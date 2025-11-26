import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Divider,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  CarOutlined,
  UserOutlined,
  CloseOutlined, // Thêm icon Close
} from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

export default function SwapAnimation() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedCode, setConfirmedCode] = useState("");
  const [step, setStep] = useState(1);
  const [newBattery, setNewBattery] = useState(null);
  const [oldBattery, setOldBattery] = useState(null);
  const [transactionInfo, setTransactionInfo] = useState({
    vehiclePlate: null,
    driverName: null,
  });
  const [isSwapped, setIsSwapped] = useState(false);
  const { Title, Text } = Typography;

  const BatteryInfoCard = ({ title, batteryData, loading, type }) => {
    const color = type === "new" ? "#52c41a" : "#faad14";
    const borderColor = type === "new" ? "#b7eb8f" : "#ffe58f";
    const bg = type === "new" ? "#f6ffed" : "#fffbe6";

    if (loading) {
      return (
        <Card bordered style={{ height: 250, textAlign: "center" }}>
          <Spin tip="Đang tải..." style={{ marginTop: 80 }} />
        </Card>
      );
    }

    if (!batteryData) {
      return (
        <Card
          bordered
          style={{
            height: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text type="secondary">Chưa có thông tin pin</Text>
        </Card>
      );
    }

    return (
      <Card
        title={
          <Text strong style={{ color: color }}>
            {title}
          </Text>
        }
        style={{ borderColor: borderColor, height: "100%", minHeight: 250 }}
        headStyle={{ backgroundColor: bg }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row justify="space-between">
            <Text strong>ID Pin:</Text>
            <Text>{batteryData.batteryId}</Text>
          </Row>
          <Divider style={{ margin: "8px 0" }} />
          <Row justify="space-between">
            <Text strong>Loại Pin:</Text>
            <Text>{batteryData.model}</Text>
          </Row>
          <Divider style={{ margin: "8px 0" }} />
          <Row justify="space-between">
            <Text strong>
              <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc (%):
            </Text>
            <Tag color={batteryData.chargeLevel > 70 ? "green" : "orange"}>
              {batteryData.chargeLevel}
            </Tag>
          </Row>
          <Divider style={{ margin: "8px 0" }} />
          <Row justify="space-between">
            <Text strong>
              <HeartOutlined style={{ color: "#ff4d4f" }} /> Tình trạng (%):
            </Text>
            <Tag color={batteryData.stateOfHealth > 70 ? "green" : "orange"}>
              {batteryData.stateOfHealth}
            </Tag>
          </Row>
        </Space>
      </Card>
    );
  };

  const handleGetNewBattery = async () => {
    if (!code || code.length !== 6)
      return showToast("warning", "⚠️ Vui lòng nhập đúng mã gồm 6 ký tự.");
    setLoading(true);
    try {
      const res = await api.get("/swap-transaction/new-battery", {
        params: { code: code },
      });
      setNewBattery(res.data);
      setTransactionInfo({
        vehiclePlate: res.data.vehiclePlate,
        driverName: res.data.driverName,
      });
      setConfirmedCode(code);
      setStep(2);
      showToast("success", "✅ Xác nhận mã thành công!");
    } catch (error) {
      showToast(
        "error",
        error.response?.data || "❌ Lấy thông tin không thành công!"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2 -> 3: Lấy thông tin pin mới xong, chuyển sang bước "Cho pin vào" ---
  // Ở code cũ step 2 là hiển thị pin mới và nút cho pin vào luôn
  // Nhưng theo yêu cầu mới: Step 2 chỉ hiện thông tin xe/pin mới -> Bấm tiếp tục -> Step 3 (Bảng to Cho pin vào)
  // Tuy nhiên để đơn giản hoá luồng code cũ của bạn:
  // Step 2 hiện tại của bạn đang là: Hiện thông tin pin mới và nút "Cho pin vào".
  // Tôi sẽ sửa Step 2 này thành màn hình CHỜ (Preview), sau đó bấm nút mới sang màn hình Cho Pin Vào.

  // --- SỬA HÀM NÀY: Gọi API lấy pin cũ ---
  const handleInsertNewBattery = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await api.get("/swap-transaction/old-battery", {
        params: { code: code },
      });
      setOldBattery(res.data);
      setStep(3); // Chuyển sang bước 3 (So sánh & Đổi) - Lưu ý: Tôi dồn Step lại cho gọn
      showToast("success", "Đã nhận diện pin cũ. Sẵn sàng đổi.");
    } catch (error) {
      showToast("error", error.response?.data || "Lỗi lấy thông tin pin cũ!");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    setLoading(true);
    const newBatteryBeforeSwap = newBattery;
    const oldBatteryBeforeSwap = oldBattery;
    try {
      await api.post(
        "/swap-transaction/swap-by-code",
        {},
        { params: { code: code } }
      );
      showToast("success", " Đổi pin thành công!");
      setOldBattery(newBatteryBeforeSwap);
      setNewBattery(oldBatteryBeforeSwap);
      setIsSwapped(true);
      setStep(4); // Hoàn tất
    } catch (error) {
      showToast("error", error.response?.data || "Đổi không thành công!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForNewSwap = () => {
    setCode("");
    setConfirmedCode("");
    setNewBattery(null);
    setOldBattery(null);
    setStep(1);
    setTransactionInfo({ vehiclePlate: null, driverName: null });
    setIsSwapped(false);
    showToast("info", "Vui lòng nhập mã xác nhận mới.");
  };

  // --- RENDER LOGIC ---

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Space
        direction="vertical"
        size={24}
        style={{ width: "100%", maxWidth: 900 }}
      >
        {/* 1. KHU VỰC NHẬP MÃ */}
        <Card
          title={
            <Title level={4} style={{ margin: 0, textAlign: "center" }}>
              Nhập mã xác nhận
            </Title>
          }
          style={{
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            borderRadius: "8px",
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          <Input
            placeholder="Nhập mã gồm 6 ký tự"
            value={code}
            maxLength={6}
            onChange={(e) => {
              const newCode = e.target.value;
              setCode(newCode);
              if (step > 1 && newCode !== confirmedCode)
                handleResetForNewSwap();
            }}
            style={{ marginBottom: 12 }}
            disabled={step > 1 || loading}
          />
          {step === 4 ? (
            <Button
              type="default"
              block
              onClick={handleResetForNewSwap}
              icon={<PlusOutlined />}
            >
              Nhập mã mới
            </Button>
          ) : (
            <Button
              type="primary"
              block
              onClick={handleGetNewBattery}
              loading={loading && step === 1}
              disabled={!code || code.length !== 6 || step > 1}
              icon={<CheckCircleOutlined />}
            >
              Kiểm tra mã
            </Button>
          )}

          {/* Thông tin xe/tài xế */}
          {step > 1 && (
            <div style={{ marginTop: 16 }}>
              <Divider style={{ margin: "8px 0" }} />
              <Row justify="space-between">
                <Text strong>
                  <UserOutlined /> Tài xế:
                </Text>
                <Text>{transactionInfo.driverName}</Text>
              </Row>
              <Row justify="space-between" style={{ marginTop: 8 }}>
                <Text strong>
                  <CarOutlined /> Biển số:
                </Text>
                <Text>{transactionInfo.vehiclePlate}</Text>
              </Row>
            </div>
          )}
        </Card>

        {/* 2. KHU VỰC ĐỔI PIN (STEP 2, 3, 4) */}
        {step > 1 && (
          <Card
            title={
              <Title level={4} style={{ margin: 0, textAlign: "center" }}>
                Thông tin giao dịch đổi pin
              </Title>
            }
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            {/* STEP 2: MÀN HÌNH "CHO PIN VÀO" (BẢNG LỚN DUY NHẤT) */}
            {step === 2 && !isSwapped && (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <Title level={5} style={{ marginBottom: 30 }}>
                  Vui lòng cho pin vào khay
                </Title>
                <Card
                  bordered
                  style={{
                    height: 300,
                    maxWidth: 500,
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
                    onClick={handleInsertNewBattery}
                    loading={loading}
                    icon={<PlusOutlined />}
                    style={{
                      width: 200,
                      height: 60,
                      fontSize: 18,
                      borderRadius: 30,
                    }}
                  >
                    {loading ? "Đang xử lý..." : "Cho pin vào"}
                  </Button>
                  <div style={{ marginTop: 24 }}>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      Mở nắp khay pin trống và đặt pin cũ vào
                    </Text>
                  </div>
                </Card>
              </div>
            )}

            {/* STEP 3: HIỂN THỊ 2 BẢNG + NÚT XÁC NHẬN/HỦY */}
            {(step === 3 || step === 4) && (
              <div>
                <Row gutter={24} align="middle">
                  {/* Cột Trái: Pin Cũ (lấy từ oldBattery) hoặc Pin Mới (nếu đã swap) */}
                  <Col span={11}>
                    <BatteryInfoCard
                      title={
                        isSwapped
                          ? "Pin mới (Đã lắp vào)"
                          : "Pin cũ (Đã tháo ra)"
                      }
                      batteryData={isSwapped ? oldBattery : oldBattery}
                      type={isSwapped ? "new" : "old"}
                    />
                  </Col>

                  {/* Icon Swap */}
                  <Col span={2} style={{ textAlign: "center" }}>
                    <SwapOutlined
                      style={{
                        fontSize: 24,
                        color: isSwapped ? "#52c41a" : "#1890ff",
                      }}
                    />
                  </Col>

                  {/* Cột Phải: Pin Mới (lấy từ newBattery) hoặc Pin Cũ (nếu đã swap) */}
                  <Col span={11}>
                    <BatteryInfoCard
                      title={
                        isSwapped
                          ? "Pin cũ (Đã tháo ra)"
                          : "Pin mới (Sẽ lắp vào)"
                      }
                      batteryData={isSwapped ? newBattery : newBattery}
                      type={isSwapped ? "old" : "new"}
                    />
                  </Col>
                </Row>

                {/* Nút Thao tác (Chỉ hiện ở Step 3 - Chưa Swap) */}
                {step === 3 && !isSwapped && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: 30,
                      display: "flex",
                      justifyContent: "center",
                      gap: 16,
                    }}
                  >
                    {/* Nút Hủy: Quay lại bước cho pin vào */}
                    <Button
                      size="large"
                      icon={<CloseOutlined />}
                      onClick={() => setStep(2)} // Quay lại Step 2
                      disabled={loading}
                      style={{ height: 45, paddingLeft: 30, paddingRight: 30 }}
                    >
                      Hủy
                    </Button>

                    {/* Nút Xác Nhận */}
                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckCircleOutlined />}
                      onClick={handleExecuteSwap}
                      loading={loading}
                      style={{ height: 45, paddingLeft: 30, paddingRight: 30 }}
                    >
                      Xác nhận Đổi Pin
                    </Button>
                  </div>
                )}

                {/* Thông báo thành công (Step 4) */}
                {isSwapped && (
                  <div style={{ textAlign: "center", marginTop: 20 }}>
                    <Tag
                      color="success"
                      style={{ fontSize: 16, padding: "8px 16px" }}
                    >
                      <CheckCircleOutlined /> Đổi pin hoàn tất
                    </Tag>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </Space>
    </div>
  );
}
