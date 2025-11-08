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
  EditOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import handleApiError from "../../Utils/handleApiError";
import { getCurrentUser } from "../../config/auth";

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
  const [isEditStatusModalVisible, setIsEditStatusModalVisible] =
    useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatusForm] = Form.useForm();

  const currentUser = getCurrentUser() || {};
  const role = currentUser?.role;

  // Fetch tickets + users
  const fetchData = async () => {
    setLoading(true);
    try {
      const ticketAPI =
        role === "DRIVER" ? "/support-ticket/my-tickets" : "/support-ticket";

      // Nếu là DRIVER, không cần gọi API user vì đã có trong localStorage
      // Nếu là ADMIN/STAFF, gọi API để lấy danh sách users
      const apiCalls = [api.get(ticketAPI)];
      if (role !== "DRIVER") {
        apiCalls.push(api.get("/admin/user"));
      }

      const [ticketRes, userRes] = await Promise.all(apiCalls);

      const users =
        role === "DRIVER"
          ? [currentUser]
          : Array.isArray(userRes?.data)
          ? userRes.data
          : [];

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
    } catch (error) {
      handleApiError(error, "danh sách hỗ trợ");
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
      handleApiError(error, "danh sách trạm");
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
        stationId: values.stationId,
      };

      await api.post("/support-ticket", payload);
      message.success("🎫 Ticket created successfully!");
      setIsCreateModalVisible(false);
      form.resetFields();
      fetchData(); // ✅ load lại danh sách
    } catch (error) {
      handleApiError(error, "tạo vé hỗ trợ");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleEditStatusClick = (record) => {
    setEditingRecord(record);
    editStatusForm.setFieldsValue({ status: record.status });
    setIsEditStatusModalVisible(true);
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

      message.success(
        `Trạng thái của yêu cầu ${ticketId} cập nhật thành ${newStatus}`
      );
      setIsEditStatusModalVisible(false);
    } catch (error) {
      handleApiError(error, "cập nhật trạng thái vé");
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
      handleApiError(error, "lịch sử phản hồi");
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
      form.resetFields(["message"]); // Clear the reply box
      // Optional: Update status to IN_PROGRESS when replying
      if (viewingRecord.status === "OPEN") {
        await handleStatusChange(viewingRecord.id, "IN_PROGRESS");
      }
    } catch (error) {
      handleApiError(error, "gửi phản hồi");
    } finally {
      setLoadingReply(false);
    }
  };

  const handleEditStatusSubmit = async (values) => {
    if (!editingRecord) return; // Kiểm tra an toàn

    const { status: newStatus } = values;
    const ticketId = editingRecord.id; // Lấy ID từ state

    // Gọi hàm lõi với đủ 2 tham số
    await handleStatusChange(ticketId, newStatus);
  };

  const getStatusTag = (status) => {
    const color =
      status === "RESOLVED"
        ? "green"
        : status === "IN_PROGRESS"
        ? "blue"
        : "orange";
    return <Tag color={color}>{status}</Tag>;
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
      render: (status) => getStatusTag(status),
      // render: (status, record) => {
      //   // Nếu là DRIVER, chỉ hiển thị Tag
      //   if (role === "DRIVER") {
      //     const color =
      //       status === "RESOLVED"
      //         ? "green"
      //         : status === "IN_PROGRESS"
      //         ? "blue"
      //         : "orange";
      //     return <Tag color={color}>{status}</Tag>;
      //   }

      //   // Nếu là ADMIN/STAFF, hiển thị Select
      //   return (
      //     <Select
      //       defaultValue={status}
      //       style={{ width: 120 }}
      //       onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
      //       bordered={false}
      //     >
      //       <Option value="OPEN">
      //         <Tag color="orange">OPEN</Tag>
      //       </Option>
      //       <Option value="IN_PROGRESS">
      //         <Tag color="blue">IN_PROGRESS</Tag>
      //       </Option>
      //       <Option value="RESOLVED">
      //         <Tag color="green">RESOLVED</Tag>
      //       </Option>
      //     </Select>
      //   );
      // },
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
      fixed: "right",
      render: (_, record) => (
        <Space>
          {(role === "ADMIN" || role === "STAFF") && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditStatusClick(record)}
            >
              Cập nhật trạng thái
            </Button>
          )}
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          >
            Xem
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
                Yêu cầu hỗ trợ
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
          dataSource={data.filter(
            (t) =>
              t.subject?.toLowerCase().includes(searchText.toLowerCase()) ||
              t.driverName?.toLowerCase().includes(searchText.toLowerCase())
          )}
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
        title={`Chi tiết yêu cầu - #${viewingRecord?.id || ""}`}
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
                <strong>Tiêu đề:</strong> {viewingRecord.subject || "—"}
              </p>
              <div style={{ marginBottom: "8px" }}>
                <strong>Mô tả:</strong>
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
                <strong>Trạng thái:</strong>{" "}
                <Tag
                  color={viewingRecord.status === "OPEN" ? "orange" : "green"}
                >
                  {viewingRecord.status}
                </Tag>
              </p>
              <p>
                <strong>Giao cho:</strong>{" "}
                {viewingRecord.assignedTo || "Chưa giao"}
              </p>
              <p>
                <strong>Tạo lúc:</strong>{" "}
                {viewingRecord.createdAt
                  ? new Date(viewingRecord.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>

            {/* Reply History */}
            <div style={{ marginTop: "20px" }}>
              <strong>Lịch sử phản hồi:</strong>
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
                    rules={[{ required: true, message: "Hãy nhập phản hồi!" }]}
                  >
                    <Input.TextArea rows={3} placeholder="Nhập phản hồi..." />
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
        title="Tạo yêu cầu hỗ trợ"
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
            <Select placeholder="Chọn trạm">
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
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề yêu cầu" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập chi tiết!" }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..."
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
      <Modal
        title={`Cập nhật trạng thái - #${editingRecord?.id || ""}`}
        open={isEditStatusModalVisible}
        onCancel={() => setIsEditStatusModalVisible(false)}
        onOk={() => editStatusForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={loadingReply} // Reuse loading state for simplicity
      >
        <Form
          form={editStatusForm}
          layout="vertical"
          onFinish={handleEditStatusSubmit}
          style={{ marginTop: "10px" }}
        >
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[
              { required: true, message: "Vui lòng chọn trạng thái mới!" },
            ]}
          >
            <Select placeholder="Chọn trạng thái mới">
              <Option value="OPEN">{getStatusTag("OPEN")}</Option>
              <Option value="IN_PROGRESS">{getStatusTag("IN_PROGRESS")}</Option>
              <Option value="RESOLVED">{getStatusTag("RESOLVED")}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
