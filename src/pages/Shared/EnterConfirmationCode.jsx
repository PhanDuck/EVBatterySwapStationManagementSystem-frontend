import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  message,
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
} from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../utils/toastHandler";

export default function SwapAnimation() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedCode, setConfirmedCode] = useState("");
  const [step, setStep] = useState(1); // 1: Nhập code, 2: Cho pin vào, 3: Sẵn sàng Swap
  const [newBattery, setNewBattery] = useState(null); // Pin mới sắp lắp vào
  const [oldBattery, setOldBattery] = useState(null); // Pin cũ tháo ra
  const [transactionInfo, setTransactionInfo] = useState({
    vehiclePlate: null,
    driverName: null,
  });
  const [isSwapped, setIsSwapped] = useState(false);
  // const token = sessionStorage.getItem("authToken");
  const { Title, Text } = Typography;

  // ⚙️ Component con hiển thị thông tin pin (dùng lại cho cả pin cũ và pin mới)
  const BatteryInfoCard = ({ title, batteryData, loading, type }) => {
    const color = type === "new" ? "#52c41a" : "#faad14";

    if (loading) {
      return (
        <Card
          bordered
          title={title}
          style={{
            height: 250,
            textAlign: "center",
          }}
        >
          <Spin tip="Đang tải thông tin pin..." />
        </Card>
      );
    }

    if (!batteryData) {
      return (
        <Card
          bordered
          title={title}
          style={{
            height: 250,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Text type="secondary">Chưa có thông tin pin</Text>
        </Card>
      );
    }

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
          <Row justify="space-between">
            <Col>
              <Text strong>ID Pin:</Text>
            </Col>
            <Col>
              <Text>{batteryData.batteryId}</Text>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />

          {/* 2. Loại Pin */}
          <Row justify="space-between">
            <Col>
              <Text strong>Loại Pin:</Text>
            </Col>
            <Col>
              <Text>{batteryData.model}</Text>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />

          {/* 3. Mức sạc (Charge Level) */}
          <Row justify="space-between">
            <Col>
              <Text strong>
                <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc (%):
              </Text>
            </Col>
            <Col>
              <Tag color={batteryData.chargeLevel > 70 ? "green" : "orange"}>
                {batteryData.chargeLevel}
              </Tag>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />

          {/* 4. Tình trạng pin (State of Health) */}
          <Row justify="space-between">
            <Col>
              <Text strong>
                <HeartOutlined style={{ color: "#ff4d4f" }} /> Tình trạng pin (%):
              </Text>
            </Col>
            <Col>
              <Tag color={batteryData.stateOfHealth > 70 ? "green" : "orange"}>
                {batteryData.stateOfHealth}
              </Tag>
            </Col>
          </Row>
        </Space>
      </Card>
    );
  };

  // ----------------------------------------------------
  //   Bước 1: Nhập Code -> Lấy thông tin Pin Mới
  // ----------------------------------------------------
  const handleGetNewBattery = async () => {
    if (!code || code.length !== 6) {  
      return showToast("warning", "⚠️ Vui lòng nhập đúng mã gồm 6 ký tự.");
    }
    if (step > 1) {
      return showToast("success", "Mã đã được xác nhận. Vui lòng tiếp tục các bước đổi pin.");
    }

    setLoading(true);
    try {
      // API lấy thông tin pin mới
      const res = await api.get("/swap-transaction/new-battery", {
        params: { code: code },
      });

      setNewBattery(res.data);
      setTransactionInfo({
        vehiclePlate: res.data.vehiclePlate,
        driverName: res.data.driverName,
      });
      setConfirmedCode(code);
      setStep(2); // Chuyển sang bước "Cho pin vào"
      showToast("success", "✅ Xác nhận mã thành công! Sẵn sàng cho pin vào.");
    } catch (error) {
      setTransactionInfo({ vehiclePlate: null, driverName: null });
      showToast("error", error.response?.data ||"❌ Lấy thông tin pin mới không thành công!");
      console.error("❌ Lỗi lấy pin mới:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  //  Bước 2: Mô phỏng "Cho pin vào" -> Lấy thông tin Pin Cũ
  // ----------------------------------------------------
  const handleInsertNewBattery = async () => {
    setLoading(true);
    message.loading({ content: "Đang cho pin vào...", key: "insert" });

    // Sau khi pin mới được "cho vào", ta gọi API để lấy thông tin pin cũ của khách hàng
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // API lấy thông tin pin cũ
      const res = await api.get("/swap-transaction/old-battery", {
        params: { code: code },
      });

      setOldBattery(res.data);
      setStep(3); // Chuyển sang bước "Sẵn sàng Swap"
      showToast("success", "Pin đã được cho vào. Đã lấy thông tin pin. Sẵn sàng đổi.");
      // message.success({
      //   content: "✅ Pin đã được cho vào. Đã lấy thông tin pin. Sẵn sàng đổi.",
      //   key: "insert",
      //   duration: 3,
      // });
    } catch (error) {
      showToast("error", error.response?.data || "Lấy thông tin pin cũ thất bại!");
      // message.error({
      //   content:
      //     error?.response?.data?.message || "❌ Lấy thông tin pin cũ thất bại!",
      //   key: "insert",
      // });
      console.error("❌ Lỗi lấy pin cũ:", error);
    } finally {
      setLoading(false);
    }
  };

  //  Bước 3: Xác nhận Swap cuối cùng
  const handleExecuteSwap = async () => {
    setLoading(true);

    const newBatteryBeforeSwap = newBattery;
    const oldBatteryBeforeSwap = oldBattery;
    try {
      const res = await api.post(
        "/swap-transaction/swap-by-code",
        {},
        {
          params: { code: code },
        }
      );
      
      showToast("success", " Đổi pin thành công!");
      console.log("✅ Response API Swap:", res.data);
      // 1. Cột TRÁI (leftBatteryData) phải là Pin MỚI (newBatteryBeforeSwap) -> setOldBattery
    setOldBattery(newBatteryBeforeSwap);
    
    // 2. Cột PHẢI (rightBatteryData) phải là Pin CŨ (oldBatteryBeforeSwap) -> setNewBattery
    setNewBattery(oldBatteryBeforeSwap);
      setIsSwapped(true);
      setStep(4);
    } catch (error) {
      showToast("error",error.response?.data || "Đổi không thành công!");
      console.error("❌ Lỗi đổi:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  //  Bước 4: Reset toàn bộ để nhập mã mới
  // ----------------------------------------------------
  const handleResetForNewSwap = () => {
    setCode("");
    setConfirmedCode("");
    setNewBattery(null);
    setOldBattery(null);
    setStep(1);
    setTransactionInfo({ vehiclePlate: null, driverName: null });
    setIsSwapped(false);
    showToast("warning", "Vui lòng nhập mã xác nhận mới.");
  };

  // Bước 5: Logic Hiển thị

  // Xác định data và title cho cột trái (LEFT COLUMN)
  const leftBatteryData = isSwapped 
    ? oldBattery // Step 4: Pin mới (Đã lắp vào)
    : oldBattery; // Step 1, 2, 3: Pin cũ (Đã tháo ra)
    
  const leftTitle = isSwapped 
    ? "Pin mới (Đã lắp vào)" 
    : "Pin cũ (Đã tháo ra)";
    
  const leftType = isSwapped ? "new" : "old"; // Xanh lá khi đã swap

  // Xác định data và title cho cột phải (RIGHT COLUMN)
  const rightBatteryData = isSwapped
    ? newBattery // Step 4: Pin cũ (Đã tháo ra)
    : newBattery; // Step 1, 2, 3: Pin mới (Sẽ lắp vào)
    
  const rightTitle = isSwapped
    ? "Pin cũ (Đã tháo ra)"
    : "Pin mới (Sẽ lắp vào)";
    
  const rightType = isSwapped ? "old" : "new"; // Cam khi đã swap

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
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
            maxWidth: 400, // Kích thước nhỏ gọn
            margin: "0 auto", // Căn giữa
          }}
        >
          <Input
            placeholder="Nhập mã gồm 6 ký tự"
            value={code}
            maxLength={6}
            onChange={(e) => {
              const newCode = e.target.value;
              setCode(newCode);
              // Reset về bước 1 nếu code bị thay đổi khi đã xác nhận
              if (step > 1 && newCode !== code) {
                handleResetForNewSwap();
              }
            }}
            style={{ marginBottom: 12 }}
            disabled={(step > 1 && step < 4) || loading || step === 4}
          />

          {/* NÚT XÁC NHẬN / NHẬP MÃ MỚI */}
          {step === 4 ? (
            // Nút ở Step 4: Đổi tên thành "Nhập mã mới" và reset
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
              disabled={!code || code.length !== 6 || step > 1 || loading}
              icon={<CheckCircleOutlined />}
            >
              Kiểm tra mã
            </Button>
          )}

          {/* HIỂN THỊ THÔNG TIN XE VÀ TÀI XẾ SAU KHI XÁC NHẬN MÃ */}
          {step > 1 && (
            <div style={{ marginTop: 16 }}>
              <Divider style={{ margin: "8px 0" }} />
              <Space direction="vertical" style={{ width: "100%" }}>
                {/* Tài xế */}
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ width: "100%" }}
                >
                  <Col>
                    <Text strong>
                      <UserOutlined style={{ marginRight: 4 }} /> Tài xế:
                    </Text>
                  </Col>
                  <Col>
                    <Text>{transactionInfo.driverName}</Text>
                  </Col>
                </Row>
                {/* Biển số xe */}
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ width: "100%" }}
                >
                  <Col>
                    <Text strong>
                      <CarOutlined style={{ marginRight: 4 }} /> Biển số xe:
                    </Text>
                  </Col>
                  <Col>
                    <Text>{transactionInfo.vehiclePlate}</Text>
                  </Col>
                </Row>
              </Space>
            </div>
          )}
        </Card>

        {/* 2. KHU VỰC HIỂN THỊ PIN VÀ HÀNH ĐỘNG (Chỉ hiện khi step > 1, Căn giữa) */}
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
            <Row gutter={24} style={{ marginBottom: 24 }} align="middle">
              {/* === CỘT TRÁI (LEFT COLUMN) === */}
              <Col span={11}>
                {step === 2 && !oldBattery && !isSwapped ? (
                  <Card
                    bordered
                    style={{
                      height: 250,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#ffffffff",
                    }}
                  >
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleInsertNewBattery} // Cho pin vào
                      loading={loading}
                      disabled={loading}
                      icon={<PlusOutlined />}
                      style={{ width: 150 }}
                    >
                      Cho pin vào
                    </Button>
                  </Card>
                ) : (
                  <BatteryInfoCard
                    title={leftTitle}
                    batteryData={leftBatteryData}
                    loading={loading && step === 2 && !isSwapped}
                    type={leftType}
                  />
                )}
              </Col>

              {/* === ICON/NÚT SWAP (CENTER) === */}
              <Col span={2} style={{ textAlign: "center" }}>
                {step === 3 && oldBattery && newBattery && (
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleExecuteSwap}
                    loading={loading}
                    disabled={loading}
                    icon={<SwapOutlined />}
                    style={{ height: 48, fontSize: 16 }}
                  >
                    Đổi Pin
                  </Button>
                )}
                {(step === 2 || step === 4) && (
                  <SwapOutlined
                    style={{
                      fontSize: "24px",
                      color: step === 4 ? "#52c41a" : "#1890ff", // Xanh lá sau khi swap thành công
                    }}
                  />
                )}
              </Col>
              {/* === CỘT PHẢI (RIGHT COLUMN) === */}
              <Col span={11}>
                {/* Bảng pin mới */}
                <BatteryInfoCard
                  title={rightTitle}
                  batteryData={rightBatteryData}
                  loading={loading && step === 1}
                  type={rightType}
                />
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </div>
  );
}
