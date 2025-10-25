import React, { useEffect, useState, useMemo } from "react";
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
import dayjs from "dayjs"; // Import dayjs

const { Option } = Select;

export default function DriverSubscriptionManagement() {
  const [data, setData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Removed editingRecord state (edit function removed)
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

      setData(
        (Array.isArray(subscriptionRes?.data) ? subscriptionRes.data : []).sort(
          (a, b) => b.id - a.id
        ) // Sắp xếp ID giảm dần
      );
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
    setIsModalVisible(true);
  };

  // Removed openEdit (edit function removed)

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

  // ➕ Chỉ tạo mới subscription
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
      const res = await api.post("/driver-subscription", payload);
      const newSub = res.data ?? { ...payload, id: `DS-${Date.now()}` };
      setData((prev) => [newSub, ...prev]);
      message.success("Tạo subscription thành công!");
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
      title: "Package",
      dataIndex: "packageId",
      key: "packageId",
      render: (id) => packageName(id),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
    },
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

    </div>
  );
}