import React, { useState, useEffect, useCallback, useRef } from "react";
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
  CloseOutlined,
  SendOutlined
} from "@ant-design/icons";
import QrScanner from "react-qr-scanner";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

const { Title, Text } = Typography;
const { Option } = Select;

// --- CONFIG & HELPERS ---
const BATTERY_TYPES = {
  1: "Standard 48V-20Ah",
  2: "Premium 52V-22Ah",
  3: "Max Power 60V-30Ah",
};

const extractStationId = (text) => {
  try {
    if (!text) return null;
    if (!isNaN(text)) return text;
    if (text.includes("http") || text.includes("stationId=")) {
      const urlStr = text.startsWith("http")
        ? text
        : `http://dummy.com?${text}`;
      return new URL(urlStr).searchParams.get("stationId");
    }
    return text;
  } catch {
    return text;
  }
};

// --- SUB-COMPONENT GỌN NHẸ ---
const BatteryCard = ({ title, data, type, loading }) => {
  const bg = type === "new" ? "#f6ffed" : "#fffbe6";
  const border = type === "new" ? "#b7eb8f" : "#ffe58f";

  if (loading)
    return (
      <Card style={{ height: 250, textAlign: "center" }}>
        <Spin tip="Đang tải..." style={{ marginTop: 80 }} />
      </Card>
    );
  if (!data)
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

  // Rút gọn việc lấy dữ liệu từ nhiều nguồn API khác nhau
  const id = data.batteryId || data.newBatteryId || data.id;
  const model = data.model || data.newBatteryModel || data.batteryModel;
  const charge = data.chargeLevel || data.newBatteryChargeLevel || 0;
  const soh = data.stateOfHealth || data.newBatteryHealth || 0;

  return (
    <Card
      title={
        <Text strong style={{ color: type === "new" ? "#52c41a" : "#faad14" }}>
          {title}
        </Text>
      }
      style={{ borderColor: border, height: "100%", minHeight: 250 }}
      headStyle={{ backgroundColor: bg }}
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

// --- MAIN COMPONENT ---
export default function QRCodePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stationId, setStationId] = useState(() => searchParams.get("stationId"));

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const isScanning = useRef(false);

  // Data
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [oldBattery, setOldBattery] = useState(null);

  const [stationName, setStationName] = useState(null);
  const [stationBatteryType, setStationBatteryType] = useState(null);

  const fetchStationInfo = useCallback(async (sId) => {
    try {
      const res = await api.get(`/station`);
      const found = res.data?.find((s) => String(s.id) === String(sId));
      if (found) {
        setStationName(found.name);
        const typeName =
          BATTERY_TYPES[found.batteryTypeId] ||
          `Loại pin ID: ${found.batteryTypeId}`;
        setStationBatteryType(typeName);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchPreview = useCallback(async (sId, vId) => {
    if (!sId || !vId) return;
    setLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    try {
      const res = await api.get("/quick-swap/preview", {
        params: { stationId: sId, vehicleId: vId },
      });
      setPreviewData(res.data);
      if (res.data.stationName) setStationName(res.data.stationName);
    } catch (error) {
      setPreviewError(
        error.response?.data?.message || "Không thể lấy thông tin pin"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await api.get("/vehicle/my-vehicles");
      const list = Array.isArray(res.data) ? res.data : [];
      setVehicles(list);
      // Auto select xe hợp lệ
      const valid = list.find(
        (v) => v.status !== "PENDING" && v.status !== "UNPAID"
      );
      if (valid) {
        setSelectedVehicleId(valid.id);
        if (stationId) fetchPreview(stationId, valid.id);
      } else {
        showToast("warning", "Bạn chưa có xe điện nào khả dụng!");
      }
    } catch {
      showToast("error", "Lỗi tải danh sách xe.");
    }
  }, [stationId, fetchPreview]);

  // Gom các API cần gọi khi vào trang
  const loadData = useCallback(
    async (sId) => {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchStationInfo(sId)]);
      setLoading(false);
    },
    [fetchVehicles, fetchStationInfo]
  );

  // --- 1. LOGIC ẨN URL & LOAD DATA ---
  useEffect(() => {
    const currentUrlId = searchParams.get("stationId");
    if (currentUrlId) {
       // Nếu thấy ID trên URL -> Lưu vào state -> Xóa khỏi URL ngay
       setStationId(currentUrlId);
       navigate("/quick-swap", { replace: true }); // Ẩn đi
    }
  }, [searchParams, navigate]);

  // Khi stationId (trong bộ nhớ) có giá trị -> Load dữ liệu
  useEffect(() => {
    if (stationId) {
      setStep(2);
      loadData(stationId);
    } else {
      setStep(1);
    }
  }, [stationId, loadData]);

  // --- HANDLERS ---
  const onScan = (data) => {
    if (isScanning.current || !data) return;
    const text = data?.text || data;
    if (text) {
      isScanning.current = true;
      const id = extractStationId(text);
      if (id) {
        showToast("success", "Đã kết nối trạm");
        setSearchParams({ stationId: id });
      } else {
        showToast("error", "QR không hợp lệ");
      }
      isScanning.current = false;
    }
  };

  const onVehicleSelect = (val) => {
    setSelectedVehicleId(val);
    fetchPreview(stationId, val);
  };

  const onConfirmVehicle = () => {
    if (!previewData)
      return showToast("error", "Chưa lấy được thông tin pin mới.");
    setStep(3);
  };

  const onInsertBattery = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await api.get("/quick-swap/old-battery", {
        params: { vehicleId: selectedVehicleId },
      });
      setOldBattery(res.data);
      showToast("success", "Đã nhận diện pin cũ.");
      setStep(4);
    } catch (e) {
      showToast("error", e.response?.data?.message || "Lỗi đọc pin cũ");
    } finally {
      setLoading(false);
    }
  };

  const onSwap = async () => {
    setLoading(true);
    try {
      await api.post("/quick-swap/execute", {
        stationId: stationId,
        vehicleId: selectedVehicleId,
        batteryId: previewData.newBatteryId,
      });
      showToast("success", "Đổi pin thành công!");
      navigate("/driver");
    } catch (e) {
      showToast("error", e.response?.data?.message || "Đổi pin thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (step === 1 || (step === 2 && stationId)) navigate("/driver");
    else setStep((s) => s - 1);
  };

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <Card
        title={
          <Space>
            <QrcodeOutlined style={{ color: "#1890ff" }} />
            <span>
              Đổi pin nhanh tại{" "}
              {stationName ? (
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#1890ff",
                    marginLeft: 5,
                  }}
                >
                  {stationName}
                </span>
              ) : (
                <Spin size="small" style={{ marginLeft: 10 }} />
              )}
            </span>
          </Space>
        }
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
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
                onError={() => {}}
                onScan={onScan}
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

        {/* STEP 2: SELECT & PREVIEW */}
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
                onChange={onVehicleSelect}
                optionLabelProp="label"
              >
                {vehicles.map((v) => {
                  const status = v.status ? v.status.toUpperCase() : "";
                  const isDisabled =
                    status === "PENDING" || status === "UNPAID";
                  const statusText =
                    status === "PENDING"
                      ? "Xe đang chờ duyệt"
                      : status === "UNPAID"
                      ? "Xe chưa thanh toán"
                      : "";
                  return (
                    <Option
                      key={v.id}
                      value={v.id}
                      disabled={isDisabled}
                      label={`${v.plateNumber} - ${v.model}`}
                    >
                      <Row justify="space-between" align="middle">
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

              {stationBatteryType && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: "15px" }}>
                    <ThunderboltOutlined
                      style={{ marginRight: 6, color: "#faad14" }}
                    />
                    Loại pin hỗ trợ: <Text strong>{stationBatteryType}</Text>
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
                          <ThunderboltOutlined /> Pin mới sẵn sàng:{" "}
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
                    message="Không thể đổi pin"
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
                    onClick={onConfirmVehicle}
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

        {/* STEP 3: INSERT BATTERY */}
        {step === 3 && (
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <Title level={4} style={{ marginBottom: 30 }}>
              Cho pin vào khay
            </Title>
            <Card
              bordered
              style={{
                height: 300,
                maxWidth: 600,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f0f5ff",
                border: "3px dashed #1890ff",
                borderRadius: 16,
              }}
            >
              <Button
                type="primary"
                size="large"
                onClick={onInsertBattery}
                loading={loading}
                icon={<PlusOutlined />}
                style={{
                  width: 250,
                  height: 60,
                  fontSize: 20,
                  borderRadius: 30,
                  boxShadow: "0 4px 10px rgba(24, 144, 255, 0.3)",
                }}
              >
                {loading ? "Đang nhận diện..." : "Cho pin vào"}
              </Button>
              <div style={{ marginTop: 24 }}>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  Hãy đặt pin cũ vào khay đã mở
                </Text>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 4: COMPARE & SWAP */}
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
                <BatteryCard
                  title="Pin cũ (Đã tháo ra)"
                  data={oldBattery}
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
                <BatteryCard
                  title="Pin mới (Sẽ lắp vào)"
                  data={previewData}
                  type="new"
                />
              </Col>
            </Row>
            <Divider />
            <div
              style={{
                textAlign: "center",
                marginTop: 30,
                display: "flex",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <Button
                size="large"
                icon={<CloseOutlined />}
                onClick={() => setStep(3)}
                disabled={loading}
                style={{ height: 45, paddingLeft: 30, paddingRight: 30 }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={onSwap}
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
