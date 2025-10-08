import React, { useState, useMemo } from "react";
import { Card, Table, Button, Space, Modal, Form, Input, DatePicker, Select, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const sampleBookings = [
  {
    id: "BK-001",
    user: "Nguyen Van A",
    vehicle: "EV-1234",
    station: "Station A",
    slot: "S1",
    date: "2025-10-01",
    time: "10:00",
    status: "Confirmed",
  },
  {
    id: "BK-002",
    user: "Tran Thi B",
    vehicle: "EV-4321",
    station: "Station B",
    slot: "S3",
    date: "2025-10-02",
    time: "14:30",
    status: "Pending",
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState(sampleBookings);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState(null);

  const columns = [
    { title: "Booking ID", dataIndex: "id", key: "id" },
    { title: "User", dataIndex: "user", key: "user" },
    { title: "Vehicle", dataIndex: "vehicle", key: "vehicle" },
    { title: "Station", dataIndex: "station", key: "station" },
    { title: "Slot", dataIndex: "slot", key: "slot" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Time", dataIndex: "time", key: "time" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const color = s === "Confirmed" ? "green" : s === "Pending" ? "orange" : "red";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const filtered = useMemo(() => bookings.filter((b) => {
    if (filterStatus && b.status !== filterStatus) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!b.user.toLowerCase().includes(q) && !b.vehicle.toLowerCase().includes(q) && !b.station.toLowerCase().includes(q)) return false;
    }
    if (dateRange && dateRange.length === 2) {
      const start = dateRange[0];
      const end = dateRange[1];
      const d = b.date;
      if (d < start || d > end) return false;
    }
    return true;
  }), [bookings, filterStatus, searchText, dateRange]);

  function openEdit(record) {
    setEditing(record);
    form.setFieldsValue({ ...record, date: record.date });
    setIsModalVisible(true);
  }

  function handleDelete(id) {
    Modal.confirm({
      title: "Delete booking",
      content: "Are you sure you want to delete this booking?",
      okText: "Delete",
      okType: "danger",
      onOk() {
        setBookings((prev) => prev.filter((p) => p.id !== id));
        message.success("Booking deleted");
      },
    });
  }

  function openNew() {
    setEditing(null);
    form.resetFields();
    setIsModalVisible(true);
  }

  function handleSubmit(values) {
    if (editing) {
      setBookings((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...values } : b)));
      message.success("Booking updated");
    } else {
      const newBooking = { ...values, id: `BK-${String(Math.floor(Math.random() * 900) + 100)}` };
      setBookings((prev) => [newBooking, ...prev]);
      message.success("Booking created");
    }
    setIsModalVisible(false);
    form.resetFields();
  }

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Bookings"
        extra={
          <Space>
            <Input placeholder="Search user, vehicle, station" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 240 }} />
            <Select placeholder="Filter by status" allowClear style={{ width: 160 }} onChange={(v) => setFilterStatus(v)}>
              <Option value="Confirmed">Confirmed</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
            <DatePicker.RangePicker onChange={(vals) => setDateRange(vals && vals.map(d => d.format('YYYY-MM-DD')))} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
              New Booking
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={filtered} rowKey={(r) => r.id} />
      </Card>

      <Modal title={editing ? "Edit Booking" : "New Booking"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ status: 'Pending' }}>
          <Form.Item name="user" label="User" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="vehicle" label="Vehicle" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="station" label="Station" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="slot" label="Slot" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}> <Input placeholder="YYYY-MM-DD" /> </Form.Item>
          <Form.Item name="time" label="Time" rules={[{ required: true }]}> <Input placeholder="HH:MM" /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> 
            <Select>
              <Option value="Confirmed">Confirmed</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{editing ? 'Update' : 'Create'}</Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
