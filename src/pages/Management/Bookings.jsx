import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  Spin,
} from "antd";
import { PlusOutlined, CloseCircleOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
import handleApiError from "../../Utils/handleApiError";
import { getCurrentUser } from "../../config/auth";
import { showToast } from "../../Utils/toastHandler";

const { TextArea } = Input;

export default function BookingsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelForm] = Form.useForm();

  // 🧩 User hiện tại - lấy từ localStorage
  const user = getCurrentUser() || {};
  const role = user?.role;
  const navigate = useNavigate();
  const initialized = useRef(false);

  // 🟢 Fetch dữ liệu ban đầu
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let bookingRes;

      if (role === "ADMIN" || role === "STAFF") {
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

  // 🔍 Tìm kiếm - Tìm kiếm trực tiếp trên dữ liệu từ API
  const filteredData = useMemo(() => {
    if (!search) return data;

    const searchLower = search.toLowerCase();
    return data.filter(
      (item) =>
        item.driverName?.toLowerCase().includes(searchLower) ||
        item.vehicleModel?.toLowerCase().includes(searchLower) ||
        item.vehiclePlateNumber?.toLowerCase().includes(searchLower) ||
        item.stationName?.toLowerCase().includes(searchLower)
    );
  }, [data, search]);

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
          item.id === bookingId
            ? { ...item, status: "CANCELLED", confirmationCode: null }
            : item
        )
      );

      showToast("success", "Đã hủy booking thành công!");

      setIsCancelModalVisible(false);
      setCancellingBooking(null);
    } catch (error) {
      showToast(
        "error",
        error.response?.data || "Hủy booking thất bại, vui lòng thử lại!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 3. ✅ Xử lý Hủy Booking cho DRIVER (Gửi API trực tiếp)
  const handleDriverCancel = (record) => {
    Modal.confirm({
      title: "Xác nhận hủy đặt lịch",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn hủy đặt lịch này không?</p>
          <p style={{ color: "red", fontWeight: "bold" }}>
            Lưu ý! Bạn không thể hủy sau 2 giờ kể từ khi đặt lịch.
          </p>
        </div>
      ),
      okText: "Hủy",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await api.patch(`/booking/my-bookings/${record.id}/cancel`);
          // Cập nhật state local
          setData((prev) =>
            prev.map((item) =>
              item.id === record.id
                ? { ...item, status: "CANCELLED", confirmationCode: null }
                : item
            )
          );
          showToast("success", "Đã hủy đặt lịch thành công!");
        } catch (error) {
          showToast(
            "error",
            error.response?.data || "Hủy đặt lịch thất bại, vui lòng thử lại!"
          );
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
      width: 60,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: "descend",
    },
    {
      title: "Tài xế",
      dataIndex: "driverName",
      key: "driverName",
      sorter: (a, b) => (a.driverName || "").localeCompare(b.driverName || ""),
    },
    {
      title: "Điện thoại",
      dataIndex: "driverPhone",
      key: "driverPhone",
      render: (phone) => <span>{phone}</span>,
    },
    {
      title: "Xe",
      dataIndex: "vehicleModel",
      key: "vehicleModel",
      sorter: (a, b) => (a.vehicleModel || "").localeCompare(b.vehicleModel),
    },
    {
      title: "Biển số",
      dataIndex: "vehiclePlateNumber",
      key: "vehiclePlateNumber",
      render: (plate) => <span>{plate}</span>,
    },
    {
      title: "Trạm",
      dataIndex: "stationName",
      key: "stationName",
      sorter: (a, b) =>
        (a.stationName || "").localeCompare(b.stationName || ""),
    },
    {
      title: "Pin cũ",
      dataIndex: "swapOutBatteryModel",
      key: "swapOutBatteryModel",
      render: (model) => <span>{model}</span>,
    },
    {
      title: "Pin mới",
      dataIndex: "swapInBatteryModel",
      key: "swapInBatteryModel",
      render: (model) => <span>{model}</span>,
    },
    {
      title: "Thời gian đặt",
      dataIndex: "bookingTime",
      key: "bookingTime",
      sorter: (a, b) =>
        dayjs(a.bookingTime).unix() - dayjs(b.bookingTime).unix(),
      render: (t) => (t ? dayjs(t).format("DD/MM/YYYY HH:mm") : "N/A"),
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
    // Mã xác nhận (Chỉ hiển thị cho ADMIN và DRIVER)
    ...(role === "ADMIN" || role === "DRIVER"
      ? [
          {
            title: "Mã xác nhận",
            dataIndex: "confirmationCode",
            key: "confirmationCode",
            render: (code) => <span>{code}</span>,
          },
        ]
      : []),
    // Cột Thao tác (Chỉ hiển thị cho ADMIN và STAFF)
    ...(role === "ADMIN" || role === "STAFF"
      ? [
          {
            title: "Thao tác",
            key: "actions",
            width: 120,
            render: (_, record) => (
              <Space>
                {record.status === "CONFIRMED" && (
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleOpenCancelModal(record)}
                  >
                    Hủy
                  </Button>
                )}
              </Space>
            ),
          },
        ]
      : []),
    // Cột Thao tác cho DRIVER
    ...(role === "DRIVER"
      ? [
          {
            title: "Thao tác",
            key: "actions",
            width: 120,
            render: (_, record) => (
              <Space>
                {(record.status === "PENDING" ||
                  record.status === "CONFIRMED") && (
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleDriverCancel(record)}
                  >
                    Hủy
                  </Button>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý đặt lịch của tài xế"
        extra={
          <Space>
            <Input
              placeholder="Tìm tài xế / xe / biển số / trạm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
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
              pageSize: 10,
            }}
            scroll={{ x: 1200 }}
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
