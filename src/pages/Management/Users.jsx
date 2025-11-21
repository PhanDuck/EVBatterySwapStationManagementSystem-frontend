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
  Spin,
} from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;

export default function AccountPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  // Gọi API thật
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/user"); // <-- đúng path thật
        // normalize id field (api may return _id)
        const list = (res.data || [])
          .map((u) => ({ ...u, id: u.id ?? u._id }))
          .filter((u) => u.status?.toLowerCase() !== "deleted")
          .sort((a, b) => b.id - a.id); // Sắp xếp theo ID giảm dần
        setAccounts(list);
      } catch (error) {
        showToast(
          "error",
          error.response?.data || "Lỗi tải danh sách người dùng"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  // creation UI/flow removed — modal is editing-only and opened from Edit buttons

  const handleEdit = (record) => {
    // normalize id for editing record
    setEditingAccount({ ...record, id: record.id ?? record._id });
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa người dùng này?",
      okType: "danger",
      onOk: async () => {
        try {
          setDeletingId(id);
          await api.delete(`/admin/user/${id}`);
          setAccounts((prev) => prev.filter((u) => (u.id ?? u._id) !== id));
          showToast("success", "Đã xóa thành công!");
        } catch (error) {
          showToast("error", error.response?.data || "Lỗi khi xóa người dùng");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleSubmit = async () => {
    // Validate form fields using Ant Form API before calling the API
    try {
      const validValues = await form.validateFields();
      // sanitize / normalize
      const payload = {
        fullName: String(validValues.fullName).trim(),
        email: String(validValues.email).trim().toLowerCase(),
        phoneNumber: String(validValues.phoneNumber).trim(),
        role: validValues.role,
        status: validValues.status,
      };

      // basic duplicate checks (client-side): email or phone already in table (excluding editing row)
      const editingId = editingAccount
        ? editingAccount.id ?? editingAccount._id
        : null;
      const dup = accounts.find((a) => {
        const aid = a.id ?? a._id;
        if (editingId && aid === editingId) return false;
        return (
          (a.email || "").toLowerCase() === payload.email ||
          (a.phoneNumber || "") === payload.phoneNumber
        );
      });
      if (dup) {
        showToast("error", "Email hoặc số điện thoại đã tồn tại.");
        return;
      }

      // creation is disabled — only allow updates
      if (!editingAccount) {
        showToast("error", "Tạo người dùng mới đã bị vô hiệu hóa.");
        return;
      }

      setSubmitting(true);
      const id = editingAccount.id ?? editingAccount._id;
      const res = await api.put(`/admin/user/${id}`, payload);
      const updated = { ...res.data, id: res.data.id ?? res.data._id };
      setAccounts((prev) =>
        prev.map((a) => ((a.id ?? a._id) === id ? updated : a))
      );
      showToast("success", "Cập nhật thành công!");
      setIsModalVisible(false);

      form.resetFields();
      setEditingAccount(null);
    } catch (error) {
      // form.validateFields throws if validation fails
      if (error.errorFields) {
        // validation errors from Ant Form
        return;
      }
      console.error(
        "Error creating/updating user:",
        error.response?.data || error.message
      );
      if (error?.response?.status === 401) {
        try {
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
        } catch {
          /* ignore storage errors */
        }
        showToast("error", "Unauthorized — vui lòng đăng nhập lại");
      } else {
        showToast(
          error.response?.data?.message || "Không thể cập nhật người dùng"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id, // Thêm sorter cho cột ID
    },
    {
      title: "Tên đầy đủ",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const color =
          role === "ADMIN"
            ? "red"
            : role === "STAFF"
            ? "blue"
            : role === "DRIVER"
            ? "green"
            : "default";
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      render: (_, record) => {
        const id = record.id ?? record._id;
        return (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              disabled={submitting || deletingId === id}
            >
              Sửa
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(id)}
              loading={deletingId === id}
              disabled={submitting || deletingId}
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý người dùng"
        extra={
          <Input.Search
            placeholder="Tìm theo tên, Email hoặc SĐT"
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            value={search}
          />
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={accounts.filter((a) => {
              if (!search) return true;
              const q = search.toLowerCase();
              const name = (a.fullName || "").toLowerCase();
              const email = (a.email || "").toLowerCase();
              const phone = (a.phoneNumber || "").toLowerCase();
              return name.includes(q) || email.includes(q) || phone.includes(q);
            })}
            rowKey={(record) => record.id ?? record._id}
            pagination={{
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trên tổng ${total} người`,
            }}
          />
        </Spin>
      </Card>

      <Modal
        title={"Chỉnh sửa người dùng"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Chọn vai trò!" }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="ADMIN">ADMIN</Option>
              <Option value="STAFF">STAFF</Option>
              <Option value="DRIVER">DRIVER</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
