import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const ServicePackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [driverSubscriptions, setDriverSubscriptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchPackages();
    fetchDriverSubscriptions();
    fetchAllUsers();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get("/service-package");
      setPackages(res.data);
    } catch (err) {
      message.error("Failed to fetch service packages");
      console.error(err);
    }
  };
  
  const fetchAllUsers = async () => {
    try {
      const res = await api.get("/admin/user");
      setUsers(res.data);
    } catch (err) {
      message.error("Failed to fetch users");
      console.error(err);
    }
  };

  const fetchDriverSubscriptions = async () => {
    try {
      const res = await api.get("/driver-subscription");
      setDriverSubscriptions(res.data);
    } catch (err) {
      message.error("Failed to fetch driver subscriptions");
      console.error(err);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingPackage) {
        await api.put(`/service-package/${editingPackage.id}`, values);
        message.success("Package updated successfully");
      } else {
        await api.post("/service-package", values);
        message.success("Package created successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchPackages();
    } catch (err) {
      message.error("Failed to save package");
      console.error(err);
    }
  };

  const handleDeletePackage = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this package?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await api.delete(`/service-package/${id}`);
          message.success("Package deleted successfully");
          fetchPackages();
        } catch (err) {
          message.error("Failed to delete package");
          console.error(err);
        }
      },
    });
  };
  
  const handleDeleteDriverSubscription = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this subscription?",
      content: "This will permanently remove the driver's subscription.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await api.delete(`/driver-subscription/${id}`);
          message.success("Driver subscription deleted successfully");
          fetchDriverSubscriptions();
        } catch (err) {
          message.error("Failed to delete driver subscription");
          console.error(err);
        }
      },
    });
  };

  const handleAdd = () => {
    setEditingPackage(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setIsModalVisible(true);
    form.setFieldsValue(pkg);
  };

  const packageColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên gói dịch vụ", dataIndex: "name", key: "name" },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      render: (price) =>
        price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Thời hạn",
      dataIndex: "durationDays",
      key: "durationDays",
      render: (days) => `${days} ngày`,
    },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeletePackage(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Create maps for quick lookups
  const userMap = useMemo(() => new Map(users.map(user => [user.id, user.fullName])), [users]);
  const packageMap = useMemo(() => new Map(packages.map(pkg => [pkg.id, pkg.name])), [packages]);

  const subscriptionColumns = [
    { title: "Subscription ID", dataIndex: "id", key: "id" },
    {
      title: "Driver Name",
      dataIndex: "driverId",
      key: "driverName",
      render: (driverId) => userMap.get(driverId) || "Unknown User",
    },
    {
      title: "Package Name",
      dataIndex: "packageId",
      key: "packageName",
      render: (packageId) => packageMap.get(packageId) || "Unknown Package",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "ACTIVE" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => handleDeleteDriverSubscription(record.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const filteredPackages = useMemo(() => {
    const q = searchText?.trim().toLowerCase();
    if (!q) return packages;
    return packages.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [packages, searchText]);

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Quản lý Gói Dịch Vụ"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm gói..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={packageColumns}
          dataSource={filteredPackages}
          rowKey="id"
        />
      </Card>
      
      <Card
        title="Driver Subscriptions"
        style={{ marginTop: '24px' }}
      >
        <Table
          columns={subscriptionColumns}
          dataSource={driverSubscriptions}
          rowKey="id"
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingPackage ? "Chỉnh sửa gói" : "Thêm gói mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên gói dịch vụ"
            rules={[{ required: true, message: "Vui lòng nhập tên gói!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="durationDays"
            label="Thời hạn (ngày)"
            rules={[{ required: true, message: "Vui lòng nhập thời hạn!" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPackage ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServicePackagesPage;