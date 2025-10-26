import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  notification,
} from "antd";
import {
  PlusOutlined,
  CheckOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const GET_COMPATIBLE_STATIONS_API_URL = "/booking/compatible-stations";

export default function BookingsPage() {
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [compatibleStations, setCompatibleStations] = useState([]);
  const [isStationLoading, setIsStationLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  
  // State mới cho modal hủy booking
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelForm] = Form.useForm();

  // 🧩 User hiện tại
  let user = {};
  try {
    const raw = localStorage.getItem("currentUser");
    user = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Failed to parse stored user", e);
  }
  const role = user?.role;
  const userId = user?.id;
  const navigate = useNavigate();

  // 🟢 Fetch dữ liệu ban đầu
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let bookingRes, vehicleRes, stationRes, userRes;

      if (role === "ADMIN" || role === "STAFF") {
        [bookingRes, vehicleRes, stationRes, userRes] = await Promise.all([
          role === "ADMIN"
            ? api.get("/booking")
            : api.get("/booking/my-stations"),
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

  // 🚀 Tải danh sách trạm tương thích
  const fetchCompatibleStations = useCallback(async (vehicleId) => {
    if (!vehicleId) {
      setCompatibleStations([]);
      return;
    }
    setIsStationLoading(true);
    try {
      const res = await api.get(`${GET_COMPATIBLE_STATIONS_API_URL}/${vehicleId}`);
      setCompatibleStations(res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải trạm tương thích:", error);
      setCompatibleStations([]);
      notification.error({
        message: "Lỗi Tải Danh Sách Trạm",
        description: "Không thể tải danh sách trạm tương thích cho xe đã chọn.",
      });
    } finally {
      setIsStationLoading(false);
    }
  }, []);

  // 🚀 Khi thay đổi xe
  const handleVehicleChange = (vehicleId) => {
    form.setFieldsValue({ stationId: null });
    setCompatibleStations([]);
    if (vehicleId) fetchCompatibleStations(vehicleId);
  };

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

  // ➕ Tạo booking mới
  const handleCreate = async () => {
    try {
      const validValues = await form.validateFields();
      const payload = {
        driverId: userId,
        vehicleId: validValues.vehicleId,
        stationId: validValues.stationId,
        bookingTime: validValues.bookingTime?.toISOString(),
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

  // ✏️ Cập nhật status
  const handleUpdateStatus = async () => {
    try {
      const validValues = await form.validateFields();
      const bookingId = editingRecord?.id;
      if (!bookingId) return;
      setSubmitting(true);
      await api.patch(`/booking/${bookingId}/status?status=${validValues.status}`);
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

  // ✅ Xác nhận booking
  const handleConfirm = async (record) => {
    try {
      const res = await api.patch(`/booking/${record.id}/confirm`);
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

  // ❌ Hủy booking (Admin/Staff) - CẬP NHẬT
  const handleAdminCancelBooking = (record) => {
    setCancellingBooking(record);
    setIsCancelModalVisible(true);
    cancelForm.resetFields();
  };

  // Xử lý submit form hủy booking - SỬA LẠI
  const handleCancelSubmit = async () => {
    try {
      const values = await cancelForm.validateFields();
      const bookingId = cancellingBooking?.id;
      
      if (!bookingId) return;

      setSubmitting(true);
      
      // Gọi API DELETE với reason trong request body
      await api.delete(`/booking/${bookingId}`, {
        data: {
          reason: values.reason,
        },
      });

      // Cập nhật state local
      setData((prev) =>
        prev.map((item) =>
          item.id === bookingId ? { ...item, status: "CANCELLED" } : item
        )
      );

      message.success("Đã hủy booking thành công!");
      setIsCancelModalVisible(false);
      setCancellingBooking(null);
      cancelForm.resetFields();
    } catch (err) {
      console.error("Cancel booking error:", err);
      message.error(
        err.response?.data?.message || "Không thể hủy booking!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ❌ Hủy booking (Driver)
  const handleCancelBooking = async (record) => {
    Modal.confirm({
      title: "Xác nhận hủy đặt lịch?",
      content: "Bạn có chắc muốn hủy booking này không?",
      okText: "Hủy Booking",
      cancelText: "Quay lại",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await api.patch(`/booking/my-bookings/${record.id}/cancel`);
          setData((prev) =>
            prev.map((item) =>
              item.id === record.id ? { ...item, status: "CANCELLED" } : item
            )
          );
          message.success("Đã hủy booking thành công!");
        } catch (err) {
          console.error("Cancel booking error:", err);
          message.error("Không thể hủy booking!");
        }
      },
    });
  };

  // 🧾 Cột hiển thị
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: "descend",
    },
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
    {
      title: "Booking Time",
      dataIndex: "bookingTime",
      key: "bookingTime",
      sorter: (a, b) =>
        dayjs(a.bookingTime).unix() - dayjs(b.bookingTime).unix(),
      render: (t) => (t ? dayjs(t).format("DD/MM/YYYY HH:mm") : "-"),
    },
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
      render: (_, record) => (
        <Space>
          {/* Nút Confirm cho Admin/Staff - chỉ hiện với PENDING */}
          {(role === "ADMIN" || role === "STAFF") &&
            record.status === "PENDING" && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleConfirm(record)}
              >
                Confirm
              </Button>
            )}

          {/* Nút Cancel cho Admin/Staff - hiện với PENDING hoặc CONFIRMED */}
          {(role === "ADMIN" || role === "STAFF") &&
            (record.status === "PENDING" || record.status === "CONFIRMED") && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleAdminCancelBooking(record)}
              >
                Cancel
              </Button>
            )}

          {/* Nút Cancel cho Driver - chỉ hiện với PENDING */}
          {role === "DRIVER" && record.status === "PENDING" && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelBooking(record)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/stations/booking")}
              >
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

      {/* Modal nhập lý do hủy booking */}
      <Modal
        title={`Hủy Booking #${cancellingBooking?.id || ""}`}
        open={isCancelModalVisible}
        onCancel={() => {
          setIsCancelModalVisible(false);
          setCancellingBooking(null);
          cancelForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={cancelForm}
          layout="vertical"
          onFinish={handleCancelSubmit}
        >
          <Form.Item
            name="reason"
            label="Lý do hủy"
            rules={[
              { required: true, message: "Vui lòng nhập lý do hủy booking!" },
              { min: 10, message: "Lý do phải có ít nhất 10 ký tự!" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do hủy booking (ví dụ: Khách hàng yêu cầu, Trạm bảo trì, v.v.)"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setIsCancelModalVisible(false);
                  setCancellingBooking(null);
                  cancelForm.resetFields();
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={submitting}
                icon={<CloseCircleOutlined />}
              >
                Xác nhận hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}