import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Tag,
  Select,
  Spin,
  Divider,
  Alert,
} from "antd";
import {
  QrcodeOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CarOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  WarningOutlined,
  SendOutlined,
} from "@ant-design/icons";
import QrScanner from "react-qr-scanner";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

const { Title, Text } = Typography;
const { Option } = Select;

// --- 1. MAPPING LOẠI PIN TỪ ID SANG TÊN ---
const BATTERY_TYPES = {
  1: "Standard 48V-20Ah",
  2: "Premium 52V-22Ah",
  3: "Max Power 60V-30Ah",
  // Thêm các loại khác nếu cần
};

// Helper: Tách ID từ URL
const extractStationId = (text) => {
  try {
    if (!text) return null;
    if (!isNaN(text)) return text;
    if (text.includes("http") || text.includes("stationId=")) {
      const urlStr = text.startsWith("http")
        ? text
        : `http://dummy.com?${text}`;
      const url = new URL(urlStr);
      return url.searchParams.get("stationId");
    }
    return text;
  } catch (e) {
    return text;
  }
};

const BatteryInfoCard = ({ title, batteryData, type, loading }) => {
  const color = type === "new" ? "#52c41a" : "#faad14";
  const borderColor = type === "new" ? "#b7eb8f" : "#ffe58f";

  if (loading)
    return (
      <Card style={{ height: 250, textAlign: "center" }}>
        <Spin tip="Đang tải..." style={{ marginTop: 80 }} />
      </Card>
    );
  if (!batteryData)
    return (
      <Card
        style={{
          height: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text type="secondary">Chưa có thông tin</Text>
      </Card>
    );

  const id =
    batteryData.batteryId || batteryData.newBatteryId || batteryData.id;
  const model =
    batteryData.model ||
    batteryData.newBatteryModel ||
    batteryData.batteryModel;
  const charge =
    batteryData.chargeLevel || batteryData.newBatteryChargeLevel || 0;
  const soh = batteryData.stateOfHealth || batteryData.newBatteryHealth || 0;

  return (
    <Card
      title={
        <Text strong style={{ color }}>
          {title}
        </Text>
      }
      style={{ borderColor: borderColor, height: "100%", minHeight: 250 }}
      headStyle={{ backgroundColor: type === "new" ? "#f6ffed" : "#fffbe6" }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row justify="space-between">
          <Text>ID:</Text>
          <Text strong>{id}</Text>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Row justify="space-between">
          <Text>Model:</Text>
          <Text>{model}</Text>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Row justify="space-between">
          <Text>
            <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc:
          </Text>
          <Tag color={charge > 80 ? "green" : "orange"}>{charge}%</Tag>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Row justify="space-between">
          <Text>
            <HeartOutlined style={{ color: "#ff4d4f" }} /> Sức khỏe:
          </Text>
          <Tag color={soh > 80 ? "green" : "orange"}>{soh}%</Tag>
        </Row>
      </Space>
    </Card>
  );
};

export default function QRCodePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const stationIdFromUrl = searchParams.get("stationId");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const isProcessingScan = useRef(false);

  // Data State
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [oldBatteryData, setOldBatteryData] = useState(null);

  const [stationName, setStationName] = useState(null);
  // State lưu tên loại pin của trạm
  const [stationBatteryType, setStationBatteryType] = useState(null);

  useEffect(() => {
    if (stationIdFromUrl) {
      setStep(2);
      fetchMyVehicles(stationIdFromUrl);
      fetchStationInfo(stationIdFromUrl);
    } else {
      setStep(1);
    }
  }, [stationIdFromUrl]);

  // Hàm lấy thông tin trạm (Name và Battery Type ID)
  const fetchStationInfo = async (sId) => {
    try {
      const res = await api.get(`/station`);
      if (Array.isArray(res.data)) {
        const found = res.data.find((s) => String(s.id) === String(sId));
        if (found) {
          setStationName(found.name);

          // Map ID -> NAME
          const typeId = found.batteryTypeId;
          const typeName = BATTERY_TYPES[typeId] || `Loại pin ID: ${typeId}`;
          setStationBatteryType(typeName);
        }
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin trạm:", error);
    }
  };

  const handleScan = (data) => {
    if (isProcessingScan.current) return;
    if (data) {
      const scannedText = data?.text || data;
      if (scannedText) {
        isProcessingScan.current = true;
        const cleanId = extractStationId(scannedText);
        if (!cleanId) {
          showToast("error", "Mã QR không hợp lệ!");
          isProcessingScan.current = false;
          return;
        }
        showToast("success", `Đã kết nối trạm`);
        setSearchParams({ stationId: cleanId });
        isProcessingScan.current = false;
      }
    }
  };

  const handleError = (err) => {};

  const fetchMyVehicles = async (sId) => {
    setLoading(true);
    try {
      const res = await api.get("/vehicle/my-vehicles");
      const list = Array.isArray(res.data) ? res.data : [];
      setVehicles(list);

      if (list.length > 0) {
        const validVehicle = list.find(
          (v) => v.status !== "PENDING" && v.status !== "UNPAID"
        );
        if (validVehicle) {
          setSelectedVehicleId(validVehicle.id);
          fetchPreview(sId, validVehicle.id);
        }
      } else {
        showToast("warning", "Bạn chưa có xe điện nào!");
      }
    } catch (error) {
      showToast("error", "Không thể tải danh sách xe.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async (sId, vId) => {
    if (!sId || !vId) return;

    setLoading(true);
    setPreviewError(null);
    setPreviewData(null);

    try {
      const res = await api.get("/quick-swap/preview", {
        params: { stationId: sId, vehicleId: vId },
      });
      setPreviewData(res.data);

      // Nếu API preview trả về stationName thì cập nhật lại
      if (res.data.stationName) {
        setStationName(res.data.stationName);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        "Không thể lấy thông tin pin";
      setPreviewError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = (val) => {
    setSelectedVehicleId(val);
    fetchPreview(stationIdFromUrl, val);
  };

  const handleConfirmVehicle = () => {
    if (!previewData) {
      showToast("error", "Chưa lấy được thông tin pin mới.");
      return;
    }
    setStep(3);
  };

  const handleInsertBattery = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await api.get("/quick-swap/old-battery", {
        params: { vehicleId: selectedVehicleId },
      });
      setOldBatteryData(res.data);
      showToast("success", "Pin đã được nhận diện. Sẵn sàng đổi.");
      setStep(4);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi khi đọc thông tin pin cũ"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    setLoading(true);
    try {
      await api.post("/quick-swap/execute", {
        stationId: stationIdFromUrl,
        vehicleId: selectedVehicleId,
        batteryId: previewData.newBatteryId,
      });

      showToast("success", "Đổi pin nhanh thành công!");
      navigate("/driver");
    } catch (error) {
      showToast("error", error.response?.data?.message || "Đổi pin thất bại");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ NÚT QUAY LẠI ---
  const handleBack = () => {
    // Nếu đang ở bước 3, 4 -> Quay về bước trước đó
    if (step > 1) {
      // TRƯỜNG HỢP ĐẶC BIỆT: Nếu đang ở Step 2 (Chọn xe)
      if (step === 2) {
        // Nếu có stationId trên URL (tức là vào thẳng bước 2, ko qua bước 1) -> Về Dashboard
        if (stationIdFromUrl) {
          navigate("/driver");
        } else {
          // Nếu không có ID trên URL (tức là đã qua bước 1 quét mã) -> Về bước 1
          setStep(1);
        }
      } else {
        // Các bước 3, 4 cứ lùi 1 bước
        setStep(step - 1);
      }
    } else {
      // Đang ở Step 1 -> Về Dashboard
      navigate("/driver");
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <Card
        title={
          <Space>
            <QrcodeOutlined style={{ color: "#1890ff" }} />
            <span>
              Đổi pin nhanh tại
              {stationName && (
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#1890ff",
                    marginLeft: 5,
                  }}
                >
                  {stationName}
                </span>
              )}
            </span>
          </Space>
        }
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Quay lại
          </Button>
        }
      >
        {/* STEP 1: SCAN */}
        {step === 1 && (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Title level={4}>Quét mã QR tại trạm</Title>
            <div
              style={{
                width: "100%",
                maxWidth: 400,
                height: 400,
                margin: "0 auto",
                border: "2px dashed #1890ff",
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <QrScanner
                delay={500}
                onError={handleError}
                onScan={handleScan}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                constraints={{ video: { facingMode: "environment" } }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  border: "2px solid rgba(255, 255, 255, 0.8)",
                  width: "60%",
                  height: "60%",
                  borderRadius: 8,
                  boxShadow: "0 0 0 999px rgba(0, 0, 0, 0.5)",
                }}
              ></div>
            </div>
            <Text type="secondary" style={{ display: "block", marginTop: 16 }}>
              Di chuyển camera đến mã QR
            </Text>
          </div>
        )}

        {/* STEP 2: CHỌN XE & XÁC NHẬN */}
        {step === 2 && (
          <div style={{ padding: "10px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Title level={5} style={{ marginBottom: 10 }}>
                Chọn xe của bạn
              </Title>

              <Select
                style={{ width: "100%", maxWidth: 500 }}
                placeholder="Chọn xe"
                size="large"
                value={selectedVehicleId}
                onChange={handleVehicleChange}
                optionLabelProp="label"
              >
                {vehicles.map((v) => {
                  const status = v.status ? v.status.toUpperCase() : "";
                  let isDisabled = false;
                  let statusText = "";

                  if (status === "PENDING") {
                    isDisabled = true;
                    statusText = "Xe đang chờ duyệt";
                  } else if (status === "UNPAID") {
                    isDisabled = true;
                    statusText = "Xe chưa thanh toán";
                  }

                  return (
                    <Option
                      key={v.id}
                      value={v.id}
                      disabled={isDisabled}
                      label={`${v.plateNumber} - ${v.model}`}
                    >
                      <Row
                        justify="space-between"
                        align="middle"
                        style={{ width: "100%" }}
                      >
                        <Col>
                          <span style={{ fontWeight: 500 }}>
                            {v.plateNumber}
                          </span>{" "}
                          - {v.model}
                        </Col>
                        <Col>
                          {isDisabled && (
                            <span
                              style={{
                                color: "#ff4d4f",
                                fontSize: 12,
                                fontStyle: "italic",
                              }}
                            >
                              {statusText}
                            </span>
                          )}
                        </Col>
                      </Row>
                    </Option>
                  );
                })}
              </Select>

              {/* HIỂN THỊ LOẠI PIN TỪ THÔNG TIN TRẠM */}
              {stationBatteryType && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: "15px" }}>
                    <ThunderboltOutlined
                      style={{ marginRight: 6, color: "#faad14" }}
                    />
                    Loại pin hỗ trợ tại trạm:{" "}
                    <Text strong>{stationBatteryType}</Text>
                  </Text>
                </div>
              )}
            </div>

            {selectedVehicleId && (
              <div style={{ marginTop: 20 }}>
                {previewData && (
                  <Card
                    type="inner"
                    title={
                      <>
                        <CarOutlined /> Thông tin xe xác nhận
                      </>
                    }
                    style={{ backgroundColor: "#f9f9f9" }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Text strong>Biển số:</Text>{" "}
                        <Tag color="blue">{previewData.vehiclePlateNumber}</Tag>
                      </Col>
                      <Col span={12}>
                        <Text strong>Dòng xe:</Text> {previewData.vehicleModel}
                      </Col>
                      <Col span={24}>
                        <Divider style={{ margin: "12px 0" }} />
                        <Text type="secondary">
                          <ThunderboltOutlined /> Pin mới sẵn sàng tại trạm:{" "}
                        </Text>
                        <Text strong>
                          {previewData.newBatteryModel} (
                          {previewData.newBatteryChargeLevel}%)
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                )}

                {previewError && (
                  <Alert
                    message="Không thể đổi pin cho xe này"
                    description={previewError}
                    type="error"
                    showIcon
                    icon={<WarningOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                )}

                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleConfirmVehicle}
                    loading={loading}
                    disabled={!!previewError || !previewData}
                    style={{ height: 45, paddingLeft: 30, paddingRight: 30 }}
                  >
                    Kiểm tra pin
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ... (STEP 3 và 4 giữ nguyên) ... */}
        {step === 3 && (
          <div style={{ padding: "20px 0" }}>
            <Title level={4} style={{ textAlign: "center", marginBottom: 30 }}>
              Cho pin cũ vào trạm
            </Title>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={11}>
                <Card
                  bordered
                  style={{
                    height: 250,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fafafa",
                    border: "2px dashed #d9d9d9",
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleInsertBattery}
                    loading={loading}
                    icon={<PlusOutlined />}
                    style={{ width: 180, height: 50 }}
                  >
                    Cho pin vào
                  </Button>
                </Card>
              </Col>
              <Col xs={24} md={2} style={{ textAlign: "center" }}>
                <SwapOutlined style={{ fontSize: 24, color: "#d9d9d9" }} />
              </Col>
              <Col xs={24} md={11}>
                <BatteryInfoCard
                  title="Pin mới (Sẽ lắp vào)"
                  batteryData={previewData}
                  type="new"
                />
              </Col>
            </Row>
          </div>
        )}

        {step === 4 && (
          <div style={{ padding: "20px 0" }}>
            <Title
              level={4}
              style={{
                textAlign: "center",
                marginBottom: 30,
                color: "#52c41a",
              }}
            >
              Sẵn sàng đổi pin
            </Title>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} md={11}>
                <BatteryInfoCard
                  title="Pin cũ (Đã tháo ra)"
                  batteryData={oldBatteryData}
                  type="old"
                />
              </Col>
              <Col xs={24} md={2} style={{ textAlign: "center" }}>
                <SwapOutlined
                  spin={loading}
                  style={{ fontSize: 32, color: "#1890ff" }}
                />
              </Col>
              <Col xs={24} md={11}>
                <BatteryInfoCard
                  title="Pin mới (Sẽ lắp vào)"
                  batteryData={previewData}
                  type="new"
                />
              </Col>
            </Row>
            <Divider />
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={handleExecuteSwap}
                loading={loading}
                style={{ height: 45, paddingLeft: 30, paddingRight: 30 }}
              >
                Xác nhận Đổi Pin Ngay
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
