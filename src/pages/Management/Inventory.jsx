import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Steps,
  Alert,
} from "antd";
import {
  ReloadOutlined,
  SendOutlined,
  RollbackOutlined,
  SearchOutlined,
  EditOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";
import { getCurrentRole } from "../../config/auth";

const { Option } = Select;

// --- CONSTANTS ---
const STATUS_COLORS = {
  AVAILABLE: "green",
  MAINTENANCE: "orange",
  PENDING: "blue",
};
const COL_WIDTH = { ID: 80, TYPE: 200, STATUS: 110, ACTION: 120 };

// --- SUB-COMPONENT: MOVE MODAL (Logic chọn thủ công) ---
const MoveToStationModal = ({
  open,
  onCancel,
  onSuccess,
  station,
  batteryType,
  warehouseCount,
  maxSlots,
}) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pool, setPool] = useState([]); // Pin khả dụng trong kho
  const [selectedIds, setSelectedIds] = useState([]);
  const [qty, setQty] = useState(1);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      setStep(0);
      setPool([]);
      setSelectedIds([]);
      setQty(1);
      form.resetFields();
      form.setFieldsValue({ quantity: 1 });
    }
  }, [open, form]);

  const handleNext = async (values) => {
    const q = values.quantity;
    setLoading(true);
    try {
      const res = await api.get(
        `/station-inventory/available-by-type/${batteryType.id}`
      );
      const raw =
        res.data?.batteries || (Array.isArray(res.data) ? res.data : []);
      // Lọc SOH > 90
      const valid = raw.filter(
        (b) => b.status === "AVAILABLE" && parseFloat(b.stateOfHealth) > 90
      );

      if (valid.length < q)
        return showToast("error", `Kho chỉ còn ${valid.length} pin đạt chuẩn.`);

      setPool(valid);
      setQty(q);
      setStep(1);
    } catch (e) {
      showToast("error", e.response?.data || "Lỗi tải pin kho");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedIds.length) return;
    setLoading(true);
    let count = 0;
    for (const id of selectedIds) {
      try {
        await api.post("/station-inventory/move-to-station", null, {
          params: {
            stationId: station.id,
            batteryId: id,
            batteryTypeId: batteryType.id,
          },
        });
        count++;
      } catch (error) {
        console.error("Lỗi chuyển pin ID:", id, error);
        showToast("error", "Lỗi chuyển pin ID:", id);
      }
    }
    setLoading(false);
    if (count > 0) {
      showToast("success", `Đã chuyển ${count} pin.`);
      onSuccess();
      onCancel();
    } else showToast("error", "Chuyển thất bại");
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 80, render: (t) => <b>#{t}</b> },
    { title: "Model", dataIndex: "model" },
    {
      title: "SOH",
      dataIndex: "stateOfHealth",
      render: (v) => <Tag color="green">{parseFloat(v).toFixed(2)}%</Tag>,
    },
    {
      title: "Pin",
      dataIndex: "chargeLevel",
      render: (v) => <Tag color={v > 80 ? "green" : "orange"}>{v}%</Tag>,
    },
  ];

  return (
    <Modal
      title={`Chuyển pin ra ${station?.name}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      maskClosable={false}
    >
      <Steps
        current={step}
        items={[
          { title: "Số lượng", icon: <SendOutlined /> },
          { title: "Chọn pin", icon: <CheckCircleOutlined /> },
        ]}
        style={{ marginBottom: 24 }}
      />

      {step === 0 ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleNext}
          initialValues={{ quantity: 1 }}
        >
          <Alert
            message="Thông tin"
            description={
              <ul>
                <li>Loại: {batteryType?.name}</li>
                <li>Kho có: {warehouseCount}</li>
                <li>Trạm còn trống: {maxSlots}</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true },
              () => ({
                validator(_, val) {
                  if (val > maxSlots)
                    return Promise.reject("Quá sức chứa trạm");
                  if (val > warehouseCount)
                    return Promise.reject("Quá tồn kho");
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<ArrowRightOutlined />}
            >
              Tiếp tục
            </Button>
          </div>
        </Form>
      ) : (
        <>
          <Alert
            message={`Hãy chọn ${qty} pin`}
            type={selectedIds.length === qty ? "success" : "warning"}
            showIcon
            style={{ marginBottom: 10 }}
          />
          <Table
            dataSource={pool}
            columns={columns}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => keys.length <= qty && setSelectedIds(keys),
              getCheckboxProps: (r) => ({
                disabled:
                  selectedIds.length >= qty && !selectedIds.includes(r.id),
              }),
            }}
            rowKey="id"
            pagination={false}
            scroll={{ y: 300 }}
            size="small"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setStep(0)}>Quay lại</Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              loading={loading}
              disabled={selectedIds.length !== qty}
              icon={<SendOutlined />}
            >
              Xác nhận
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

// --- SUB-COMPONENT: SOH EDIT MODAL ---
const EditSohModal = ({ open, onCancel, record, onSubmit, loading }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (open && record)
      form.setFieldsValue({ newSOH: parseFloat(record.stateOfHealth) });
  }, [open, record, form]);

  return (
    <Modal title="Cập nhật tình trạng pin" open={open} onCancel={onCancel} footer={null}>
      <Form
        form={form}
        layout="vertical"
        onFinish={(v) => onSubmit(record, v.newSOH)}
      >
        <Form.Item
          name="newSOH"
          label="Tình trạng pin mới (%)"
          rules={[{ required: true }]}
        >
          <InputNumber
            min={0}
            max={100}
            step={0.01}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Cập nhật
        </Button>
      </Form>
    </Modal>
  );
};

// --- MAIN COMPONENT ---
export default function InventoryPage() {
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [stationItems, setStationItems] = useState([]); // Pin tại trạm
  const [warehouseItems, setWarehouseItems] = useState([]); // Pin tại kho
  const [batteryMap, setBatteryMap] = useState({});

  const [stationId, setStationId] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [showAllStation, setShowAllStation] = useState(false);

  // Modals
  const [moveModal, setMoveModal] = useState(false);
  const [sohModal, setSohModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const userRole = getCurrentRole()?.toUpperCase();
  const isAdmin = userRole === "ADMIN";

  // --- 1. DATA FETCHING ---
  const fetchStations = useCallback(async () => {
    try {
      const res = await api.get(
        isAdmin ? "/station" : "/staff-station-assignment/my-stations"
      );
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setStations(data);
      if (data.length && !stationId) setStationId(data[0].id);
    } catch {
      showToast("error", "Lỗi tải trạm");
    }
  }, [isAdmin, stationId]);

  const fetchTypes = useCallback(async () => {
    try {
      const res = await api.get("/battery-type");
      const map = {};
      (res.data || []).forEach(
        (t) => (map[t.id] = `${t.name} (${t.capacity}Ah)`)
      );
      setBatteryMap(map);
    } catch {
      showToast("error", "Không thể tải danh sách loại pin");
    }
  }, []);

  const fetchStationData = useCallback(async (sId) => {
    if (!sId) return setStationItems([]);
    setLoading(true);
    try {
      const res = await api.get(`/station/${sId}/batteries`);
      const items = Array.isArray(res.data)
        ? res.data
        : res.data?.batteries || [];
      setStationItems(items.sort((a, b) => b.id - a.id));
      return items[0]?.batteryTypeId; // Trả về loại pin của trạm
    } catch {
      showToast("error", "Lỗi tải pin trạm");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarehouseData = useCallback(
    async (typeId) => {
      setLoading(true);
      try {
        let url = isAdmin
          ? "/station-inventory"
          : `/station-inventory/available-by-type/${typeId}`;
        if (!isAdmin && !typeId) return setWarehouseItems([]); // Staff cần typeId

        const res = await api.get(url);
        let items = Array.isArray(res.data)
          ? res.data
          : res.data?.batteries || [];

        if (isAdmin && typeId)
          items = items.filter((i) => i.batteryTypeId === typeId);
        setWarehouseItems(items.sort((a, b) => b.id - a.id));
      } catch {
        showToast("error", "Lỗi tải kho");
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
  );

  // --- EFFECTS ---
  useEffect(() => {
    fetchStations();
    fetchTypes();
  }, [fetchStations, fetchTypes]);

  useEffect(() => {
    if (stationId) {
      fetchStationData(stationId).then((typeId) => {
        setFilterType(isAdmin ? null : typeId); // Admin mặc định không lọc, Staff lọc theo trạm
        fetchWarehouseData(isAdmin ? null : typeId);
      });
    }
  }, [stationId, fetchStationData, fetchWarehouseData, isAdmin]);

  // --- HANDLERS ---
  const handleMoveToWarehouse = async (item) => {
    try {
      await api.post("/station-inventory/move-to-warehouse", null, {
        params: { batteryId: item.id, stationId },
      });
      showToast("success", `Pin ${item.id} đã về kho`);
      fetchStationData(stationId);
      fetchWarehouseData(isAdmin ? null : filterType);
    } catch (e) {
      showToast("error", e.response?.data || "Lỗi chuyển kho");
    }
  };

  const handleUpdateSOH = async (item, newSOH) => {
    try {
      await api.patch(
        `/station-inventory/${item.id}/complete-maintenance`,
        null,
        { params: { newSOH } }
      );
      showToast("success", `Đã cập nhật tình trạng pin ${item.id}`);
      setSohModal(false);
      fetchWarehouseData(filterType);
    } catch (e) {
      showToast("error", e.response?.data || "Lỗi cập nhật");
    }
  };

  // --- DERIVED DATA ---
  const currentStation = stations.find((s) => s.id === stationId) || {};
  const stationType = stationItems.find((b) => b.batteryTypeId); // Lấy loại pin đại diện của trạm

  // Tính toán Filter & Search
  const filterData = (list, isStation) => {
    let data = list;
    if (isStation && !isAdmin) return data; // Staff thấy hết
    if (isStation && isAdmin && !showAllStation)
      data = data.filter((b) => b.status === "MAINTENANCE");
    if (searchId) data = data.filter((b) => String(b.id).includes(searchId));
    return data;
  };

  const stationCols = [
    {
      title: "ID",
      dataIndex: "id",
      width: COL_WIDTH.ID,
      render: (t) => <b>#{t}</b>,
    },
    {
      title: "Loại",
      dataIndex: "batteryTypeId",
      width: COL_WIDTH.TYPE,
      render: (id) => batteryMap[id],
    },
    {
      title: "Tình trạng pin (%)",
      dataIndex: "stateOfHealth",
      width: 100,
      render: (v) => (
        <Tag color={v > 70 ? "green" : "orange"}>
          {parseFloat(v).toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: COL_WIDTH.STATUS,
      render: (s) => <Tag color={STATUS_COLORS[s] || "default"}>{s}</Tag>,
    },
    {
      title: "Thao tác",
      key: "act",
      fixed: "right",
      width: COL_WIDTH.ACTION,
      render: (_, r) =>
        r.status === "MAINTENANCE" && (
          <Button
            size="small"
            type="primary"
            icon={<RollbackOutlined />}
            onClick={() => handleMoveToWarehouse(r)}
          >
            Về Kho
          </Button>
        ),
    },
  ];

  const warehouseColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: COL_WIDTH.ID,
      render: (t) => <b>#{t}</b>,
    },
    {
      title: "Loại",
      dataIndex: "batteryTypeId",
      width: COL_WIDTH.TYPE,
      render: (id) => batteryMap[id],
    },
    {
      title: "Tình trạng pin (%)",
      dataIndex: "stateOfHealth",
      width: 100,
      render: (v) => (
        <Tag color={v > 70 ? "green" : "orange"}>
          {parseFloat(v).toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: COL_WIDTH.STATUS,
      render: (s) => <Tag color={STATUS_COLORS[s] || "default"}>{s}</Tag>,
    },
    {
      title: "Thao tác",
      key: "act",
      fixed: "right",
      width: COL_WIDTH.ACTION,
      render: (_, r) =>
        isAdmin &&
        r.status === "MAINTENANCE" && (
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditItem(r);
              setSohModal(true);
            }}
          >
            Cập nhật
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 1. BẢNG PIN TẠI TRẠM */}
      <Card
        title={`Pin tại ${currentStation.name || "..."} (${stationItems.length} pin)`}
        extra={
          <Space>
            <Input.Search
              placeholder="Tìm ID..."
              allowClear
              onChange={(e) => setSearchId(e.target.value)}
              style={{ width: 150 }}
            />
            <Select
              placeholder="Chọn Trạm"
              style={{ width: 200 }}
              value={stationId}
              onChange={setStationId}
              showSearch
              optionFilterProp="children"
            >
              {stations.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
            {isAdmin && (
              <Button onClick={() => setShowAllStation(!showAllStation)}>
                {showAllStation ? "Xem bảo trì" : "Xem tất cả"}
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchStationData(stationId)}
            >
              Tải lại
            </Button>
          </Space>
        }
        style={{ marginBottom: 20 }}
      >
        <Table
          columns={stationCols}
          dataSource={filterData(stationItems, true)}
          rowKey="id"
          size="small"
          pagination={{ showTotal: (t) => `Tổng ${t}` }}
        />
      </Card>

      {/* 2. BẢNG KHO BẢO TRÌ */}
      <Card
        title="Pin tại kho bảo trì"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => setMoveModal(true)}
              disabled={!stationId || !stationType || stationItems.length >= 20} // Logic check đơn giản
            >
              Chuyển ra trạm
            </Button>
            {isAdmin && filterType && (
              <Button
                onClick={() => {
                  setFilterType(null);
                  fetchWarehouseData(null);
                }}
                icon={<RollbackOutlined />}
              >
                Bỏ lọc
              </Button>
            )}
            {isAdmin && !filterType && (
              <Button
                onClick={() => {
                  setFilterType(stationType.batteryTypeId);
                  fetchWarehouseData(stationType.batteryTypeId);
                }}
                icon={<SearchOutlined />}
              >
                Lọc theo trạm
              </Button>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchWarehouseData(filterType)}
            >
              Tải lại
            </Button>
          </Space>
        }
      >
        <Table
          columns={warehouseColumns}
          dataSource={filterData(warehouseItems, false)}
          rowKey="id"
          size="small"
          pagination={{ showTotal: (t) => `Tổng ${t}` }}
        />
      </Card>

      {/* Modals */}
      <MoveToStationModal
        open={moveModal}
        onCancel={() => setMoveModal(false)}
        onSuccess={() => {
          fetchStationData(stationId);
          fetchWarehouseData(filterType);
        }}
        station={{ id: stationId, name: currentStation.name }}
        batteryType={{
          id: stationType?.batteryTypeId,
          name: batteryMap[stationType?.batteryTypeId],
        }}
        warehouseCount={
          warehouseItems.filter(
            (b) =>
              b.status === "AVAILABLE" &&
              b.batteryTypeId === stationType?.batteryTypeId &&
              b.stateOfHealth > 90
          ).length
        }
        maxSlots={19 - stationItems.length}
      />

      <EditSohModal
        open={sohModal}
        onCancel={() => setSohModal(false)}
        record={editItem}
        onSubmit={handleUpdateSOH}
        loading={loading}
      />
    </div>
  );
}
