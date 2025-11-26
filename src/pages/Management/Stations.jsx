import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Statistic,
  Row,
  Col,
  Alert,
  Steps,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SwapOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;

// --- CONSTANTS ---
const STATUS_COLORS = {
  ACTIVE: "green",
  MAINTENANCE: "orange",
  INACTIVE: "red",
  "UNDER CONSTRUCTION": "blue",
};

// --- SUB-COMPONENT: BATTERY LIST MODAL ---
const BatteryListModal = ({ station, open, onCancel, batteryTypes }) => {
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && station?.id) {
      setLoading(true);
      api
        .get(`/station/${station.id}/batteries`)
        .then((res) => setBatteries(Array.isArray(res.data) ? res.data : []))
        .catch(() => setBatteries([]))
        .finally(() => setLoading(false));
    }
  }, [open, station]);

  const columns = [
    { title: "ID", dataIndex: "id", render: (t) => <b>#{t}</b> },
    { title: "Model", dataIndex: "model" },
    {
      title: "Loại",
      dataIndex: "batteryTypeId",
      render: (id) => batteryTypes.find((t) => t.id === id)?.name,
    },
    {
      title: "Pin (%)",
      dataIndex: "chargeLevel",
      render: (s) => <Tag color={s > 70 ? "green" : "orange"}>{s}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "AVAILABLE" ? "green" : "blue"}>{s}</Tag>
      ),
    },
  ];

  return (
    <Modal
      title={`Pin tại trạm ${station?.name || ""}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        dataSource={batteries}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

// --- SUB-COMPONENT: BATTERY SWAP MODAL ---
const BatterySwapModal = ({
  station,
  open,
  onCancel,
  batteryTypesMap,
  onSuccess,
}) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [badBatteries, setBadBatteries] = useState([]);
  const [goodBatteries, setGoodBatteries] = useState([]);
  const [selectedBad, setSelectedBad] = useState([]);
  const [selectedGood, setSelectedGood] = useState([]);

  // Load bad batteries when modal opens
  useEffect(() => {
    if (open && station?.id) {
      setStep(0);
      setSelectedBad([]);
      setSelectedGood([]);
      setLoading(true);
      api
        .get(`/station/${station.id}/batteries/needs-maintenance`)
        .then((res) => setBadBatteries(res.data?.batteries || []))
        .catch(() => setBadBatteries([]))
        .finally(() => setLoading(false));
    }
  }, [open, station]);

  const handleNext = async () => {
    if (!selectedBad.length)
      return showToast("warning", "Chọn ít nhất 1 pin lỗi");
    const typeId = badBatteries[0]?.batteryTypeId;
    if (!typeId) return;

    setLoading(true);
    try {
      const res = await api.get(
        `/station-inventory/available-by-type/${typeId}`
      );
      setGoodBatteries(
        (res.data?.batteries || []).filter(
          (b) => b.status === "AVAILABLE" && b.stateOfHealth > 90
        )
      );
      setStep(1);
    } catch {
      showToast("error", "Lỗi tải pin kho");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (selectedGood.length !== selectedBad.length)
      return showToast("error", "Số lượng pin không khớp");
    setLoading(true);
    try {
      await Promise.all(
        selectedBad.map((id) =>
          api.post("/station-inventory/move-to-warehouse", null, {
            params: { batteryId: id, stationId: station.id },
          })
        )
      );
      await Promise.all(
        selectedGood.map((id) =>
          api.post("/station-inventory/move-to-station", null, {
            params: {
              batteryId: id,
              stationId: station.id,
              batteryTypeId: badBatteries[0].batteryTypeId,
            },
          })
        )
      );
      showToast("success", "Đổi pin thành công");
      onSuccess();
      onCancel();
    } catch {
      showToast("error", "Lỗi đổi pin");
    } finally {
      setLoading(false);
    }
  };

  const columns = (isGood) =>
    [
      { title: "ID", dataIndex: "id", render: (t) => <b>#{t}</b> },
      {
        title: "Loại",
        dataIndex: "batteryTypeId",
        render: (id) => batteryTypesMap[id],
      },
      {
        title: "SOH",
        dataIndex: "stateOfHealth",
        render: (s) => <Tag color="green">{s}%</Tag>,
      },
      !isGood && {
        title: "Bảo trì cuối",
        dataIndex: "lastMaintenanceDate",
        render: (d) => (d ? new Date(d).toLocaleDateString() : "-"),
      },
    ].filter(Boolean);

  return (
    <Modal
      title={`Đổi pin trạm ${station?.name}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Steps
        current={step}
        items={[
          { title: "Chọn Pin Lỗi (Trạm)", icon: <EnvironmentOutlined /> },
          { title: "Chọn Pin Tốt (Kho)", icon: <InboxOutlined /> },
        ]}
        style={{ marginBottom: 20 }}
      />

      {step === 0 ? (
        <>
          <Table
            dataSource={badBatteries}
            columns={columns(false)}
            rowSelection={{
              selectedRowKeys: selectedBad,
              onChange: setSelectedBad,
            }}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
          <div style={{ textAlign: "right", marginTop: 10 }}>
            <Button type="primary" onClick={handleNext}>
              Tiếp tục
            </Button>
          </div>
        </>
      ) : (
        <>
          <Alert
            message={`Chọn đủ ${selectedBad.length} pin tốt`}
            type={
              selectedGood.length === selectedBad.length ? "success" : "warning"
            }
            showIcon
            style={{ marginBottom: 10 }}
          />
          <Table
            dataSource={goodBatteries}
            columns={columns(true)}
            rowSelection={{
              selectedRowKeys: selectedGood,
              onChange: setSelectedGood,
            }}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
          <Space style={{ float: "right", marginTop: 10 }}>
            <Button onClick={() => setStep(0)}>Quay lại</Button>
            <Button
              type="primary"
              onClick={handleSwap}
              loading={loading}
              disabled={selectedGood.length !== selectedBad.length}
            >
              Xác nhận
            </Button>
          </Space>
        </>
      )}
    </Modal>
  );
};

// --- SUB-COMPONENT: STATION FORM MODAL ---
const StationFormModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  batteryTypes,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.setFieldsValue(initialValues || {});
    else form.resetFields();
  }, [open, initialValues, form]);

  return (
    <Modal
      title={initialValues ? "Cập nhật trạm" : "Thêm trạm mới"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={initialValues ? "Lưu" : "Tạo"}
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên trạm"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Địa chỉ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="city" label="Tỉnh/TP" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="district"
              label="Quận/Huyện"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="latitude"
              label="Vĩ độ"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="longitude"
              label="Kinh độ"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="capacity"
              label="Sức chứa"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactInfo"
              label="Liên hệ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="batteryTypeId"
              label="Loại pin"
              rules={[{ required: true }]}
            >
              <Select>
                {batteryTypes.map((t) => (
                  <Option key={t.id} value={t.id}>
                    {t.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {initialValues && (
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.keys(STATUS_COLORS).map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function StationPage() {
  const [stations, setStations] = useState([]);
  const [batteryTypes, setBatteryTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [listModal, setListModal] = useState({ open: false, data: null });
  const [swapModal, setSwapModal] = useState({ open: false, data: null });

  // Filter
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const userRole = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"))?.role;
    } catch {
      return null;
    }
  }, []);

  // API Calls
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [stationRes, typeRes] = await Promise.all([
        api.get(
          userRole === "ADMIN"
            ? "/station"
            : "/staff-station-assignment/my-stations"
        ),
        api.get("/battery-type"),
      ]);
      setStations(
        (Array.isArray(stationRes.data) ? stationRes.data : []).sort(
          (a, b) => b.id - a.id
        )
      );
      setBatteryTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
    } catch (e) {
      showToast("error", e.response?.data || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSave = async (values) => {
    try {
      if (formModal.data) {
        await api.put(`/station/${formModal.data.id}`, values);
        showToast("success", "Cập nhật thành công");
      } else {
        await api.post("/station", values);
        showToast("success", "Tạo mới thành công");
      }
      setFormModal({ open: false, data: null });
      loadData();
    } catch (e) {
      showToast("error", e.response?.data || "Lỗi lưu dữ liệu");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa?",
      content: "Hành động này không thể hoàn tác.",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/station/${id}`);
          showToast("success", "Đã xóa trạm");
          loadData();
        } catch (e) {
          showToast("error", e.response?.data || "Lỗi xóa trạm");
        }
      },
    });
  };

  // Derived Data
  const batteryMap = useMemo(
    () =>
      batteryTypes.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {}),
    [batteryTypes]
  );

  const filteredData = useMemo(() => {
    const q = searchText.toLowerCase();
    return stations.filter(
      (s) =>
        (statusFilter === "all" || s.status === statusFilter) &&
        ((s.name || "").toLowerCase().includes(q) ||
          (s.location || "").toLowerCase().includes(q))
    );
  }, [stations, searchText, statusFilter]);

  const stats = {
    total: stations.length,
    active: stations.filter((s) => s.status === "ACTIVE").length,
    capacity: stations.reduce((sum, s) => sum + (s.capacity || 0), 0),
    current: stations.reduce((sum, s) => sum + (s.currentBatteryCount || 0), 0),
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60, render: (t) => <b>#{t}</b> },
    { title: "Trạm", dataIndex: "name" },
    { title: "Địa chỉ", dataIndex: "location", width: 300 },
    {
      title: "Pin / Sức chứa",
      key: "cap",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <span>
            <b>{r.currentBatteryCount || 0}</b> / {r.capacity}
          </span>
          <div
            style={{
              width: 100,
              height: 4,
              background: "#eee",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                width: `${(r.currentBatteryCount / r.capacity) * 100}%`,
                height: "100%",
                background: "#52c41a",
              }}
            />
          </div>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
    },
    { title: "Liên hệ", dataIndex: "contactInfo" },
    {
      title: "Thao tác",
      key: "act",
      fixed: "right",
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setListModal({ open: true, data: r })}
          >
            Xem
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => setSwapModal({ open: true, data: r })}
          >
            Đổi Pin
          </Button>
          {userRole === "ADMIN" && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setFormModal({ open: true, data: r })}
              >
                Sửa
              </Button>
              <Button
                size="small"
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(r.id)}
              >
                Xóa
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng trạm"
              value={stats.total}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Trạm hoạt động"
              value={stats.active}
              valueStyle={{ color: "#3f8600" }}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sức chứa"
              value={stats.capacity}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pin hiện có"
              value={stats.current}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card
        title="Quản lý trạm đổi pin"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả</Option>
              {Object.keys(STATUS_COLORS).map((k) => (
                <Option key={k} value={k}>
                  {k}
                </Option>
              ))}
            </Select>
            {userRole === "ADMIN" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setFormModal({ open: true, data: null })}
              >
                Thêm Trạm
              </Button>
            )}
          </Space>
        }
      >
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modals */}
      <StationFormModal
        open={formModal.open}
        initialValues={formModal.data}
        onCancel={() => setFormModal({ open: false, data: null })}
        onSubmit={handleSave}
        batteryTypes={batteryTypes}
      />

      <BatteryListModal
        open={listModal.open}
        station={listModal.data}
        onCancel={() => setListModal({ open: false, data: null })}
        batteryTypes={batteryTypes}
      />

      <BatterySwapModal
        open={swapModal.open}
        station={swapModal.data}
        onCancel={() => setSwapModal({ open: false, data: null })}
        batteryTypesMap={batteryMap}
        onSuccess={loadData}
      />
    </div>
  );
}
