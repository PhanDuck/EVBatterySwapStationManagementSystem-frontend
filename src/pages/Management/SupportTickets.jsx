import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  MessageOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { TextArea } = Input;

export default function SupportPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [responses, setResponses] = useState([]);
  const [loadingReply, setLoadingReply] = useState(false);
  const userRole = JSON.parse(localStorage.getItem("currentUser"))?.role;

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const role = currentUser?.role;

  // Fetch tickets + users
  const fetchData = async () => {
    setLoading(true);
    try {
      const ticketAPI =
        role === "DRIVER" ? "/support-ticket/my-tickets" : "/support-ticket";
      const userAPI = role === "DRIVER" ? "/Current" : "/admin/user";

      const [ticketRes, userRes] = await Promise.all([
        api.get(ticketAPI),
        api.get(userAPI),
      ]);

      const users = Array.isArray(userRes.data) ? userRes.data : [userRes.data];

      const tickets = (ticketRes.data || []).map((t) => {
        const user = users.find(
          (u) => u.id === t.customerId || u.id === t.createdBy
        );
        return {
          ...t,
          key: t.id ?? t._id,
          user: user || null,
        };
      });

      setData(tickets);
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

  const handleView = (record) => {
    setViewingRecord(record);
    setIsViewModalVisible(true);
    fetchResponses(record.id);
  };

  const handleReply = async (values) => {
    setLoadingReply(true);
    try {
      await api.post(`/ticket-response`, {
        ticketId: viewingRecord.id,
        message: values.message,
      });
      message.success("✅ Reply sent!");
      fetchResponses(viewingRecord.id); // refresh list
    } catch (error) {
      message.error("❌ Failed to send reply");
    } finally {
      setLoadingReply(false);
    }
  };
  const fetchResponses = async (ticketId) => {
    try {
      const res = await api.get(`/ticket-response/ticket/${ticketId}`);
      setResponses(res.data || []);
    } catch (error) {
      console.error("Error loading reply history:", error);
    }
  };

  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Space>
          <MessageOutlined />
          <strong>{text}</strong>
        </Space>
      ),
      width: 120,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (subject) => <strong>{subject}</strong>,
      width: 200,
    },
    {
      title: "Customer Info",
      key: "customer",
      render: (_, record) => {
        const { driverName, driverEmail } = record || {};
        return (
          <Space direction="vertical" size="small">
            <strong>{driverName || "No name"}</strong>
            <span style={{ color: "#666", fontSize: "12px" }}>
              {driverEmail || "No email"}
            </span>
          </Space>
        );
      },
      width: 220,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const color =
          s === "RESOLVED"
            ? "green"
            : s === "IN_PROGRESS"
            ? "blue"
            : s === "OPEN"
            ? "orange"
            : "red";
        return <Tag color={color}>{s}</Tag>;
      },
      width: 120,
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (assignedTo) => assignedTo || "Unassigned",
      width: 150,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          >
            View
          </Button>
          {role == "DRIVER" && (
            <Button
              icon={<MessageOutlined />}
              size="small"
              onClick={() => handleReply(record)}
            >
              Reply
            </Button>
          )}
        </Space>
      ),
      width: 160,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Support Tickets"
        extra={
          <Space>
            <Input
              placeholder="Search subject, customer"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            {role === "DRIVER" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingRecord(null);
                  setIsModalVisible(true);
                  form.resetFields();
                }}
              >
                Create Ticket
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
        />
      </Card>

      {/* View Ticket Modal */}
      {/* 🧩 View Modal */}
      <Modal
        title={`Ticket Details - ${viewingRecord?.id}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={
          <Button onClick={() => setIsViewModalVisible(false)}>Close</Button>
        }
        width={700}
      >
        {viewingRecord && (
          <div>
            {/* Ticket Info */}
            <p>
              <strong>Subject:</strong> {viewingRecord.subject}
            </p>
            <div style={{ marginBottom: "8px" }}>
              <strong>Description:</strong>
              <div
                style={{
                  background: "#fafafa",
                  padding: "12px",
                  borderRadius: "6px",
                  marginTop: "6px",
                }}
              >
                {viewingRecord.description}
              </div>
            </div>

            <p>
              <strong>Status:</strong> {viewingRecord.status}
            </p>
            <p>
              <strong>Assigned To:</strong>{" "}
              {viewingRecord.assignedTo || "Not assigned"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(viewingRecord.createdAt).toLocaleString()}
            </p>

            {/* Response History */}
            <div style={{ marginTop: "20px" }}>
              <strong>Reply History:</strong>
              {responses.length === 0 ? (
                <p> Chưa có phản hồi nào.</p>
              ) : (
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    paddingRight: "5px",
                  }}
                >
                  {responses.map((res, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <p>
                        <strong>{res.staffName}</strong>
                      </p>
                      <p>{res.message}</p>
                      <small>
                        {new Date(res.responseTime).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Box (Only Admin / Staff) */}
            {(userRole === "ADMIN" || userRole === "STAFF") && (
              <div style={{ marginTop: "20px" }}>
                <Form onFinish={handleReply}>
                  <Form.Item
                    name="message"
                    rules={[
                      { required: true, message: "Please enter a reply!" },
                    ]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Enter your reply..."
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loadingReply}
                  >
                    Send Reply
                  </Button>
                </Form>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
