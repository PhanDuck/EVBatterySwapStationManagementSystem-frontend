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
import handleApiError from "../../Utils/handleApiError";
import { getCurrentRole } from "../../config/auth";

const { Option } = Select;

export default function InventoryPage() {
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [warehouseInventory, setWarehouseInventory] = useState([]);
  const [stationInventory, setStationInventory] = useState([]);
  const [batteryTypesMap, setBatteryTypesMap] = useState({});
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [filterBatteryTypeId, setFilterBatteryTypeId] = useState(null);
  const [isEditSOHModalVisible, setIsEditSOHModalVisible] = useState(false);
  const [currentBatteryToEdit, setCurrentBatteryToEdit] = useState(null);
  const [form] = Form.useForm();  
  const role = getCurrentRole();
  const upperRole = role ? role.toUpperCase() : null;
  const isAdmin = upperRole === "ADMIN";

  // --- 1. FUNCTIONS TẢI DỮ LIỆU ---

  // Tải danh sách trạm Staff quản lý
  const fetchManagedStations = useCallback(async () => {
    
    // 💡 KHẮC PHỤC LỖI: Lấy vai trò mới nhất và chuẩn hóa từ auth.js
    const currentRole = getCurrentRole(); // Lấy lại role trong hàm callback
        const currentUpperRole = currentRole ? currentRole.toUpperCase() : null;
    
    // Nếu không tìm thấy vai trò, dừng lại (Thêm kiểm tra an toàn)
    if (!upperRole) {
      message.error("Không xác định được quyền người dùng. Vui lòng thử đăng nhập lại.");
      setStations([]);
      return;
    }

    try {
      let res;
      let isRoleAdmin = currentUpperRole === "ADMIN";

      // Logic: Admin lấy tất cả các trạm, Staff lấy trạm được gán
      if (isRoleAdmin) {
        res = await api.get("/station");
      } else {
        res = await api.get("/staff-station-assignment/my-stations");
      }

      const data = Array.isArray(res.data) ? res.data : [];
      setStations(data);

      // Tự động chọn trạm đầu tiên nếu có
      if (data.length > 0) {
        setSelectedStationId(data[0].id);
      }
    } catch (error) {
      handleApiError(
        error,
        upperRole === "ADMIN"
          ? "Tải danh sách tất cả trạm!"
          : "Tải danh sách trạm quản lý!"
      );
      console.error(error);
      setStations([]);
    }
  }, []);

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
    } catch (error) {
      handleApiError(error, "Tải loại pin!");
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
      // Xử lý response - có thể là mảng trực tiếp hoặc object có key batteries
      let inventory = [];
      if (Array.isArray(res.data)) {
        inventory = res.data;
      } else if (res.data?.batteries && Array.isArray(res.data.batteries)) {
        inventory = res.data.batteries;
      }

      setStationInventory(inventory.sort((a, b) => b.id - a.id)); // Sắp xếp ID giảm dần
    } catch (error) {
      handleApiError(error, "Tải tồn kho trạm!");
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

      // Xử lý response - có thể là mảng trực tiếp hoặc object có key batteries
      let inventory = [];
      if (Array.isArray(res.data)) {
        inventory = res.data;
      } else if (res.data?.batteries && Array.isArray(res.data.batteries)) {
        inventory = res.data.batteries;
      }

      setWarehouseInventory(inventory.sort((a, b) => b.id - a.id)); // Sắp xếp ID giảm dần
    } catch (error) {
      handleApiError(error, "Tải tồn kho kho!");
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
      handleApiError(error, "Chuyển pin về kho bảo trì.");
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
    } catch (error) {
      handleApiError(error, "Chuyển pin ra trạm.");
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
    if (!isAdmin) return; // Đảm bảo chỉ Admin mới có thể mở

    setCurrentBatteryToEdit(record);
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
      handleApiError(error, "Lỗi cập nhật SOH/Hoàn tất bảo trì.");
      console.error(
        "Lỗi API Cập nhật SOH:",
        error.response?.data || error.message
      );
    }
  };

  // --- 3. ĐỊNH NGHĨA CỘT CHO BẢNG ---

  // Độ rộng cố định cho các cột (giúp căn thẳng hàng giữa 2 bảng)
  const FIXED_COL_WIDTH = {
    PIN_ID: 100,
    CAPACITY: 120,
    BATTERY_TYPE: 200,
    SOH: 120,
    CHARGE: 120,
    STATUS: 120,
    DATE: 150,
    ACTIONS: 150,
  };

  // Cột cho Bảng Pin Cần Bảo Dưỡng tại Trạm
  const stationColumns = [
    {
      title: "Pin ID",
      dataIndex: "id",
      key: "id",
      width: FIXED_COL_WIDTH.PIN_ID,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: "descend",
    },
    {
      title: "Dung tích pin",
      dataIndex: "capacity",
      key: "capacity",
      width: FIXED_COL_WIDTH.CAPACITY,
      render: (capacity) => capacity || "—",
    },
    {
      title: "Loại Pin",
      dataIndex: "batteryTypeId",
      key: "batteryTypeId",
      width: FIXED_COL_WIDTH.BATTERY_TYPE,
      render: (typeId) => batteryTypesMap[typeId] || "—",
    },
    {
      title: "Mức sạc (%)",
      dataIndex: "chargeLevel",
      key: "chargeLevel",
      width: FIXED_COL_WIDTH.CHARGE,
      render: (chargeLevel) => {
        const chargeValue = chargeLevel
          ? parseFloat(chargeLevel).toFixed(0)
          : "—";

        if (chargeValue === "—") return "—";

        let color;
        const numericCharge = parseFloat(chargeValue);

        if (numericCharge >= 70) {
          color = "green";
        } else {
          color = "orange";
        }

        return <Tag color={color}>{chargeValue}</Tag>;
      },
    },
    {
      title: "Tình trạng pin (%)",
      dataIndex: "stateOfHealth",
      key: "stateOfHealth",
      width: FIXED_COL_WIDTH.SOH,
      // ĐIỀU CHỈNH: Format SOH (Làm tròn 2 chữ số thập phân)
      render: (soh) => {
        const sohValue = soh ? parseFloat(soh).toFixed(2) : "—";
        return sohValue !== "—" ? (
          <Tag color={parseFloat(sohValue) >= 70 ? "green" : "orange"}>
            {sohValue}
          </Tag>
        ) : (
          "N—"
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: FIXED_COL_WIDTH.STATUS,
      render: (status) => (
        <Tag color={status === "AVAILABLE" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Bảo trì lần cuối",
      dataIndex: "lastMaintenanceDate",
      key: "lastMaintenanceDate",
      width: FIXED_COL_WIDTH.DATE,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "—"), // Định dạng ngày cho an toàn
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: FIXED_COL_WIDTH.ACTIONS,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chuyển pin lỗi này về kho bảo trì">
            <Button
              type="primary"
              icon={<RollbackOutlined />}
              onClick={() => handleMoveToWarehouse(record)} // Move To Warehouse
              //danger
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
    {
      title: "Pin ID",
      dataIndex: "id",
      key: "id",
      width: FIXED_COL_WIDTH.PIN_ID,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: "descend",
    },
    {
      title: "Dung tích pin",
      dataIndex: "capacity",
      key: "capacity",
      width: FIXED_COL_WIDTH.CAPACITY,
      render: (capacity) => capacity || "—",
    },
    {
      title: "Loại Pin",
      dataIndex: "batteryTypeId",
      key: "batteryTypeId",
      width: FIXED_COL_WIDTH.BATTERY_TYPE,
      render: (typeId) => batteryTypesMap[typeId] || "—",
    },
    {
      title: "Mức sạc (%)",
      dataIndex: "chargeLevel",
      key: "chargeLevel",
      width: FIXED_COL_WIDTH.CHARGE,
      render: (chargeLevel) => {
        const chargeValue = chargeLevel
          ? parseFloat(chargeLevel).toFixed(0)
          : "—";

        if (chargeValue === "—") return "—";

        let color;
        const numericCharge = parseFloat(chargeValue);

        if (numericCharge >= 70) {
          color = "green";
        } else {
          color = "orange";
        }

        return <Tag color={color}>{chargeValue}</Tag>;
      },
    },
    {
      title: "Tình trạng pin (%)",
      dataIndex: "stateOfHealth",
      key: "stateOfHealth",
      width: FIXED_COL_WIDTH.SOH,
      // ĐIỀU CHỈNH: Format SOH (Làm tròn 2 chữ số thập phân)
      render: (soh) => {
        const sohValue = soh ? parseFloat(soh).toFixed(2) : "—";
        return sohValue !== "—" ? (
          <Tag color={parseFloat(sohValue) >= 70 ? "green" : "orange"}>
            {sohValue}
          </Tag>
        ) : (
          "—"
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: FIXED_COL_WIDTH.STATUS,
      render: (status) => (
        <Tag color={status === "AVAILABLE" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "", // Để trống tiêu đề
      dataIndex: "placeholder",
      key: "placeholder",
      width: FIXED_COL_WIDTH.DATE, // Sử dụng cùng độ rộng
      render: () => null, // Luôn trả về rỗng
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: FIXED_COL_WIDTH.ACTIONS,
      render: (_, record) => (
        <Space>
          {/* Nút "Sửa SOH" (Chỉ hiện cho ADMIN và pin MAINTENANCE) */}
          {isAdmin && record.status === "MAINTENANCE" && (
            <Tooltip title="Hoàn tất bảo trì và cập nhật SOH">
              <Button
                onClick={() => handleEditSOH(record)}
                type="primary"
                icon={<EditOutlined />}
                size="small"
                //setOpen={true}
              >
                Cập nhật
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
                Ra trạm
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
        title="Quản lý tồn kho pin tại trạm"
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
              Tải lại pin tại trạm
            </Button>
          </Space>
        }
        style={{ marginBottom: "20px" }}
      >
        <h4>Danh sách pin cần bảo dưỡng hoặc lỗi tại trạm đang chọn:</h4>
        <Table
          columns={stationColumns}
          dataSource={stationInventory}
          loading={loading}
          rowKey="id"
          pagination={{
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trên ${total} pin`,
          }}
        />
      </Card>

      {/* CARD QUẢN LÝ TỒN KHO TẠI KHO (WAREHOUSE) */}
      <Card
        title="Quản lý tồn kho pin trong kho bảo trì"
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
                : "Lọc pin theo loại"}
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
                Bỏ lọc
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
              Tải lại pin kho
            </Button>
          </Space>
        }
      >
        <h4>
          Danh sách pin sẵn sàng (AVAILABLE) và pin đang bảo trì (MAINTENANCE):
        </h4>
        <Table
          columns={warehouseColumns}
          dataSource={warehouseInventory}
          loading={loading}
          rowKey="id"
          pagination={{
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trên ${total} pin`,
          }}
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
                : "—"}
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
                Hoàn tất bảo trì & cập nhật
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