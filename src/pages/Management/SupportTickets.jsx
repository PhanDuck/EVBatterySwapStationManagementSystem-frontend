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
  Select,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  MessageOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { TextArea } = Input;
const { Option } = Select;

export default function SupportPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [responses, setResponses] = useState([]);
  const [loadingReply, setLoadingReply] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [stationList, setStationList] = useState([]);

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

      const tickets = (ticketRes.data || [])
        .map((t) => {
          const user = users.find(
            (u) => u.id === t.customerId || u.id === t.createdBy
          );
          return {
            ...t,
            key: t.id ?? t._id,
            user: user || null,
          };
        })
        .sort((a, b) => b.id - a.id); // Sắp xếp theo ID giảm dần

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
  }, [role]);

  const fetchStations = async () => {
    try {
      const res = await api.get("/station");
      setStationList(res.data || []);
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  useEffect(() => {
    if (role === "DRIVER") {
      fetchStations();
    }
  }, [role]);

  const handleCreateTicket = async (values) => {
    setLoadingCreate(true);
    try {
      const payload = {
        subject: values.subject,
        description: values.description,
        stationId: values.stationId, // ✅ gửi stationId
      };

      await api.post("/support-ticket", payload);
      message.success("🎫 Ticket created successfully!");
      setIsCreateModalVisible(false);
      form.resetFields();
      fetchData(); // ✅ load lại danh sách
    } catch (error) {
      console.error("Error creating ticket:", error);
      message.error("❌ Failed to create ticket!");
    } finally {
      setLoadingCreate(false);
    }
  };

  // ✨ Hàm mới để xử lý thay đổi status
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      // Gọi API để cập nhật status
      await api.patch(`/support-ticket/${ticketId}/status`, null, {
        params: { status: newStatus },
      });

      // Cập nhật lại state của data để UI thay đổi ngay lập tức
      setData((prevData) =>
        prevData.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );

      message.success(`Ticket ${ticketId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      message.error("Failed to update status. Please try again.");
    }
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setIsViewModalVisible(true);
    fetchResponses(record.id);
  };
  const fetchResponses = async (ticketId) => {
    try {
      if (role === "DRIVER") {
        // 🚗 DRIVER: Lấy phản hồi qua API /support-ticket/my-tickets
        const res = await api.get("/support-ticket/my-tickets");
        // Tìm đúng ticket theo ID
        const myTicket = res.data?.find((t) => t.id === ticketId);
        // Nếu ticket có trường responses (backend trả về)
        if (myTicket && myTicket.responses) {
          setResponses(myTicket.responses);
        } else {
          setResponses([]);
        }
      } else {
        // 👨‍💼 ADMIN / STAFF: Lấy phản hồi qua API riêng
        const res = await api.get(`/ticket-response/ticket/${ticketId}`);
        setResponses(res.data || []);
      }
    } catch (error) {
      console.error("Error loading reply history:", error);
      message.error("Không thể tải phản hồi!");
      setResponses([]);
    }
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
      console.error(error);
    } finally {
      setLoadingReply(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id, // Thêm sorter cho cột ID
      render: (text) => (
        <Space>
          <MessageOutlined />
          <strong>{text}</strong>
        </Space>
      ),
      width: 120,
    },
    {
      title: "Tiêu đề",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (subject) => <strong>{subject}</strong>,
      width: 150,
    },
    {
      title: "Khách hàng",
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
      width: 120,
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 220,
      render: (status, record) => {
        // Nếu là DRIVER, chỉ hiển thị Tag
        if (role === "DRIVER") {
          const color =
            status === "RESOLVED"
              ? "green"
              : status === "IN_PROGRESS"
              ? "blue"
              : "orange";
          return <Tag color={color}>{status}</Tag>;
        }

        // Nếu là ADMIN/STAFF, hiển thị Select
        return (
          <Select
            defaultValue={status}
            style={{ width: 120 }}
            onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
            bordered={false}
          >
            <Option value="OPEN">
              <Tag color="orange">OPEN</Tag>
            </Option>
            <Option value="IN_PROGRESS">
              <Tag color="blue">IN_PROGRESS</Tag>
            </Option>
            <Option value="RESOLVED">
              <Tag color="green">RESOLVED</Tag>
            </Option>
          </Select>
        );
      },
    },
    {
      title: "Trạm",
      dataIndex: "stationName",
      key: "stationName",
      render: (stationName) => stationName || "—",
      width: 150,
    },
    {
      title: "Thao tác",
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
        </Space>
      ),
      width: 160,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Quản lí hỗ trợ"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm tiêu đề hoặc tên khách hàng"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            {role === "DRIVER" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalVisible(true)}
              >
                Thêm hỗ trợ
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Tải lại
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            showTotal: (total, range) =>
            `${range[0]}-${range[1]} trên tổng ${total} hỗ trợ`,
          }}
        />
      </Card>

      {/* View Ticket Modal */}
      {/* 🧩 View Modal */}
      <Modal
        title={`Ticket Details - #${viewingRecord?.id || ""}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={
          <Button onClick={() => setIsViewModalVisible(false)}>Close</Button>
        }
        width={700}
      >
        {viewingRecord ? (
          <>
            {/* Ticket Info */}
            <div style={{ marginBottom: "12px" }}>
              <p>
                <strong>Subject:</strong> {viewingRecord.subject || "—"}
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
                  {viewingRecord.description || "Không có mô tả."}
                </div>
              </div>

              <p>
                <strong>Status:</strong>{" "}
                <Tag
                  color={viewingRecord.status === "OPEN" ? "orange" : "green"}
                >
                  {viewingRecord.status}
                </Tag>
              </p>
              <p>
                <strong>Assigned To:</strong>{" "}
                {viewingRecord.assignedTo || "Unassigned"}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {viewingRecord.createdAt
                  ? new Date(viewingRecord.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>

            {/* Reply History */}
            <div style={{ marginTop: "20px" }}>
              <strong>Reply History:</strong>
              {responses.length === 0 ? (
                <p style={{ marginTop: "8px" }}>Chưa có phản hồi nào.</p>
              ) : (
                <div
                  style={{
                    maxHeight: "220px",
                    overflowY: "auto",
                    paddingRight: "5px",
                    background: "#fdfdfd",
                    border: "1px solid #eee",
                    borderRadius: "6px",
                    marginTop: "8px",
                  }}
                >
                  {responses.map((res, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <p style={{ marginBottom: 4 }}>
                        <strong>
                          {res.staffName || res.driverName || "Unknown User"}
                        </strong>
                      </p>
                      <p style={{ marginBottom: 4 }}>{res.message}</p>
                      <small style={{ color: "#888" }}>
                        {new Date(res.responseTime).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Box — Only Admin/Staff */}
            {(role === "ADMIN" || role === "STAFF") && (
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
          </>
        ) : (
          <p>Loading ticket details...</p>
        )}
      </Modal>
      {/* 🧾 Create Ticket Modal — chỉ dành cho DRIVER */}
      <Modal
        title="Create Support Ticket"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleCreateTicket}
          form={form}
          style={{ marginTop: "10px" }}
        >
          {/* 🏙️ Thêm chọn trạm */}
          <Form.Item label="Trạm" name="stationId">
            <Select placeholder="Select your station">
              {stationList.map((station) => (
                <Option key={station.id} value={station.id}>
                  {station.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Tiêu đề"
            name="subject"
            rules={[
              { required: true, message: "Please enter the ticket subject!" },
            ]}
          >
            <Input placeholder="Enter ticket subject" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[
              { required: true, message: "Please enter ticket details!" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describe your issue or question..."
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: "10px" }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Quay lại
              </Button>
              <Button type="primary" htmlType="submit" loading={loadingCreate}>
                Gửi yêu cầu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
