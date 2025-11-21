import React, { useState, useEffect, useCallback } from "react";
import { Form, Select, Spin, notification, Typography } from "antd";
import api from "../../config/axios";

const { Option } = Select;
const { Text } = Typography;

const BookingFormFields = ({
  form,
  onVehicleChange,
  preselectedVehicleId,
  preselectedStationId,
}) => {
  const [vehicles, setVehicles] = useState([]);
  const [compatibleStations, setCompatibleStations] = useState([]);
  const [isStationLoading, setIsStationLoading] = useState(false);
  const [isVehicleLoading, setIsVehicleLoading] = useState(true);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState(null);
  const [remainingSwaps, setRemainingSwaps] = useState(null);

  const fetchCompatibleStations = useCallback(async (vehicleId) => {
    if (!vehicleId) {
      setCompatibleStations([]);
      return;
    }
    setIsStationLoading(true);
    try {
      const res = await api.get(
        `${"/booking/compatible-stations"}/${vehicleId}`
      );
      const stationsData = res.data.map((s) => ({
        ...s,
        availableBatteriesCount: s.currentBatteryCount ?? 0,
      }));
      setCompatibleStations(stationsData || []);
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
        const res = await api.get("/vehicle/my-vehicles");
        const fetchedVehicles = res.data || [];
        setVehicles(fetchedVehicles);

        // Nếu có preselectedVehicleId, tự động tải trạm tương thích
        if (preselectedVehicleId) {
          const preselectedVehicle = fetchedVehicles.find(
            (v) => v.id === preselectedVehicleId
          );
          setSelectedVehicleDetails(preselectedVehicle);
          // Tự động fetch trạm tương thích
          if (preselectedVehicleId) {
            fetchCompatibleStations(preselectedVehicleId);
          }
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
  }, [preselectedVehicleId, fetchCompatibleStations]);

  // Fetch tên trạm khi có preselectedStationId
  useEffect(() => {
    if (preselectedStationId && compatibleStations.length > 0) {
      const station = compatibleStations.find(
        (s) => s.id === preselectedStationId
      );
      if (station) {
        // Chỉ cần set giá trị cho form là đủ, Select sẽ tự hiển thị tên
        form.setFieldsValue({ stationId: preselectedStationId });
      }
    }
  }, [preselectedStationId, compatibleStations, form]);

  const handleVehicleChange = (vehicleId) => {
    form.setFieldsValue({ stationId: undefined });
    const selected = vehicles.find((v) => v.id === vehicleId);
    setSelectedVehicleDetails(selected);
    setRemainingSwaps(selected?.remainingSwaps ?? null);
    if (vehicleId) {
      fetchCompatibleStations(vehicleId);
    } else {
      setCompatibleStations([]);
      setRemainingSwaps(null);
    }
    if (onVehicleChange) {
      onVehicleChange(vehicleId);
    }
  };

  if (isVehicleLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "20px" }}
      >
        <Spin tip="Đang tải danh sách xe..." />
      </div>
    );
  }

  return (
    <>
      <Form.Item
        name="vehicleId"
        label="1. Chọn xe của bạn"
        rules={[{ required: true, message: "Vui lòng chọn xe của bạn!" }]}
      >
        <Select placeholder="Chọn một chiếc xe" onChange={handleVehicleChange}>
          {vehicles.map((v) => {
            const isDisabled = v.status !== "ACTIVE";
            const disabledLabel = isDisabled
              ? ` (${v.status === "PENDING" ? "Chờ duyệt" : "Không hoạt động"})`
              : "";
            return (
              <Option key={v.id} value={v.id} disabled={isDisabled}>
                {v.model} ({v.plateNumber || "Chưa có biển số"}){disabledLabel}
              </Option>
            );
          })}
        </Select>
      </Form.Item>

      {(selectedVehicleDetails && selectedVehicleDetails.plateNumber) ||
      remainingSwaps !== null ? (
        <div style={{ marginBottom: 16, marginTop: -10 }}>
          {selectedVehicleDetails && selectedVehicleDetails.plateNumber && (
            <div style={{ marginBottom: 4 }}>
              <Text strong>Biển số xe: </Text>
              <Text type="secondary">{selectedVehicleDetails.plateNumber}</Text>
            </div>
          )}

          {remainingSwaps !== null && (
            <div>
              <Text strong>Số lần đổi pin còn lại: </Text>
              <Text
                style={{ color: remainingSwaps > 0 ? "#52c41a" : "#f5222d" }}
              >
                **{remainingSwaps}** lần
              </Text>
            </div>
          )}
        </div>
      ) : null}

      <Form.Item
        name="stationId"
        label="2. Chọn trạm đổi pin phù hợp với xe bạn"
        rules={[{ required: true, message: "Vui lòng chọn một trạm!" }]}
      >
        <Select
          placeholder="Chọn một trạm"
          showSearch
          optionFilterProp="children"
          disabled={!form.getFieldValue("vehicleId")}
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
              {` (còn ${s.availableBatteriesCount} pin)`}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default BookingFormFields;
