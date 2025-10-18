import React, { useState, useEffect } from "react";
import { Card, Table, Button, Space, Tag, Modal, Form, Select, DatePicker, Statistic, Row, Col, message, } from "antd";
import  {PlusOutlined, EditOutlined, StopOutlined, PlayCircleOutlined, GiftOutlined, DeleteOutlined, } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../config/axios";  

const { Option } = Select;

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [form] = Form.useForm();

  // 🟢 Fetch all subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const res = await api.get("/subscription");
        const list = (res.data || []).map((item) => ({
          ...item,
          id: item.id ?? item._id,
        }));
        setSubscriptions(list);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách subscription!");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  // 🟡 Create or Update
  const handleSubmit = async (values) => {
    const processed = {
      ...values,
      startDate: values.startDate.format("YYYY-MM-DD"),
      endDate: values.endDate.format("YYYY-MM-DD"),
      nextBilling: values.nextBilling
        ? values.nextBilling.format("YYYY-MM-DD")
        : null,
    };

    try {
      if (editingSubscription) {
        await api.put(`/admin/subscription/${editingSubscription.id}`, processed);
        setSubscriptions((prev) =>
          prev.map((s) =>
            s.id === editingSubscription.id ? { ...s, ...processed } : s
          )
        );
        message.success("Cập nhật subscription thành công!");
      } else {
        const res = await api.post("/admin/subscription", processed);
        const newSub = res.data || processed;
        setSubscriptions((prev) => [...prev, newSub]);
        message.success("Tạo subscription mới thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Lưu subscription thất bại!");
    }
  };

  // 🔴 Delete
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa subscription này?",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/admin/subscription/${id}`);
          setSubscriptions((prev) => prev.filter((s) => s.id !== id));
          message.success("Đã xóa subscription!");
        } catch (err) {
          console.error(err);
          message.error("Không thể xóa subscription!");
        }
      },
    });
  };

  // 🟠 Suspend & Reactivate
  const handleSuspend = async (id) => {
    try {
      await api.put(`/admin/subscription/${id}`, { status: "Suspended" });
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "Suspended", nextBilling: null } : s
        )
      );
      message.success("Đã tạm ngưng subscription!");
    } catch (err) {
      message.error("Không thể tạm ngưng!");
    }
  };

  const handleReactivate = async (id) => {
    try {
      await api.put(`/admin/subscription/${id}`, { status: "Active" });
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "Active",
                nextBilling: dayjs().add(1, "month").format("YYYY-MM-DD"),
              }
            : s
        )
      );
      message.success("Đã kích hoạt lại subscription!");
    } catch (err) {
      message.error("Không thể kích hoạt lại!");
    }
  };

  const handleEdit = (record) => {
    setEditingSubscription(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      nextBilling: record.nextBilling ? dayjs(record.nextBilling) : null,
    });
  };

  // 🧮 Statistics
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "Active"
  ).length;
  const monthlyRevenue = subscriptions
    .filter((s) => s.status === "Active")
    .reduce((sum, s) => sum + (s.monthlyPrice || 0), 0);
  const averageUsage =
    subscriptions
      .filter((s) => s.status === "Active" && s.swapsLimit > 0)
      .reduce(
        (sum, s, _, arr) =>
          sum + (s.swapsUsed / s.swapsLimit) / arr.length || 0,
        0
      ) * 100;

  const columns = [
    {
      title: "Subscription ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Space>
          <GiftOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <strong>{record.customerName}</strong>
          <span style={{ color: "#666", fontSize: "12px" }}>
            {record.customerEmail}
          </span>
        </Space>
      ),
    },
    {
      title: "Package",
      key: "package",
      render: (_, r) => (
        <Space direction="vertical" size="small">
          <strong>{r.packageName}</strong>
          <span style={{ color: "#666", fontSize: "12px" }}>
            ${r.monthlyPrice}/month
          </span>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Active: "green",
          Suspended: "orange",
          Expired: "red",
          Cancelled: "default",
          Pending: "blue",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Period",
      key: "period",
      render: (_, r) => (
        <>
          <div style={{ fontSize: 12 }}>
            {r.startDate} → {r.endDate}
          </div>
          {r.nextBilling && (
            <div style={{ color: "#1890ff", fontSize: 12 }}>
              Next: {r.nextBilling}
            </div>
          )}
        </>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {record.status === "Active" ? (
            <Button
              icon={<StopOutlined />}
              size="small"
              onClick={() => handleSuspend(record.id)}
            >
              Suspend
            </Button>
          ) : (
            <Button
              icon={<PlayCircleOutlined />}
              type="default"
              size="small"
              onClick={() => handleReactivate(record.id)}
            >
              Reactivate
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Subscriptions" value={totalSubscriptions} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Subscriptions"
              value={activeSubscriptions}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={monthlyRevenue}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Usage"
              value={averageUsage || 0}
              precision={1}
              suffix="%"
              valueStyle={{
                color: averageUsage > 70 ? "#3f8600" : "#cf1322",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        title="Subscription Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSubscription(null);
              setIsModalVisible(true);
              form.resetFields();
            }}
          >
            Create
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          editingSubscription ? "Edit Subscription" : "Create Subscription"
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Suspended">Suspended</Option>
              <Option value="Expired">Expired</Option>
              <Option value="Cancelled">Cancelled</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="autoRenewal"
            label="Auto Renewal"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="nextBilling" label="Next Billing">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSubscription ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;
