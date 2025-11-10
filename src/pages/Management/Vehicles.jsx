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
  Upload,
  Image,
  Tabs,
  Tooltip,
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
  UploadOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import handleApiError from "../../Utils/handleApiError";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;
const { Title, Text } = Typography;

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [batteryTypes, setBatteryTypes] = useState([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [vehicleImage, setVehicleImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [availableBatteries, setAvailableBatteries] = useState([]);
  const [batteriesLoading, setBatteriesLoading] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedVehicleForApprove, setSelectedVehicleForApprove] =
    useState(null);
  const [selectedBatteryForApprove, setSelectedBatteryForApprove] =
    useState(null);
  const [drivers, setDrivers] = useState([]);

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
  const isAdmin = role === "ADMIN";

  // --- Component Modal Lịch sử Đổi Pin ---
  const VehicleSwapHistoryModal = React.memo(
    ({ open, onClose, vehicleHistory, loading, userRole }) => {
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
                  <Text>{batteryId}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: "5px 0" }} />

              {/* 2. Loại Pin (Model) */}
              <Row justify="space-between" style={{ paddingBottom: 5 }}>
                <Col>
                  <Text strong>Loại Pin:</Text>
                </Col>
                <Col>
                  <Text>{model}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: "5px 0" }} />

              {/* 3. Mức sạc (Charge Level) */}
              <Row justify="space-between" style={{ paddingBottom: 5 }}>
                <Col>
                  <Text strong>
                    <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc (%):
                  </Text>
                </Col>
                <Col>
                  <Tag color={chargeLevel > 70 ? "green" : "orange"}>
                    {chargeLevel}
                  </Tag>
                </Col>
              </Row>
              <Divider style={{ margin: "5px 0" }} />

              {/* 4. Tình trạng pin (State of Health) */}
              <Row justify="space-between">
                <Col>
                  <Text strong>
                    <HeartOutlined style={{ color: "#ff4d4f" }} /> Tình trạng pin (%):
                  </Text>
                </Col>
                <Col>
                  <Tag color={soh > 70 ? "green" : "orange"}>{soh}</Tag>
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
            style={{
              marginBottom: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
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
        const endpoint = isAdmin ? "/vehicle" : "/vehicle/my-vehicles";
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
        showToast("error", error.response?.data || "Lỗi tải danh sách phương tiện");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [isAdmin]);

  // 👥 Lấy danh sách tài xế (chỉ cho ADMIN)
  useEffect(() => {
    if (isAdmin) {
          const fetchDrivers = async () => {
            try {
              const res = await api.get("/admin/user");
              // Lọc chỉ lấy những user có role = DRIVER
              const driverList = Array.isArray(res.data)
                ? res.data.filter((u) => u.role === "DRIVER")
                : [];
              setDrivers(driverList.sort((a, b) => a.id - b.id));
            } catch (error) {
              showToast("error", error.response?.data || "Lỗi tải danh sách tài xế");
            }
          };
          fetchDrivers();
        }
      }, [isAdmin]);

  // 🚗 Lấy danh sách xe chờ duyệt từ danh sách vehicles đã có
  useEffect(() => {
    if (role === "ADMIN" && vehicles.length > 0) {
      // Lọc xe có status = PENDING từ danh sách vehicles đã fetch
      const pendingList = vehicles.filter((v) => v.status === "PENDING");
      const sortedList = pendingList.sort((a, b) => b.id - a.id);
      console.log("Pending vehicles (status=PENDING):", sortedList);
      setPendingVehicles(sortedList);
    }
  }, [vehicles, role]);

  // 🔋 Lấy loại pin
  useEffect(() => {
    const fetchBatteryTypes = async () => {
      try {
        const res = await api.get("/battery-type");
        setBatteryTypes(res.data || []);
      } catch (error) {
        showToast("error", error.response?.data || "Lỗi tải danh sách loại pin");
      }
    };
    fetchBatteryTypes();
  }, []);

  // 🔋 Lấy danh sách pin AVAILABLE trong kho theo batteryTypeId
  const fetchAvailableBatteries = async (batteryTypeId) => {
    setBatteriesLoading(true);
    try {
      const res = await api.get(
        `/station-inventory/available-by-type/${batteryTypeId}`
      );
      console.log("Available batteries response:", res.data);

      let availableList = [];
      if (Array.isArray(res.data)) {
        availableList = res.data;
      } else if (res.data?.batteries && Array.isArray(res.data.batteries)) {
        availableList = res.data.batteries;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        availableList = res.data.data;
      }

      console.log(
        "Available batteries for type",
        batteryTypeId,
        ":",
        availableList
      );
      console.log("Total available batteries:", availableList.length);
      setAvailableBatteries(availableList);
    } catch (error) {
      console.error("Error fetching batteries:", error);
      handleApiError(error, "Tải danh sách pin");
      setAvailableBatteries([]);
    } finally {
      setBatteriesLoading(false);
    }
  };

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
      showToast("error", error.response?.data || "Lỗi tải lịch sử đổi pin");
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
      title: "Ảnh xe",
      dataIndex: "registrationImage",
      key: "registrationImage",
      render: (image) =>
        image ? (
          <Image
            src={image}
            alt="Vehicle"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
            preview
          />
        ) : (
          <Text type="secondary">Không có ảnh</Text>
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
    ...(isAdmin
      ? [
          {
            title: "Tài xế",
            dataIndex: "driverName",
            key: "driverName",
            sorter: (a, b) =>
              (a.driverName || "").localeCompare(b.driverName || ""),
            render: (driverName, record) => (
              <Text>
                {driverName ||
                  (record.driverId ? `ID: ${record.driverId}` : "")}
              </Text>
            ),
          },
        ]
      : []),
    {
      title: "Loại pin",
      dataIndex: "batteryTypeName",
      key: "batteryTypeName",
      sorter: (a, b) =>
        (a.batteryTypeName || "").localeCompare(b.batteryTypeName),
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
      title: "Pin hiện tại",
      dataIndex: "currentBatteryId",
      key: "currentBatteryId",
      width: 120,
      render: (batteryId) => (
        <Text style={{ color: "#000000ff" }}>
          {batteryId ? `Pin #${batteryId}` : "Không có pin"}
        </Text>
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

  // 🧾 Cột bảng xe chờ duyệt
  const pendingColumns = [
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
      title: "Ảnh xe",
      dataIndex: "registrationImage",
      key: "registrationImage",
      render: (image) =>
        image ? (
          <Image
            src={image}
            alt="Vehicle"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
            preview
          />
        ) : (
          <Text type="secondary">Không có ảnh</Text>
        ),
    },
    {
      title: "Biển số xe",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "Dòng xe",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "ID tài xế",
      dataIndex: "driverId",
      key: "driverId",
      render: (driverId) => <Text>{driverId ? `ID: ${driverId}` : ""}</Text>,
    },
    {
      title: "Loại pin",
      dataIndex: "batteryTypeName",
      key: "batteryTypeName",
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            style={{ backgroundColor: "#52c41a" }}
            onClick={() => {
              setSelectedVehicleForApprove(record);
              setSelectedBatteryForApprove(null);
              setApproveModalVisible(true);
              fetchAvailableBatteries(record.batteryTypeId);
            }}
          >
            Duyệt
          </Button>
          <Button
            type="primary"
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => {
              Modal.confirm({
                title: "Từ chối xe",
                content: "Nhập lý do từ chối:",
                okText: "Từ chối",
                cancelText: "Hủy",
                onOk() {
                  const reason = prompt("Lý do từ chối:");
                  if (reason) {
                    handleRejectVehicle(record.id, reason);
                  }
                },
              });
            }}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  // 🟢 CREATE / UPDATE
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    const selectedBatteryType = batteryTypes.find(
      (t) => t.id === values.batteryTypeId
    );
    let payload = {
      vin: values.vin,
      plateNumber: values.plateNumber,
      model: values.model,
      batteryTypeId: values.batteryTypeId,
      //...(editingVehicle && isAdmin && { status: values.status }),
    };

    // Thêm driverId nếu đang sửa và admin chọn tài xế
    if (editingVehicle && isAdmin && values.driverId) {
      payload.driverId = values.driverId;
    }

    let endpoint = "";

    if (editingVehicle) {
      endpoint = `/vehicle/${editingVehicle.id}`;
    } else {
      endpoint = "/vehicle";
    }

    // Lấy tên tài xế từ danh sách drivers
    const selectedDriver = drivers.find((d) => d.id === values.driverId);
    const driverName = selectedDriver
      ? selectedDriver.fullName
      : editingVehicle?.driverName;

    const updateData = {
      ...payload,
      batteryTypeName: selectedBatteryType
        ? selectedBatteryType.name
        : "Không xác định",
      driverName: driverName,
      id: editingVehicle ? editingVehicle.id : undefined,
      //status: editingVehicle ? editingVehicle.status : "ACTIVE",
      status:
        values.status || (editingVehicle ? editingVehicle.status : "PENDING"),
    };

    try {
      if (editingVehicle) {
        // Logic UPDATE - Không gửi ảnh khi sửa
        console.log("Updating vehicle without image");
        console.log("Payload:", payload);

        // Gửi FormData thay vì JSON để tránh lỗi 415
        const formData = new FormData();
        formData.append("vin", payload.vin);
        formData.append("plateNumber", payload.plateNumber);
        formData.append("model", payload.model);
        formData.append("batteryTypeId", payload.batteryTypeId);
        if (payload.driverId) {
          formData.append("driverId", payload.driverId);
        }
        // if (payload.status) {
        //   formData.append("status", payload.status);
        // }

        const response = await api.put(endpoint, formData);

        console.log("Update response:", response);

        setVehicles((prev) =>
          prev.map((v) =>
            v.id === editingVehicle.id
              ? {
                  ...v,
                  ...updateData,
                  registrationImage: vehicleImage,
                  status: v.status,
                }
              : v
          )
        );
        showToast("success", "Cập nhật phương tiện thành công!");
        
      } else {
        // Logic CREATE - Bắt buộc có ảnh
        if (!imageFile || !(imageFile instanceof File)) {
          message.error("Vui lòng chọn ảnh giấy đăng ký!");
          setIsSubmitting(false);
          return;
        }

        let res;
        // Gửi FormData với ảnh
        const formData = new FormData();
        formData.append("vin", payload.vin);
        formData.append("plateNumber", payload.plateNumber);
        formData.append("model", payload.model);
        formData.append("batteryTypeId", payload.batteryTypeId);
        formData.append("registrationImage", imageFile);
        console.log("Sending FormData with image:", imageFile.name);
        res = await api.post(endpoint, formData);

        // Xử lý response từ backend
        console.log("API Response:", res.data);
        let newVehicleData = payload;
        if (res.data) {
          // Nếu backend trả về object
          if (typeof res.data === "object" && res.data.id) {
            console.log("Format 1: Direct object with id");
            newVehicleData = res.data;
          }
          // Nếu backend trả về wrapped response (e.g., { data: {...} })
          else if (res.data.data && typeof res.data.data === "object") {
            console.log("Format 2: Wrapped in data field");
            newVehicleData = res.data.data;
          }
          // Nếu backend trả về { success: true, message: "...", data: {...} }
          else if (res.data.success && res.data.data) {
            console.log("Format 3: Success wrapper with data");
            newVehicleData = res.data.data;
          }
        }
        console.log("Final newVehicleData:", newVehicleData);

        const newVehicle = {
          ...newVehicleData,
          batteryTypeName: selectedBatteryType
            ? selectedBatteryType.name
            : "Không xác định",
          driverName: null,
          swapCount: 0,
          status: newVehicleData.status || "ACTIVE",
          registrationImage: vehicleImage || newVehicleData.registrationImage,
          id: newVehicleData.id || Date.now(),
        };
        setVehicles((prev) => [newVehicle, ...prev]);
        showToast("success", "Đăng ký phương tiện thành công!");
      }

      setIsModalVisible(false);
      form.resetFields();
      setVehicleImage(null);
      setImageFile(null);
    } catch (error) {

      showToast("error", error.response?.data || "Lỗi lưu thông tin phương tiện");
      setIsSubmitting(false);
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
          showToast("success", "Đã vô hiệu hóa phương tiện!");
        } catch (error) {
          showToast("error", error.response?.data || "Lỗi vô hiệu hóa phương tiện");
        }
      },
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalVisible(true);
    setVehicleImage(vehicle.registrationImage || null);
    setImageFile(null);
    const initialValues = {
      vin: vehicle.vin,
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      batteryTypeId: vehicle.batteryTypeId,
      status: vehicle.status,
    };

    // Thêm driverId nếu là admin
    if (isAdmin && vehicle.driverId) {
      initialValues.driverId = vehicle.driverId;
    }

    form.setFieldsValue(initialValues);
  };

  // 🖼️ Xử lý upload ảnh
  const handleImageUpload = (file) => {
    console.log("File selected:", file);
    console.log("File type:", file.type);
    console.log("File size:", file.size);

    // Kiểm tra file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Vui lòng chọn file hình ảnh!");
      return Upload.LIST_IGNORE;
    }

    // Kiểm tra file size (max 10MB)
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      showToast("error", "Ảnh phải nhỏ hơn 10MB!");
      return Upload.LIST_IGNORE;
    }

    // Đọc file và hiển thị preview
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("Image preview loaded successfully");
      setVehicleImage(e.target.result);
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      showToast("error", "Lỗi đọc file ảnh!");
    };
    reader.readAsDataURL(file);

    // Lưu file để gửi lên server
    setImageFile(file);
    console.log("Image file set:", file.name);

    return false; // Ngăn upload tự động
  };

  // ✅ Duyệt xe
  const [isApprovingVehicle, setIsApprovingVehicle] = useState(false);

  const handleApproveVehicle = async (vehicleId, batteryId) => {
    setIsApprovingVehicle(true);
    try {
      console.log("Approving vehicle:", vehicleId, "with battery:", batteryId);

      // Tạo payload - gửi batteryId (không phải currentBatteryId)
      const payload = {};
      if (batteryId) {
        payload.batteryId = batteryId;
      }
      console.log("Payload being sent:", JSON.stringify(payload));

      // Gửi request
      const res = await api.put(`/vehicle/${vehicleId}/approve`, payload);
      console.log("Full Approve response:", res);
      console.log("Approve response data:", res.data);
      console.log("Response status:", res.status);

      showToast("success", "Đã duyệt xe thành công!");

      // Cập nhật danh sách xe chờ duyệt
      setPendingVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

      // Cập nhật danh sách xe chính - thay đổi status từ PENDING thành ACTIVE
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? {
                ...v,
                status: "ACTIVE",
                ...(batteryId && { currentBatteryId: batteryId }),
              }
            : v
        )
      );

      setApproveModalVisible(false);
      setSelectedVehicleForApprove(null);
      setSelectedBatteryForApprove(null);
    } catch (error) {
      console.error("Error approving vehicle - Full error:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);

      // Hiển thị thông báo lỗi chi tiết
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Lỗi khi duyệt xe";
      showToast("error", errorMessage);
    } finally {
      setIsApprovingVehicle(false);
    }
  };

  // ❌ Từ chối xe
  const handleRejectVehicle = async (vehicleId, reason) => {
    try {
      console.log("Rejecting vehicle:", vehicleId, "Reason:", reason);
      const res = await api.put(`/vehicle/${vehicleId}/reject`, { reason });
      console.log("Reject response:", res.data);

      showToast("success", "Đã từ chối xe!");

      // Cập nhật danh sách xe chờ duyệt
      setPendingVehicles((prev) => prev.filter((v) => v.id !== vehicleId));

      // Cập nhật danh sách xe chính - xóa xe bị từ chối
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    } catch (error) {
      console.error(
        "Error rejecting vehicle:",
        error.response?.data || error.message
      );
      showToast("error", error.response?.data?.message || "Lỗi khi từ chối xe");
    }
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalVisible(true);
    setVehicleImage(null);
    setImageFile(null);
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
      {isAdmin ? (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "all",
              label: "Tất cả xe",
              children: (
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
              ),
            },
            {
              key: "pending",
              label: `Xe chờ duyệt (${pendingVehicles.length})`,
              children: (
                <Card title="Duyệt xe">
                  {pendingVehicles.length === 0 ? (
                    <Empty description="Không có xe chờ duyệt" />
                  ) : (
                    <Table
                      columns={pendingColumns}
                      dataSource={pendingVehicles}
                      rowKey={(record) => record.id}
                      pagination={{
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} trên ${total} xe`,
                      }}
                    />
                  )}
                </Card>
              ),
            },
          ]}
        />
      ) : (
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
      )}

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
            rules={[{ required: true, message: "Vui lòng nhập mã VIN!" }]}
          >
            <Input placeholder="Nhập mã VIN (17 ký tự)" />
          </Form.Item>

          <Form.Item
            name="plateNumber"
            label="Biển số xe"
            rules={[{ required: true, message: "Vui lòng nhập biển số xe!" }]}
          >
            <Input placeholder="VD: 29K112342" />
          </Form.Item>

          <Form.Item
            name="model"
            label="Dòng xe"
            rules={[{ required: true, message: "Vui lòng nhập dòng xe!" }]}
          >
            <Input placeholder="VD: VinFast Klara S, Tesla Model 3" />
          </Form.Item>

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

          {editingVehicle && isAdmin && (
            <Form.Item
              name="driverId"
              label="Tài xế"
              rules={[{ required: true, message: "Vui lòng chọn tài xế!" }]}
            >
              <Select placeholder="Chọn tài xế">
                {drivers.map((driver) => (
                  <Option key={driver.id} value={driver.id}>
                    {driver.fullName} (ID: {driver.id})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* {editingVehicle && isAdmin && (
            <Form.Item
              name="status"
              label={
                <Tooltip title="ACTIVE: Xe đang hoạt động, INACTIVE: Xe bị vô hiệu hóa">
                  <Space>
                    Trạng thái <InfoCircleOutlined />
                  </Space>
                </Tooltip>
              }
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="ACTIVE">
                  <Tag color="green">ACTIVE</Tag>
                </Option>
                <Option value="INACTIVE">
                  <Tag color="red">INACTIVE</Tag>
                </Option>
              </Select>
            </Form.Item>
          )} */}

          {!editingVehicle && (
            <Form.Item
              name="registrationImage"
              label="Ảnh giấy đăng ký xe"
              rules={[
                { required: true, message: "Vui lòng chọn ảnh giấy đăng ký!" },
              ]}
            >
              <div>
                <Upload
                  beforeUpload={handleImageUpload}
                  maxCount={1}
                  accept="image/*"
                  listType="picture-card"
                  fileList={[]}
                  onRemove={() => {
                    setImageFile(null);
                    setVehicleImage(null);
                  }}
                >
                  {!vehicleImage && (
                    <div>
                      <UploadOutlined style={{ fontSize: 32 }} />
                      <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                    </div>
                  )}
                </Upload>
                {vehicleImage && (
                  <div style={{ marginTop: 16 }}>
                    <Image
                      src={vehicleImage}
                      alt="Registration Image Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 300,
                        borderRadius: 4,
                      }}
                      preview
                    />
                  </div>
                )}
              </div>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isSubmitting
                  ? editingVehicle
                    ? "Đang cập nhật..."
                    : "Đang đăng ký..."
                  : editingVehicle
                  ? "Cập nhật"
                  : "Đăng ký"}
              </Button>
              <Button
                onClick={() => setIsModalVisible(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Duyệt xe và chọn pin */}
      <Modal
        title="Duyệt xe và chọn pin"
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedVehicleForApprove(null);
          setSelectedBatteryForApprove(null);
          setAvailableBatteries([]);
        }}
        width={500}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setApproveModalVisible(false);
              setSelectedVehicleForApprove(null);
              setSelectedBatteryForApprove(null);
              setAvailableBatteries([]);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isApprovingVehicle}
            onClick={() => {
              if (selectedVehicleForApprove) {
                console.log(
                  "Submit approve with vehicle:",
                  selectedVehicleForApprove.id,
                  "battery:",
                  selectedBatteryForApprove
                );
                handleApproveVehicle(
                  selectedVehicleForApprove.id,
                  selectedBatteryForApprove
                );
              } else {
                message.error("Vui lòng chọn xe để duyệt!");
              }
            }}
          >
            {isApprovingVehicle ? "Đang duyệt..." : "Duyệt xe"}
          </Button>,
        ]}
      >
        {selectedVehicleForApprove && (
          <div>
            <Form layout="vertical">
              <Form.Item label="Chọn pin để gán ban đầu (Pin sẵn có)" required>
                <Spin spinning={batteriesLoading}>
                  <Select
                    placeholder="Chọn pin phù hợp"
                    onChange={setSelectedBatteryForApprove}
                  >
                    {availableBatteries.map((battery) => (
                      <Option
                        key={battery.id}
                        value={battery.id}
                        label={
                          <Tooltip
                            title={`Mức sạc: ${battery.chargeLevel}% | Tình trạng: ${battery.stateOfHealth}%`}
                          >
                            <span>
                              Pin #{battery.id} - {battery.model}
                            </span>
                          </Tooltip>
                        }
                      >
                        <div style={{ padding: "8px 0" }}>
                          <div
                            style={{ fontWeight: "bold", marginBottom: "4px" }}
                          >
                            Pin #{battery.id} - {battery.model}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Mức sạc:
                            <Tag
                              color={
                                battery.chargeLevel > 70 ? "green" : "orange"
                              }
                            >
                              {battery.chargeLevel}%
                            </Tag>
                            Tình trạng:
                            <Tag
                              color={
                                battery.stateOfHealth > 70 ? "green" : "orange"
                              }
                            >
                              {battery.stateOfHealth}%
                            </Tag>
                          </div>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Spin>
              </Form.Item>
            </Form>
          </div>
        )}
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
