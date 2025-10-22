import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  notification,
  Typography,
  Layout,
  Row,
  Col,
  Steps,
  Result,
} from "antd";
import {
  CarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";

// Import component chứa các trường form
import BookingFormFields from "../../components/BookingForm/BookingForm";

import '../../App.css'; 
import '../../index.css';

dayjs.locale("vi");
dayjs.extend(relativeTime);

const { Title, Paragraph } = Typography;
const { Step } = Steps;

const POST_BOOKING_API_URL = "/booking";

function StationBookingPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const onFinish = async (values) => {
    setLoading(true);
    // Định dạng lại thời gian trước khi gửi đi để phù hợp với múi giờ Việt Nam
    const payload = {
      ...values,
      bookingTime: dayjs(values.bookingTime).format("YYYY-MM-DDTHH:mm:ss"),
    };
    try {
      const res = await api.post(POST_BOOKING_API_URL, payload);
      setBookingDetails({
        ...res.data,
        vehicleName: `ID ${values.vehicleId}`, // Placeholder
        stationName: `ID ${values.stationId}`, // Placeholder
        bookingTime: dayjs(values.bookingTime),
      });
      setBookingSuccess(true);
      notification.success({
        message: "Đặt Lịch Thành Công!",
        description: `Lịch hẹn của bạn đã được xác nhận.`,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Đã xảy ra lỗi khi đặt lịch.";
      notification.error({
        message: "Đặt Lịch Thất Bại",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValuesChange = () => {
    const { vehicleId, stationId, bookingTime } = form.getFieldsValue();
    if (vehicleId && stationId && bookingTime) {
      setCurrentStep(3);
    } else if (vehicleId && stationId) {
      setCurrentStep(2);
    } else if (vehicleId) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  };

  const resetBookingForm = () => {
    setBookingSuccess(false);
    setBookingDetails(null);
    setCurrentStep(0);
    form.resetFields();
  };

  return (
    <div style={{ padding: "24px", marginTop: 40, background: '#f0f2f5' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
            {bookingSuccess ? (
              <Result
                icon={<SmileOutlined />}
                title="Đặt Lịch Thành Công!"
                subTitle={
                  <div>
                    <Paragraph>Mã xác nhận: <strong>{bookingDetails?.confirmationCode}</strong></Paragraph>
                    <Paragraph>Lịch hẹn của bạn đã được lên lịch vào lúc <strong>{bookingDetails?.bookingTime.format('HH:mm DD/MM/YYYY')}</strong> ({bookingDetails?.bookingTime.fromNow()}).</Paragraph>
                  </div>
                }
                extra={[
                  <Button type="primary" key="new" onClick={resetBookingForm}>
                    Tạo Lịch Hẹn Mới
                  </Button>,
                ]}
              />
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
                  <Step title="Chọn Thời Gian" icon={<ClockCircleOutlined />} />
                </Steps>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  onValuesChange={handleValuesChange} // onValuesChange sẽ cập nhật Steps
                  size="large"
                >
                  {/* Nhúng các trường form từ component chung */}
                  <BookingFormFields form={form} onVehicleChange={handleValuesChange} />

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