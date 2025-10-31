import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
import { FaDeleteLeft } from "react-icons/fa6";
import handleApiError from "../../Utils/handleApiError";
import { getCurrentUser } from "../../config/auth";

const { TextArea } = Input;

export default function BookingsPage() {
  const [data, setData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelForm] = Form.useForm();

  // 🧩 User hiện tại - lấy từ localStorage
  const user = getCurrentUser() || {};
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
        // DRIVER: không cần gọi API /Current vì đã có user trong localStorage
        [bookingRes, vehicleRes, stationRes] = await Promise.all([
          api.get("/booking/my-bookings"),
          api.get("/vehicle/my-vehicles"),
          api.get("/station"),
        ]);
        userRes = { data: user }; // Sử dụng user từ localStorage
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
    } catch (error) {
      handleApiError(error, "");
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

  // ✅ Xác nhận booking
  const handleConfirm = async (record) => {
    try {
      const res = await api.delete(`/booking/staff/${record.id}/cancel`);
      setData((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? { ...item, status: res.data?.status || "CONFIRMED" }
            : item
        )
      );
      message.success("Xóa booking thành công!");
    } catch (error) {
      handleApiError(error, "Confirm booking");
    }
  };

  // ✅ Xử lý xác nhận Hủy Booking cho ADMIN/STAFF
  const handleCancelSubmit = async (values) => {
    const bookingId = cancellingBooking?.id;
    if (!bookingId) return;

    setSubmitting(true);
    try {
      // ❗ SỬ DỤNG API DELETE VỚI REASON TRONG QUERY DÀNH CHO STAFF/ADMIN
      await api.delete(
        `/booking/staff/${bookingId}/cancel?reason=${encodeURIComponent(
          values.reason
        )}`
      );

      // Cập nhật state local
      setData((prev) =>
        prev.map((item) =>
          item.id === bookingId ? { ...item, status: "CANCELLED" } : item
        )
      );

      message.success("Đã hủy booking thành công!");
      setIsCancelModalVisible(false);
      setCancellingBooking(null);
    } catch (error) {
      handleApiError(error, "Cancel booking (Admin/Staff)");
    } finally {
      setSubmitting(false);
    }
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
      title: "Tài xế",
      dataIndex: "driverId",
      key: "driverId",
      render: (id) => driverName(id),
    },
    {
      title: "Xe",
      dataIndex: "vehicleId",
      key: "vehicleId",
      render: (id) => vehicleName(id),
    },
    {
      title: "Trạm",
      dataIndex: "stationId",
      key: "stationId",
      render: (id) => stationName(id),
    },
    {
      title: "Thời gian đặt",
      dataIndex: "bookingTime",
      key: "bookingTime",
      sorter: (a, b) =>
        dayjs(a.bookingTime).unix() - dayjs(b.bookingTime).unix(),
      render: (t) => (t ? dayjs(t).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const color =
          s === "COMPLETED"
            ? "green"
            : s === "CONFIRMED"
            ? "orange"
            : s === "PENDING"
            ? "orange"
            : "red";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    // Mã đổi pin (Chỉ hiển thị cho ADMIN và DRIVER)
    ...(role === "ADMIN" || role === "DRIVER"
      ? [
          {
            title: "Mã xác nhận",
            dataIndex: "confirmationCode",
            key: "confirmationCode",
            render: (code) => <p>{code || "-"}</p>, // Hiển thị mã đổi pin
          },
        ]
      : []), // Trả về mảng rỗng nếu là STAFF hoặc vai trò khác
    {
      title: "Thao tác",
      key: "actions",

      render: (_, record) => (
        <Space>
          {(role === "ADMIN" || role === "STAFF") &&
            record.status === "CONFIRMED" && (
              <Button
                danger
                icon={<FaDeleteLeft />}
                onClick={() => handleConfirm(record)}
              >
                Cancel
              </Button>
            )}

          {role === "DRIVER" && record.status === "CONFIRMED" && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelSubmit(record)}
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
        title="Quản lý đặt lịch"
        extra={
          <Space>
            <Input
              placeholder="Tìm tài xế / xe / trạm"
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
                Thêm Đặt Lịch Mới
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
            pagination={{
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trên ${total} lịch`,
            }}
          />
        </Spin>
      </Card>

      {/* Modal nhập lý do hủy booking cho Admin/Staff */}
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
        <Form form={cancelForm} layout="vertical" onFinish={handleCancelSubmit}>
          <Form.Item name="reason" label="Lý do hủy">
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
                Quay lại
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
