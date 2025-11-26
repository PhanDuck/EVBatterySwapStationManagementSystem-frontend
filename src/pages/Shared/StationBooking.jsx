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
} from "antd";
import {
  CarOutlined,
  EnvironmentOutlined,
  SendOutlined,
  SmileOutlined,
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
  
  // State lưu response từ API để hiển thị kết quả
  const [bookingDetails, setBookingDetails] = useState(null);
  
  const [searchParams] = useSearchParams();

  // Lấy vehicleId và stationId từ URL params
  const vehicleIdFromUrl = searchParams.get("vehicleId");
  const stationIdFromUrl = searchParams.get("stationId");

  // Tự động điền form nếu có URL params
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

      // Logic mới: Map trực tiếp dữ liệu từ API trả về
      // Không tự tính toán thời gian ở Frontend nữa
      setBookingDetails({
        confirmationCode: data.confirmationCode,
        bookingTime: dayjs(data.bookingTime),           // Thời gian đặt
        expiryTime: dayjs(data.reservationExpiry),      // Thời gian hết hạn
        remainingSwaps: data.remainingSwaps,            // Số lần đổi còn lại
        
        // Tận dụng các trường API trả về để hiển thị đẹp hơn thay vì ID
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

  // Hàm để truyền vehicleId từ URL xuống component con
  const getPreselectedVehicleId = () => {
    return vehicleIdFromUrl ? parseInt(vehicleIdFromUrl) : null;
  };

  const resetBookingForm = () => {
    setBookingSuccess(false);
    setBookingDetails(null);
    setCurrentStep(0);
    form.resetFields();
  };

  return (
    <div style={{ padding: "24px", marginTop: 40, background: "#f0f2f5" }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={16} xl={14}>
          <Card
            style={{
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              borderRadius: "12px",
            }}
          >
            {bookingSuccess ? (
              <Result
                icon={<SmileOutlined />}
                title="Đặt Lịch Thành Công!"
                subTitle={
                  <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                    {/* Mã xác nhận */}
                    <Paragraph>
                      Mã xác nhận:{" "}
                      <Text strong copyable={{ text: bookingDetails?.confirmationCode }}>
                         {bookingDetails?.confirmationCode}
                      </Text>
                    </Paragraph>

                    {/* Thông tin Trạm & Xe */}
                    {bookingDetails?.stationName && (
                         <Paragraph>Trạm: <Text strong>{bookingDetails.stationName}</Text></Paragraph>
                    )}
                    {bookingDetails?.vehiclePlateNumber && (
                         <Paragraph>Biển số xe: <Text strong>{bookingDetails.vehiclePlateNumber}</Text></Paragraph>
                    )}

                    {/* Thời gian đặt (Booking Time) */}
                    <Paragraph>
                      Thời gian đặt:{" "}
                      <strong>
                        {bookingDetails?.bookingTime?.format("HH:mm - DD/MM/YYYY")}
                      </strong>
                    </Paragraph>

                    {/* Thời gian hết hạn (Expiry Time) - Lấy trực tiếp từ API */}
                    {bookingDetails?.expiryTime && (
                      <Paragraph>
                        Hết hạn lúc:{" "}
                        <Text type="danger" strong>
                          {bookingDetails.expiryTime.format("HH:mm - DD/MM/YYYY")}
                        </Text>
                      </Paragraph>
                    )}

                    {/* Số lần đổi pin còn lại */}
                    {bookingDetails?.remainingSwaps !== undefined &&
                      bookingDetails.remainingSwaps !== null && (
                        <Paragraph style={{ marginTop: 8 }}>
                          <Text strong>Số dư ví đổi pin: </Text>
                          <Text
                            style={{
                              color:
                                bookingDetails.remainingSwaps > 0
                                  ? "#52c41a"
                                  : "#f5222d",
                              fontSize: "16px",
                            }}
                          >
                            <b>{bookingDetails.remainingSwaps}</b> lần
                          </Text>
                        </Paragraph>
                      )}

                    <Paragraph type="secondary" style={{marginTop: 16, fontStyle: 'italic'}}>
                      * Vui lòng đến trạm trước thời gian hết hạn.
                    </Paragraph>
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
                <Title
                  level={2}
                  style={{ textAlign: "center", marginBottom: 16 }}
                >
                  Đặt Lịch Đổi Pin
                </Title>
                <Paragraph
                  type="secondary"
                  style={{ textAlign: "center", marginBottom: 32 }}
                >
                  Nhanh chóng, tiện lợi và luôn sẵn sàng phục vụ.
                </Paragraph>
                <Steps
                  current={currentStep}
                  style={{ marginBottom: 32 }}
                  size="small"
                >
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
                  {/* Nhúng các trường form từ component chung */}
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