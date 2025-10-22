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
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  MessageOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Option } = Select;
const { TextArea } = Input;

export default function SupportPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // 🧩 Fetch all tickets
  const fetchData = async () => {
    setLoading(true);
    const Role =  JSON.parse(localStorage.getItem('currentUser')).role;
    const apiPath = Role === "DRIVER" ? "/support-ticket/my-tickets" : "/support-ticket";
    try {
      const res = await api.get(apiPath);
      const list = (res.data || []).map((t) => ({ ...t, key: t.id ?? t._id }));
      setData(list);
    } catch (err) {
      console.error("Fetch tickets error:", err);
      message.error("Không thể tải danh sách ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🧩 Create new ticket
  const handleCreate = async (values) => {
    try {
      await api.post("/support-ticket", values);
      message.success("Tạo ticket mới thành công");
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.error("Create ticket error:", err);
      message.error("Không thể tạo ticket");
    }
  };

  // 🧩 Update existing ticket
  const handleUpdate = async (values) => {
    try {
      await api.put(`/support-ticket/${editingRecord.id}`, values);
      message.success("Cập nhật ticket thành công");
      setIsModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.error("Update ticket error:", err);
      message.error("Không thể cập nhật ticket");
    }
  };

  // 🧩 Submit form (create or update)
  const handleSubmit = async (values) => {
    if (editingRecord) await handleUpdate(values);
    else await handleCreate(values);
  };

  // 🧩 View ticket
  const handleView = (record) => {
    setViewingRecord(record);
    setIsViewModalVisible(true);
  };

  // 🧩 Edit ticket
  const handleReply = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  // 🧩 Table columns
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
      width: 220,
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
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
      width: 120,
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
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
          <Button
            icon={<MessageOutlined />}
            size="small"
            onClick={() => handleReply(record)}
          >
            Reply
          </Button>
        </Space>
      ),
      width: 160,
    },
  ];

  // 🧩 Filter search
  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    const q = searchText.trim().toLowerCase();
    return (
      item.subject?.toLowerCase().includes(q) ||
      item.customerName?.toLowerCase().includes(q) ||
      item.customerEmail?.toLowerCase().includes(q) ||
      item.customerPhone?.toLowerCase().includes(q)
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
                setEditingRecord(null);
                setIsModalVisible(true);
                form.resetFields();
              }}
            >
              Create Ticket
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} tickets`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 🧩 View Modal */}
      <Modal
        title={`Ticket Details - ${viewingRecord?.id}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={<Button onClick={() => setIsViewModalVisible(false)}>Close</Button>}
        width={700}
      >
        {viewingRecord && (
          <div>
            <p>
              <strong>Subject:</strong> {viewingRecord.subject}
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
                {viewingRecord.description}
              </div>
            </p>
            <p>
              <strong>Status:</strong> {viewingRecord.status}
            </p>
            <p>
              <strong>Assigned To:</strong> {viewingRecord.assignedTo}
            </p>
            <p>
              <strong>Created At:</strong> {viewingRecord.createdAt}
            </p>
          </div>
        )}
      </Modal>

      {/* 🧩 Create / Edit Modal */}
      <Modal
        title={editingRecord ? "Update Ticket" : "Create Ticket"}
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
            disabled={!!editingRecord}
          >
            <Input placeholder="Enter ticket subject" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter ticket details" />
          </Form.Item>



          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingRecord ? "Update" : "Create"}
            </Button>
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
