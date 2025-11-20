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
} from "@ant-design/icons";
import api from "../../config/axios";
import handleApiError from "../../Utils/handleApiError";
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
      // API: GET /api/station/{id}/batteries (theo hình ảnh Swagger)
      const res = await api.get(`/station/${stationId}/batteries`);

      // Dữ liệu API trả về mảng trực tiếp
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data && Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setBatteries(data);
      showToast("success", `Tải thành công ${data.length} pin tại trạm ${stationId}.`);
    } catch (err) {
      showToast("error", err.response?.data || "Tải danh sách pin tại trạm thất bại, vui lòng thử lại!");
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
      title={`Danh sách ${batteries.length}/${station?.capacity || 0} pin tại ${
        station?.name || ""
      }`}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose={true} // Tải lại dữ liệu mỗi lần mở
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

// Định nghĩa trạng thái của luồng đổi pin
const SWAP_STEP = {
  SELECT_FAULTY: "SELECT_FAULTY", // Bước 1: Chọn pin lỗi tại trạm về kho
  //SELECT_GOOD: "SELECT_GOOD", // Bước 2: Chọn pin tốt trong kho ra trạm
};

/**
 * Component Modal thực hiện Quy trình Đổi Pin (Về Kho / Ra Trạm)
 * Lưu ý: Component này được định nghĩa bên ngoài StationPage, nhưng trong cùng file.
 */
const BatterySwapModal = ({
  station,
  isVisible,
  onCancel,
  batteryTypesMap,
  onSwapSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(SWAP_STEP.SELECT_FAULTY);

  // --- State cho BƯỚC 1: Chọn Pin lỗi (Maintenance)
  const [stationMaintenanceBatteries, setStationMaintenanceBatteries] =
    useState([]);
  const [selectedFaultyBatteryIds, setSelectedFaultyBatteryIds] = useState([]); // ID pin lỗi đã chọn
  const [randomlySelectedGoodBatteries, setRandomlySelectedGoodBatteries] =
        useState([]); // Pin tốt được chọn ngẫu nhiên

  // --- State cho BƯỚC 2: Chọn Pin tốt (Available)
  // const [warehouseAvailableBatteries, setWarehouseAvailableBatteries] =
  //   useState([]);
  // const [selectedGoodBatteryIds, setSelectedGoodBatteryIds] = useState([]); // ID pin tốt đã chọn

  // Lấy ID loại pin của trạm (giả định trạm chỉ chứa 1 loại pin)
  const stationBatteryTypeId = useMemo(() => {
    if (!stationMaintenanceBatteries.length) return null;
    return stationMaintenanceBatteries[0].batteryTypeId;
  }, [stationMaintenanceBatteries]);

  // Tải Pin cần bảo dưỡng tại trạm (BƯỚC 1)
  const fetchMaintenanceBatteries = useCallback(async (stationId) => {
    if (!stationId) return;
    setLoading(true);
    try {
      // API: GET /api/station/{id}/batteries/needs-maintenance
      const res = await api.get(
        `/station/${stationId}/batteries/needs-maintenance`
      );
      const batteries = Array.isArray(res.data?.batteries)
        ? res.data.batteries
        : [];
      setStationMaintenanceBatteries(batteries.sort((a, b) => b.id - a.id));
    } catch (error) {
      handleApiError(error, "Tải pin cần bảo dưỡng tại trạm!");
      setStationMaintenanceBatteries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect chạy khi modal mở
  useEffect(() => {
    if (isVisible && station?.id) {
      setCurrentStep(SWAP_STEP.SELECT_FAULTY); // Reset bước khi mở
      setSelectedFaultyBatteryIds([]);
      //setSelectedGoodBatteryIds([]);
      setRandomlySelectedGoodBatteries([]);
      fetchMaintenanceBatteries(station.id);
    } else if (!isVisible) {
      setStationMaintenanceBatteries([]);
      //setWarehouseAvailableBatteries([]);
    }
  }, [isVisible, station, fetchMaintenanceBatteries]);

  // --- LOGIC RANDOM VÀ SUBMIT ---

    /**
     * Hàm chọn ngẫu nhiên X pin đạt chuẩn (SOH > 90%)
     * @param {number} typeId - Loại pin cần tìm
     * @param {number} count - Số lượng pin cần chọn
     * @returns {Array} - Mảng các đối tượng pin đã chọn ngẫu nhiên
     */
    const selectRandomGoodBatteries = async (typeId, count) => {
        if (count === 0 || !typeId) return [];
          const res = await api.get(
              `/station-inventory/available-by-type/${typeId}`
          );
          
          const responseData = res.data;

          // Lấy danh sách pin và đảm bảo nó là mảng
          const allAvailableBatteries = Array.isArray(res.data?.batteries)
              ? res.data.batteries
              : [];

          // 2. Lọc Pin Đạt Chuẩn (SOH > 90%)
          let pool = allAvailableBatteries.filter(
              (b) =>
                  b.status === "AVAILABLE" && parseFloat(b.stateOfHealth) > 90
          );

          if (pool.length < count) {
              throw new Error(
                  `Chỉ tìm thấy ${pool.length} pin AVAILABLE (SOH > 90%) trong kho. Cần ${count} pin.`
              );
          }

          // 3. Tiến hành chọn ngẫu nhiên
          const selected = [];
          while (selected.length < count && pool.length > 0) {
              const randomIndex = Math.floor(Math.random() * pool.length);
              selected.push(pool[randomIndex]);
              // Xóa pin đã chọn khỏi pool để không chọn lại
              pool.splice(randomIndex, 1);
          }
          return selected;
    };

    const handleNextStepAndCompleteSwap = async () => {
        const count = selectedFaultyBatteryIds.length;

        if (count === 0) {
            return message.warning(
                "Vui lòng chọn ít nhất 1 pin lỗi để chuyển về kho."
            );
        }

        if (!stationBatteryTypeId) {
            return message.error(
                "Không xác định được loại pin của trạm để tìm pin thay thế."
            );
        }

        setLoading(true);

        try {
            // --- BƯỚC 1: Chọn pin tốt ngẫu nhiên từ kho ---
            
            // Sử dụng logic random đã được ghi nhớ
            const goodBatteriesToSwap = await selectRandomGoodBatteries(
                stationBatteryTypeId,
                count
            );
            
            setRandomlySelectedGoodBatteries(goodBatteriesToSwap);

            // --- BƯỚC 2: Thực hiện Chuyển pin lỗi về kho (Move To Warehouse) ---
            for (const batteryId of selectedFaultyBatteryIds) {
                // API: POST /api/station-inventory/move-to-warehouse
                await api.post("/station-inventory/move-to-warehouse", null, {
                    params: {
                        batteryId: batteryId,
                        stationId: station.id,
                    },
                });
            }

            // --- BƯỚC 3: Thực hiện Chuyển pin tốt ra trạm (Move To Station) ---
            for (const goodBattery of goodBatteriesToSwap) {
                // API: POST /api/station-inventory/move-to-station
                await api.post("/station-inventory/move-to-station", null, {
                    params: {
                        batteryId: goodBattery.id,
                        stationId: station.id,
                        batteryTypeId: stationBatteryTypeId,
                    },
                });
            }

            message.success(
                `✅ Hoàn tất đổi ${count} pin. ${count} pin lỗi đã về kho, ${count} pin tốt (ngẫu nhiên) đã ra trạm.`
            );
            onSwapSuccess();
            onCancel();
        } catch (error) {
            // Xử lý lỗi từ API hoặc lỗi logic random
            const errorMessage = error.message.includes("pin")
                ? error.message // Hiển thị thông báo lỗi custom từ selectRandomGoodBatteries
                : "❌ Lỗi trong quá trình đổi pin. Vui lòng kiểm tra console log.";
            message.error(errorMessage);
            console.error("Lỗi Swap Pin:", error);
        } finally {
            setLoading(false);
        }
    };

  // --- CẤU HÌNH BẢNG (COLUMNS) ---

  const getColumns = () => {
    return [
      { title: "ID Pin", dataIndex: "id", key: "id", width: 80 },
      {
        title: "Loại Pin",
        dataIndex: "batteryTypeId",
        key: "batteryTypeId",
        width: 250,
        render: (typeId) => batteryTypesMap[typeId] || "",
      },
      {
        title: "Tình trạng pin (%)",
        dataIndex: "stateOfHealth",
        key: "stateOfHealth",
        width: 140,
        render: (soh) => {
          const sohValue = soh ? parseFloat(soh).toFixed(2) : "";
          return sohValue !== "" ? (
            <Tag color={parseFloat(sohValue) >= 70 ? "green" : "orange"}>
              {sohValue}
            </Tag>
          ) : (
            ""
          );
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 110,
        render: (status) => (
          <Tag color={status === "AVAILABLE" ? "green" : "orange"}>
            {status}
          </Tag>
        ),
      },
      {
        title: "Bảo trì lần cuối",
        dataIndex: "lastMaintenanceDate",
        key: "lastMaintenanceDate",
        width: 140,
        render: (date) => (date ? new Date(date).toLocaleDateString() : ""),
      },
    ];
  };

  // --- ROW SELECTION CONFIG ---

  // BƯỚC 1: Chọn pin lỗi
  const faultyRowSelection = {
    selectedRowKeys: selectedFaultyBatteryIds,
    onChange: (selectedKeys) => {
      setSelectedFaultyBatteryIds(selectedKeys);
    },
    hideSelectAll: true,
  };

  // --- JSX Render Logic ---

  const isNextButtonDisabled = selectedFaultyBatteryIds.length === 0 || loading;
  const currentTitle = `Chọn ${selectedFaultyBatteryIds.length} pin lỗi từ trạm về kho bảo trì`;

  return (
    <Modal
      title={`Quy trình đổi pin cho ${station?.name}`}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose={true}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Alert
          message={currentTitle}
          description={`Danh sách ${stationMaintenanceBatteries.length} pin cần bảo dưỡng/lỗi tại trạm. Vui lòng chọn pin. Pin tốt sẽ được tự động chọn ngẫu nhiên từ kho (Tình trạng > 90%).`}
          type={"warning"}
          showIcon
        />
        <Table
          columns={getColumns()}
          dataSource={stationMaintenanceBatteries}
          rowSelection={faultyRowSelection}
          loading={loading}
          rowKey="id"
        />
        <Space style={{ justifyContent: "flex-end", width: "100%" }}>
          <Button
              type="primary"
              onClick={handleNextStepAndCompleteSwap}
              disabled={isNextButtonDisabled}
              loading={loading}
              icon={<SendOutlined />}
          >
              {loading
                  ? `Đang thực hiện đổi ${selectedFaultyBatteryIds.length} pin...`
                  : `Tiếp tục & Đổi ${selectedFaultyBatteryIds.length} Pin (Tự động)`}
          </Button>
          <Button onClick={onCancel} style={{ marginLeft: 8 }}>
              Đóng
          </Button>
        </Space>
        
        {/* Hiển thị kết quả chọn ngẫu nhiên nếu có lỗi hoặc để debug */}
        {randomlySelectedGoodBatteries.length > 0 && (
            <Alert
                message={`Đã chọn ngẫu nhiên ${randomlySelectedGoodBatteries.length} pin TỐT từ kho (SOH > 90%) để thay thế.`}
                description={
                    <ul>
                        {randomlySelectedGoodBatteries.map((b) => (
                            <li key={b.id}>
                                **Pin ID {b.id}** ({batteryTypesMap[b.batteryTypeId]}) - SOH: {parseFloat(b.stateOfHealth).toFixed(2)}%
                            </li>
                        ))}
                    </ul>
                }
                type="success"
                style={{ marginTop: 16 }}
                showIcon
            />
        )}
      </Space>
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
  //const Role = JSON.parse(localStorage.getItem("currentUser"))?.role; // Get role directly
  const Role = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"))?.role;
    } catch {
      return null;
    }
  }, []);

  // ---------------------------
  // 🚀 1. FETCH ALL STATIONS & BATTERY TYPES
  // ---------------------------
  useEffect(() => {
    fetchStations();
    fetchBatteryTypes();
  }, []);

  const fetchStations = async () => {
    let apiPath =
      Role === "ADMIN" ? "/station" : "/staff-station-assignment/my-stations";
    try {
      const res = await api.get(apiPath);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setStations(data.sort((a, b) => b.id - a.id));
    } catch (err) {
      handleApiError(err, "Tải danh sách trạm");
    }
  };

  const fetchBatteryTypes = async () => {
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
      handleApiError(err, "Tải loại pin");
    }
  };

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
      handleApiError(err, "lưu trạm");
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
          // Calling the correct DELETE API endpoint
          await api.delete(`/station/${id}`);
          message.success("Trạm được xóa thành công");
          // Refresh the station list after deletion
          fetchStations();
        } catch (err) {
          handleApiError(err, "xóa trạm");
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

  // Handler để mở Modal Pin
  const handleViewBatteries = (station) => {
    setViewingStation(station);
    setIsBatteryListModalVisible(true);
  };

  // Handler để mở Modal Đổi Pin
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
        <Space
          direction="vertical"
          size="small"
          //onClick={() => handleViewBatteries(record)}
          //style={{ cursor: "pointer" }}
        >
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
            onClick={() => handleViewBatteries(record)} // Gọi hàm mở Modal
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
  const totalCapacity = stations.reduce((sum, s) => sum + (s.capacity || 0), 0);
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
            {Role === "ADMIN" && ( // Corrected role check from "Admin" to "ADMIN"
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
                  rules={[{ required: true, message: "Hãy chọn trạng thái!" }]}
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