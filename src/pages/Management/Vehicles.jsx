import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Empty,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import handleApiError from "../../Utils/handleApiError";

const { Option } = Select;
const { Title, Text } = Typography;

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [batteryTypes, setBatteryTypes] = useState([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const user = (() => {
    try {
      const userString = localStorage.getItem("currentUser");
      return userString ? JSON.parse(userString) : {};
    } catch (error) {
      handleApiError(error, "Lỗi đọc thông tin người dùng");
      return {};
    }
  })();

  const role = String(user?.role || "USER")
    .trim()
    .toUpperCase();
  const isDriver = role === "DRIVER";
  const isAdminOrStaff = role === "ADMIN" || role === "STAFF";

  // --- Component Modal Lịch sử Đổi Pin ---
  const VehicleSwapHistoryModal = React.memo(
  ({
    open,
    onClose,
    vehicleHistory,
    loading,
    userRole
  }) => {
    const swapCount = vehicleHistory.length;
    const canViewTransactionId = userRole === "ADMIN" || userRole === "STAFF";

    // ⚙️ Component con hiển thị thông tin pin
    const BatteryInfoCard = ({ title, batteryData, type }) => {
      const color = type === "new" ? "#52c41a" : "#faad14"; // Xanh cho Pin Mới (Swap In), Vàng cho Pin Cũ (Swap Out)

      const isSwapIn = type === "new";
      const batteryId = isSwapIn
        ? batteryData?.swapOutBatteryId
        : batteryData?.swapInBatteryId;
      const model = isSwapIn
        ? batteryData?.swapOutBatteryModel
        : batteryData?.swapInBatteryModel;
      const chargeLevel = isSwapIn
        ? batteryData?.swapOutBatteryChargeLevel
        : batteryData?.swapInBatteryChargeLevel;
      const soh = isSwapIn
        ? batteryData?.swapOutBatteryHealth
        : batteryData?.swapInBatteryHealth;

      return (
        <Card
          bordered
          title={
            <Text strong style={{ color: color }}>
              {title}
            </Text>
          }
          style={{
            minHeight: 250,
            borderColor: color,
          }}
          headStyle={{ backgroundColor: "#fafafa" }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {/* 1. ID Pin */}
            <Row justify="space-between" style={{ paddingBottom: 5 }}>
              <Col>
                <Text strong>ID Pin:</Text>
              </Col>
              <Col>
                <Text>{batteryId || "—"}</Text>
              </Col>
            </Row>
            <Divider style={{ margin: "5px 0" }} />

            {/* 2. Loại Pin (Model) */}
            <Row justify="space-between" style={{ paddingBottom: 5 }}>
              <Col>
                <Text strong>Loại Pin:</Text>
              </Col>
              <Col>
                <Text>{model || "—"}</Text>
              </Col>
            </Row>
            <Divider style={{ margin: "5px 0" }} />

            {/* 3. Mức sạc (Charge Level) */}
            <Row justify="space-between" style={{ paddingBottom: 5 }}>
              <Col>
                <Text strong>
                  <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc
                  (%):
                </Text>
              </Col>
              <Col>
                <Tag color={chargeLevel > 70 ? "green" : "orange"}>
                  {chargeLevel || "—"}
                </Tag>
              </Col>
            </Row>
            <Divider style={{ margin: "5px 0" }} />

            {/* 4. Tình trạng pin (State of Health) */}
            <Row justify="space-between">
              <Col>
                <Text strong>
                  <HeartOutlined style={{ color: "#ff4d4f" }} /> Tình trạng pin
                  (%):
                </Text>
              </Col>
              <Col>
                <Tag color={soh > 70 ? "green" : "orange"}>{soh || "—"}</Tag>
              </Col>
            </Row>
          </Space>
        </Card>
      );
    };

    const HistoryItem = ({ transaction, index, totalSwaps }) => {
      // 💡 Sử dụng JS Date Object để định dạng thay vì moment
      const date = new Date(transaction.endTime);
      const timeString = date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateString = date.toLocaleDateString("vi-VN");
      const dateTimeFormatted = `${timeString} ${dateString}`;
      const stationName = transaction.stationName || "Trạm không rõ";
      const swapNumber = totalSwaps - index;

      return (
        <Card
          style={{ marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          bodyStyle={{ padding: "16px" }}
        >
          {/* Header - ID Giao dịch, Thời gian, Trạm */}
          <Row
            justify="space-between"
            align="middle"
            style={{
              marginBottom: 15,
              paddingBottom: 10,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Lần giao dịch {swapNumber}
              </Title>
              {canViewTransactionId && (
                <Text type="secondary" style={{ fontSize: "0.85em" }}>
                  ID: <Text code>{transaction.id}</Text>
                </Text>
              )}
              <Space size="small" style={{ marginTop: 4 }}>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Text type="secondary" style={{ fontSize: "0.85em" }}>
                  {dateTimeFormatted}
                </Text>
              </Space>
            </Col>
            <Col style={{ textAlign: "right" }}>
              <Space size="small">
                <EnvironmentOutlined style={{ color: "#52c41a" }} />
                <Text strong>{stationName}</Text>
              </Space>
            </Col>
          </Row>

          {/* Pin Cũ vs Pin Mới */}
          <Row gutter={16} align="middle">
            <Col span={11}>
              <BatteryInfoCard
                title="Pin cũ (Đã tháo ra)"
                batteryData={transaction}
                type="old"
              />
            </Col>
            <Col span={2} style={{ textAlign: "center" }}>
              <SwapOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            </Col>
            <Col span={11}>
              <BatteryInfoCard
                title="Pin mới (Đã lắp vào)"
                batteryData={transaction}
                type="new"
              />
            </Col>
          </Row>
        </Card>
      );
    };

    return (
      <Modal
        title={
          <Title level={3} style={{ margin: 0 }}>
            Lịch sử đổi pin của xe
          </Title>
        }
        open={open}
        onCancel={onClose}
        footer={null}
        width={1000} // Tăng chiều rộng để phù hợp với 2 cột
        destroyOnClose={true}
      >
        <Spin spinning={loading}>
          {swapCount === 0 && !loading ? (
            <Empty description="Phương tiện này chưa có lịch sử đổi pin." />
          ) : (
            <div
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                paddingRight: "10px",
              }}
            >
              {/* Sắp xếp history theo endTime mới nhất trước */}
              {vehicleHistory.map((item, index) => (
                <HistoryItem
                  transaction={item}
                  key={item.id}
                  index={index}
                  totalSwaps={swapCount}
                />
              ))}
            </div>
          )}
        </Spin>
      </Modal>
    );
  }
);

  // 🚗 Lấy danh sách vehicle
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);

      try {
        // 1. Tải danh sách xe
        const endpoint =
          role === "ADMIN" || role === "STAFF"
            ? "/vehicle"
            : "/vehicle/my-vehicles";
        const res = await api.get(endpoint);

        const initialVehicleList = (
          Array.isArray(res.data)
            ? res.data
            : res.data?.data && Array.isArray(res.data.data)
            ? res.data.data
            : []
        ).sort((a, b) => b.id - a.id);

        setVehicles(initialVehicleList);
      } catch (error) {
        handleApiError(error, "Danh sách phương tiện");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [role]);

  // 🧑‍💻 Lấy danh sách tài xế (chỉ cho Admin/Staff)
  useEffect(() => {
    if (isAdminOrStaff) {
      const fetchDrivers = async () => {
        try {
          // ⚠️ Giả định API endpoint là '/user/drivers'
          const res = await api.get("/admin/user");
          const allUsers = res.data && Array.isArray(res.data.data) ? res.data.data : [];
          const driverList = allUsers
            .filter(user => user.role && user.role.toUpperCase() === "DRIVER")
            .map(driver => ({
                id: driver.id,
                name: driver.name, // Giả định trường tên là 'name'
                // Thêm các trường cần thiết khác ở đây nếu có (vd: vehicleId)
            }));
          setDrivers(driverList || []); 
        } catch (error) {
          handleApiError(error, "Tải danh sách tài xế");
        }
      };
      fetchDrivers();
    }
  }, [isAdminOrStaff]);

  // 🔋 Lấy loại pin
  useEffect(() => {
    const fetchBatteryTypes = async () => {
      try {
        const res = await api.get("/battery-type");
        setBatteryTypes(res.data || []);
      } catch (error) {
        handleApiError(error, "Tải danh sách loại pin");
      }
    };
    fetchBatteryTypes();
  }, []);

  // Hàm xử lý xem lịch sử
  const handleViewHistory = async (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setIsHistoryModalVisible(true);
    setHistoryLoading(true);
    setVehicleHistory([]); // Xóa lịch sử cũ

    try {
      const res = await api.get(
        `/swap-transaction/vehicle/${vehicleId}/history`
      );
      const historyList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const sortedHistory = historyList.sort(
        (a, b) => new Date(b.endTime) - new Date(a.endTime)
      );

      setVehicleHistory(sortedHistory);
      const newSwapCount = sortedHistory.length;
      setVehicles((prevVehicles) =>
        prevVehicles.map((v) =>
          v.id === vehicleId ? { ...v, swapCount: newSwapCount } : v
        )
      );
    } catch (error) {
      handleApiError(error, "Tải lịch sử đổi pin");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryModalClose = () => {
    setIsHistoryModalVisible(false);
    setSelectedVehicleId(null);
    setVehicleHistory([]);
  };

  // 🧾 Cột bảng 
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      render: (text) => (
        <Space>
          <CarOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "Biển số xe",
      dataIndex: "plateNumber",
      key: "plateNumber",
      sorter: (a, b) =>
        (a.plateNumber || "").localeCompare(b.plateNumber || ""),
    },
    {
      title: "Dòng xe",
      dataIndex: "model",
      key: "model",
      sorter: (a, b) => (a.model || "").localeCompare(b.model || ""),
    },
    ...(isAdminOrStaff ? [{
      title: "Tài xế",
      dataIndex: "driverName",
      key: "driverName",
      sorter: (a, b) =>
        (a.driverName || "").localeCompare(b.driverName || ""),
      render: (text) => <Text>{text || "Lỗi"}</Text>,
    }] : []),
    {
      title: "Loại pin",
      dataIndex: "batteryTypeName",
      key: "batteryTypeName",
      sorter: (a, b) =>
        (a.batteryTypeName || "").localeCompare(b.batteryTypeName || ""),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Lần đổi pin",
      dataIndex: "swapCount",
      key: "swapCount",
      width: 120,
      sorter: (a, b) => (a.swapCount || 0) - (b.swapCount || 0),
      render: (swapCount) => (
        <Text style={{ color: "#000000ff" }}>
          {swapCount === undefined || swapCount === null ? "0" : swapCount}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      render: (_, record) => {
        const isDriver = role === "DRIVER";
        return (
          <Space>
            {/* Nút Xem lịch sử cho TẤT CẢ các vai trò */}
            <Button
              type="primary" // Có thể dùng 'default' hoặc 'dashed'
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewHistory(record.id)} // Gọi hàm xem lịch sử
            >
              Xem
            </Button>

            {!isDriver && (
              <Space>
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
                  disabled={record.status === "INACTIVE"}
                >
                  Xóa
                </Button>
              </Space>
            )}
          </Space>
        );
      },
    },
  ];

  // 🟢 CREATE / UPDATE
  const handleSubmit = async (values) => {
    const selectedBatteryType = batteryTypes.find(t => t.id === values.batteryTypeId);
    let payload = {
    model: values.model,
    batteryTypeId: values.batteryTypeId,
  };
  let endpoint = "";

  if (editingVehicle) {
    // Trường hợp UPDATE
    if (isAdminOrStaff) {
      // ADMIN/STAFF: Được sửa VIN, PlateNumber, Model, BatteryType, và DriverId
      payload = {
        vin: values.vin,
        plateNumber: values.plateNumber,
        model: values.model,
        batteryTypeId: values.batteryTypeId,
        driverId: values.driverId, 
      };
      endpoint = `/vehicle/${editingVehicle.id}`; 
    } else if (isDriver) {
      endpoint = `/vehicle/my-vehicles/${editingVehicle.id}`;
    } else {
      message.error("Bạn không có quyền chỉnh sửa xe này.");
      return; 
    }
  } else {
    payload = {
      vin: values.vin,
      plateNumber: values.plateNumber,
      model: values.model,
      batteryTypeId: values.batteryTypeId,
    };
    if (isAdminOrStaff && values.driverId) {
        payload.driverId = values.driverId;
    }
    endpoint = "/vehicle";
  }
  
  const selectedDriver = drivers.find(d => d.id === values.driverId);
  const payloadForFE = {
    ...payload,
    batteryTypeName: selectedBatteryType ? selectedBatteryType.name : "Không xác định",
    driverName: isAdminOrStaff ? (selectedDriver ? selectedDriver.name : null) : editingVehicle?.driverName,
    id: editingVehicle ? editingVehicle.id : undefined, // Giữ ID cho update
    status: editingVehicle ? editingVehicle.status : "ACTIVE", // Giữ status cho update
  }

  try {
    if (editingVehicle) {
      // Logic UPDATE
      await api.put(endpoint, payload);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === editingVehicle.id
            ? { ...v, ...payloadForFE } // Cập nhật cả trường driverName (nếu là Admin/Staff)
            : v
        )
      );
      message.success("Cập nhật phương tiện thành công!");
    } else {
      // Logic CREATE
      const res = await api.post(endpoint, payload);
      const newVehicleData = res.data && Object.keys(res.data).length > 0 ? res.data : payload;

      const newVehicle = {
          ...newVehicleData,
          batteryTypeName: selectedBatteryType ? selectedBatteryType.name : "Không xác định",
          driverName: isAdminOrStaff && values.driverId ? (selectedDriver ? selectedDriver.name : null) : null,
          swapCount: 0,
          status: "ACTIVE",
          // Đảm bảo có ID (dùng ID từ API hoặc fallback)
          id: newVehicleData.id || Date.now(), 
      };
      setVehicles((prev) => [newVehicle, ...prev]);
      message.success("Đăng ký phương tiện thành công!");
    }

    setIsModalVisible(false);
    form.resetFields();
  } catch (error) {
    handleApiError(error, "Lưu thông tin phương tiện");
  }
};

  // 🔴 SOFT DELETE
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Bạn có chắc muốn vô hiệu hóa xe này?",
      content: "Hành động này sẽ chuyển trạng thái xe thành INACTIVE.",
      okText: "Vô hiệu hóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await api.delete(`/vehicle/${id}`);
          setVehicles((prev) =>
            prev.map((v) => (v.id === id ? { ...v, status: "INACTIVE" } : v))
          );
          message.success("Đã vô hiệu hóa phương tiện!");
        } catch (error) {
          handleApiError(error, "vô hiệu hóa phương tiện");
        }
      },
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalVisible(true);
    const initialValues = {
    vin: vehicle.vin,
    plateNumber: vehicle.plateNumber,
    model: vehicle.model,
    batteryTypeId: vehicle.batteryTypeId,
    ...(isAdminOrStaff && { driverId: vehicle.driverId }), 
  };
  
  form.setFieldsValue(initialValues);
};

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const filteredData = useMemo(() => {
    return vehicles.filter((v) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !(v.model || "").toLowerCase().includes(q) &&
          !(v.plateNumber || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [vehicles, searchText]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý xe"
        extra={
          <Space>
            <Input
              placeholder="Tìm theo dòng xe hoặc biển số"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />

            {isDriver && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Đăng ký xe mới
              </Button>
            )}
          </Space>
        }
      >
        <Spin spinning={loading}>
          {filteredData.length === 0 && !loading ? (
            <Empty description="Không có phương tiện" />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record) => record.id || record.vin}
              pagination={{
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trên ${total} xe`,
              }}
            />
          )}
        </Spin>
      </Card>

      <Modal
        title={
          editingVehicle ? "Chỉnh sửa phương tiện" : "Đăng ký phương tiện mới"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="vin"
            label="Mã VIN (Vehicle Identification Number)"
            rules={[
              { required: true, message: "Vui lòng nhập mã VIN!" },
              { min: 5, message: "Mã VIN phải có ít nhất 5 ký tự!" },
            ]}
          >
            <Input 
              placeholder="Nhập mã VIN (số khung xe)"
              disabled={isDriver && editingVehicle} 
            />
          </Form.Item>

          <Form.Item
            name="plateNumber"
            label="Biển số xe"
            rules={[{ required: true, message: "Vui lòng nhập biển số xe!" }]}
          >
            <Input 
              placeholder="VD: 83A-12345"
              disabled={isDriver && editingVehicle}  
            />
          </Form.Item>

          <Form.Item
            name="model"
            label="Dòng xe"
            rules={[{ required: true, message: "Vui lòng nhập dòng xe!" }]}
          >
            <Input placeholder="VD: Model 3, VinFast Feliz..." />
          </Form.Item>

          {isAdminOrStaff && (
              <Form.Item
                  name="driverId"
                  label="Tài xế"
                  loading={drivers.length === 0}
              >
                  <Select 
                      placeholder="Chọn tài xế" 
                      allowClear
                  >
                      {drivers.map((driver) => (
                          // Giả định driver object có id và name
                          <Option key={driver.id} value={driver.id}>
                              {driver.name} - ID: {driver.id}
                          </Option>
                      ))}
                  </Select>
              </Form.Item>
          )}

          <Form.Item
            name="batteryTypeId"
            label="Loại pin"
            rules={[{ required: true, message: "Vui lòng chọn loại pin!" }]}
          >
            <Select placeholder="Chọn loại pin">
              {batteryTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVehicle ? "Cập nhật" : "Đăng ký"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Lịch sử Đổi Pin */}
      <VehicleSwapHistoryModal
        open={isHistoryModalVisible}
        onClose={handleHistoryModalClose}
        vehicleHistory={vehicleHistory}
        loading={historyLoading}
        vehicleId={selectedVehicleId}
        userRole={role}
      />
    </div>
  );
};

export default VehiclePage;
