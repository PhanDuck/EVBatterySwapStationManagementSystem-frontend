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
  Steps,
  Alert,
} from "antd";
import {
  ReloadOutlined,
  SendOutlined,
  RollbackOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import handleApiError from "../../Utils/handleApiError";
import { getCurrentRole } from "../../config/auth";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;
const MAX_STATION_CAPACITY = 20;
const MAX_BATTERIES_ALLOWED = 19;

// --- COMPONENT MODAL CHUYỂN PIN (LOGIC MỚI: CHỌN THỦ CÔNG) ---
const MoveToStationModal = ({
  isVisible,
  onCancel,
  onSuccess,
  station,
  batteryType,
  warehouseCount,
  maxSlotsAvailable,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Danh sách tất cả pin đạt chuẩn trong kho (để hiển thị cho user chọn)
  const [availablePool, setAvailablePool] = useState([]); 
  // Danh sách ID các pin user đã tích chọn
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); 
  
  // Lưu số lượng đã nhập ở bước 1 để đối chiếu ở bước 2
  const [confirmedQuantity, setConfirmedQuantity] = useState(0);

  const [form] = Form.useForm();
  // Đã xóa dòng quantityRequested bị thừa

  // Reset state khi mở modal
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0);
      setAvailablePool([]);
      setSelectedRowKeys([]);
      setConfirmedQuantity(0);
      form.resetFields();
      form.setFieldsValue({ quantity: 1 });
    }
  }, [isVisible, form]);

  // BƯỚC 1: TẢI DANH SÁCH PIN ĐẠT CHUẨN & CHUYỂN BƯỚC
  const handleFetchAndNext = async (values) => {
    const { quantity } = values;
    setLoading(true);
    try {
      const res = await api.get(
        `/station-inventory/available-by-type/${batteryType.id}`
      );
      // API trả về { total: 12, batteries: [...] } hoặc mảng
      const rawBatteries =
        res.data?.batteries || (Array.isArray(res.data) ? res.data : []);
      
      // Lọc Pin SOH > 90%
      const pool = rawBatteries.filter(
        (b) => b.status === "AVAILABLE" && parseFloat(b.stateOfHealth) > 90
      );

      if (pool.length < quantity) {
        showToast(
          "error",
          `Không đủ pin đạt chuẩn (SOH > 90%). Kho chỉ còn ${pool.length} pin.`
        );
        setLoading(false);
        return;
      }

      // Lưu danh sách vào state để qua bước 2 hiển thị
      setAvailablePool(pool);
      setConfirmedQuantity(quantity); // Lưu lại số lượng cần chọn
      setSelectedRowKeys([]); // Reset lựa chọn cũ
      setCurrentStep(1);
    } catch (error) {
      showToast(
        "error",
        error?.response?.data || "Không thể tải pin trong kho"
      );
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: GỌI API CHUYỂN CÁC PIN ĐÃ CHỌN
  const handleConfirmMove = async () => {
    if (selectedRowKeys.length === 0) return;
    
    setLoading(true);
    let successCount = 0;

    // Lặp qua danh sách ID đã chọn
    for (const batteryId of selectedRowKeys) {
      try {
        await api.post("/station-inventory/move-to-station", null, {
          params: {
            stationId: station.id,
            batteryId: batteryId,
            batteryTypeId: batteryType.id,
          },
        });
        successCount++;
      } catch (error) {
        console.error(`Lỗi chuyển pin ${batteryId}`, error);
      }
    }

    setLoading(false);
    if (successCount > 0) {
      showToast(
        "success",
        `Đã chuyển thành công ${successCount} pin ra trạm ${station.name}.`
      );
      onSuccess();
      onCancel();
    } else {
      showToast("error", "Chuyển pin thất bại. Vui lòng thử lại.");
    }
  };

  // Cấu hình bảng chọn pin
  const selectionColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (t) => <b>#{t}</b>,
    },
    { title: "Model", dataIndex: "model", key: "model" },
    {
      title: "SOH",
      dataIndex: "stateOfHealth",
      key: "soh",
      render: (v) => <Tag color="green">{parseFloat(v).toFixed(2)}%</Tag>,
    },
    {
      title: "Mức sạc",
      dataIndex: "chargeLevel",
      key: "charge",
      render: (v) => <Tag color={v > 80 ? "green" : "orange"}>{v}%</Tag>,
    },
  ];

  // Cấu hình rowSelection (Checkbox)
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      // Chỉ cho phép chọn tối đa bằng số lượng đã nhập ở bước 1
      if (newSelectedRowKeys.length > confirmedQuantity) {
        return; // Chặn không cho chọn thêm
      }
      setSelectedRowKeys(newSelectedRowKeys);
    },
    // Disable các ô còn lại khi đã chọn đủ số lượng
    getCheckboxProps: (record) => ({
      disabled: 
        selectedRowKeys.length >= confirmedQuantity && 
        !selectedRowKeys.includes(record.id),
    }),
  };

  return (
    <Modal
      title={`Chuyển pin ra trạm: ${station?.name}`}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={800}
      maskClosable={false}
    >
      <Steps
        current={currentStep}
        items={[
          { title: "Nhập số lượng", icon: <SendOutlined /> },
          { title: "Chọn pin thủ công", icon: <CheckCircleOutlined /> },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* --- NỘI DUNG BƯỚC 1: NHẬP SỐ LƯỢNG --- */}
      {currentStep === 0 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFetchAndNext}
          initialValues={{ quantity: 1 }}
        >
          <Alert
            message="Thông tin kho & Trạm"
            description={
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Loại pin: <b>{batteryType?.name}</b></li>
                <li>Kho còn (SOH {">"} 90%): <b>{warehouseCount}</b> pin</li>
                <li>Trạm còn trống: <b>{maxSlotsAvailable}</b> chỗ</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="quantity"
            label="Số lượng pin cần chuyển"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng!" },
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const num = Number(value);
                  
                  // Validate chặn cứng, không tự sửa số
                  if (num <= 0) {
                    return Promise.reject(new Error("Số lượng phải lớn hơn 0!"));
                  }
                  if (num > maxSlotsAvailable) {
                    return Promise.reject(
                      new Error(`Vượt quá sức chứa của trạm! (Trống: ${maxSlotsAvailable})`)
                    );
                  }
                  if (num > warehouseCount) {
                     return Promise.reject(
                      new Error(`Vượt quá số lượng trong kho! (Kho có: ${warehouseCount})`)
                    );
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              // Bỏ max ở đây để cho phép nhập thoải mái và hiện lỗi đỏ
              placeholder="Nhập số lượng..."
            />
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={onCancel}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<ArrowRightOutlined />}
              >
                Tiếp tục chọn Pin
              </Button>
            </Space>
          </div>
        </Form>
      )}

      {/* --- NỘI DUNG BƯỚC 2: CHỌN THỦ CÔNG --- */}
      {currentStep === 1 && (
        <div>
          <Alert 
            message={`Vui lòng chọn đủ ${confirmedQuantity} pin từ danh sách dưới đây.`}
            description={`Đã chọn: ${selectedRowKeys.length} / ${confirmedQuantity}`}
            type={selectedRowKeys.length === confirmedQuantity ? "success" : "warning"}
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Table
            dataSource={availablePool}
            columns={selectionColumns}
            rowSelection={rowSelection} // Bật tính năng chọn dòng
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ y: 300 }}
            style={{ border: "1px solid #f0f0f0", borderRadius: 8 }}
          />
          
          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => setCurrentStep(0)}
                disabled={loading}
                icon={<ArrowLeftOutlined />}
              >
                Quay lại
              </Button>
              <Button
                type="primary"
                onClick={handleConfirmMove}
                loading={loading}
                icon={<SendOutlined />}
                // Chỉ cho phép bấm khi chọn đủ số lượng
                disabled={selectedRowKeys.length !== confirmedQuantity}
              >
                Xác nhận chuyển ({selectedRowKeys.length}) pin
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
};

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
  const [showAllStationBatteries, setShowAllStationBatteries] = useState(false);

  const role = getCurrentRole();
  const upperRole = role ? role.toUpperCase() : null;
  const isAdmin = upperRole === "ADMIN";

  // Lấy thông tin trạm hiện tại (bao gồm count)
  const currentStationInfo = useMemo(() => {
    const station = stations.find((s) => s.id === selectedStationId);
    const currentBatteryCount = stationInventory.length;

    const baseInfo = station
      ? {
          id: station.id,
          name: station.name,
          capacity: MAX_STATION_CAPACITY,
          currentCount: currentBatteryCount,
        }
      : {
          id: null,
          name: "chưa chọn",
          capacity: MAX_STATION_CAPACITY,
          currentCount: 0,
        };
    
    const maxLimit = MAX_BATTERIES_ALLOWED;
    const maxSlotsForMove = Math.max(0, maxLimit - currentBatteryCount);

    return {
      ...baseInfo,
      maxLimit: maxLimit,
      maxSlotsForMove: maxSlotsForMove,
    };
  }, [selectedStationId, stations, stationInventory]);

  const selectedStationName = currentStationInfo.name;

  // Loại pin hiện tại của trạm
  const currentStationBatteryType = useMemo(() => {
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

  const fetchWarehouseInventory = useCallback(
    async (typeIdToFilter = null) => {
      setLoading(true);
      try {
        let res;
        let inventory = [];

        // --- Logic API ---
        if (!isAdmin) {
          if (!typeIdToFilter) {
            setWarehouseInventory([]);
            if (currentStationInfo.id) {
              showToast(
                "warning",
                "Staff cần có Pin tại Trạm để xác định loại pin kho cần tải."
              );
            }
            return;
          }
          res = await api.get(
            `/station-inventory/available-by-type/${typeIdToFilter}`
          );
        } else {
          res = await api.get("/station-inventory");
        }

        if (Array.isArray(res.data)) {
          inventory = res.data;
        } else if (res.data?.batteries && Array.isArray(res.data.batteries)) {
          inventory = res.data.batteries;
        }

        let filteredInventory = inventory;
        if (isAdmin && typeIdToFilter) {
          filteredInventory = inventory.filter(
            (item) => item.batteryTypeId === typeIdToFilter
          );
        }

        setWarehouseInventory(filteredInventory.sort((a, b) => b.id - a.id));
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

  // Tải danh sách trạm
  const fetchManagedStations = useCallback(async () => {
    const currentRole = getCurrentRole();
    const currentUpperRole = currentRole ? currentRole.toUpperCase() : null;

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

      if (isRoleAdmin) {
        res = await api.get("/station");
      } else {
        res = await api.get("/staff-station-assignment/my-stations");
      }

      const data = Array.isArray(res.data) ? res.data : [];
      setStations(data);

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
      setStations([]);
    }
  }, [upperRole]);

  const fetchBatteryTypes = useCallback(async () => {
    try {
      const res = await api.get("/battery-type");
      const map = {};
      (Array.isArray(res.data) ? res.data : []).forEach((type) => {
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

  const fetchStationInventory = useCallback(async (stationId) => {
    if (!stationId) {
      setStationInventory([]);
      return null;
    }
    setLoading(true);
    try {
      const res = await api.get(`/station/${stationId}/batteries`);
      let inventory = Array.isArray(res.data)
        ? res.data
        : res.data?.batteries && Array.isArray(res.data.batteries)
        ? res.data.batteries
        : [];

      setStationInventory(inventory.sort((a, b) => b.id - a.id));
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

  useEffect(() => {
    fetchManagedStations();
    fetchBatteryTypes();
  }, [fetchManagedStations, fetchBatteryTypes]);

  useEffect(() => {
    setShowAllStationBatteries(false);
    if (selectedStationId) {
      const loadData = async () => {
        const stationTypeId = await fetchStationInventory(selectedStationId);

        if (stationTypeId) {
          if (!isAdmin) {
            setFilterBatteryTypeId(stationTypeId);
            fetchWarehouseInventory(stationTypeId);
          } else {
            setFilterBatteryTypeId(null);
            fetchWarehouseInventory(null);
          }
        } else {
          setFilterBatteryTypeId(null);
          setWarehouseInventory([]);
          if (isAdmin) {
            fetchWarehouseInventory(null);
          } else {
            showToast(
              "warning",
              "Trạm chưa có pin để xác định loại pin kho cần tải."
            );
          }
        }
      };
      loadData();
    } else {
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

      fetchStationInventory(selectedStationId);
      fetchWarehouseInventory(isAdmin ? null : filterBatteryTypeId);
    } catch (error) {
      showToast(
        "error",
        error.response?.data ||
          "Chuyển pin về kho bảo trì thất bại, vui lòng thử lại!"
      );
    }
  };

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

    setFilterBatteryTypeId(typeId);
    fetchWarehouseInventory(typeId);
    showToast(
      "success",
      `Đã lọc Pin Kho theo loại: ${batteryTypesMap[typeId]}.`
    );
  };

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

    const maxSlotsForMove = currentStationInfo.maxSlotsForMove;
    if (maxSlotsForMove <= 0) {
      return showToast(
        "error",
        `Trạm đã đạt giới hạn pin cho phép (${currentStationInfo.currentCount}/${currentStationInfo.maxLimit} pin) để chuyển pin tốt vào. Vui lòng chuyển pin lỗi ra trước.`
      );
    }

    setIsMoveToStationModalVisible(true);
  };

  const handleMoveSuccess = useCallback(() => {
    fetchStationInventory(selectedStationId);
    fetchWarehouseInventory(isAdmin ? null : filterBatteryTypeId);
  }, [
    selectedStationId,
    fetchStationInventory,
    fetchWarehouseInventory,
    isAdmin,
    filterBatteryTypeId,
  ]);

  const handleEditSOH = (record) => {
    if (!isAdmin) return;

    setCurrentBatteryToEdit(record);
    form.resetFields();
    form.setFieldsValue({
      newSOH: record.stateOfHealth ? parseFloat(record.stateOfHealth) : null,
    });
    setIsEditSOHModalVisible(true);
  };

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
      setIsEditSOHModalVisible(false);
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
      render: (date) => (date ? new Date(date).toLocaleDateString() : ""),
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
                onClick={() => handleMoveToWarehouse(record)}
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

  const customWarehouseSort = useCallback((data) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const compareFn = (a, b) => {
      const getPriority = (status) => {
        if (status === "AVAILABLE") return 1;
        if (status === "MAINTENANCE") return 2;
        return 99;
      };
      const priorityA = getPriority(a.status);
      const priorityB = getPriority(b.status);
      const sohA = parseFloat(a.stateOfHealth);
      const sohB = parseFloat(b.stateOfHealth);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      if (sohA !== sohB) {
        return sohB - sohA;
      }
      return b.id - a.id;
    };
    return [...data].sort(compareFn);
  }, []);

  const warehouseDataSource = useMemo(() => {
    return customWarehouseSort(warehouseInventory);
  }, [warehouseInventory, customWarehouseSort]);

  const warehouseColumns = [
    {
      title: "Pin ID",
      dataIndex: "id",
      key: "id",
      width: FIXED_COL_WIDTH.PIN_ID,
      sorter: (a, b) => a.id - b.id,
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
      title: "",
      dataIndex: "placeholder",
      key: "placeholder",
      width: FIXED_COL_WIDTH.DATE,
      render: () => null,
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: FIXED_COL_WIDTH.ACTIONS,
      render: (_, record) => (
        <Space>
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

      <Card
        title="Quản lý tồn kho pin trong kho bảo trì"
        extra={
          <Space>
            <Button
              icon={<SendOutlined />}
              onClick={openMoveToStationModal}
              type="default"
              disabled={
                !selectedStationId ||
                !currentStationBatteryType ||
                currentStationInfo.currentCount >=
                  currentStationInfo.capacity ||
                getAvailableCount(currentStationBatteryType?.id) === 0
              }
            >
              Chuyển pin ra trạm
            </Button>
            {isAdmin && (
              <Space>
                <Button
                  onClick={handleFilterByStationType}
                  type={filterBatteryTypeId ? "primary" : "default"}
                  icon={<SearchOutlined />}
                  disabled={!selectedStationId}
                >
                  {filterBatteryTypeId &&
                  filterBatteryTypeId === currentStationBatteryType?.id
                    ? `Đang lọc: ${batteryTypesMap[filterBatteryTypeId]}`
                    : "Lọc theo loại pin"}
                </Button>

                {filterBatteryTypeId && (
                  <Button
                    onClick={() => {
                      setFilterBatteryTypeId(null);
                      fetchWarehouseInventory(null);
                    }}
                    icon={<RollbackOutlined />}
                  >
                    Bỏ lọc
                  </Button>
                )}
              </Space>
            )}
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

      <Modal
        title={
          currentBatteryToEdit
            ? `Cập nhật SOH cho Pin ID ${currentBatteryToEdit.id}`
            : "Cập nhật SOH"
        }
        open={isEditSOHModalVisible}
        onCancel={() => setIsEditSOHModalVisible(false)}
        footer={null}
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
              <Button type="primary" htmlType="submit" loading={loading}>
                Hoàn tất bảo trì & cập nhật
              </Button>
              <Button onClick={() => setIsEditSOHModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* COMPONENT MỚI: QUY TRÌNH CHUYỂN PIN 2 BƯỚC */}
      <MoveToStationModal
        isVisible={isMoveToStationModalVisible}
        onCancel={() => setIsMoveToStationModalVisible(false)}
        onSuccess={handleMoveSuccess}
        station={currentStationInfo}
        batteryType={currentStationBatteryType}
        warehouseCount={
          currentStationBatteryType
            ? getAvailableCount(currentStationBatteryType.id)
            : 0
        }
        maxSlotsAvailable={currentStationInfo.maxSlotsForMove}
      />
    </div>
  );
}