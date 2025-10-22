import React, { useEffect, useState, useMemo, useCallback, } from "react";
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
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import BookingForm from "../../components/BookingForm/BookingForm";

const { Option } = Select;
const GET_COMPATIBLE_STATIONS_API_URL = "/booking/compatible-stations";

export default function BookingsPage() {
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);

  // 🧩 Lấy thông tin user hiện tại
  let user = {};
  try {
    const raw = localStorage.getItem("currentUser");
    user = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to parse stored user", e);
  }
  const role = user?.role;
  const userId = user?.id;

  // 🟢 Fetch dữ liệu ban đầu
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let bookingRes, vehicleRes, stationRes, userRes;

      if (role === "ADMIN" || role === "STAFF") {
        [bookingRes, vehicleRes, stationRes, userRes] = await Promise.all([
          role === "ADMIN" ? api.get("/booking") : api.get("/booking/my-stations"),
          api.get("/vehicle"),
          api.get("/station"),
          api.get("/admin/user"),
        ]);
      } else {
        [bookingRes, vehicleRes, stationRes, userRes] = await Promise.all([
          api.get("/booking/my-bookings"),
          api.get("/vehicle/my-vehicles"),
          api.get("/station"),
          api.get("/Current"),
        ]);
      }

      setData(Array.isArray(bookingRes?.data) ? bookingRes.data : []);
      setVehicles(Array.isArray(vehicleRes?.data) ? vehicleRes.data : []);
      setStations(Array.isArray(stationRes?.data) ? stationRes.data : []);
      setUsers(
        Array.isArray(userRes?.data)
          ? userRes.data
          : userRes?.data
          ? [userRes.data]
          : []
      );
    } catch (err) {
      console.error("❌ Fetch error:", err);
      message.error("Không thể tải dữ liệu, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 📖 Map ID sang tên
  const driverName = (id) =>
    users.find((u) => u.id === id)?.fullName || `${id}`;
  const vehicleName = (id) =>
    vehicles.find((v) => v.id === id)?.model || `${id}`;
  const stationName = (id) =>
    stations.find((s) => s.id === id)?.name || `${id}`;

  // 🔍 Tìm kiếm
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        driverName(item.driverId)
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        vehicleName(item.vehicleId)
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        stationName(item.stationId).toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, users, vehicles, stations]);

  // ➕ Tạo booking mới (Driver)
  const handleCreate = async (values) => {
    try {
      const payload = {
        driverId: userId,
        vehicleId: values.vehicleId,
        stationId: values.stationId,
        bookingTime: values.bookingTime,
        status: "PENDING",
      };

      setSubmitting(true);
      const res = await api.post("/booking", payload);
      setData((prev) => [res.data, ...prev]);
      message.success("Tạo booking thành công!");
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error("Submit booking error:", err);
      message.error("Không thể tạo booking!");
    } finally {
      setSubmitting(false);
    }
  };

  // ✏️ Cập nhật status (Admin/Staff)
  const handleUpdateStatus = async () => {
    try {
      const validValues = await form.validateFields();
      const bookingId = editingRecord?.id;
      if (!bookingId) return;
      setSubmitting(true);
      await api.patch(
        `/booking/${bookingId}/status?status=${validValues.status}`
      );
      message.success("Cập nhật trạng thái thành công!");
      setData((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: validValues.status } : b
        )
      );
      setIsModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
    } catch (err) {
      console.error("Update status error:", err);
      message.error("Không thể cập nhật trạng thái!");
    } finally {
      setSubmitting(false);
    }
  };

  // ➕ Mở modal
  const openNew = () => {
    form.resetFields();
    setEditingRecord(null);
    setIsModalVisible(true);
  };
  const handleConfirm = async (record) => {
    try {
      const res = await api.patch(`/booking/${record.id}/confirm`);

      // ✅ Cập nhật lại state ngay
      setData((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? { ...item, status: res.data?.status || "CONFIRMED" }
            : item
        )
      );

      message.success("Xác nhận booking thành công!");
    } catch (err) {
      console.error("Confirm booking error:", err);
      message.error("Không thể xác nhận booking!");
    }
  };

  // 🧾 Cột hiển thị
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    {
      title: "Driver",
      dataIndex: "driverId",
      key: "driverId",
      render: (id) => driverName(id),
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleId",
      key: "vehicleId",
      render: (id) => vehicleName(id),
    },
    {
      title: "Station",
      dataIndex: "stationId",
      key: "stationId",
      render: (id) => stationName(id),
    },
    { title: "Booking Time", dataIndex: "bookingTime", key: "bookingTime" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const color =
          s === "COMPLETED"
            ? "green"
            : s === "CONFIRMED"
            ? "blue"
            : s === "PENDING"
            ? "orange"
            : "red";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        return (
          <Space>
            {(role === "ADMIN" || role === "STAFF") &&  record.status === "PENDING" && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleConfirm(record)}
              >
                Confirm
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Bookings Management"
        extra={
          <Space>
            <Input
              placeholder="Tìm Driver / Vehicle / Station"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 250 }}
            />
            {role === "DRIVER" && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>
                New Booking
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

      {/* 🔹 Modal Form */}
      <Modal
        title={editingRecord ? "Edit Booking Status" : "New Booking"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRecord(null);
        }}
        footer={null}
      >
        {role === 'DRIVER' && !editingRecord && (
          <BookingForm 
            form={form} 
            onFinish={handleCreate}
            submitButton={
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Create
                </Button>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              </Space>
            }
          />
        )}

        {(role === "ADMIN" || role === "STAFF") && editingRecord && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateStatus}
            initialValues={{ status: editingRecord.status }}
          >
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select>
                <Option value="PENDING">PENDING</Option>
                <Option value="CONFIRMED">CONFIRMED</Option>
                <Option value="COMPLETED">COMPLETED</Option>
                <Option value="CANCELLED">CANCELLED</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Update
                </Button>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}