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
} from "@ant-design/icons";
import axios from "axios";

const EnterConfirmationCode = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Nhập code, 2: Cho pin vào, 3: Sẵn sàng Swap
  const [newBattery, setNewBattery] = useState(null); // Pin mới sắp lắp vào
  const [oldBattery, setOldBattery] = useState(null); // Pin cũ tháo ra

  const token = sessionStorage.getItem("authToken");

  const { Title, Text } = Typography;

  // Định nghĩa các API endpoints
  const API_BASE_URL = "";
  const GET_NEW_BATTERY_API_URL = "/api/swap-transaction/new-battery";
  const GET_OLD_BATTERY_API_URL = "/api/swap-transaction/old-battery";
  const POST_SWAP_API_URL = "/api/swap-transaction/swap-by-code";

  // ⚙️ Component con hiển thị thông tin pin (dùng lại cho cả pin cũ và pin mới)
  const BatteryInfoCard = ({
    title,
    batteryData,
    loading,
    type,
    backgroundColor,
  }) => {
    const color = type === "new" ? "green" : "yellow";

    if (loading) {
      return (
        <Card
          bordered
          title={title}
          style={{
            height: 250,
            textAlign: "center",
            backgroundColor: backgroundColor || "#ffffffff",
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
            backgroundColor: backgroundColor || "#ffffffff",
          }}
        >
          <Text type="secondary">Chưa có thông tin pin</Text>
        </Card>
      );
    }

    return (
      <Card
        bordered
        title={title}
        style={{
          minHeight: 250,
          borderColor: color,
          backgroundColor: backgroundColor || "#ffffffff",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* 1. Loại Pin */}
          <Row justify="space-between">
            <Col>
              <Text strong>Loại Pin:</Text>
            </Col>
            <Col>
              <Text>{batteryData.model || "—"}</Text>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />

          {/* 2. Mức sạc (Charge Level) */}
          <Row justify="space-between">
            <Col>
              <Text strong>
                <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc
                (%):
              </Text>
            </Col>
            <Col>
              <Tag color={batteryData.chargeLevel > 70 ? "green" : "orange"}>
                {batteryData.chargeLevel}
              </Tag>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />

          {/* 3. Tình trạng pin (State of Health) */}
          <Row justify="space-between">
            <Col>
              <Text strong>
                <HeartOutlined style={{ color: "#ff4d4f" }} /> Tình trạng
                pin(%):
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
      return message.warning("⚠️ Vui lòng nhập đúng mã gồm 6 ký tự.");
    }
    if (step > 1) {
      return message.info(
        "Mã đã được xác nhận. Vui lòng tiếp tục các bước đổi pin."
      );
    }

    setLoading(true);
    try {
      // API lấy thông tin pin mới
      const res = await axios.get(
        `${API_BASE_URL}${GET_NEW_BATTERY_API_URL}?code=${code}`, // Dùng 'code' làm parameter
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewBattery(res.data);
      setStep(2); // Chuyển sang bước "Cho pin vào"
      message.success("✅ Xác nhận mã thành công! Sẵn sàng cho pin vào.");
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          "❌ Lấy thông tin pin mới không thành công!"
      );
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
      const res = await axios.get(
        `${API_BASE_URL}${GET_OLD_BATTERY_API_URL}?code=${code}`, // Dùng 'code' làm parameter
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOldBattery(res.data);
      setStep(3); // Chuyển sang bước "Sẵn sàng Swap"
      message.success({
        content: "✅ Pin đã được cho vào. Đã lấy thông tin pin. Sẵn sàng đổi.",
        key: "insert",
        duration: 3,
      });
    } catch (error) {
      message.error({
        content:
          error?.response?.data?.message || "❌ Lấy thông tin pin cũ thất bại!",
        key: "insert",
      });
      console.error("❌ Lỗi lấy pin cũ:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  //  Bước 3: Xác nhận Swap cuối cùng
  // ----------------------------------------------------
  const handleExecuteSwap = async () => {
    setLoading(true);

    // API Swap Transaction cuối cùng
    try {
      const res = await axios.post(
        `${POST_SWAP_API_URL}?code=${code}`,
        {}, // body rỗng
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("🎉 Đổi pin thành công!");
      console.log("✅ Response API Swap:", res.data);
      setCode("");
      setStep(1);
      setNewBattery(null);
      setOldBattery(null);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "❌ Đổi không thành công!"
      );
      console.error("❌ Lỗi đổi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xác định nút hiển thị
  const renderActionButton = () => {
    if (step === 2) {
      return (
        <Button
          type="primary"
          block
          onClick={handleInsertNewBattery} // Cho pin vào
          loading={loading}
          disabled={loading}
          icon={<PlusOutlined />}
        >
          Cho pin vào
        </Button>
      );
    } else if (step === 3) {
      return (
        <Button
          type="primary"
          block
          onClick={handleExecuteSwap} // Execute Swap cuối cùng
          loading={loading}
          disabled={loading || !oldBattery} // Đảm bảo đã có thông tin pin cũ
          icon={<SwapOutlined />}
        >
          Xác nhận đổi pin
        </Button>
      );
    }
    // Trả về null hoặc một thẻ rỗng để ẩn nút ở Step 1
    return null;
  };

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
                setStep(1);
                setNewBattery(null);
                setOldBattery(null);
              }
            }}
            style={{ marginBottom: 12 }}
            disabled={step > 1 || loading}
          />

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
        </Card>

        {/* 2. KHU VỰC HIỂN THỊ PIN VÀ HÀNH ĐỘNG (Chỉ hiện khi step > 1, Căn giữa) */}
        {step > 1 && (
          <Card
            title={
              <Title level={4} style={{ margin: 0, textAlign: "center" }}>
                <SwapOutlined /> Thông tin giao dịch đổi pin
              </Title>
            }
            style={{
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              borderRadius: "8px",
              // Đã được căn giữa nhờ container <Space>
            }}
          >
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={12}>
                {/* Bảng pin cũ */}
                {step === 2 && !oldBattery ? (
                  <Card
                    bordered
                    title="Pin cũ (Đang lắp trên xe)"
                    style={{
                      height: 250,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      backgroundColor: "#ffffffff",
                    }}
                  >
                    <Text type="secondary" style={{ textAlign: "center" }}>
                      Hãy cho pin vào.
                    </Text>
                  </Card>
                ) : (
                  <BatteryInfoCard
                    title="Pin cũ (Đã tháo ra)"
                    batteryData={oldBattery}
                    loading={loading && step === 2}
                    type="old"
                    backgroundColor={step === 3 ? "#ffffebff" : null}
                  />
                )}
              </Col>
              <Col span={12}>
                {/* Bảng pin mới */}
                <BatteryInfoCard
                  title="Pin mới (Sẽ lắp vào)"
                  batteryData={newBattery}
                  loading={loading && step === 1}
                  type="new"
                  backgroundColor={step > 1 ? "#f8fef2ff" : null}
                />
              </Col>
            </Row>

            {/* Nút hành động chính */}
            <div style={{ marginTop: 20 }}>{renderActionButton()}</div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default EnterConfirmationCode;

// const handleConfirm = async () => {
//   if (!code || code.length !== 6) {
//     return message.warning("⚠️ Vui lòng nhập đúng mã gồm 6 ký tự.");
//   }

//   try {
//     setLoading(true);

//     const res = await axios.post(
//       `/api/swap-transaction/swap-by-code?confirmationCode=${code}`,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     message.success("✅ Xác nhận thành công!");
//     console.log("✅ Response API:", res.data);
//   } catch (error) {
//     console.error("❌ Lỗi API:", error);
//     message.error(
//       error?.response?.data?.message || "❌ Xác nhận không thành công!"
//     );
//   } finally {
//     setLoading(false);
//   }
// };

// return (
//   <Card
//     title="Nhập mã xác nhận để Swap Pin"
//     style={{ maxWidth: 400, margin: "0 auto" }}
//   >
//     <Input
//       placeholder="Nhập mã gồm 6 ký tự"
//       value={code}
//       maxLength={6}
//       onChange={(e) => setCode(e.target.value)}
//       style={{ marginBottom: 12 }}
//     />

//     <Button
//       type="primary"
//       block
//       onClick={handleConfirm}
//       loading={loading}
//       disabled={!code}
//     >
//       Xác nhận Swap
//     </Button>
//   </Card>
// );
