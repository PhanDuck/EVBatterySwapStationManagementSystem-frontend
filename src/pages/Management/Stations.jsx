import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Statistic,
  Row,
  Col,
  message,
  Alert,
  Steps,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SwapOutlined,
  SendOutlined,
  InboxOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;

/**
 * Component Modal hiển thị danh sách Pin tại một Trạm
 */
const BatteryListModal = ({ station, isVisible, onCancel, batteryTypes }) => {
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ánh xạ Battery Type ID sang Tên
  const getBatteryTypeName = (id) => {
    const type = batteryTypes.find((t) => t.id === id);
    return type ? type.name : "";
  };

  // 🔋 Hàm tải danh sách pin
  const fetchBatteries = async (stationId) => {
    setLoading(true);
    try {
      const res = await api.get(`/station/${stationId}/batteries`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data && Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setBatteries(data);
      showToast(
        "success",
        `Tải thành công ${data.length} pin tại trạm ${stationId}.`
      );
    } catch (err) {
      console.log(err);
      setBatteries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && station?.id) {
      fetchBatteries(station.id);
    } else if (!isVisible) {
      setBatteries([]); // Clear data khi modal đóng
    }
  }, [isVisible, station]);

  const batteryColumns = [
    {
      title: "ID Pin",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Loại Pin",
      dataIndex: "batteryTypeId",
      key: "batteryTypeId",
      render: (id) => getBatteryTypeName(id),
    },
    {
      title: "Mức sạc (%)",
      dataIndex: "chargeLevel",
      key: "chargeLevel",
      render: (s) => (
        <Tag color={s > 70 ? "green" : s > 20 ? "orange" : "red"}>{s}</Tag>
      ),
    },
    {
      title: "Tình trạng pin (%)",
      dataIndex: "stateOfHealth",
      key: "stateOfHealth",
      render: (s) => (
        <Tag color={s > 70 ? "green" : s > 20 ? "orange" : "red"}>{s}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          AVAILABLE: "green",
          PENDING: "blue",
          MAINTENANCE: "orange",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
  ];

  return (
    <Modal
      title={`Danh sách ${batteries.length}/${
        station?.capacity || 0
      } pin tại ${station?.name || ""}`}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose={true}
    >
      <Table
        columns={batteryColumns}
        dataSource={batteries}
        loading={loading}
        rowKey="id"
        pagination={{
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trên tổng ${total} pin`,
        }}
      />
    </Modal>
  );
};

/**
 * Component Modal thực hiện Quy trình Đổi Pin (Về Kho / Ra Trạm) - LOGIC CHỌN THỦ CÔNG
 */
const BatterySwapModal = ({
  station,
  isVisible,
  onCancel,
  batteryTypesMap,
  onSwapSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // --- State BƯỚC 1: Chọn Pin lỗi (Maintenance)
  const [stationMaintenanceBatteries, setStationMaintenanceBatteries] = useState([]);
  const [selectedFaultyBatteryIds, setSelectedFaultyBatteryIds] = useState([]);

  // --- State BƯỚC 2: Chọn Pin tốt (Available) từ kho
  const [warehouseGoodBatteries, setWarehouseGoodBatteries] = useState([]);
  const [selectedGoodBatteryIds, setSelectedGoodBatteryIds] = useState([]);

  const stationBatteryTypeId = useMemo(() => {
    if (!stationMaintenanceBatteries.length) return null;
    return stationMaintenanceBatteries[0].batteryTypeId;
  }, [stationMaintenanceBatteries]);

  // Hàm tải Pin lỗi tại trạm
  const fetchMaintenanceBatteries = useCallback(async (stationId) => {
    if (!stationId) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/station/${stationId}/batteries/needs-maintenance`
      );
      const batteries = Array.isArray(res.data?.batteries)
        ? res.data.batteries
        : [];
      setStationMaintenanceBatteries(batteries.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.log("Lỗi tải pin cần bảo dưỡng:", error);
      setStationMaintenanceBatteries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm tải Pin tốt từ kho (SOH > 90%)
  const fetchWarehouseGoodBatteries = async (typeId) => {
    setLoading(true);
    try {
      const res = await api.get(`/station-inventory/available-by-type/${typeId}`);
      const rawBatteries = res.data?.batteries || (Array.isArray(res.data) ? res.data : []);
      
      // Lọc pin SOH > 90%
      const goodPool = rawBatteries.filter(
        (b) => b.status === "AVAILABLE" && parseFloat(b.stateOfHealth) > 90
      );
      setWarehouseGoodBatteries(goodPool);
    } catch (error) {
      showToast(error, "Lỗi tải danh sách pin tốt từ kho.");
    } finally {
      setLoading(false);
    }
  };

  // Effect khởi tạo khi mở Modal
  useEffect(() => {
    if (isVisible && station?.id) {
      setCurrentStep(0);
      setSelectedFaultyBatteryIds([]);
      setSelectedGoodBatteryIds([]);
      setWarehouseGoodBatteries([]);
      fetchMaintenanceBatteries(station.id);
    }
  }, [isVisible, station, fetchMaintenanceBatteries]);

  // Chuyển sang Bước 2
  const handleNextStep = async () => {
    if (selectedFaultyBatteryIds.length === 0) {
      return message.warning("Vui lòng chọn ít nhất 1 pin lỗi để đổi.");
    }
    if (!stationBatteryTypeId) {
      return message.error("Không xác định được loại pin của trạm.");
    }
    
    // Tải danh sách pin tốt từ kho trước khi chuyển bước
    await fetchWarehouseGoodBatteries(stationBatteryTypeId);
    setCurrentStep(1);
  };

  // Xử lý Submit (Gọi API)
  const handleConfirmSwap = async () => {
    // Kiểm tra số lượng
    if (selectedGoodBatteryIds.length !== selectedFaultyBatteryIds.length) {
        return message.error(`Vui lòng chọn đúng ${selectedFaultyBatteryIds.length} pin tốt để thay thế.`);
    }

    setLoading(true);
    try {
      // 1. Chuyển pin lỗi về kho
      for (const batteryId of selectedFaultyBatteryIds) {
        await api.post("/station-inventory/move-to-warehouse", null, {
          params: { batteryId, stationId: station.id },
        });
      }

      // 2. Chuyển pin tốt ra trạm
      for (const batteryId of selectedGoodBatteryIds) {
        await api.post("/station-inventory/move-to-station", null, {
          params: {
            batteryId,
            stationId: station.id,
            batteryTypeId: stationBatteryTypeId,
          },
        });
      }

      message.success(`✅ Đã đổi thành công ${selectedFaultyBatteryIds.length} pin.`);
      onSwapSuccess();
      onCancel();
    } catch (error) {
      message.error("Lỗi trong quá trình đổi pin. Vui lòng thử lại.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Cấu hình bảng ---
  const getColumns = (isGoodBatteryTable = false) => [
    { title: "ID Pin", dataIndex: "id", key: "id", width: 80, render: (t) => <b>#{t}</b> },
    { 
        title: "Loại Pin", 
        dataIndex: "batteryTypeId", 
        key: "type", 
        width: 200,
        render: (id) => batteryTypesMap[id] || "" 
    },
    {
      title: "SOH (%)",
      dataIndex: "stateOfHealth",
      key: "soh",
      width: 100,
      render: (soh) => (
        <Tag color={parseFloat(soh) > 90 ? "green" : "orange"}>
            {parseFloat(soh).toFixed(2)}%
        </Tag>
      ),
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (s) => <Tag color={s === "AVAILABLE" ? "green" : "orange"}>{s}</Tag>
    },
    // Cột ngày bảo trì chỉ hiện ở bảng Pin Lỗi
    !isGoodBatteryTable && {
        title: "Bảo trì cuối",
        dataIndex: "lastMaintenanceDate",
        width: 150,
        render: (d) => d ? new Date(d).toLocaleDateString() : ""
    }
  ].filter(Boolean);

  // Config chọn dòng Bước 1
  const faultyRowSelection = {
    selectedRowKeys: selectedFaultyBatteryIds,
    onChange: (keys) => setSelectedFaultyBatteryIds(keys),
  };

  // Config chọn dòng Bước 2 (Giới hạn số lượng)
  const goodRowSelection = {
    selectedRowKeys: selectedGoodBatteryIds,
    onChange: (keys) => {
        // Chặn không cho chọn quá số lượng pin lỗi
        if (keys.length > selectedFaultyBatteryIds.length) return;
        setSelectedGoodBatteryIds(keys);
    },
    getCheckboxProps: (record) => ({
        // Disable các ô còn lại khi đã chọn đủ số lượng
        disabled: selectedGoodBatteryIds.length >= selectedFaultyBatteryIds.length && !selectedGoodBatteryIds.includes(record.id)
    })
  };

  return (
    <Modal
      title={`Quy trình đổi pin cho ${station?.name}`}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Steps
        current={currentStep}
        items={[
          { title: "Chọn Pin Lỗi (Tại Trạm)", icon: <EnvironmentOutlined /> },
          { title: "Chọn Pin Tốt (Tại Kho)", icon: <InboxOutlined /> },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* --- BƯỚC 1: CHỌN PIN LỖI --- */}
      {currentStep === 0 && (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Alert 
                message="Bước 1: Chọn pin cần bảo dưỡng để chuyển về kho"
                description={`Đã chọn: ${selectedFaultyBatteryIds.length} pin`}
                type="warning" showIcon
            />
            <Table
                dataSource={stationMaintenanceBatteries}
                columns={getColumns(false)}
                rowSelection={faultyRowSelection}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                loading={loading}
                size="small"
            />
            <div style={{ textAlign: "right", marginTop: 16 }}>
                <Space>
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button 
                        type="primary" 
                        onClick={handleNextStep} 
                        icon={<ArrowRightOutlined />}
                        disabled={selectedFaultyBatteryIds.length === 0}
                        loading={loading}
                    >
                        Tiếp tục chọn Pin thay thế
                    </Button>
                </Space>
            </div>
        </Space>
      )}

      {/* --- BƯỚC 2: CHỌN PIN TỐT --- */}
      {currentStep === 1 && (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Alert 
                message={`Bước 2: Vui lòng chọn đủ ${selectedFaultyBatteryIds.length} pin tốt từ kho để thay thế`}
                description={`Đã chọn: ${selectedGoodBatteryIds.length} / ${selectedFaultyBatteryIds.length}`}
                type={selectedGoodBatteryIds.length === selectedFaultyBatteryIds.length ? "success" : "info"} 
                showIcon
            />
             {/* Cảnh báo nếu kho không đủ pin */}
             {warehouseGoodBatteries.length < selectedFaultyBatteryIds.length && (
                <Alert 
                    message="Cảnh báo: Kho không đủ pin tốt để thay thế!" 
                    type="error" 
                    showIcon 
                    style={{marginBottom: 8}}
                />
            )}

            <Table
                dataSource={warehouseGoodBatteries}
                columns={getColumns(true)}
                rowSelection={goodRowSelection}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
            />
            <div style={{ textAlign: "right", marginTop: 16 }}>
                <Space>
                    <Button onClick={() => setCurrentStep(0)} icon={<ArrowLeftOutlined />}>Quay lại</Button>
                    <Button 
                        type="primary" 
                        onClick={handleConfirmSwap} 
                        icon={<SwapOutlined />}
                        loading={loading}
                        // Chỉ cho phép xác nhận khi chọn đủ số lượng
                        disabled={selectedGoodBatteryIds.length !== selectedFaultyBatteryIds.length}
                    >
                        Xác nhận Đổi Pin
                    </Button>
                </Space>
            </div>
        </Space>
      )}
    </Modal>
  );
};

const StationPage = () => {
  const [stations, setStations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batteryTypes, setBatteryTypes] = useState([]);
  const [batteryTypesMap, setBatteryTypesMap] = useState({});
  const [isBatteryListModalVisible, setIsBatteryListModalVisible] =
    useState(false);
  const [isBatterySwapModalVisible, setIsBatterySwapModalVisible] =
    useState(false);
  const [viewingStation, setViewingStation] = useState(null);

  const Role = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"))?.role;
    } catch {
      return null;
    }
  }, []);

  // ---------------------------
  // 🚀 1. FETCH ALL STATIONS & BATTERY TYPES (Đã sửa bằng useCallback)
  // ---------------------------

  const fetchStations = useCallback(async () => {
    let apiPath =
      Role === "ADMIN"
        ? "/station"
        : "/staff-station-assignment/my-stations";
    try {
      const res = await api.get(apiPath);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setStations(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.log("Lỗi tải danh sách trạm:", err);
    }
  }, [Role]);

  const fetchBatteryTypes = useCallback(async () => {
    try {
      const res = await api.get("/battery-type");
      const data = Array.isArray(res.data) ? res.data : [];
      setBatteryTypes(data);
      const map = {};
      data.forEach((type) => {
        map[type.id] = `${type.name}`;
      });
      setBatteryTypesMap(map);
    } catch (err) {
      console.log("Lỗi tải loại pin:", err);
    }
  }, []);

  useEffect(() => {
    fetchStations();
    fetchBatteryTypes();
  }, [fetchStations, fetchBatteryTypes]); 

  const handleSwapSuccess = () => {
    fetchStations();
  };

  // ---------------------------
  // 🚀 2. CREATE / UPDATE STATION
  // ---------------------------
  const handleSubmit = async (values) => {
    try {
      if (editingStation) {
        await api.put(`/station/${editingStation.id}`, values);
        message.success("Trạm cập nhật thành công");
      } else {
        await api.post("/station", values);
        message.success("Trạm được tạo thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchStations();
    } catch (err) {
      showToast(
        err.response?.data || "Lưu trạm thất bại, vui lòng thử lại!",
        "error"
      );
    }
  };

  // ---------------------------
  // 🚀 3. DELETE STATION
  // ---------------------------
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Bạn có chắc là xóa trạm này?",
      content: "Hành động này sẽ xóa vĩnh viễn trạm.",
      okText: "Có, Xóa",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await api.delete(`/station/${id}`);
          message.success("Trạm được xóa thành công");
          fetchStations();
        } catch (err) {
          showToast(
            err.response?.data || "Xóa trạm thất bại, vui lòng thử lại!",
            "error"
          );
        }
      },
    });
  };

  // ---------------------------
  // Handlers
  // ---------------------------
  const handleAdd = () => {
    setEditingStation(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setIsModalVisible(true);
    form.setFieldsValue(station);
  };

  const handleViewBatteries = (station) => {
    setViewingStation(station);
    setIsBatteryListModalVisible(true);
  };

  const handleOpenSwapModal = (station) => {
    setViewingStation(station);
    setIsBatterySwapModalVisible(true);
  };

  // ---------------------------
  // Columns
  // ---------------------------
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "Trạm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Địa chỉ",
      dataIndex: "location",
      key: "location",
      width: 340,
      render: (text) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Số lượng pin",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity, record) => (
        <Space direction="vertical" size="small">
          <span>
            <strong>{record.currentBatteryCount || 0}</strong> / {capacity} pin
          </span>
          <div
            style={{
              width: "100px",
              height: "6px",
              backgroundColor: "#bec2bf",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(record.currentBatteryCount / capacity) * 100}%`,
                height: "100%",
                backgroundColor:
                  record.currentBatteryCount > capacity * 0.5
                    ? "#52c41a"
                    : record.currentBatteryCount > capacity * 0.2
                    ? "#faad14"
                    : "#ff4d4f",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          ACTIVE: "green",
          MAINTENANCE: "orange",
          INACTIVE: "red",
          "UNDER CONSTRUCTION": "blue",
        };
        return (
          <Tag color={colorMap[status?.toUpperCase()] || "default"}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "contactInfo",
      key: "contactInfo",
    },
    {
      title: "Tỉnh/Thành phố",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewBatteries(record)}
          >
            Xem
          </Button>

          <Button
            type="primary"
            icon={<SwapOutlined />}
            size="small"
            onClick={() => handleOpenSwapModal(record)}
          >
            Đổi Pin
          </Button>
          {Role === "ADMIN" && (
            <Space size="small">
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
              >
                Sửa
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record.id)}
              >
                Xóa
              </Button>
            </Space>
          )}
        </Space>
      ),
    },
  ];

  // ---------------------------
  // Filters + Summary
  // ---------------------------
  const filteredStations = useMemo(() => {
    const q = searchText?.trim().toLowerCase();
    return stations.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q) {
        const name = (s.name || "").toLowerCase();
        const address = (s.location || "").toLowerCase();
        if (!name.includes(q) && !address.includes(q)) return false;
      }
      return true;
    });
  }, [stations, searchText, statusFilter]);

  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.status === "ACTIVE").length;
  const totalCapacity = stations.reduce(
    (sum, s) => sum + (s.capacity || 0),
    0
  );
  const totalCurrentBatteries = stations.reduce(
    (sum, s) => sum + (s.currentBatteryCount || 0),
    0
  );

  // ---------------------------
  // JSX Render
  // ---------------------------
  return (
    <div style={{ padding: "24px" }}>
      {/* Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng số trạm"
              value={totalStations}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Trạm hoạt động"
              value={activeStations}
              valueStyle={{ color: "#3f8600" }}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng sức chứa"
              value={totalCapacity}
              suffix="pin"
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng số pin tại trạm"
              value={totalCurrentBatteries}
              suffix="pin"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        title="Quản lý trạm đổi pin"
        extra={
          <Space>
            <Input
              placeholder="Tìm theo tên hoặc địa chỉ"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              value={searchText}
            />
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 180 }}
            >
              <Option value="all"> Chọn trạng thái</Option>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="MAINTENANCE">MAINTENANCE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
              <Option value="UNDER CONSTRUCTION">UNDER CONSTRUCTION</Option>
            </Select>
            {Role === "ADMIN" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm Trạm
              </Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredStations}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trên tổng ${total} trạm`,
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={editingStation ? "Sửa trạm" : "Thêm trạm mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên trạm"
                rules={[{ required: true, message: "Hãy nhập tên trạm!" }]}
              >
                <Input placeholder="Nhập tên trạm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Địa chỉ"
                rules={[{ required: true, message: "Hãy nhập địa chỉ!" }]}
              >
                <Input placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="Tỉnh/Thành phố"
                rules={[
                  { required: true, message: "Hãy nhập tỉnh/thành phố!" },
                ]}
              >
                <Input placeholder="Ví dụ TP.HCM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="district"
                label="Quận/Huyện"
                rules={[{ required: true, message: "Hãy nhập quận/huyện!" }]}
              >
                <Input placeholder="Ví dụ: Quận 7" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="latitude"
                label="Vĩ độ"
                rules={[{ required: true, message: "Hãy nhập vĩ độ!" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Ví dụ: 10.7300"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="longitude"
                label="Kinh độ"
                rules={[{ required: true, message: "Hãy nhập kinh độ!" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Ví dụ: 106.7000"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Sức chứa"
                rules={[{ required: true, message: "Hãy nhập sức chứa!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactInfo"
                label="Số liên hệ"
                rules={[{ required: true, message: "Hãy nhập số liên hệ!" }]}
              >
                <Input placeholder="Nhập số liên hệ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="batteryTypeId"
                label="Loại pin"
                rules={[{ required: true, message: "Hãy chọn loại pin!" }]}
              >
                <Select placeholder="Chọn loại pin">
                  {batteryTypes.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name} (Voltage: {type.voltage}, Capacity:{" "}
                      {type.capacityAh}Ah)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {editingStation && (
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[
                    { required: true, message: "Hãy chọn trạng thái!" },
                  ]}
                >
                  <Select placeholder="Select status">
                    <Option value="ACTIVE">ACTIVE</Option>
                    <Option value="MAINTENANCE">MAINTENANCE</Option>
                    <Option value="INACTIVE">INACTIVE</Option>
                    <Option value="UNDER CONSTRUCTION">
                      UNDER CONSTRUCTION
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStation ? "Cập nhật" : "Tạo"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/* MODAL HIỂN THỊ DANH SÁCH PIN */}
      <BatteryListModal
        station={viewingStation}
        isVisible={isBatteryListModalVisible}
        onCancel={() => setIsBatteryListModalVisible(false)}
        batteryTypes={batteryTypes}
      />

      <BatterySwapModal
        station={viewingStation}
        isVisible={isBatterySwapModalVisible}
        onCancel={() => setIsBatterySwapModalVisible(false)}
        batteryTypesMap={batteryTypesMap}
        onSwapSuccess={handleSwapSuccess}
      />
    </div>
  );
};

export default StationPage;