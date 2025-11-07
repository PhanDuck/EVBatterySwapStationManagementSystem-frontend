import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  CloseCircleOutlined 
} from "@ant-design/icons";
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
      let bookingRes, vehicleRes, stationRes, userRes;

      if (role === "ADMIN" || role === "STAFF") {
        // ✅ OPTIMIZATION: Parallel API calls với timeout
        const apiCalls = [
          role === "ADMIN"
            ? api.get("/booking")
            : api.get("/booking/my-stations"),
          api.get("/vehicle"),
          api.get("/station"),
          api.get("/admin/user"),
        ];

        [bookingRes, vehicleRes, stationRes, userRes] = await Promise.all(
          apiCalls.map(call => 
            Promise.race([
              call,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error("API timeout")), 20000)
              )
            ]).catch(err => {
              console.warn("API call timeout or failed:", err);
              return { data: [] };
            })
          )
        );
      } else {
        // ✅ OPTIMIZATION: Driver chỉ tải dữ liệu cần thiết
        // 📌 Tăng timeout cho /booking/my-bookings vì API này chạy lâu
        const bookingCall = Promise.race([
          api.get("/booking/my-bookings"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Booking API timeout")), 25000)
          )
        ]).catch(err => {
          console.warn("Booking API timeout or failed:", err);
          return { data: [] };
        });

        const vehicleCall = Promise.race([
          api.get("/vehicle/my-vehicles"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Vehicle API timeout")), 15000)
          )
        ]).catch(err => {
          console.warn("Vehicle API timeout or failed:", err);
          return { data: [] };
        });

        const stationCall = Promise.race([
          api.get("/station"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Station API timeout")), 15000)
          )
        ]).catch(err => {
          console.warn("Station API timeout or failed:", err);
          return { data: [] };
        });

        [bookingRes, vehicleRes, stationRes] = await Promise.all([
          bookingCall,
          vehicleCall,
          stationCall
        ]);
        userRes = { data: user }; // Sử dụng user từ localStorage
      }

      // ✅ OPTIMIZATION: Xử lý response data an toàn
      const processData = (res) => {
        if (Array.isArray(res?.data)) return res.data;
        if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
        return [];
      };

      setData(processData(bookingRes));
      setVehicles(processData(vehicleRes));
      setStations(processData(stationRes));
      
      const userData = processData(userRes);
      setUsers(userData.length > 0 ? userData : (user ? [user] : []));
    } catch (error) {
      handleApiError(error, "Tải dữ liệu đặt lịch");
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    if (initialized.current === false) {
        initialized.current = true;
        fetchData();
    }
  }, [fetchData]);

  // 📖 Map ID sang tên - ✅ OPTIMIZATION: Sử dụng Map thay vì find() để tăng tốc độ
  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach(u => map.set(u.id, u.fullName));
    return map;
  }, [users]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach(v => map.set(v.id, v.model));
    return map;
  }, [vehicles]);

  const stationMap = useMemo(() => {
    const map = new Map();
    stations.forEach(s => map.set(s.id, s.name));
    return map;
  }, [stations]);

  const driverName = (id) => userMap.get(id) || `${id}`;
  const vehicleName = (id) => vehicleMap.get(id) || `${id}`;
  const stationName = (id) => stationMap.get(id) || `${id}`;

  // 🔍 Tìm kiếm - ✅ OPTIMIZATION: Giới hạn số lần render
  const filteredData = useMemo(() => {
    if (!search) return data;
    
    const searchLower = search.toLowerCase();
    return data.filter(
      (item) =>
        driverName(item.driverId).toLowerCase().includes(searchLower) ||
        vehicleName(item.vehicleId).toLowerCase().includes(searchLower) ||
        stationName(item.stationId).toLowerCase().includes(searchLower)
    );
  }, [data, search, userMap, vehicleMap, stationMap]);

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

  // 🧾 Cột hiển thị - ✅ OPTIMIZATION: Thêm sorter cho tất cả các cột
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
      sorter: (a, b) => driverName(a.driverId).localeCompare(driverName(b.driverId)),
      render: (id) => driverName(id),
    },
    {
      title: "Xe",
      dataIndex: "vehicleId",
      key: "vehicleId",
      sorter: (a, b) => vehicleName(a.vehicleId).localeCompare(vehicleName(b.vehicleId)),
      render: (id) => vehicleName(id),
    },
    {
      title: "Trạm",
      dataIndex: "stationId",
      key: "stationId",
      sorter: (a, b) => stationName(a.stationId).localeCompare(stationName(b.stationId)),
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
      sorter: (a, b) => a.status.localeCompare(b.status),
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