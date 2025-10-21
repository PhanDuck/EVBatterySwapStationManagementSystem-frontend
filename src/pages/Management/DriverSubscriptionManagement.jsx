import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  message,
  Spin,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import moment from "moment";

const { Option } = Select;

export default function DriverSubscriptionManagement() {
  const [data, setData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [search, setSearch] = useState("");

  const [form] = Form.useForm();

  // 🧩 Lấy thông tin user hiện tại
  let user = {};
  try {
    const raw = localStorage.getItem("currentUser");
    user = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to parse stored user", e);
  }
  const role = user?.role;
  // 🟢 Fetch dữ liệu
  const fetchData = async () => {
    setLoading(true);
    try {
      const [subscriptionRes, driverRes, packageRes] = await Promise.all([
        role === "DRIVER"
          ? api.get("/driver-subscription/my-subscriptions")
          : api.get("/driver-subscription"),
        api.get("/Current"),
        api.get("/service-package"),
      ]);

      setData(Array.isArray(subscriptionRes?.data) ? subscriptionRes.data : []);
      setDrivers(Array.isArray(driverRes?.data) ? driverRes.data : []);
      setPackages(Array.isArray(packageRes?.data) ? packageRes.data : []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 Map ID sang tên
  const driverName = (id) =>
    drivers.find((d) => d.id === id)?.fullName || `${id}`;
  const packageName = (id) =>
    packages.find((p) => p.id === id)?.name || `${id}`;

  // 🔍 Filter search
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        driverName(item.driverId)
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        packageName(item.packageId).toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, drivers, packages]);

  // ➕ Mở modal thêm
  const openNew = () => {
    form.resetFields();
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  // ✏️ Mở modal sửa
  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      driverId: record.driverId,
      packageId: record.packageId,
      startDate: moment(record.startDate),
      endDate: moment(record.endDate),
      status: record.status,
      remainingSwaps: record.remainingSwaps,
    });
    setIsModalVisible(true);
  };

  // 🗑️ Xóa subscription
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa subscription?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setDeletingId(id);
          await api.delete(`/driver-subscription/${id}`);
          setData((prev) => prev.filter((s) => s.id !== id));
          message.success("Đã xóa subscription!");
        } catch (err) {
          console.error(err);
          message.error("Không thể xóa subscription!");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // ➕ Thêm / Cập nhật subscription
  const handleSubmit = async (values) => {
    const payload = {
      driverId: values.driverId,
      packageId: values.packageId,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
      status: values.status,
      remainingSwaps: values.remainingSwaps,
    };

    try {
      setSubmitting(true);
      if (editingRecord) {
        await api.put(`/driver-subscription/${editingRecord.id}`, payload);
        setData((prev) =>
          prev.map((s) =>
            s.id === editingRecord.id ? { ...s, ...payload } : s
          )
        );
        message.success("Cập nhật subscription thành công!");
      } else {
        const res = await api.post("/driver-subscription", payload);
        const newSub = res.data ?? { ...payload, id: `DS-${Date.now()}` };
        setData((prev) => [newSub, ...prev]);
        message.success("Tạo subscription thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Không thể lưu subscription!");
    } finally {
      setSubmitting(false);
    }
  };

  // 🧾 Columns Table
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Driver",
      dataIndex: "driverId",
      key: "driverId",
      render: (id) => driverName(id),
    },
    {
      title: "Package",
      dataIndex: "packageId",
      key: "packageId",
      render: (id) => packageName(id),
    },
    { title: "Start Date", dataIndex: "startDate", key: "startDate" },
    { title: "End Date", dataIndex: "endDate", key: "endDate" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const color =
          s === "ACTIVE" ? "green" : s === "INACTIVE" ? "orange" : "red";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Remaining Swaps",
      dataIndex: "remainingSwaps",
      key: "remainingSwaps",
    },
    // Actions column chỉ cho DRIVER
    ...(role === "DRIVER"
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <Space>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => openEdit(record)}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleDelete(record.id)}
                  loading={deletingId === record.id}
                >
                  Delete
                </Button>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Driver Subscriptions Management"
        extra={
          <Space>
            <Input
              placeholder="Tìm Driver / Package"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 250 }}
            />
            {role === "DRIVER" && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
                New Subscription
              </Button>
            )}
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 8 }}
          />
        </Spin>
      </Card>

      {/* Modal Form */}
      <Modal
        title={editingRecord ? "Edit Subscription" : "New Subscription"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="driverId"
            label="Driver"
            rules={[{ required: true, message: "Vui lòng chọn Driver" }]}
          >
            <Select disabled={role !== "DRIVER"}>
              {drivers.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="packageId"
            label="Package"
            rules={[{ required: true, message: "Vui lòng chọn Package" }]}
          >
            <Select>
              {packages.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
          >
            <Select>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
              <Option value="EXPIRED">EXPIRED</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="remainingSwaps"
            label="Remaining Swaps"
            rules={[{ required: true, message: "Nhập số lần còn lại" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingRecord ? "Update" : "Create"}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setEditingRecord(null);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
