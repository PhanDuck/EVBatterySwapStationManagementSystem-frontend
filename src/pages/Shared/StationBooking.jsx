import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Form,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Steps,
  Result,
  Descriptions,
  Tag,
  Divider
} from "antd";
import {
  CarOutlined,
  EnvironmentOutlined,
  SendOutlined,
  SmileOutlined,
  ClockCircleOutlined,
  BarcodeOutlined,
  WalletOutlined
} from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// Import component chứa các trường form
import BookingFormFields from "../../components/BookingForm/BookingForm";

import "../../App.css";
import "../../index.css";
import { showToast } from "../../Utils/toastHandler";

// Set locale tiếng Việt cho dayjs
dayjs.locale("vi");

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

function StationBookingPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const [bookingDetails, setBookingDetails] = useState(null);
  const [searchParams] = useSearchParams();

  const vehicleIdFromUrl = searchParams.get("vehicleId");
  const stationIdFromUrl = searchParams.get("stationId");

  useEffect(() => {
    if (vehicleIdFromUrl) {
      form.setFieldsValue({
        vehicleId: parseInt(vehicleIdFromUrl),
      });
      setCurrentStep(1);
    }
    if (vehicleIdFromUrl && stationIdFromUrl) {
      form.setFieldsValue({
        vehicleId: parseInt(vehicleIdFromUrl),
        stationId: parseInt(stationIdFromUrl),
      });
      setCurrentStep(2);
    }
  }, [vehicleIdFromUrl, stationIdFromUrl, form]);

  const onFinish = async (values) => {
    setLoading(true);
    const payload = {
      vehicleId: values.vehicleId,
      stationId: values.stationId,
    };

    try {
      const res = await api.post("/booking", payload);
      const data = res.data;

      setBookingDetails({
        confirmationCode: data.confirmationCode,
        createdAt: dayjs(data.createdAt), 
        expiryTime: dayjs(data.reservationExpiry),      
        
        remainingSwaps: data.remainingSwaps,            
        stationName: data.stationName,                   
        vehiclePlateNumber: data.vehiclePlateNumber,
        stationLocation: data.stationLocation, 
      });

      setBookingSuccess(true);
      showToast("success", "Đặt lịch thành công!");
    } catch (error) {
      const errorMessage =
        error.response?.data || "Đã xảy ra lỗi khi đặt lịch.";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleValuesChange = () => {
    const { vehicleId, stationId } = form.getFieldsValue();
    if (vehicleId && stationId) {
      setCurrentStep(2);
    } else if (vehicleId) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  };

  const getPreselectedVehicleId = () => {
    return vehicleIdFromUrl ? parseInt(vehicleIdFromUrl) : null;
  };

  const resetBookingForm = () => {
    setBookingSuccess(false);
    setBookingDetails(null);
    setCurrentStep(0);
    form.resetFields();
  };

  const renderSuccessContent = () => {
    if (!bookingDetails) return null;

    return (
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        {/* Khung chứa Mã xác nhận nổi bật */}
        <div style={{ 
            background: '#f6ffed', 
            border: '1px dashed #b7eb8f', 
            borderRadius: '8px', 
            padding: '16px', 
            textAlign: 'center',
            marginBottom: '24px'
        }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            <BarcodeOutlined /> Mã xác nhận của bạn
          </Text>
          <Title level={2} style={{ color: '#52c41a', margin: '4px 0 0' }} copyable>
            {bookingDetails.confirmationCode}
          </Title>
        </div>

        {/* Bảng thông tin chi tiết */}
        <Descriptions 
          bordered 
          column={{ xs: 1, sm: 1, md: 2 }} 
          size="small"
          layout="horizontal"
        >
          <Descriptions.Item label={<><EnvironmentOutlined /> Trạm</>} span={2}>
            <b>{bookingDetails.stationName}</b>
            <br />
            <Text type="secondary" style={{fontSize: 12}}>{bookingDetails.stationLocation}</Text>
          </Descriptions.Item>

          <Descriptions.Item label={<><CarOutlined /> Biển số xe</>}>
            <Tag color="blue">{bookingDetails.vehiclePlateNumber}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label={<><WalletOutlined /> Số dư ví</>}>
            <Text strong style={{ color: bookingDetails.remainingSwaps > 0 ? '#52c41a' : '#f5222d' }}>
              {bookingDetails.remainingSwaps} lần
            </Text>
          </Descriptions.Item>

          <Descriptions.Item label={<><ClockCircleOutlined /> Thời gian đặt</>}>
            {bookingDetails.createdAt?.format("HH:mm DD/MM/YYYY")}
          </Descriptions.Item>

          <Descriptions.Item label="Hết hạn lúc (sau giờ đặt 3 tiếng)" contentStyle={{ fontWeight: 'bold', color: '#cf1322' }}>
            {bookingDetails.expiryTime?.format("HH:mm DD/MM/YYYY")}
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '16px 0' }} />
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", marginTop: 40, background: "#f0f2f5" }}>
      <Row justify="center">
        <Col xs={24} sm={22} md={18} lg={16} xl={14}>
          <Card
            style={{
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              borderRadius: "12px",
            }}
          >
            {bookingSuccess ? (
              <Result
                status="success"
                icon={<SmileOutlined />}
                title="Đặt Lịch Thành Công!"
                subTitle="Hệ thống đã ghi nhận lịch hẹn của bạn."
                extra={[
                  <Button type="primary" key="new" onClick={resetBookingForm} size="large">
                    Đặt Lịch Mới
                  </Button>,
                ]}
              >
                {renderSuccessContent()}
              </Result>
            ) : (
              <>
                <Title level={2} style={{ textAlign: "center", marginBottom: 16 }}>
                  Đặt Lịch Đổi Pin
                </Title>
                <Paragraph type="secondary" style={{ textAlign: "center", marginBottom: 32 }}>
                  Nhanh chóng, tiện lợi và luôn sẵn sàng phục vụ.
                </Paragraph>
                <Steps current={currentStep} style={{ marginBottom: 32 }} size="small">
                  <Step title="Chọn Xe" icon={<CarOutlined />} />
                  <Step title="Chọn Trạm" icon={<EnvironmentOutlined />} />
                </Steps>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  onValuesChange={handleValuesChange}
                  size="large"
                >
                  <BookingFormFields
                    form={form}
                    onVehicleChange={handleValuesChange}
                    preselectedVehicleId={getPreselectedVehicleId()}
                    preselectedStationId={
                      stationIdFromUrl ? parseInt(stationIdFromUrl) : null
                    }
                  />

                  <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SendOutlined />}
                      style={{ width: "100%", height: 48, fontSize: 16 }}
                      disabled={loading}
                    >
                      {loading ? "Đang xử lý..." : "Xác Nhận Đặt Lịch"}
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StationBookingPage;