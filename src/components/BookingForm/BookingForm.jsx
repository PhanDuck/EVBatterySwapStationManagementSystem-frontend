import React, { useState, useEffect, useCallback } from "react";
import { Form, Select, DatePicker, Spin, notification } from "antd";
import api from "../../config/axios";
//import dayjs from "dayjs";

const { Option } = Select;

const GET_VEHICLES_API_URL = "/vehicle/my-vehicles";
const GET_COMPATIBLE_STATIONS_API_URL = "/booking/compatible-stations";

// Component giờ đây sẽ nhận thêm prop `form`, `onVehicleChange`, `preselectedVehicleId`, `preselectedStationId`
const BookingFormFields = ({ form, onVehicleChange, preselectedVehicleId, preselectedStationId }) => {
  const [vehicles, setVehicles] = useState([]);
  const [compatibleStations, setCompatibleStations] = useState([]);
  const [isStationLoading, setIsStationLoading] = useState(false);
  const [isVehicleLoading, setIsVehicleLoading] = useState(true);

  const fetchCompatibleStations = useCallback(async (vehicleId) => {
    if (!vehicleId) {
      setCompatibleStations([]);
      return;
    }
    setIsStationLoading(true);
    try {
      const res = await api.get(
        `${GET_COMPATIBLE_STATIONS_API_URL}/${vehicleId}`
      );
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
      try {
        const res = await api.get(GET_VEHICLES_API_URL);
        setVehicles(res.data || []);
        
        // 🆕 Nếu có preselectedVehicleId, tự động tải trạm tương thích
        if (preselectedVehicleId) {
          await fetchCompatibleStations(preselectedVehicleId);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách xe:", error);
        notification.error({
          message: "Lỗi Tải Dữ Liệu",
          description: "Không thể tải danh sách xe của bạn.",
        });
      } finally {
        setIsVehicleLoading(false);
      }
    };
    fetchVehicles();
  }, [preselectedVehicleId]);

  const handleVehicleChange = (vehicleId) => {
    form.setFieldsValue({ stationId: undefined }); // Reset station selection
    if (vehicleId) {
      fetchCompatibleStations(vehicleId);
    } else {
      setCompatibleStations([]);
    }
    // Gọi callback để component cha có thể cập nhật UI (ví dụ: Steps)
    if (onVehicleChange) {
      onVehicleChange(vehicleId);
    }
  };

  // const disabledDate = (current) => {
  //   return current && current < dayjs().startOf("day");
  // };

  if (isVehicleLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "20px" }}
      >
        <Spin tip="Đang tải danh sách xe..." />
      </div>
    );
  }

  // Component chỉ trả về các Form.Item, không bao gồm thẻ <Form>
  return (
    <>
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
              {v.model} ({v.plateNumber || "Chưa có biển số"})
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
          disabled={!form.getFieldValue("vehicleId") || isStationLoading}
          loading={isStationLoading}
          notFoundContent={
            isStationLoading ? (
              <Spin size="small" />
            ) : !form.getFieldValue("vehicleId") ? (
              "Vui lòng chọn xe để xem trạm"
            ) : (
              "Không tìm thấy trạm tương thích"
            )
          }
        >
          {compatibleStations.map((s) => (
            <Option key={s.id} value={s.id}>
              {s.name} - {s.district}, {s.city}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* <Form.Item
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
      </Form.Item> */}
    </>
  );
};

export default BookingFormFields;