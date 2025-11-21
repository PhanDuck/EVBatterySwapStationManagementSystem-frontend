import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Select,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Input,
} from "antd";
import {
  ReloadOutlined,
  SendOutlined,
  RollbackOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import handleApiError from "../../Utils/handleApiError";
import { getCurrentRole } from "../../config/auth";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;
const MAX_STATION_CAPACITY = 20;
const MAX_BATTERIES_ALLOWED = 19;

export default function InventoryPage() {
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [warehouseInventory, setWarehouseInventory] = useState([]);
  const [stationInventory, setStationInventory] = useState([]);
  const [batteryTypesMap, setBatteryTypesMap] = useState({});
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [filterBatteryTypeId, setFilterBatteryTypeId] = useState(null);
  const [isEditSOHModalVisible, setIsEditSOHModalVisible] = useState(false);
  const [isMoveToStationModalVisible, setIsMoveToStationModalVisible] =
    useState(false);
  const [currentBatteryToEdit, setCurrentBatteryToEdit] = useState(null);
  const [form] = Form.useForm();
  const [moveForm] = Form.useForm();
  const [showAllStationBatteries, setShowAllStationBatteries] = useState(false);
  const [quantityToMove, setQuantityToMove] = useState(1);

  const role = getCurrentRole();
  const upperRole = role ? role.toUpperCase() : null;
  const isAdmin = upperRole === "ADMIN";

  // Lấy thông tin trạm hiện tại (bao gồm count)
  const currentStationInfo = useMemo(() => {
    const station = stations.find((s) => s.id === selectedStationId);
    // Lấy số lượng pin thực tế đang có tại trạm (từ dữ liệu stationInventory đã tải)
    const currentBatteryCount = stationInventory.length;

    const baseInfo = station
      ? {
          id: station.id,
          name: station.name,
          capacity: MAX_STATION_CAPACITY, // Giả định Capacity luôn là 20
          currentCount: currentBatteryCount,
        }
      : {
          id: null,
          name: "chưa chọn",
          capacity: MAX_STATION_CAPACITY,
          currentCount: 0,
        };
    // Tính số lượng pin tối đa được phép có trong trạm (giới hạn mềm)
    const maxLimit = MAX_BATTERIES_ALLOWED;
    // Số lượng tối đa có thể chuyển vào (Giới hạn: MaxLimit - CurrentCount)
    const maxSlotsForMove = Math.max(0, maxLimit - currentBatteryCount);

    return {
      ...baseInfo,
      maxLimit: maxLimit,
      maxSlotsForMove: maxSlotsForMove,
    };
  }, [selectedStationId, stations, stationInventory]);

  const selectedStationName = currentStationInfo.name;

  // Loại pin hiện tại của trạm (Ưu tiên pin đã có ID Loại Pin)
  const currentStationBatteryType = useMemo(() => {
    // Tìm pin (Ưu tiên pin đã có ID Loại Pin)
    const batteryWithTypeId = stationInventory.find((b) => b.batteryTypeId);
    if (batteryWithTypeId) {
      return {
        id: batteryWithTypeId.batteryTypeId,
        name: batteryTypesMap[batteryWithTypeId.batteryTypeId],
      };
    }
    return null;
  }, [stationInventory, batteryTypesMap]);

  // Lấy số lượng pin AVAILABLE theo loại
  const getAvailableCount = useCallback(
    (typeId) => {
      if (!typeId) return 0;
      return warehouseInventory.filter(
        (b) =>
          b.batteryTypeId === typeId &&
          b.status === "AVAILABLE" &&
          parseFloat(b.stateOfHealth) > 90
      ).length;
    },
    [warehouseInventory]
  );

  // --- 1. FUNCTIONS TẢI DỮ LIỆU ---

  // Tải tồn kho chung trong Kho
  const fetchWarehouseInventory = useCallback(
    async (typeIdToFilter = null) => {
      setLoading(true);
      try {
        let res;
        let inventory = [];

        // --- Logic API ---
        if (!isAdmin) {
          // STAFF: Chỉ tải pin AVAILABLE và bắt buộc phải có typeIdToFilter
          if (!typeIdToFilter) {
            // Nếu là Staff VÀ không có typeId để lọc -> Không tải, trả về rỗng
            setWarehouseInventory([]);
            if (currentStationInfo.id) {
              // Chỉ show toast nếu đã chọn trạm
              showToast(
                "warning",
                "Staff cần có Pin tại Trạm để xác định loại pin kho cần tải."
              );
            }
            return;
          }
          // Staff tải pin AVAILABLE theo loại
          res = await api.get(
            `/station-inventory/available-by-type/${typeIdToFilter}`
          );
        } else {
          // ADMIN: Luôn tải TOÀN BỘ kho (AVAILABLE & MAINTENANCE)
          res = await api.get("/station-inventory");
        }

        // Xử lý response
        if (Array.isArray(res.data)) {
          inventory = res.data;
        } else if (res.data?.batteries && Array.isArray(res.data.batteries)) {
          inventory = res.data.batteries;
        }

        // --- Logic Lọc trên Client (Chỉ áp dụng cho ADMIN) ---
        let filteredInventory = inventory;
        if (isAdmin && typeIdToFilter) {
          // Admin áp dụng lọc theo loại pin trên dữ liệu toàn bộ đã tải
          filteredInventory = inventory.filter(
            (item) => item.batteryTypeId === typeIdToFilter
          );
        }

        setWarehouseInventory(filteredInventory.sort((a, b) => b.id - a.id)); // Sắp xếp ID giảm dần
      } catch (error) {
        showToast(
          "error",
          error.response?.data || "Tải tồn kho kho thất bại, vui lòng thử lại!"
        );
        setWarehouseInventory([]);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, currentStationInfo.id]
  );

  // Tải danh sách trạm Staff quản lý
  const fetchManagedStations = useCallback(async () => {
    const currentRole = getCurrentRole(); // Lấy lại role trong hàm callback
    const currentUpperRole = currentRole ? currentRole.toUpperCase() : null;

    // Nếu không tìm thấy vai trò, dừng lại (Thêm kiểm tra an toàn)
    if (!currentUpperRole) {
      showToast(
        "error",
        "Không xác định được quyền người dùng. Vui lòng thử đăng nhập lại."
      );
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
  }, [upperRole]);

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
      showToast(
        "error",
        error.response?.data || "Tải loại pin thất bại, vui lòng thử lại!"
      );
    }
  }, []);

  // Tải Pin cần bảo dưỡng tại trạm đã chọn
  const fetchStationInventory = useCallback(async (stationId) => {
    if (!stationId) {
      setStationInventory([]);
      return null;
    }
    setLoading(true);
    try {
      const res = await api.get(`/station/${stationId}/batteries`);
      // Xử lý response - có thể là mảng trực tiếp hoặc object có key batteries
      let inventory = Array.isArray(res.data)
        ? res.data
        : res.data?.batteries && Array.isArray(res.data.batteries)
        ? res.data.batteries
        : [];

      setStationInventory(inventory.sort((a, b) => b.id - a.id)); // Sắp xếp ID giảm dần
      const typeId =
        inventory.length > 0
          ? inventory.find((b) => b.batteryTypeId)?.batteryTypeId
          : null;
      return typeId;
    } catch (error) {
      console.error("Lỗi tải tồn kho trạm:", error);
      showToast(
        "error",
        error.response?.data || "Tải tồn kho trạm thất bại, vui lòng thử lại!"
      );
      setStationInventory([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect chạy lần đầu
  useEffect(() => {
    fetchManagedStations();
    fetchBatteryTypes();
  }, [fetchManagedStations, fetchBatteryTypes]);

  // Effect chạy khi trạm được chọn thay đổi
  useEffect(() => {
    setShowAllStationBatteries(false);
    if (selectedStationId) {
      const loadData = async () => {
        // 1. Tải pin trạm và lấy loại pin của trạm
        const stationTypeId = await fetchStationInventory(selectedStationId);

        // 2. Tải kho tổng
        if (stationTypeId) {
          if (!isAdmin) {
            setFilterBatteryTypeId(stationTypeId);
            fetchWarehouseInventory(stationTypeId);
          } else {
            setFilterBatteryTypeId(null);
            fetchWarehouseInventory(null);
          }
        } else {
          // Trạm không có pin
          setFilterBatteryTypeId(null);
          setWarehouseInventory([]); // Dọn kho nếu trạm trống pin
          if (isAdmin) {
            fetchWarehouseInventory(null);
          } else {
            // Staff không được xem kho nếu trạm chưa có pin
            showToast(
              "warning",
              "Trạm chưa có pin để xác định loại pin kho cần tải."
            );
          }
        }
      };
      loadData();
    } else {
      // Khi không có trạm nào được chọn
      setStationInventory([]);
      setWarehouseInventory([]);
      setFilterBatteryTypeId(null);
    }
  }, [
    selectedStationId,
    fetchStationInventory,
    fetchWarehouseInventory,
    isAdmin,
  ]);

  // --- 2. HÀM XỬ LÝ THAO TÁC MOVE VÀ LỌC ---

  // Xử lý Pin về Kho (Dùng chung cho cả pin MAINTENANCE và AVAILABLE)
  const handleMoveToWarehouse = async (record) => {
    if (!selectedStationId) return showToast("warning", "Vui lòng chọn trạm!");

    try {
      await api.post("/station-inventory/move-to-warehouse", null, {
        params: {
          batteryId: record.id,
          stationId: selectedStationId,
        },
      });
      showToast(
        "success",
        `✅ Pin ${record.id} đã được chuyển về kho bảo trì.`
      );

      // Cập nhật lại 2 bảng
      fetchStationInventory(selectedStationId);
      // Tải lại Pin Kho, Admin vẫn giữ logic không lọc (filter null) khi tải lại. Staff sẽ tự lọc trong fetchWarehouseInventory()
      fetchWarehouseInventory(isAdmin ? null : filterBatteryTypeId);
    } catch (error) {
      showToast(
        "error",
        error.response?.data ||
          "Chuyển pin về kho bảo trì thất bại, vui lòng thử lại!"
      );
    }
  };

  //Xử lý LỌC Pin trong Kho theo loại Pin của Trạm
  const handleFilterByStationType = () => {
    if (!selectedStationId) {
      return showToast("warning", "Vui lòng chọn trạm trước.");
    }

    const typeId = currentStationBatteryType?.id;

    if (!typeId) {
      return showToast(
        "warning",
        "Trạm chưa có pin để xác định loại pin cần lọc."
      );
    }

    // Cập nhật state và gọi hàm tải dữ liệu mới
    setFilterBatteryTypeId(typeId);
    fetchWarehouseInventory(typeId);
    showToast(
      "success",
      `Đã lọc Pin Kho theo loại: ${batteryTypesMap[typeId]}.`
    );
  };

  // Mở Modal Chuyển Pin Tốt RA TRẠM
  const openMoveToStationModal = () => {
    if (!selectedStationId)
      return showToast("warning", "Vui lòng chọn trạm trước.");

    if (!currentStationBatteryType) {
      return showToast(
        "warning",
        "Trạm chưa có pin để xác định loại pin cần chuyển."
      );
    }

    const availableCount = getAvailableCount(currentStationBatteryType.id);
    if (availableCount === 0) {
      return showToast(
        "warning",
        `Kho không có pin loại ${currentStationBatteryType.name} sẵn sàng (AVAILABLE) để chuyển ra trạm.`
      );
    }

    // Kiểm tra số lượng slot trống
    const maxSlotsForMove = currentStationInfo.maxSlotsForMove;
    if (maxSlotsForMove <= 0) {
      return showToast(
        "error",
        `Trạm đã đạt giới hạn pin cho phép (${currentStationInfo.currentCount}/${currentStationInfo.maxLimit} pin) để chuyển pin tốt vào. Vui lòng chuyển pin lỗi ra trước.`
      );
    }

    // Reset form và mở Modal
    moveForm.resetFields();
    moveForm.setFieldsValue({
      batteryTypeId: currentStationBatteryType.id,
      quantity: 1,
    });

    setQuantityToMove(1);
    setIsMoveToStationModalVisible(true);
  };

  // Xử lý Pin Tốt RA TRẠM
  const handleMoveToStationSubmit = async (values) => {
    if (!selectedStationId) return showToast("warning", "Vui lòng chọn trạm!");
    const { batteryTypeId, quantity } = values;

    // Kiểm tra lại số slot trống lần cuối
    const maxSlotsForMove = currentStationInfo.maxSlotsForMove;
    if (quantity > maxSlotsForMove) {
      showToast(
        "error",
        `Số lượng pin muốn chuyển (${quantity}) vượt quá số slot trống cho phép (${maxSlotsForMove} pin). Vui lòng điều chỉnh.`
      );
      return;
    }

    setLoading(true);
    let allAvailableBatteries = [];

    try {
      // 1. GỌI API MỚI để lấy danh sách pin AVAILABLE theo loại
      const res = await api.get(
        `/station-inventory/available-by-type/${batteryTypeId}`
      );

      // Kiểm tra cấu trúc response (như trong hình API: data.batteries)
      const rawBatteries =
        res.data?.batteries && Array.isArray(res.data.batteries)
          ? res.data.batteries
          : [];

      // 2. LỌC: Pin có status AVAILABLE VÀ SOH > 90%
      allAvailableBatteries = rawBatteries.filter(
        (b) => b.status === "AVAILABLE" && parseFloat(b.stateOfHealth) > 90
      );
    } catch (error) {
      setLoading(false);
      return showToast(
        "error",
        error.response?.data || "Lỗi khi tải danh sách pin tốt từ kho."
      );
    }

    if (allAvailableBatteries.length < quantity) {
      setLoading(false);
      showToast(
        "error",
        `Kho chỉ còn ${allAvailableBatteries.length} pin loại ${batteryTypesMap[batteryTypeId]} có SOH > 90% để chuyển. Vui lòng điều chỉnh số lượng.`
      );
      return;
    }

    const batteriesToMove = [];
    const availableBatteriesPool = [...allAvailableBatteries]; // Tạo bản sao để tránh thay đổi mảng gốc

    // 3. CHỌN NGẪU NHIÊN 'quantity' pin
    for (let i = 0; i < quantity; i++) {
      const randomIndex = Math.floor(
        Math.random() * availableBatteriesPool.length
      );
      const randomBattery = availableBatteriesPool[randomIndex];
      batteriesToMove.push(randomBattery);
      availableBatteriesPool.splice(randomIndex, 1); // Loại bỏ pin đã chọn khỏi pool
    }

    if (batteriesToMove.length === 0) {
      setLoading(false);
      showToast(
        "warning",
        "Không tìm thấy pin AVAILABLE có SOH > 90% để chuyển."
      );
      return;
    }

    let successCount = 0;
    let failedCount = 0;
    const typeName = batteryTypesMap[batteryTypeId];

    // 4. Lặp và gọi API cho từng pin
    for (const battery of batteriesToMove) {
      try {
        await api.post("/station-inventory/move-to-station", null, {
          params: {
            stationId: selectedStationId,
            batteryId: battery.id,
            batteryTypeId: batteryTypeId,
          },
        });
        successCount++;
      } catch (error) {
        failedCount++;
        console.error(
          `Lỗi chuyển pin ${battery.id}:`,
          error.response?.data || error.message
        );
      }
    }

    // 5. Xử lý kết quả
    if (successCount > 0) {
      showToast(
        "success",
        `✅ Đã chuyển thành công ${successCount} pin loại ${typeName} (ngẫu nhiên) ra trạm.`
      );
    } else {
      showToast(
        "error",
        `Chuyển pin ra trạm thất bại hoàn toàn (${failedCount} pin). Vui lòng kiểm tra log.`
      );
    }

    setIsMoveToStationModalVisible(false);
    // Cập nhật lại 2 bảng
    fetchStationInventory(selectedStationId);
    fetchWarehouseInventory(isAdmin ? null : filterBatteryTypeId);
    setLoading(false);
  };

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
      await api.patch(
        `/station-inventory/${record.id}/complete-maintenance`,
        null,
        {
          params: {
            newSOH: newSOH,
          },
        }
      );
      showToast(
        "success",
        `✅ Pin ${record.id} đã hoàn tất bảo trì, SOH cập nhật: ${newSOH}%.`
      );
      setIsEditSOHModalVisible(false); // Đóng modal
      // Refresh Kho sau khi cập nhật
      fetchWarehouseInventory(filterBatteryTypeId);
      fetchStationInventory(selectedStationId);
    } catch (error) {
      showToast(
        "error",
        error.response?.data || "Lỗi cập nhật SOH/Hoàn tất bảo trì."
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
      render: (capacity) => capacity,
    },
    {
      title: "Loại Pin",
      dataIndex: "batteryTypeId",
      key: "batteryTypeId",
      width: FIXED_COL_WIDTH.BATTERY_TYPE,
      render: (typeId) => batteryTypesMap[typeId],
    },
    {
      title: "Mức sạc (%)",
      dataIndex: "chargeLevel",
      key: "chargeLevel",
      width: FIXED_COL_WIDTH.CHARGE,
      render: (chargeLevel) => {
        const chargeValue = chargeLevel
          ? parseFloat(chargeLevel).toFixed(0)
          : "";

        if (chargeValue === "") return "";

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
        const sohValue = soh ? parseFloat(soh).toFixed(2) : "";
        return sohValue !== "" ? (
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
      render: (date) => (date ? new Date(date).toLocaleDateString() : ""), // Định dạng ngày cho an toàn
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: FIXED_COL_WIDTH.ACTIONS,
      render: (_, record) => (
        <Space>
          {record.status === "MAINTENANCE" && (
            <Tooltip title="Chuyển pin lỗi này về kho bảo trì">
              <Button
                type="primary"
                icon={<RollbackOutlined />}
                onClick={() => handleMoveToWarehouse(record)} // Move To Warehouse
                size="small"
              >
                Về Kho
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // HÀM SẮP XẾP TÙY CHỈNH CHO KHO (Theo ưu tiên SOH > 90%)
  const customWarehouseSort = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Định nghĩa hàm so sánh
    const compareFn = (a, b) => {
      // Hàm phụ trợ để xác định mức độ ưu tiên của Status
      const getPriority = (status) => {
        if (status === "AVAILABLE") return 1; // Cao nhất
        if (status === "MAINTENANCE") return 2; // Thấp hơn
        return 99; // Các trạng thái khác (nếu có)
      };

      const priorityA = getPriority(a.status);
      const priorityB = getPriority(b.status);

      const sohA = parseFloat(a.stateOfHealth);
      const sohB = parseFloat(b.stateOfHealth);

      // 1. So sánh theo Trạng thái (Status)
      if (priorityA !== priorityB) {
        // Pin có Priority thấp hơn (số nhỏ hơn) sẽ được xếp trước
        return priorityA - priorityB;
      }

      // 2. Nếu cùng Trạng thái, so sánh theo SOH (Giảm dần)
      if (sohA !== sohB) {
        // sohB - sohA sẽ xếp giảm dần (SOH cao hơn sẽ lên trước)
        return sohB - sohA;
      }

      // 3. Nếu SOH cũng bằng nhau, dùng ID để phá vỡ thế hoà (Giảm dần)
      return b.id - a.id;
    };

    // Tạo bản sao và sắp xếp
    return [...data].sort(compareFn);
  }, []);

  const warehouseDataSource = useMemo(() => {
    return customWarehouseSort(warehouseInventory);
  }, [warehouseInventory, customWarehouseSort]);

  // Cột cho Bảng Tồn Kho Pin trong Kho
  const warehouseColumns = [
    {
      title: "Pin ID",
      dataIndex: "id",
      key: "id",
      width: FIXED_COL_WIDTH.PIN_ID,
      sorter: (a, b) => a.id - b.id,
      //defaultSortOrder: "descend",
    },
    {
      title: "Dung tích pin",
      dataIndex: "capacity",
      key: "capacity",
      width: FIXED_COL_WIDTH.CAPACITY,
      render: (capacity) => capacity,
    },
    {
      title: "Loại Pin",
      dataIndex: "batteryTypeId",
      key: "batteryTypeId",
      width: FIXED_COL_WIDTH.BATTERY_TYPE,
      render: (typeId) => batteryTypesMap[typeId],
    },
    {
      title: "Mức sạc (%)",
      dataIndex: "chargeLevel",
      key: "chargeLevel",
      width: FIXED_COL_WIDTH.CHARGE,
      render: (chargeLevel) => {
        const chargeValue = chargeLevel
          ? parseFloat(chargeLevel).toFixed(0)
          : "";

        if (chargeValue === "") return "";

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
        const sohValue = soh ? parseFloat(soh).toFixed(2) : "";
        return sohValue !== "" ? (
          <Tag color={parseFloat(sohValue) >= 70 ? "green" : "orange"}>
            {sohValue}
          </Tag>
        ) : (
          ""
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
              >
                Cập nhật
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const stationDataSource = useMemo(() => {
    if (isAdmin && showAllStationBatteries) {
      return stationInventory; // Admin: Xem tất cả
    }
    return stationInventory.filter((b) => b.status === "MAINTENANCE"); // Staff: Chỉ xem MAINTENANCE
  }, [stationInventory, isAdmin, showAllStationBatteries]);

  return (
    <div style={{ padding: "24px" }}>
      {/* CARD QUẢN LÝ TỒN KHO TẠI TRẠM */}
      <Card
        title={
          selectedStationId
            ? `Quản lý tồn kho pin tại ${selectedStationName} (${currentStationInfo.currentCount}/${currentStationInfo.capacity}) pin`
            : `Quản lý tồn kho pin tại ${selectedStationName} (${currentStationInfo.currentCount}/${currentStationInfo.capacity}) pin`
        }
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
            {/* NÚT CHUYỂN ĐỔI XEM TẤT CẢ/CHỈ BẢO TRÌ (CHỈ ADMIN) */}
            {isAdmin && selectedStationId && (
              <Button
                icon={<EyeOutlined />}
                onClick={() => setShowAllStationBatteries((prev) => !prev)}
                type={showAllStationBatteries ? "primary" : "default"}
              >
                {showAllStationBatteries
                  ? "Chỉ xem pin bảo trì"
                  : "Xem tất cả pin tại trạm"}
              </Button>
            )}
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
        <h4>
          {isAdmin && showAllStationBatteries
            ? `Danh sách TẤT CẢ pin tại ${selectedStationName}`
            : `Danh sách pin cần bảo dưỡng hoặc lỗi tại ${selectedStationName}`}
        </h4>
        <Table
          columns={stationColumns}
          dataSource={stationDataSource}
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
            {/* NÚT MỞ MODAL THÊM PIN RA TRẠM */}
            <Button
              icon={<SendOutlined />}
              onClick={openMoveToStationModal}
              type="default" // Màu default để phân biệt với nút lọc
              disabled={
                !selectedStationId ||
                !currentStationBatteryType ||
                currentStationInfo.currentCount >=
                  currentStationInfo.capacity || // Đầy pin
                getAvailableCount(currentStationBatteryType?.id) === 0
              }
            >
              Chuyển pin ra trạm
            </Button>
            {isAdmin && (
              <Space>
                {/* NÚT LỌC PIN THEO LOẠI */}
                <Button
                  onClick={handleFilterByStationType}
                  type={filterBatteryTypeId ? "primary" : "default"} // Đổi màu nếu đang lọc
                  icon={<SearchOutlined />}
                  disabled={!selectedStationId} // Vô hiệu hóa nếu không có pin ở trạm
                >
                  {filterBatteryTypeId &&
                  filterBatteryTypeId === currentStationBatteryType?.id
                    ? `Đang lọc: ${batteryTypesMap[filterBatteryTypeId]}`
                    : "Lọc theo loại pin"}
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
              </Space>
            )}
            {/* NÚT TẢI LẠI KHO BÌNH THƯỜNG */}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchWarehouseInventory(isAdmin ? null : filterBatteryTypeId);
              }}
            >
              Tải lại pin kho
            </Button>
          </Space>
        }
      >
        <h4>
          {isAdmin
            ? "Danh sách pin trong kho:"
            : "Danh sách pin sẵn sàng (AVAILABLE) trong kho:"}
        </h4>
        <Table
          columns={warehouseColumns}
          dataSource={warehouseDataSource}
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
                : ""}
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

      {/* MODAL CHUYỂN PIN RA TRẠM (MỚI) */}
      <Modal
        title={`Chuyển pin AVAILABLE ra ${selectedStationName}`}
        open={isMoveToStationModalVisible}
        onCancel={() => setIsMoveToStationModalVisible(false)}
        footer={null}
      >
        <Form
          form={moveForm}
          layout="vertical"
          onFinish={handleMoveToStationSubmit}
          initialValues={{ quantity: 1 }}
          onValuesChange={(_, allValues) => {
            if (
              allValues.quantity !== undefined &&
              allValues.quantity !== null
            ) {
              setQuantityToMove(allValues.quantity);
            }
          }}
        >
          <Form.Item name="batteryTypeId" label="Loại Pin">
            {/* Hiển thị loại pin dưới dạng Text/Tag, không cho phép chọn */}
            <Tag color="blue" style={{ padding: "5px 10px", fontSize: "14px" }}>
              {currentStationBatteryType?.name} (Kho còn:{" "}
              {getAvailableCount(currentStationBatteryType?.id)} pin)
            </Tag>
            {/* Dùng Input để giữ giá trị trong Form nhưng bị ẩn */}
            <Input type="hidden" />
          </Form.Item>
          <p>
            Trạm còn trống:{" "}
            <Tag color="green">{currentStationInfo.maxSlotsForMove}</Tag> pin
          </p>

          <Form.Item
            name="quantity"
            label="Số lượng Pin cần chuyển"
            dependencies={["batteryTypeId"]}
            rules={[
              { required: true, message: "Vui lòng nhập số lượng!" },
              () => ({
                validator(_, value) {
                  const typeId = currentStationBatteryType?.id;
                  if (!typeId) {
                    return Promise.reject(
                      new Error("Không xác định được loại pin của trạm!")
                    );
                  }
                  const maxInWarehouse = getAvailableCount(typeId);
                  const maxAllowedToMove =
                    currentStationInfo.capacity -
                    currentStationInfo.currentCount;
                  const overallMax = Math.min(maxInWarehouse, maxAllowedToMove);
                  if (value === null || value === undefined) {
                    return Promise.reject(new Error("Vui lòng nhập số lượng!"));
                  }

                  const numValue = Number(value);
                  if (!Number.isInteger(numValue) || numValue < 1) {
                    return Promise.reject(
                      new Error("Số lượng phải là số nguyên dương.")
                    );
                  }

                  if (numValue > overallMax) {
                    return Promise.reject(
                      new Error(`Số lượng tối đa là ${overallMax} pin!`)
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              min={1}
              max={Math.min(
                getAvailableCount(currentStationBatteryType?.id),
                currentStationInfo.maxSlotsForMove
              )}
              style={{ width: "100%" }}
              placeholder={`Nhập số lượng pin (Tối đa: ${Math.min(
                getAvailableCount(currentStationBatteryType?.id),
                currentStationInfo.maxSlotsForMove
              )})`}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
                disabled={
                  !currentStationBatteryType?.id || // Không có loại pin của trạm
                  currentStationInfo.currentCount >=
                    currentStationInfo.maxLimit ||
                  moveForm.getFieldsError().some((err) => err.errors.length > 0) // Lỗi form
                }
              >
                Xác nhận chuyển ra ({quantityToMove} pin)
              </Button>
              <Button onClick={() => setIsMoveToStationModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
