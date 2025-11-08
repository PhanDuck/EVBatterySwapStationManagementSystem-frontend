import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
import { PlusOutlined, CloseCircleOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
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
  const initialized = useRef(false);

  // 🟢 Fetch dữ liệu ban đầu
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let bookingRes;

      if (role === "ADMIN" || role === "STAFF") {
<<<<<<< HEAD
        [bookingRes, vehicleRes, stationRes, userRes] = await Promise.all([
          role === "ADMIN"
            ? api.get("/booking")
            : api.get("/booking/my-stations"),
          api.get("/vehicle"),
          api.get("/station"),
          api.get("/admin/user"),
        ]);
      } else {
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
=======
        // ADMIN & STAFF: lấy tất cả booking hoặc booking của trạm phụ trách
        const url = role === "ADMIN" ? "/booking" : "/booking/my-stations";
        bookingRes = await Promise.race([
          api.get(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Booking API timeout")), 25000)
          ),
        ]).catch((err) => {
          console.warn("Booking API timeout or failed:", err);
          return { data: [] };
        });
      } else {
        // DRIVER: chỉ lấy booking của chính mình
        bookingRes = await Promise.race([
          api.get("/booking/my-bookings"),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Booking API timeout")), 25000)
          ),
        ]).catch((err) => {
          console.warn("Booking API timeout or failed:", err);
          return { data: [] };
        });
      }

      // ✅ Xử lý dữ liệu
      const processData = (res) => {
        if (Array.isArray(res?.data)) return res.data;
        if (res?.data?.data && Array.isArray(res.data.data))
          return res.data.data;
        return [];
      };

      const bookings = processData(bookingRes);
      setData(bookings);
>>>>>>> d9d6f98 (sua api booking)
    } catch (error) {
      handleApiError(error, "");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (initialized.current === false) {
      initialized.current = true;
      fetchData();
    }
  }, [fetchData]);

<<<<<<< HEAD
  // 📖 Map ID sang tên
  const driverName = (id) =>
    users.find((u) => u.id === id)?.fullName || `${id}`;
  const vehicleName = (id) =>
    vehicles.find((v) => v.id === id)?.model || `${id}`;
  const stationName = (id) =>
    stations.find((s) => s.id === id)?.name || `${id}`;

  // 🔍 Tìm kiếm
  const filteredData = useMemo(() => {
=======
  // 📖 Map ID sang tên - ✅ OPTIMIZATION: Sử dụng Map thay vì find() để tăng tốc độ
  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u.fullName));
    return map;
  }, [users]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach((v) => map.set(v.id, v.model));
    return map;
  }, [vehicles]);

  const stationMap = useMemo(() => {
    const map = new Map();
    stations.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [stations]);

  const driverName = (id) => userMap.get(id) || `${id}`;
  const vehicleName = (id) => vehicleMap.get(id) || `${id}`;
  const stationName = (id) => stationMap.get(id) || `${id}`;

  // 🔍 Tìm kiếm - ✅ OPTIMIZATION: Giới hạn số lần render
  const filteredData = useMemo(() => {
    if (!search) return data;

    const searchLower = search.toLowerCase();
>>>>>>> d9d6f98 (sua api booking)
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

  // 1. Xử lý Hủy Booking cho ADMIN/STAFF
  const handleOpenCancelModal = (record) => {
    setCancellingBooking(record);
    setIsCancelModalVisible(true);
    cancelForm.resetFields();
  };

  // 2. Xử lý xác nhận Hủy Booking cho ADMIN/STAFF
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
  // 3. ✅ Xử lý Hủy Booking cho DRIVER (Gửi API trực tiếp)
  const handleDriverCancel = (record) => {
    Modal.confirm({

      title: "Xác nhận hủy đặt lịch",
      content: "Bạn có chắc chắn muốn hủy đặt lịch này không?",
      okText: "Hủy",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await api.patch(`/booking/my-bookings/${record.id}/cancel`);

          // Cập nhật state local
          setData((prev) =>
            prev.map((item) =>
              item.id === record.id ? { ...item, status: "CANCELLED" } : item
            )
          );
          message.success("Đã hủy đặt lịch thành công!");
        } catch (error) {
          handleApiError(error, "Hủy đặt lịch (Driver)");
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
      title: "Tài xế",

      dataIndex: "driverName",
      key: "driverName",
      sorter: (a, b) => a.driverName - b.driverName,
      defaultSortOrder: "descend",     
    },
    {
      title: "Xe",
      dataIndex: "vehicleModel",
      key: "vehicleModel",
      sorter: (a, b) => a.vehicleModel - b.vehicleModel,
      defaultSortOrder: "descend",  
    },
    {
      title: "Trạm",
      dataIndex: "stationName",
      key: "stationName",
      sorter: (a, b) => a.stationName - b.stationName,
      defaultSortOrder: "descend",
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
                type="primary"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleOpenCancelModal(record)}
              >
                Hủy
              </Button>
            )}

          {role === "DRIVER" && record.status === "CONFIRMED" && (
            <Button
              type="primary"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleDriverCancel(record)}
            >
              Hủy
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
//driver dùng api: PATCH/api/booking/my-bookings/{id}/cancel để hủy booking, staff/admin dùng api: DELETE/api/booking/staff/{id}/cancel. driver bấm nút hủy
