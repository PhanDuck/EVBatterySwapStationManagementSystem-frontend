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
  SyncOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import handleApiError from "../../Utils/handleApiError";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;
const { Title, Text } = Typography;

// --- COMPONENT CON: Hiển thị thông báo xe đang chờ duyệt (PHIÊN BẢN PRO UI) ---
const PendingVehicleAlert = ({ vehicle }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdTime = new Date(vehicle.createdAt).getTime();
      const twelveHoursInMillis = 12 * 60 * 60 * 1000; // 12 tiếng
      const deadline = createdTime + twelveHoursInMillis;
      const now = new Date().getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0 });
      } else {
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ hours, minutes });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [vehicle.createdAt]);

  const formattedCreatedDate = new Date(vehicle.createdAt).toLocaleString(
    "vi-VN",
    {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );

  // Style cho biển số xe giống thật
  const plateStyle = {
    border: "2px solid #333",
    borderRadius: "4px",
    padding: "2px 8px",
    backgroundColor: "white",
    color: "black",
    fontWeight: "bold",
    fontFamily: "monospace",
    fontSize: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dải màu trang trí bên trái */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "6px",
          background: "linear-gradient(180deg, #faad14 0%, #ffec3d 100%)",
        }}
      />

      <Row gutter={[24, 24]} align="middle">
        {/* Cột 1: Thông tin chính và Trạng thái */}
        <Col xs={24} md={14}>
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Space align="center" style={{ marginBottom: 8 }}>
              <Spin
                indicator={
                  <SyncOutlined
                    spin
                    style={{ fontSize: 20, color: "#faad14" }}
                  />
                }
              />
              <Text strong style={{ fontSize: 18, color: "#faad14" }}>
                Hồ sơ đăng ký đang được xét duyệt
              </Text>
            </Space>

            <Title level={3} style={{ margin: "4px 0 8px 0" }}>
              {vehicle.model}
            </Title>

            <Space size={16} align="center" wrap>
              <div style={plateStyle}>{vehicle.plateNumber}</div>
              <Text type="secondary">
                <CalendarOutlined /> Đăng ký lúc: {formattedCreatedDate}
              </Text>
            </Space>
          </Space>

          {/* Phần chính sách */}
          <div
            style={{
              marginTop: 20,
              padding: "16px",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              border: "1px dashed #d9d9d9",
            }}
          >
            <Text strong style={{ color: "#555" }}>
              <InfoCircleOutlined /> Quy trình duyệt xe:
            </Text>
            <ul style={{ margin: "8px 0 0 20px", color: "#666", padding: 0 }}>
              <li style={{ marginBottom: 4 }}>
                Thời gian xử lý trung bình: <strong>30 phút</strong>.
              </li>
              <li style={{ marginBottom: 4 }}>
                Hệ thống sẽ tự động hủy yêu cầu nếu quá <strong>12 tiếng</strong>{" "}
                không được duyệt.
              </li>
              <li>Kết quả sẽ được gửi thông báo qua email của bạn.</li>
            </ul>
          </div>
        </Col>

        {/* Cột 2: Đồng hồ đếm ngược */}
        <Col xs={24} md={10} style={{ textAlign: "center" }}>
          <div
            style={{
              backgroundColor: "#f2d338",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid #ffe58f",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              type="secondary"
              style={{
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Thời gian còn lại
            </Text>

            {isExpired ? (
              <Title level={4} type="danger" style={{ margin: "10px 0" }}>
                Đã hết hạn duyệt
              </Title>
            ) : (
              <div style={{ margin: "10px 0" }}>
                <Space align="baseline">
                  <span
                    style={{
                      fontSize: "48px",
                      fontWeight: "bold",
                      color: "#ff4d4f",
                      lineHeight: 1,
                    }}
                  >
                    {timeLeft.hours}
                  </span>
                  <span
                    style={{ fontSize: "16px", color: "#888", marginRight: 10 }}
                  >
                    giờ
                  </span>
                  <span
                    style={{
                      fontSize: "48px",
                      fontWeight: "bold",
                      color: "#ff4d4f",
                      lineHeight: 1,
                    }}
                  >
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "16px", color: "#888" }}>phút</span>
                </Space>
              </div>
            )}

            <Tag
              icon={<SafetyCertificateOutlined />}
              color={isExpired ? "red" : "orange"}
            >
              {isExpired ? "Hệ thống đang hủy bỏ" : "Đang chờ Admin xác nhận"}
            </Tag>
          </div>
        </Col>
      </Row>
    </div>
  );
};

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
  const [isSwapModalVisible, setIsSwapModalVisible] = useState(false);
  const [vehicleToSwap, setVehicleToSwap] = useState(null);
  const [selectedReplacementBattery, setSelectedReplacementBattery] =
    useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [rejectReasonModalVisible, setRejectReasonModalVisible] =
    useState(false);
  const [rejectingVehicleId, setRejectingVehicleId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectingVehicle, setIsRejectingVehicle] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [selectedVehicleForDeposit, setSelectedVehicleForDeposit] =
    useState(null);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [deleteReasonModalVisible, setDeleteReasonModalVisible] =
    useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);

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

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
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
      showToast(
        "error",
        error.response?.data || "Lỗi tải danh sách phương tiện"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const myPendingVehicles = useMemo(() => {
    if (isDriver) {
      return vehicles.filter((v) => v.status === "PENDING");
    }
    return [];
  }, [vehicles, isDriver]);

  // --- Component Modal Lịch sử Đổi Pin ---
  const VehicleSwapHistoryModal = React.memo(
    ({ open, onClose, vehicleHistory, loading, userRole }) => {
      const swapCount = vehicleHistory.length;
      const canViewTransactionId = userRole === "ADMIN" || userRole === "STAFF";

      const BatteryInfoCard = ({ title, batteryData, type }) => {
        const color = type === "new" ? "#52c41a" : "#faad14";
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
              <Row justify="space-between" style={{ paddingBottom: 5 }}>
                <Col>
                  <Text strong>ID Pin:</Text>
                </Col>
                <Col>
                  <Text>{batteryId}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: "5px 0" }} />
              <Row justify="space-between" style={{ paddingBottom: 5 }}>
                <Col>
                  <Text strong>Loại Pin:</Text>
                </Col>
                <Col>
                  <Text>{model}</Text>
                </Col>
              </Row>
              <Divider style={{ margin: "5px 0" }} />
              <Row justify="space-between" style={{ paddingBottom: 5 }}>
                <Col>
                  <Text strong>
                    <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc
                    (%):
                  </Text>
                </Col>
                <Col>
                  <Tag color={chargeLevel > 70 ? "green" : "orange"}>
                    {chargeLevel}
                  </Tag>
                </Col>
              </Row>
              <Divider style={{ margin: "5px 0" }} />
              <Row justify="space-between">
                <Col>
                  <Text strong>
                    <HeartOutlined style={{ color: "#ff4d4f" }} /> Tình trạng
                    pin (%):
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
          width={1000}
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

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (isAdmin) {
      const fetchDrivers = async () => {
        try {
          const res = await api.get("/admin/user");
          const driverList = Array.isArray(res.data)
            ? res.data.filter((u) => u.role === "DRIVER")
            : [];
          setDrivers(driverList.sort((a, b) => a.id - b.id));
        } catch (error) {
          showToast(
            "error",
            error.response?.data || "Lỗi tải danh sách tài xế"
          );
        }
      };
      fetchDrivers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (role === "ADMIN" && vehicles.length > 0) {
      const pendingList = vehicles.filter((v) => v.status === "PENDING");
      const sortedList = pendingList.sort((a, b) => b.id - a.id);
      setPendingVehicles(sortedList);
    }
  }, [vehicles, role]);

  useEffect(() => {
    const fetchBatteryTypes = async () => {
      try {
        const res = await api.get("/battery-type");
        setBatteryTypes(res.data || []);
      } catch (error) {
        showToast(
          "error",
          error.response?.data || "Lỗi tải danh sách loại pin"
        );
      }
    };
    fetchBatteryTypes();
  }, []);

  const handleSwapFaultyBattery = async (vehicle) => {
    setVehicleToSwap(vehicle);
    setSelectedReplacementBattery(null);
    setIsSwapModalVisible(true);

    const batteryTypeId = vehicle.batteryTypeId;

    if (batteryTypeId) {
      setBatteriesLoading(true);
      try {
        const response = await api.get(
          `/station-inventory/available-by-type/${batteryTypeId}`
        );

        const available = response.data.batteries.filter(
          (battery) => battery.id !== vehicle.currentBatteryId
        );

        setAvailableBatteries(available);
      } catch (error) {
        message.error("Lỗi khi tải danh sách pin thay thế!");
        console.error(error);
      } finally {
        setBatteriesLoading(false);
      }
    } else {
      message.warning("Xe chưa có loại pin được xác định!");
    }
  };

  const handleConfirmSwap = async () => {
    if (!vehicleToSwap || !selectedReplacementBattery) {
      message.error("Vui lòng chọn pin thay thế!");
      return;
    }

    const payload = {
      vehicleId: vehicleToSwap.id,
      replacementBatteryId: selectedReplacementBattery,
    };

    setIsSwapping(true);
    try {
      await api.post("/battery/swap-faulty", payload);
      message.success("Đã đổi pin lỗi thành công!");

      await fetchVehicles();

      setIsSwapModalVisible(false);
      setVehicleToSwap(null);
      setSelectedReplacementBattery(null);
      setAvailableBatteries([]);
    } catch (error) {
      message.error(
        `Lỗi đổi pin: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setIsSwapping(false);
    }
  };

  const fetchAvailableBatteries = async (batteryTypeId) => {
    setBatteriesLoading(true);
    try {
      const res = await api.get(
        `/station-inventory/available-by-type/${batteryTypeId}`
      );

      let availableList = [];
      if (Array.isArray(res.data)) {
        availableList = res.data;
      } else if (res.data?.batteries && Array.isArray(res.data.batteries)) {
        availableList = res.data.batteries;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        availableList = res.data.data;
      }

      setAvailableBatteries(availableList);
    } catch (error) {
      console.error("Error fetching batteries:", error);
      handleApiError(error, "Tải danh sách pin");
      setAvailableBatteries([]);
    } finally {
      setBatteriesLoading(false);
    }
  };

  const handleViewHistory = async (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setIsHistoryModalVisible(true);
    setHistoryLoading(true);
    setVehicleHistory([]);

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
            preview={{
              mask: (
                <Space>
                  <EyeOutlined /> Xem
                </Space>
              ),
            }}
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
        (a.plateNumber || "")
          .toLowerCase()
          .localeCompare(b.plateNumber || "")
          .toLowerCase(),
    },
    {
      title: "Dòng xe",
      dataIndex: "model",
      key: "model",
      sorter: (a, b) =>
        (a.model || "").toLowerCase().localeCompare(b.model || "").toLowerCase(),
    },
    ...(isAdmin
      ? [
          {
            title: "Tài xế",
            dataIndex: "driverName",
            key: "driverName",
            sorter: (a, b) =>
              (a.driverName || "")
                .toLowerCase()
                .localeCompare(b.driverName || "")
                .toLowerCase(),
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
        (a.batteryTypeName || "")
          .toLowerCase()
          .localeCompare(b.batteryTypeName || "")
          .toLowerCase(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => {
        let color = "red";
        if (status === "ACTIVE") color = "green";
        else if (status === "PENDING") color = "orange";
        else if (status === "UNPAID") color = "volcano";
        else if (status === "PAID") color = "blue";
        else if (status === "REFUNDED") color = "purple";
        return <Tag color={color}>{status}</Tag>;
      },
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
      render: (swapCount, record) => {
        if (record.status === "PENDING") return null;
        return (
          <Text style={{ color: "#000000ff" }}>
            {swapCount === undefined || swapCount === null ? "0" : swapCount}
          </Text>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      render: (_, record) => {
        const isDriver = role === "DRIVER";
        const isPending = record.status === "PENDING";
        const isUnpaid = record.status === "UNPAID";
        return (
          <Space wrap>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewHistory(record.id)}
              disabled={isPending || isUnpaid}
            >
              Xem
            </Button>

            {isDriver && isUnpaid && (
              <Button
                type="primary"
                style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
                icon={<ThunderboltOutlined />}
                size="small"
                onClick={() => handleDepositVehicle(record)}
              >
                Cọc xe
              </Button>
            )}

            {!isDriver && (
              <Space>
                <Button
                  type="default"
                  icon={<SwapOutlined />}
                  size="small"
                  onClick={() => handleSwapFaultyBattery(record)}
                  style={{
                    backgroundColor: "#fffbe5",
                    borderColor: "#ffe58f",
                  }}
                  disabled={record.status !== "ACTIVE"}
                >
                  Đổi
                </Button>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEdit(record)}
                  disabled={isPending || isUnpaid}
                >
                  Sửa
                </Button>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleDelete(record.id, record.status)}
                  disabled={record.status === "INACTIVE"}
                >
                  Xóa
                </Button>
              </Space>
            )}

            {isDriver && isUnpaid && (
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record.id, record.status)}
              >
                Xóa
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

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
            preview={{
              mask: (
                <Space>
                  <EyeOutlined /> Xem
                </Space>
              ),
            }}
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
              setRejectingVehicleId(record.id);
              setRejectReason("");
              setRejectReasonModalVisible(true);
            }}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

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
    };

    let endpoint = "";

    if (editingVehicle) {
      endpoint = `/vehicle/${editingVehicle.id}`;
    } else {
      endpoint = "/vehicle";
    }

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
      status:
        values.status || (editingVehicle ? editingVehicle.status : "PENDING"),
    };

    try {
      if (editingVehicle) {
        const formData = new FormData();
        formData.append("vin", payload.vin);
        formData.append("plateNumber", payload.plateNumber);
        formData.append("model", payload.model);
        formData.append("batteryTypeId", payload.batteryTypeId);

        await api.put(endpoint, formData);

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
        if (!imageFile || !(imageFile instanceof File)) {
          message.error("Vui lòng chọn ảnh giấy đăng ký!");
          setIsSubmitting(false);
          return;
        }

        let res;
        const formData = new FormData();
        formData.append("vin", payload.vin);
        formData.append("plateNumber", payload.plateNumber);
        formData.append("model", payload.model);
        formData.append("batteryTypeId", payload.batteryTypeId);
        formData.append("registrationImage", imageFile);
        res = await api.post(endpoint, formData);

        let newVehicleData = payload;
        if (res.data) {
          if (typeof res.data === "object" && res.data.id) {
            newVehicleData = res.data;
          } else if (res.data.data && typeof res.data.data === "object") {
            newVehicleData = res.data.data;
          } else if (res.data.success && res.data.data) {
            newVehicleData = res.data.data;
          }
        }

        const newVehicle = {
          ...newVehicleData,
          batteryTypeName: selectedBatteryType
            ? selectedBatteryType.name
            : "Không xác định",
          driverName: null,
          swapCount: 0,
          status: newVehicleData.status || "UNPAID",
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
      showToast(
        "error",
        error.response?.data || "Lỗi lưu thông tin phương tiện"
      );
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id, vehicleStatus) => {
    if (vehicleStatus === "UNPAID") {
      Modal.confirm({
        title: "Bạn có chắc muốn xóa xe này?",
        content: "Xe chưa thanh toán cọc sẽ bị xóa vĩnh viễn.",
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            try {
              await api.delete(`/vehicle/${id}/cancel`);
            } catch (error) {
              if (error.response?.status === 404) {
                await api.delete(`/vehicle/${id}`);
              } else {
                throw error;
              }
            }
            setVehicles((prev) => prev.filter((v) => v.id !== id));
            showToast("success", "Đã xóa phương tiện!");
          } catch (error) {
            showToast(
              "error",
              error.response?.data || "Lỗi xóa phương tiện"
            );
          }
        },
      });
    } else if (vehicleStatus === "PAID" || vehicleStatus === "PENDING") {
      setDeletingVehicleId(id);
      setDeleteReason("");
      setDeleteReasonModalVisible(true);
    } else {
      Modal.confirm({
        title: "Bạn có chắc muốn vô hiệu hóa xe này?",
        content: "Hành động này sẽ chuyển trạng thái xe thành INACTIVE.",
        okText: "Vô hiệu hóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            try {
              await api.delete(`/vehicle/${id}/cancel`);
            } catch (error) {
              if (error.response?.status === 404) {
                await api.delete(`/vehicle/${id}`);
              } else {
                throw error;
              }
            }
            setVehicles((prev) =>
              prev.map((v) => (v.id === id ? { ...v, status: "INACTIVE" } : v))
            );
            showToast("success", "Đã vô hiệu hóa phương tiện!");
          } catch (error) {
            showToast(
              "error",
              error.response?.data || "Lỗi vô hiệu hóa phương tiện"
            );
          }
        },
      });
    }
  };

  const handleDeleteVehicleWithRefund = async (vehicleId, reason) => {
    if (!reason || reason.trim() === "") {
      message.error("Vui lòng nhập lý do hoàn tiền!");
      return;
    }

    setIsDeletingVehicle(true);
    try {
      const payload = { refundReason: reason.trim() };
      const res = await api.delete(`/vehicle/${vehicleId}`, { data: payload });
      showToast("success", "Đã xóa xe và hoàn tiền cọc!");
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId ? { ...v, status: "REFUNDED" } : v
        )
      );
      setDeleteReasonModalVisible(false);
      setDeletingVehicleId(null);
      setDeleteReason("");
    } catch (error) {
      showToast("error", error.response?.data?.message || "Lỗi khi xóa xe");
    } finally {
      setIsDeletingVehicle(false);
    }
  };

  const handleDepositVehicle = (vehicle) => {
    setSelectedVehicleForDeposit(vehicle);
    setDepositModalVisible(true);
  };

  // --- SỬA LỖI Ở ĐÂY: Gửi redirectUrl qua Query Parameter ---
  const handleConfirmDeposit = async () => {
    if (!selectedVehicleForDeposit) {
      message.error("Vui lòng chọn xe!");
      return;
    }

    setIsProcessingDeposit(true);
    try {
      // Sử dụng tên miền thật của bạn
      const redirectUrl = "https://evbatteryswapsystem.com/payment/result";

      // Đã sửa: Truyền redirectUrl vào URL thay vì body
      // Sử dụng encodeURIComponent để mã hóa URL an toàn
      const res = await api.post(
        `/vehicle/${selectedVehicleForDeposit.id}/deposit/pay?redirectUrl=${encodeURIComponent(
          redirectUrl
        )}`
      );

      console.log("Deposit response:", res.data);

      let paymentUrl = null;

      if (res.data?.paymentUrl) {
        paymentUrl = res.data.paymentUrl;
      } else if (res.data?.payUrl) {
        paymentUrl = res.data.payUrl;
      } else if (typeof res.data === "string") {
        paymentUrl = res.data;
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        showToast("error", "Không tạo được liên kết thanh toán!");
      }
    } catch (error) {
      console.error("Error processing deposit:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Lỗi khi cọc xe";
      showToast("error", errorMessage);
    } finally {
      setIsProcessingDeposit(false);
    }
  };
  // -------------------------------------------------------------

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
    form.setFieldsValue(initialValues);
  };

  const handleImageUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Vui lòng chọn file hình ảnh!");
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      showToast("error", "Ảnh phải nhỏ hơn 5MB!");
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setVehicleImage(e.target.result);
    };
    reader.onerror = (error) => {
      showToast("error", "Lỗi đọc file ảnh!");
    };
    reader.readAsDataURL(file);
    setImageFile(file);
    return false;
  };

  const [isApprovingVehicle, setIsApprovingVehicle] = useState(false);

  const handleApproveVehicle = async (vehicleId, batteryId) => {
    setIsApprovingVehicle(true);
    try {
      const payload = {};
      if (batteryId) {
        payload.batteryId = batteryId;
      }
      await api.put(`/vehicle/${vehicleId}/approve`, payload);
      showToast("success", "Đã duyệt xe thành công!");

      setPendingVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
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

  const handleRejectVehicle = async (vehicleId, reason) => {
    if (!reason || reason.trim() === "") {
      message.error("Vui lòng nhập lý do từ chối!");
      return;
    }
    setIsRejectingVehicle(true);
    try {
      const payload = { rejectionReason: reason.trim() };
      await api.put(`/vehicle/${vehicleId}/reject`, payload);
      showToast("success", "Đã từ chối xe!");
      setPendingVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      setRejectReasonModalVisible(false);
      setRejectingVehicleId(null);
      setRejectReason("");
    } catch (error) {
      showToast("error", error.response?.data?.message || "Lỗi khi từ chối xe");
    } finally {
      setIsRejectingVehicle(false);
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

          {isDriver && myPendingVehicles.length > 0 && (
            <div style={{ marginTop: 24 }}>
              {myPendingVehicles.map((vehicle) => (
                <PendingVehicleAlert key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal Cọc Xe */}
      <Modal
        title="Cọc xe"
        open={depositModalVisible}
        onOk={handleConfirmDeposit}
        onCancel={() => {
          setDepositModalVisible(false);
          setSelectedVehicleForDeposit(null);
        }}
        okText="Xác nhận cọc"
        cancelText="Hủy"
        confirmLoading={isProcessingDeposit}
      >
        {selectedVehicleForDeposit && (
          <div>
            <p>
              <strong>Biển số xe:</strong> {selectedVehicleForDeposit.plateNumber}
            </p>
            <p>
              <strong>Dòng xe:</strong> {selectedVehicleForDeposit.model}
            </p>
            <p>
              <strong>Loại pin:</strong> {selectedVehicleForDeposit.batteryTypeName}
            </p>
            <p style={{ color: "#ff4d4f", marginTop: 16 }}>
              Bạn sẽ được chuyển đến trang thanh toán để quét mã QR cọc xe.
            </p>
          </div>
        )}
      </Modal>

      {/* Modal Xóa Xe Với Hoàn Tiền */}
      <Modal
        title="Xóa xe và hoàn tiền cọc"
        open={deleteReasonModalVisible}
        onOk={() =>
          handleDeleteVehicleWithRefund(deletingVehicleId, deleteReason)
        }
        onCancel={() => {
          setDeleteReasonModalVisible(false);
          setDeletingVehicleId(null);
          setDeleteReason("");
        }}
        okText="Xác nhận xóa"
        cancelText="Hủy"
        confirmLoading={isDeletingVehicle}
      >
        <p>Vui lòng nhập lý do hoàn tiền cọc:</p>
        <Input.TextArea
          rows={4}
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
          placeholder="Nhập lý do hoàn tiền..."
        />
      </Modal>

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

          {!editingVehicle && (
            <Form.Item
              name="registrationImage"
              label="Ảnh giấy đăng ký xe"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ảnh giấy đăng ký!",
                },
              ]}
            >
              <div>
                {!vehicleImage && (
                  <Upload
                    beforeUpload={handleImageUpload}
                    maxCount={1}
                    accept="image/*"
                    listType="picture-card"
                    fileList={[]}
                    showUploadList={false}
                  >
                    <div>
                      <UploadOutlined style={{ fontSize: 32 }} />
                      <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                    </div>
                  </Upload>
                )}

                {vehicleImage && (
                  <div style={{ marginTop: 16 }}>
                    <Image
                      src={vehicleImage}
                      alt="Preview"
                      height={150}
                      style={{
                        borderRadius: 8,
                        objectFit: "contain",
                        border: "1px solid #d9d9d9",
                      }}
                      preview={{
                        mask: (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              fontSize: "14px",
                            }}
                          >
                            <Space>
                              <EyeOutlined /> Xem
                            </Space>

                            <div
                              style={{
                                width: 1,
                                height: 14,
                                backgroundColor: "rgba(255,255,255,0.5)",
                              }}
                            />

                            <Space
                              className="delete-btn-hover"
                              style={{
                                cursor: "pointer",
                                color: "#ff4d4f",
                                fontWeight: "bold",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setVehicleImage(null);
                                form.setFieldsValue({
                                  registrationImage: null,
                                });
                              }}
                            >
                              <DeleteOutlined /> Xóa
                            </Space>
                          </div>
                        ),
                      }}
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

      <VehicleSwapHistoryModal
        open={isHistoryModalVisible}
        onClose={handleHistoryModalClose}
        vehicleHistory={vehicleHistory}
        loading={historyLoading}
        vehicleId={selectedVehicleId}
        userRole={role}
      />

      <Modal
        title={`Đổi Pin Lỗi cho xe: ${vehicleToSwap?.plateNumber}`}
        open={isSwapModalVisible}
        onCancel={() => setIsSwapModalVisible(false)}
        width={500}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsSwapModalVisible(false)}
            disabled={isSwapping}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSwapping}
            onClick={handleConfirmSwap}
            disabled={!selectedReplacementBattery}
          >
            {isSwapping ? "Đang đổi pin..." : "Xác nhận Đổi pin"}
          </Button>,
        ]}
      >
        {vehicleToSwap && (
          <Form layout="vertical">
            <Form.Item label="Pin hiện tại bị lỗi" style={{ marginBottom: 8 }}>
              <Tag color="red">
                Pin #{vehicleToSwap.currentBatteryId} -{" "}
                {vehicleToSwap.currentBatteryModel}
              </Tag>
            </Form.Item>
            <Form.Item label="Chọn Pin Thay Thế" required>
              <Spin spinning={batteriesLoading}>
                <Select
                  placeholder="Chọn pin AVAILABLE để thay thế"
                  onChange={setSelectedReplacementBattery}
                  value={selectedReplacementBattery}
                  showSearch
                  optionFilterProp="label"
                >
                  {availableBatteries.map((battery) => (
                    <Option
                      key={battery.id}
                      value={battery.id}
                      label={`Pin #${battery.id} - ${battery.model}`}
                    >
                      <div
                        style={{
                          padding: "8px 0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontWeight: "bold", flex: 1 }}>
                          Pin #{battery.id} - {battery.model}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            display: "flex",
                            gap: "8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Tag
                            color={
                              battery.chargeLevel > 70 ? "green" : "orange"
                            }
                          >
                            {battery.chargeLevel}%
                          </Tag>
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
                {availableBatteries.length === 0 && !batteriesLoading && (
                  <p style={{ marginTop: 10, color: "red" }}>
                    **Không có pin AVAILABLE phù hợp với loại pin này.**
                  </p>
                )}
              </Spin>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Duyệt xe và chọn pin"
        open={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedVehicleForApprove(null);
          setSelectedBatteryForApprove(null);
          setAvailableBatteries([]);
        }}
        width={900}
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
                    popupMatchSelectWidth={false}
                    style={{ width: "100%" }}
                    popupStyle={{ minWidth: "800px", maxHeight: "400px" }}
                  >
                    {availableBatteries.map((battery) => (
                      <Option
                        key={battery.id}
                        value={battery.id}
                        label={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <span>
                              Pin #{battery.id} - {battery.model}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                gap: "16px",
                                whiteSpace: "nowrap",
                                fontSize: "12px",
                              }}
                            >
                              <span>
                                Mức sạc:{" "}
                                <Tag
                                  color={
                                    battery.chargeLevel > 70
                                      ? "green"
                                      : "orange"
                                  }
                                >
                                  {battery.chargeLevel}%
                                </Tag>
                              </span>
                              <span>
                                Tình trạng:{" "}
                                <Tag
                                  color={
                                    battery.stateOfHealth > 70
                                      ? "green"
                                      : "orange"
                                  }
                                >
                                  {battery.stateOfHealth}%
                                </Tag>
                              </span>
                            </div>
                          </div>
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            padding: "8px 0",
                          }}
                        >
                          <div style={{ fontWeight: "bold" }}>
                            Pin #{battery.id} - {battery.model}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              whiteSpace: "nowrap",
                              fontSize: "12px",
                            }}
                          >
                            <span>
                              Mức sạc:{" "}
                              <Tag
                                color={
                                  battery.chargeLevel > 70 ? "green" : "orange"
                                }
                              >
                                {battery.chargeLevel}%
                              </Tag>
                            </span>
                            <span>
                              Tình trạng:{" "}
                              <Tag
                                color={
                                  battery.stateOfHealth > 70
                                    ? "green"
                                    : "orange"
                                }
                              >
                                {battery.stateOfHealth}%
                              </Tag>
                            </span>
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

      <Modal
        title="Từ chối xe"
        open={rejectReasonModalVisible}
        onCancel={() => {
          setRejectReasonModalVisible(false);
          setRejectingVehicleId(null);
          setRejectReason("");
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setRejectReasonModalVisible(false);
              setRejectingVehicleId(null);
              setRejectReason("");
            }}
            disabled={isRejectingVehicle}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={isRejectingVehicle}
            onClick={() => {
              if (rejectingVehicleId) {
                handleRejectVehicle(rejectingVehicleId, rejectReason);
              }
            }}
          >
            {isRejectingVehicle ? "Đang từ chối..." : "Từ chối xe"}
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Lý do từ chối" required>
            <Input.TextArea
              placeholder="Nhập lý do từ chối xe (sẽ được gửi đến email khách hàng)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehiclePage;