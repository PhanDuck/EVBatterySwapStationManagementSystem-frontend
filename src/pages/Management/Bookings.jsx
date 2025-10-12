import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  message,
  Spin,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../config/axios";

const { Option } = Select;

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 🔹 Fetch all bookings (READ)
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await api.get("/booking"); 
        const list = Array.isArray(res.data) ? res.data : [];
        setBookings(list);
      } catch (err) {
        console.error("Fetch bookings error:", err);
        message.error("Không thể tải danh sách booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // 🔹 Filter & Search
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !b.driverID?.toString().toLowerCase().includes(q) &&
          !b.vehicleID?.toString().toLowerCase().includes(q) &&
          !b.stationID?.toString().toLowerCase().includes(q)
        )
          return false;
      }
      if (dateRange && dateRange.length === 2) {
        const [start, end] = dateRange;
        if (b.bookingTime < start || b.bookingTime > end) return false;
      }
      return true;
    });
  }, [bookings, searchText, dateRange]);

  // 🔹 CREATE & UPDATE
  const handleSubmit = async (values) => {
    try {
      const payload = {
        bookingTime: values.bookingTime,
        status: values.status,
        driverID: values.driverID,
        stationID: values.stationID,
        vehicleID: values.vehicleID,
      };

      if (editing) {
        // UPDATE
        const res = await api.put(`/booking/${editing.bookingID}`, payload);
        setBookings((prev) =>
          prev.map((b) =>
            b.bookingID === editing.bookingID ? res.data : b
          )
        );
        message.success("Cập nhật booking thành công");
      } else {
        // CREATE
        const res = await api.post("/booking", payload);
        setBookings((prev) => [res.data, ...prev]);
        message.success("Tạo booking mới thành công");
      }
    } catch (err) {
      console.error("Submit booking error:", err);
      message.error("Không thể lưu booking");
    } finally {
      setIsModalVisible(false);
      form.resetFields();
    }
  };

  // 🔹 DELETE
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xóa booking này?",
      okType: "danger",
      onOk: async () => {
        try {
          setDeletingId(id);
          await api.delete(`/booking/${id}`);
          setBookings((prev) => prev.filter((b) => b.bookingID !== id));
          message.success("Xóa booking thành công");
        } catch (err) {
          console.error("Delete booking error:", err);
          message.error("Không thể xóa booking");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // 🔹 Columns
  const columns = [
    { title: "Booking ID", dataIndex: "id", key: "id" },
    { title: "Driver ID", dataIndex: "driverID", key: "driverID" },
    { title: "Vehicle ID", dataIndex: "vehicleID", key: "vehicleID" },
    { title: "Station ID", dataIndex: "stationID", key: "stationID" },
    { title: "Booking Time", dataIndex: "bookingTime", key: "bookingTime" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const color =
          s === "Confirmed" ? "green" : s === "Pending" ? "orange" : "red";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            loading={deletingId === record.bookingID}
            onClick={() => handleDelete(record.bookingID)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const openNew = () => {
    setEditing(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 🔹 JSX render
  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Bookings Management"
        extra={
          <Space>
            <Input
              placeholder="Tìm Driver, Vehicle, Station"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
            />
            <DatePicker.RangePicker
              onChange={(vals) =>
                setDateRange(vals && vals.map((d) => d.format("YYYY-MM-DD")))
              }
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
              New Booking
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={filtered} rowKey="bookingID" />
        </Spin>
      </Card>

      {/* 🔹 Modal Form */}
      <Modal
        title={editing ? "Edit Booking" : "New Booking"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: "Pending" }}
        >
          <Form.Item
            name="driverID"
            label="Driver ID"
            rules={[{ required: true, message: "Vui lòng nhập Driver ID" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="vehicleID"
            label="Vehicle ID"
            rules={[{ required: true, message: "Vui lòng nhập Vehicle ID" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="stationID"
            label="Station ID"
            rules={[{ required: true, message: "Vui lòng nhập Station ID" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="bookingTime"
            label="Booking Time"
            rules={[{ required: true, message: "Vui lòng nhập thời gian đặt" }]}
          >
            <Input placeholder="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Confirmed">Confirmed</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editing ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
