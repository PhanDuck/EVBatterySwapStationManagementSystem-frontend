import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Select,
  Tooltip,
  Modal,
  Form,
  InputNumber,
} from "antd";
import {
  ReloadOutlined,
  SendOutlined,
  RollbackOutlined,
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Option } = Select;
// === LẤY ROLE NGƯỜI DÙNG TỪ LOCAL STORAGE ===
const userRole = JSON.parse(localStorage.getItem("currentUser"))?.role;

export default function InventoryPage() {
  // === STATE QUẢN LÝ DỮ LIỆU ===
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]); // Trạm Staff quản lý
  const [warehouseInventory, setWarehouseInventory] = useState([]); // Pin trong Kho
  const [stationInventory, setStationInventory] = useState([]); // Pin cần bảo dưỡng tại Trạm
  const [batteryTypesMap, setBatteryTypesMap] = useState({}); // Map TypeID -> Tên

  // === STATE QUẢN LÝ THAO TÁC (MODAL) ===
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [filterBatteryTypeId, setFilterBatteryTypeId] = useState(null);
  const [isEditSOHModalVisible, setIsEditSOHModalVisible] = useState(false);
  const [currentBatteryToEdit, setCurrentBatteryToEdit] = useState(null);
  const [form] = Form.useForm(); // Khởi tạo Form instance

  // --- 1. FUNCTIONS TẢI DỮ LIỆU ---

  // Tải danh sách trạm Staff quản lý
  const fetchManagedStations = useCallback(async () => {
    try {
      let res;

      // Logic MỚI: Admin lấy tất cả các trạm, Staff lấy trạm được gán
      if (userRole === "ADMIN") {
        res = await api.get("/station"); // API giả định lấy TẤT CẢ trạm
      } else {
        res = await api.get("/staff-station-assignment/my-stations");
      }

      const data = Array.isArray(res.data) ? res.data : [];
      setStations(data);

      // Tự động chọn trạm đầu tiên nếu có
      if (data.length > 0) {
        setSelectedStationId(data[0].id);
      }
    } catch (err) {
      message.error(
        userRole === "ADMIN"
          ? "Không thể tải danh sách TẤT CẢ trạm!"
          : "Không thể tải danh sách trạm quản lý!"
      );
      console.error(err);
      setStations([]);
    }
  }, []); // userRole là biến global/constant nên không cần trong dependency array

  // Tải Map Loại Pin (Tên, Dung lượng)
  const fetchBatteryTypes = useCallback(async () => {
    try {
      const res = await api.get("/battery-type");
      const map = {};
      // TĂNG CƯỜNG BẢO VỆ Ở ĐÂY: Dùng Array.isArray
      (Array.isArray(res.data) ? res.data : []).forEach((type) => {
        // <-- CHỈNH SỬA
        map[type.id] = `${type.name} (${type.capacity}Ah)`;
      });
      setBatteryTypesMap(map);
    } catch (err) {
      console.error("Lỗi tải loại pin:", err);
    }
  }, []);

  // Tải Pin cần bảo dưỡng tại trạm đã chọn
  const fetchStationInventory = useCallback(async (stationId) => {
    if (!stationId) return;
    setLoading(true);
    try {
      // API: GET /api/station/{id}/batteries/needs-maintenance
      const res = await api.get(
        `/station/${stationId}/batteries/needs-maintenance`
      );
      const inventory = Array.isArray(res.data.batteries)
        ? res.data.batteries
        : [];
      setStationInventory(inventory); // <-- CHỈNH SỬA
    } catch (err) {
      message.error("Không thể tải tồn kho trạm!");
      console.error(err);
      setStationInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải tồn kho chung trong Kho
  const fetchWarehouseInventory = useCallback(async (typeIdToFilter = null) => {
    setLoading(true);
    try {
      let res;
      if (typeIdToFilter) {
        // API LỌC: GET /api/station-inventory/available-by-type/{batteryTypeId}
        res = await api.get(
          `/station-inventory/available-by-type/${typeIdToFilter}`
        );
      } else {
        // API TOÀN BỘ: GET /api/station-inventory
        res = await api.get("/station-inventory");
      }

      // Sửa lỗi truy cập key: .batteries
      const inventory = Array.isArray(res.data.batteries)
        ? res.data.batteries
        : [];
      setWarehouseInventory(inventory);
    } catch (err) {
      message.error("Không thể tải tồn Kho!");
      console.error("Lỗi API Tồn kho Kho:", err.response?.data || err.message);
      setWarehouseInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect chạy lần đầu
  useEffect(() => {
    fetchManagedStations();
    fetchBatteryTypes();
    fetchWarehouseInventory();
  }, [fetchManagedStations, fetchBatteryTypes, fetchWarehouseInventory]);

  // Effect chạy khi trạm được chọn thay đổi
  useEffect(() => {
    if (selectedStationId) {
      fetchStationInventory(selectedStationId);
      setFilterBatteryTypeId(null);
      fetchWarehouseInventory(null);
    }
  }, [selectedStationId, fetchStationInventory, fetchWarehouseInventory]);

  // --- 2. HÀM XỬ LÝ THAO TÁC MOVE VÀ LỌC ---

  //Lấy Type ID của pin tại trạm đang chọn (để lọc)
  const getBatteryTypeForCurrentStation = () => {
    // Dựa vào pin đầu tiên trong danh sách pin cần bảo dưỡng
    if (stationInventory.length === 0) return null;
    return stationInventory[0].batteryTypeId;
  };

  //Xử lý LỌC Pin trong Kho theo loại Pin của Trạm
  const handleFilterByStationType = () => {
    const typeId = getBatteryTypeForCurrentStation();

    if (!typeId) {
      return message.warning(
        "Không có pin tại trạm để xác định loại pin cần lọc."
      );
    }

    // Cập nhật state và gọi hàm tải dữ liệu mới
    setFilterBatteryTypeId(typeId);
    fetchWarehouseInventory(typeId);
    message.success(`Đã lọc Pin Kho theo loại: ${batteryTypesMap[typeId]}.`);
  };

  // Xử lý Pin lỗi VỀ KHO
  const handleMoveToWarehouse = async (record) => {
    if (!selectedStationId) return message.error("Vui lòng chọn trạm!");

    // API: POST /api/station-inventory/move-to-warehouse
    try {
      await api.post("/station-inventory/move-to-warehouse", null, {
        params: {
          batteryId: record.id,
          stationId: selectedStationId,
        },
      });
      message.success(`✅ Pin ${record.id} đã được chuyển về kho bảo trì.`);
      fetchStationInventory(selectedStationId); // Refresh Pin tại trạm
      // Tải lại Pin Kho, sử dụng filter hiện tại nếu có
      fetchWarehouseInventory(filterBatteryTypeId);
    } catch (error) {
      message.error("❌ Lỗi chuyển pin về kho.");
      console.error(error);
    }
  };

  // Mở Modal Chuyển Pin Tốt RA TRẠM
  // const openMoveToStationModal = async (typeId) => {
  //   if (!selectedStationId) return message.error("Vui lòng chọn trạm!");

  //   // Tải Pin Tốt có sẵn trong Kho theo loại
  //   try {
  //     // API: GET /api/station-inventory/available-by-type/{batteryTypeId}
  //     const res = await api.get(
  //       `/station-inventory/available-by-type/${typeId}`
  //     );
  //     setAvailableWarehouseBatteries(res.data || []);
  //     setIsMoveToStationModalVisible(true);
  //   } catch (err) {
  //     message.error("Không thể tải pin tốt có sẵn trong kho.");
  //     console.error(err);
  //   }
  // };

  // Xử lý Pin Tốt RA TRẠM
  const handleMoveToStation = async (batteryId, typeId) => {
    if (!selectedStationId) return message.error("Vui lòng chọn trạm!");

    // API: POST /api/station-inventory/move-to-station
    try {
      await api.post("/station-inventory/move-to-station", null, {
        params: {
          batteryId: batteryId,
          stationId: selectedStationId,
          batteryTypeId: typeId,
        },
      });
      message.success(`✅ Pin ${batteryId} đã được chuyển ra trạm.`);
      // Tải lại Pin Kho, sử dụng filter hiện tại nếu có
      fetchStationInventory(selectedStationId);
      fetchWarehouseInventory(filterBatteryTypeId);
    } catch (err) {
      message.error("❌ Lỗi chuyển pin ra trạm.");
      console.error(err);
    }
  };

  // --- Xử lý Sửa SOH (Chỉ Admin) ---
  // const handleEditSOH = async (record) => {
  //   // Logic của Admin: Đánh dấu pin đã bảo trì xong và cập nhật SOH
  //   // API: PATCH /api/station-inventory/{batteryId}/complete-maintenance

  //   // Yêu cầu nhập SOH mới (giả lập prompt)
  //   const newSOH = prompt(`Nhập SOH mới (0-100) cho Pin ID ${record.id} (Loại: ${batteryTypesMap[record.batteryTypeId]}):`);

  //   const sohValue = newSOH ? parseFloat(newSOH) : null;

  //   if (sohValue === null || isNaN(sohValue) || sohValue < 0 || sohValue > 100) {
  //       return message.error("SOH không hợp lệ. Vui lòng nhập giá trị từ 0 đến 100.");
  //   }

  //   try {
  //       await api.patch(
  //           `/station-inventory/${record.id}/complete-maintenance`,
  //           null,
  //           {
  //               params: {
  //                   newSOH: sohValue,
  //               },
  //           }
  //       );
  //       message.success(`✅ Pin ${record.id} đã hoàn tất bảo trì, SOH cập nhật: ${sohValue}%.`);
  //       // Refresh Kho sau khi cập nhật
  //       fetchWarehouseInventory(filterBatteryTypeId);
  //   } catch (error) {
  //       message.error("❌ Lỗi cập nhật SOH/Hoàn tất bảo trì.");
  //       console.error("Lỗi API Cập nhật SOH:", error.response?.data || error.message);
  //   }
  // };
  const handleEditSOH = (record) => {
    if (userRole !== "ADMIN") return; // Đảm bảo chỉ Admin mới có thể mở

    setCurrentBatteryToEdit(record);
    // Reset form và set giá trị SOH hiện tại (nếu có)
    form.resetFields();
    form.setFieldsValue({
      newSOH: record.stateOfHealth ? parseFloat(record.stateOfHealth) : null,
    });
    setIsEditSOHModalVisible(true);
  };

  // --- Xử lý Sửa SOH (Submit Form) ---
  const handleSOHSubmit = async (values) => {
    if (!currentBatteryToEdit) return;

    const { newSOH } = values;
    const record = currentBatteryToEdit;

    try {
      // API: PATCH /api/station-inventory/{batteryId}/complete-maintenance
      await api.patch(
        `/station-inventory/${record.id}/complete-maintenance`,
        null,
        {
          params: {
            newSOH: newSOH,
          },
        }
      );
      message.success(
        `✅ Pin ${record.id} đã hoàn tất bảo trì, SOH cập nhật: ${newSOH}%.`
      );
      setIsEditSOHModalVisible(false); // Đóng modal
      // Refresh Kho sau khi cập nhật
      fetchWarehouseInventory(filterBatteryTypeId);
    } catch (error) {
      message.error("❌ Lỗi cập nhật SOH/Hoàn tất bảo trì.");
      console.error(
        "Lỗi API Cập nhật SOH:",
        error.response?.data || error.message
      );
    }
  };

  // --- 3. ĐỊNH NGHĨA CỘT CHO BẢNG ---

  // Cột cho Bảng Pin Cần Bảo Dưỡng tại Trạm
  const stationColumns = [
    { title: "Pin ID", dataIndex: "id", key: "id" },
    {
      title: "Dung tích pin",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) => capacity || "N/A",
    },
    {
      title: "Loại Pin",
      dataIndex: "batteryTypeId",
      key: "batteryTypeId",
      render: (typeId) => batteryTypesMap[typeId] || "N/A",
    },
    {
      title: "SOH (%)",
      dataIndex: "stateOfHealth",
      key: "stateOfHealth",
      // ĐIỀU CHỈNH: Format SOH (Làm tròn 2 chữ số thập phân)
      render: (soh) => {
        const sohValue = soh ? parseFloat(soh).toFixed(2) : "N/A";
        return sohValue !== "N/A" ? (
          <Tag color={parseFloat(sohValue) > 75 ? "orange" : "red"}>
            {sohValue}
          </Tag>
        ) : (
          "N/A"
        );
      },
    },
    {
      title: "Mức sạc (%)",
      dataIndex: "chargeLevel",
      key: "chargeLevel",
      render: (chargeLevel) => chargeLevel || "N/A",
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "AVAILABLE" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
    {
      title: "Ngày bảo dưỡng",
      dataIndex: "lastMaintenanceDate",
      key: "lastMaintenanceDate",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"), // Định dạng ngày cho an toàn
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chuyển pin lỗi này về kho bảo trì">
            <Button
              icon={<RollbackOutlined />}
              onClick={() => handleMoveToWarehouse(record)} // Move To Warehouse
              danger
              size="small"
            >
              Về Kho
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Cột cho Bảng Tồn Kho Pin trong Kho
  const warehouseColumns = [
    { title: "Pin ID", dataIndex: "id", key: "id" },
    {
      title: "Dung tích pin",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) => capacity || "N/A",
    },
    {
      title: "Loại Pin",
      dataIndex: "batteryTypeId",
      key: "batteryTypeId",
      render: (typeId) => batteryTypesMap[typeId] || "N/A",
    },
    {
      title: "SOH (%)",
      dataIndex: "stateOfHealth",
      key: "stateOfHealth",
      // ĐIỀU CHỈNH: Format SOH (Làm tròn 2 chữ số thập phân)
      render: (soh) => {
        const sohValue = soh ? parseFloat(soh).toFixed(2) : "N/A";
        return sohValue !== "N/A" ? (
          <Tag color={parseFloat(sohValue) > 85 ? "green" : "blue"}>
            {sohValue}
          </Tag>
        ) : (
          "N/A"
        );
      },
    },
    {
      title: "Mức sạc (%)",
      dataIndex: "chargeLevel",
      key: "chargeLevel",
      render: (chargeLevel) => chargeLevel || "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "AVAILABLE" ? "green" : "volcano"}>{status}</Tag>
      ),
      //width: 360,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/* Nút "Sửa SOH" (Chỉ hiện cho ADMIN và pin MAINTENANCE) */}
          {userRole === "ADMIN" && record.status === "MAINTENANCE" && (
            <Tooltip title="Hoàn tất bảo trì và cập nhật SOH">
              <Button
                onClick={() => handleEditSOH(record)}
                type="primary"
                icon={<EditOutlined />}
                size="small"
                setOpen={true}
              >
                Sửa SOH
              </Button>
            </Tooltip>
          )}

          {/* Nút "Ra Trạm" (Chỉ hiện cho AVAILABLE) */}
          {record.status === "AVAILABLE" && (
            <Tooltip
              title={`Chuyển pin ${record.id} ra trạm ${
                selectedStationId ? selectedStationId : "chưa chọn"
              }`}
            >
              <Button
                icon={<SendOutlined />}
                onClick={() =>
                  handleMoveToStation(record.id, record.batteryTypeId)
                }
                type="primary"
                size="small"
                disabled={!selectedStationId}
              >
                Ra Trạm
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* CARD QUẢN LÝ TỒN KHO TẠI TRẠM */}
      <Card
        title="Quản lý Tồn kho Pin tại Trạm"
        extra={
          <Space>
            <Select
              placeholder="Chọn Trạm quản lý"
              style={{ width: 250 }}
              value={selectedStationId}
              onChange={(value) => setSelectedStationId(value)}
              showSearch
              optionFilterProp="children"
            >
              {stations.map((station) => (
                <Option key={station.id} value={station.id}>
                  {station.name}
                </Option>
              ))}
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                if (selectedStationId) fetchStationInventory(selectedStationId);
              }}
            >
              Tải lại Pin Trạm
            </Button>
          </Space>
        }
        style={{ marginBottom: "20px" }}
      >
        <h4>Danh sách Pin cần Bảo dưỡng/Lỗi tại Trạm đang chọn:</h4>
        <Table
          columns={stationColumns}
          dataSource={stationInventory}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* CARD QUẢN LÝ TỒN KHO TẠI KHO (WAREHOUSE) */}
      <Card
        title="Quản lí tồn kho Pin trong Kho Bảo trì"
        extra={
          <Space>
            {/* NÚT LỌC PIN THEO LOẠI */}
            <Button
              onClick={handleFilterByStationType}
              type={filterBatteryTypeId ? "primary" : "default"} // Đổi màu nếu đang lọc
              icon={<SearchOutlined />}
              disabled={stationInventory.length === 0} // Vô hiệu hóa nếu không có pin ở trạm
            >
              {filterBatteryTypeId
                ? `Lọc theo: ${batteryTypesMap[filterBatteryTypeId]}`
                : "Lọc Pin theo Loại"}
            </Button>

            {/* NÚT BỎ LỌC (Chỉ hiện khi đang lọc) */}
            {filterBatteryTypeId && (
              <Button
                onClick={() => {
                  setFilterBatteryTypeId(null); // Đặt lại trạng thái lọc
                  fetchWarehouseInventory(null); // Tải lại toàn bộ
                }}
                icon={<RollbackOutlined />}
              >
                Bỏ Lọc
              </Button>
            )}
            {/* NÚT TẢI LẠI KHO BÌNH THƯỜNG */}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setFilterBatteryTypeId(null); // Đảm bảo bỏ lọc khi tải lại thủ công
                fetchWarehouseInventory(null);
              }}
            >
              Tải lại Pin Kho
            </Button>
          </Space>
        }
      >
        <h4>Pin sẵn sàng (AVAILABLE) và Pin đang bảo trì (MAINTENANCE):</h4>
        <Table
          columns={warehouseColumns}
          dataSource={warehouseInventory}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* MODAL CẬP NHẬT SOH */}
      <Modal
        title={
          currentBatteryToEdit
            ? `Cập nhật SOH cho Pin ID ${currentBatteryToEdit.id}`
            : "Cập nhật SOH"
        }
        open={isEditSOHModalVisible}
        onCancel={() => setIsEditSOHModalVisible(false)}
        footer={null} // Tự quản lý các nút bấm trong Form
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSOHSubmit}
          initialValues={{ newSOH: null }}
        >
          <p>
            Loại Pin:{" "}
            <Tag color="blue">
              {currentBatteryToEdit
                ? batteryTypesMap[currentBatteryToEdit.batteryTypeId]
                : "N/A"}
            </Tag>
          </p>

          <Form.Item
            name="newSOH"
            label="SOH mới (%)"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập SOH mới (0-100)!",
              },
              {
                type: "number",
                min: 0,
                max: 100,
                message: "SOH phải nằm trong khoảng 0 đến 100.",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              step={0.01}
              formatter={(value) => `${value}%`}
              parser={(value) => value.replace("%", "")}
              style={{ width: "100%" }}
              placeholder="Nhập SOH mới (ví dụ: 99.50)"
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading} // Sử dụng state loading nếu bạn muốn có hiệu ứng tải
              >
                Hoàn tất bảo trì & Cập nhật
              </Button>
              <Button onClick={() => setIsEditSOHModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL CHUYỂN PIN TỐT RA TRẠM (Dành cho chức năng nâng cao) */}
      {/* Đã tích hợp trực tiếp vào bảng Warehouse để Staff tiện thao tác */}
    </div>
  );
}
