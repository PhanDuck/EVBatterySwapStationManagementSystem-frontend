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
  CloseOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

const { Title, Text } = Typography;

// --- SUB-COMPONENT: Battery Card ---
const BatteryCard = ({ title, data, type, loading }) => {
  const color = type === "new" ? "#52c41a" : "#faad14";
  const bg = type === "new" ? "#f6ffed" : "#fffbe6";
  const border = type === "new" ? "#b7eb8f" : "#ffe58f";

  if (loading)
    return (
      <Card bordered style={{ height: 250, textAlign: "center" }}>
        <Spin tip="Đang tải..." style={{ marginTop: 80 }} />
      </Card>
    );
  if (!data)
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

  return (
    <Card
      title={
        <Text strong style={{ color }}>
          {title}
        </Text>
      }
      style={{ borderColor: border, height: "100%", minHeight: 250 }}
      headStyle={{ backgroundColor: bg }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row justify="space-between">
          <Text strong>ID Pin:</Text>
          <Text>{data.batteryId}</Text>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Row justify="space-between">
          <Text strong>Loại Pin:</Text>
          <Text>{data.model}</Text>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Row justify="space-between">
          <Text strong>
            <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc (%):
          </Text>
          <Tag color={data.chargeLevel > 70 ? "green" : "orange"}>
            {data.chargeLevel}
          </Tag>
        </Row>
        <Divider style={{ margin: "8px 0" }} />
        <Row justify="space-between">
          <Text strong>
            <HeartOutlined style={{ color: "#ff4d4f" }} /> Tình trạng (%):
          </Text>
          <Tag color={data.stateOfHealth > 70 ? "green" : "orange"}>
            {data.stateOfHealth}
          </Tag>
        </Row>
      </Space>
    </Card>
  );
};

// --- MAIN COMPONENT ---
export default function SwapAnimation() {
  const [inputCode, setInputCode] = useState("");
  const [confirmedCode, setConfirmedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [newBattery, setNewBattery] = useState(null);
  const [oldBattery, setOldBattery] = useState(null);
  const [txInfo, setTxInfo] = useState({ plate: null, driver: null });
  const [isSwapped, setIsSwapped] = useState(false);

  // --- API HANDLERS ---
  const onVerifyCode = async () => {
    if (!inputCode || inputCode.length !== 6)
      return showToast("warning", "⚠️ Vui lòng nhập đúng mã gồm 6 ký tự.");
    setLoading(true);
    try {
      const res = await api.get("/swap-transaction/new-battery", {
        params: { code: inputCode },
      });
      setNewBattery(res.data);
      setTxInfo({ plate: res.data.vehiclePlate, driver: res.data.driverName });
      setConfirmedCode(inputCode);
      setStep(2); // Chuyển sang màn hình "Cho pin vào"
      showToast("success", "✅ Xác nhận mã thành công!");
    } catch (e) {
      showToast("error", e.response?.data || "❌ Lỗi xác thực mã!");
    } finally {
      setLoading(false);
    }
  };

  const onInsertBattery = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await api.get("/swap-transaction/old-battery", {
        params: { code: inputCode },
      });
      setOldBattery(res.data);
      setStep(3); // Chuyển sang màn hình so sánh
      showToast("success", "Đã nhận diện pin cũ. Sẵn sàng đổi.");
    } catch (e) {
      showToast("error", e.response?.data || "Lỗi lấy thông tin pin cũ!");
    } finally {
      setLoading(false);
    }
  };

  const onSwap = async () => {
    setLoading(true);
    const tempNew = newBattery;
    const tempOld = oldBattery;
    try {
      await api.post(
        "/swap-transaction/swap-by-code",
        {},
        { params: { code: inputCode } }
      );
      showToast("success", "Đổi pin thành công!");
      // Hoán đổi vị trí hiển thị để mô phỏng kết quả
      setOldBattery(tempNew);
      setNewBattery(tempOld);
      setIsSwapped(true);
      setStep(4); // Hoàn tất
    } catch (e) {
      showToast("error", e.response?.data || "Đổi không thành công!");
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setInputCode("");
    setConfirmedCode("");
    setNewBattery(null);
    setOldBattery(null);
    setStep(1);
    setTxInfo({ plate: null, driver: null });
    setIsSwapped(false);
    showToast("info", "Vui lòng nhập mã xác nhận mới.");
  };

  // --- RENDER STEPS ---

  // Step 1: Nhập mã
  const renderInputSection = () => (
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
        value={inputCode}
        maxLength={6}
        onChange={(e) => {
          const val = e.target.value;
          setInputCode(val);
          if (step > 1 && val !== confirmedCode) onReset();
        }}
        style={{ marginBottom: 12 }}
        disabled={step > 1 || loading}
      />
      {step === 4 ? (
        <Button type="default" block onClick={onReset} icon={<PlusOutlined />}>
          Nhập mã mới
        </Button>
      ) : (
        <Button
          type="primary"
          block
          onClick={onVerifyCode}
          loading={loading && step === 1}
          disabled={!inputCode || inputCode.length !== 6 || step > 1}
          icon={<CheckCircleOutlined />}
        >
          Kiểm tra mã
        </Button>
      )}

      {step > 1 && (
        <div style={{ marginTop: 16 }}>
          <Divider style={{ margin: "8px 0" }} />
          <Row justify="space-between">
            <Text strong>
              <UserOutlined /> Tài xế:
            </Text>
            <Text>{txInfo.driver}</Text>
          </Row>
          <Row justify="space-between" style={{ marginTop: 8 }}>
            <Text strong>
              <CarOutlined /> Biển số:
            </Text>
            <Text>{txInfo.plate}</Text>
          </Row>
        </div>
      )}
    </Card>
  );

  // Step 2: Cho pin vào (Bảng lớn giữa màn hình)
  const renderInsertSection = () => (
    <div style={{ padding: "20px 0", textAlign: "center" }}>
      <Title level={5} style={{ marginBottom: 30 }}>
        Vui lòng cho pin cũ vào khay đã mở
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
          onClick={onInsertBattery}
          loading={loading}
          icon={<PlusOutlined />}
          style={{ width: 200, height: 60, fontSize: 18, borderRadius: 30 }}
        >
          {loading ? "Đang xử lý..." : "Cho pin vào"}
        </Button>
        <div style={{ marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Mở nắp khay pin và đặt pin cũ vào
          </Text>
        </div>
      </Card>
    </div>
  );

  // Step 3 & 4: So sánh và Swap
  const renderSwapSection = () => (
    <div>
      <Row gutter={24} align="middle">
        {/* Cột Trái */}
        <Col span={11}>
          <BatteryCard
            title={isSwapped ? "Pin mới (Đã lắp vào)" : "Pin cũ (Đã tháo ra)"}
            data={isSwapped ? oldBattery : oldBattery}
            type={isSwapped ? "new" : "old"}
          />
        </Col>

        {/* Icon Giữa */}
        <Col span={2} style={{ textAlign: "center" }}>
          <SwapOutlined
            style={{ fontSize: 24, color: isSwapped ? "#52c41a" : "#1890ff" }}
          />
        </Col>

        {/* Cột Phải */}
        <Col span={11}>
          <BatteryCard
            title={isSwapped ? "Pin cũ (Đã tháo ra)" : "Pin mới (Sẽ lắp vào)"}
            data={isSwapped ? newBattery : newBattery}
            type={isSwapped ? "old" : "new"}
          />
        </Col>
      </Row>

      {/* Nút Thao tác (Step 3) */}
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
          <Button
            size="large"
            icon={<CloseOutlined />}
            onClick={() => setStep(2)}
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
            Xác nhận Đổi Pin
          </Button>
        </div>
      )}

      {/* Thông báo thành công (Step 4) */}
      {isSwapped && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Tag color="success" style={{ fontSize: 16, padding: "8px 16px" }}>
            <CheckCircleOutlined /> Đổi piin hoàn tất
          </Tag>
        </div>
      )}
    </div>
  );

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
        {renderInputSection()}

        {/* Chỉ hiện khu vực đổi pin khi đã qua bước nhập mã */}
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
            {step === 2 && !isSwapped && renderInsertSection()}
            {(step === 3 || step === 4) && renderSwapSection()}
          </Card>
        )}
      </Space>
    </div>
  );
}
