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
  Select,
  message,
  Rate,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../config/axios"; // 

const { Option } = Select;
const { TextArea } = Input;

const SupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [form] = Form.useForm();

  // 🧩 Load danh sách tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch helper so Refresh button and other actions can reuse it
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/support-ticket");
      const list = (res.data || []).map((t) => ({ ...t, id: t.id ?? t._id }));
      setTickets(list);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách ticket");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 CREATE + UPDATE
  const handleSubmit = async (values) => {
    try {
      if (editingTicket) {
        // Update
        await api.put(`/support-ticket/${editingTicket.id}`, values);
        message.success("Cập nhật ticket thành công");
      } else {
        // Create
        await api.post("/support-ticket", values);
        message.success("Tạo ticket mới thành công");
      }

      // Refresh list
      const res = await api.get("/support-ticket");
      setTickets(res.data || []);

      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Không thể lưu ticket");
    }
  };

  // 🧩 DELETE
  const handleDelete = async (record) => {
    Modal.confirm({
      title: "Xác nhận xóa ticket",
      content: `Bạn có chắc muốn xóa ticket "${record.subject}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await api.delete(`/support-ticket/${record.id}`);
          message.success("Xóa ticket thành công");
          setTickets(tickets.filter((t) => t.id !== record.id));
        } catch (err) {
          console.error(err);
          message.error("Không thể xóa ticket");
        }
      },
    });
  };

  // 🧩 VIEW
  const handleView = (ticket) => {
    setViewingTicket(ticket);
    setIsViewModalVisible(true);
  };

  // 🧩 EDIT
  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setIsModalVisible(true);
    form.setFieldsValue(ticket);
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
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
      render: (subject) => <strong>{subject}</strong>,
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
          <span style={{ color: "#666", fontSize: "12px" }}>
            {record.customerPhone}
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
          Open: "blue",
          "In Progress": "orange",
          Resolved: "green",
          Closed: "default",
          Pending: "purple",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) =>
        rating ? (
          <Rate disabled defaultValue={rating} style={{ fontSize: "14px" }} />
        ) : (
          "-"
        ),
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
          <Button
            icon={<MessageOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Update
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const filteredTickets = tickets.filter((t) => {
    if (!searchText) return true;
    const q = searchText.trim().toLowerCase();
    const subject = (t.subject || "").toString().toLowerCase();
    const customerName = (t.customerName || "").toString().toLowerCase();
    const customerEmail = (t.customerEmail || "").toString().toLowerCase();
    const customerPhone = (t.customerPhone || "").toString().toLowerCase();
    return (
      subject.includes(q) ||
      customerName.includes(q) ||
      customerEmail.includes(q) ||
      customerPhone.includes(q)
    );
  });

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Support Tickets"
        extra={
          <Space>
            <Input
              placeholder="Search subject, customer or phone"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTicket(null);
                setIsModalVisible(true);
                form.resetFields();
              }}
            >
              Create Ticket
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTickets}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredTickets}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tickets`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      {/* View Ticket Modal */}
      <Modal
        title={`Ticket Details - ${viewingTicket?.id}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {viewingTicket && (
          <div>
            <p>
              <strong>Subject:</strong> {viewingTicket.subject}
            </p>
            <p>
              <strong>Description:</strong>
              <div
                style={{
                  background: "#fafafa",
                  padding: "12px",
                  borderRadius: "6px",
                }}
              >
                {viewingTicket.description}
              </div>
            </p>
            <p>
              <strong>Status:</strong> {viewingTicket.status}
            </p>
            <p>
              <strong>Assigned To:</strong> {viewingTicket.assignedTo}
            </p>
            <p>
              <strong>Created At:</strong> {viewingTicket.createdAt}
            </p>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        title={editingTicket ? "Update Ticket" : "Create Ticket"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Enter ticket subject" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter details" />
          </Form.Item>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Option value="Open">Open</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Resolved">Resolved</Option>
                <Option value="Closed">Closed</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Category field removed per request */}

          <Form.Item name="assignedTo" label="Assign To" rules={[{ required: true }]}>
            <Select>
              <Option value="Support Team">Support Team</Option>
              <Option value="Technical Team">Technical Team</Option>
              <Option value="Billing Team">Billing Team</Option>
              <Option value="Mobile Team">Mobile Team</Option>
              <Option value="Product Team">Product Team</Option>
            </Select>
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit">
              {editingTicket ? "Update" : "Create"}
            </Button>
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default SupportPage;
