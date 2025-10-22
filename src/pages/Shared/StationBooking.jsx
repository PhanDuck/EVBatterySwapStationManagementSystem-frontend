import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Form,
  Select,
  DatePicker,
  Button,
  Card,
  notification,
  Spin,
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

import '../../App.css'; 
import '../../index.css';

dayjs.locale("vi");
dayjs.extend(relativeTime);

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
const { Content } = Layout;
const { Step } = Steps;

const POST_BOOKING_API_URL = "/booking";
const GET_VEHICLES_API_URL = "/vehicle/my-vehicles";
const GET_COMPATIBLE_STATIONS_API_URL = "/booking/compatible-stations";

function StationBookingPage() {
  const [form] = Form.useForm();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [compatibleStations, setCompatibleStations] = useState([]);
  const [isStationLoading, setIsStationLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const preselectedStation = location.state?.station;

  const fetchCompatibleStations = useCallback(async (vehicleId) => {
    if (!vehicleId) {
      setCompatibleStations([]);
      return;
    }
    setIsStationLoading(true);
    try {
      const res = await api.get(`${GET_COMPATIBLE_STATIONS_API_URL}/${vehicleId}`);
      setCompatibleStations(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải trạm tương thích:", error);
      setCompatibleStations([]);
      notification.error({
        message: "Lỗi Tải Danh Sách Trạm",
        description: "Không thể tải danh sách trạm tương thích cho xe đã chọn.",
      });
    } finally {
      setIsStationLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      setDataLoading(true);
      try {
        const vehiclesRes = await api.get(GET_VEHICLES_API_URL);
        setVehicles(vehiclesRes.data || []);
        
        if (preselectedStation && vehiclesRes.data.length > 0) {
          const defaultVehicleId = vehiclesRes.data[0].id;
          form.setFieldsValue({ vehicleId: defaultVehicleId });
          await fetchCompatibleStations(defaultVehicleId);
          form.setFieldsValue({ stationId: preselectedStation.id });
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách xe:", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchVehicles();
  }, [preselectedStation, form, fetchCompatibleStations]);

  const handleVehicleChange = (vehicleId) => {
    form.setFieldsValue({ stationId: null, bookingTime: null });
    setCompatibleStations([]);
    if (vehicleId) {
      fetchCompatibleStations(vehicleId);
    }
    handleValuesChange();
  };

  const onFinish = async (values) => {
    setLoading(true);
    const payload = {
      vehicleId: values.vehicleId,
      stationId: values.stationId,
      bookingTime: dayjs(values.bookingTime).toISOString(),
    };
    try {
      const res = await api.post(POST_BOOKING_API_URL, payload);
      const vehicle = vehicles.find((v) => v.id === values.vehicleId);
      const station = compatibleStations.find((s) => s.id === values.stationId);
      setBookingDetails({
        ...res.data,
        vehicleName: `${vehicle.model} (${vehicle.plateNumber})`,
        stationName: `${station.name}`,
        bookingTime: dayjs(values.bookingTime),
      });
      setBookingSuccess(true);
      notification.success({
        message: "Đặt Lịch Thành Công!",
        description: `Lịch hẹn của bạn đã được xác nhận. Mã: ${
          res.data.confirmationCode || "Kiểm tra mục Lịch hẹn của tôi"
        }`,
        duration: 5,
      });
      form.resetFields();
      setCompatibleStations([]);
    } catch (error) {
      console.error(
        "Lỗi khi tạo lịch hẹn:",
        error.response ? error.response.data : error.message
      );
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại.";
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

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const resetBookingForm = () => {
    setBookingSuccess(false);
    setBookingDetails(null);
    setCurrentStep(0);
    form.resetFields();
    setCompatibleStations([]);
  };

  if (dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 128px)' }}>
        <Spin tip="Đang tải dữ liệu xe..." size="large" />
      </div>
    );
  }

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
                    <Paragraph>Lịch hẹn cho xe <strong>{bookingDetails?.vehicleName}</strong> tại trạm <strong>{bookingDetails?.stationName}</strong> đã được lên lịch vào lúc <strong>{bookingDetails?.bookingTime.format('HH:mm DD/MM/YYYY')}</strong> ({bookingDetails?.bookingTime.fromNow()}).</Paragraph>
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
                  onValuesChange={handleValuesChange}
                  size="large"
                  disabled={vehicles.length === 0}
                >
                  <Form.Item
                    name="vehicleId"
                    label="1. Chọn xe của bạn"
                    rules={[{ required: true, message: "Vui lòng chọn xe của bạn!" }]}
                  >
                    <Select 
                      placeholder="Chọn một chiếc xe (Tên xe, Biển số)"
                      onChange={handleVehicleChange}
                    >
                      {vehicles.map((v) => (
                        <Option key={v.id} value={v.id}>
                          <Text strong>{v.model}</Text> - <Text type="secondary">{v.plateNumber || "Chưa có biển số"}</Text>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="stationId"
                    label="2. Chọn trạm đổi pin phù hợp với xe bạn"
                    rules={[{ required: true, message: "Vui lòng chọn một trạm!" }]}
                  >
                    <Select 
                      placeholder="Chọn một trạm" 
                      showSearch 
                      optionFilterProp="children"
                      disabled={!form.getFieldValue('vehicleId') || isStationLoading}
                      loading={isStationLoading}
                      notFoundContent={
                        isStationLoading ? <Spin size="small" /> : 
                        !form.getFieldValue('vehicleId') ? "Vui lòng chọn xe để xem trạm" : "Không tìm thấy trạm tương thích"
                      }
                    >
                      {compatibleStations.map((s) => (
                        <Option key={s.id} value={s.id}>
                          <Text strong>{s.name}</Text> - <Text type="secondary">{s.district}, {s.city}</Text>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="bookingTime"
                    label="3. Chọn thời gian hẹn"
                    rules={[{ required: true, message: "Vui lòng chọn ngày và giờ!" }]}
                  >
                    <DatePicker
                      showTime={{ format: "HH:mm", minuteStep: 15 }}
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={disabledDate}
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày và giờ"
                    />
                  </Form.Item>
                  <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<SendOutlined />}
                      style={{ width: "100%", height: 48, fontSize: 16 }}
                      disabled={loading || vehicles.length === 0}
                    >
                      {loading ? "Đang xử lý..." : "Xác Nhận Đặt Lịch"}
                    </Button>
                  </Form.Item>
                  {vehicles.length === 0 && (
                    <Typography.Text type="danger" style={{ display: 'block', textAlign: 'center', marginTop: '1rem' }}>
                      Bạn cần thêm xe vào tài khoản trước khi có thể đặt lịch.
                    </Typography.Text>
                  )}
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