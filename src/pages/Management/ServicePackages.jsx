import React, { useState, useEffect } from "react";
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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../config/axios";


  export default function ServicePackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();

  // 🟢 Lấy danh sách gói dịch vụ
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/service-package");
      setPackages(res.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải service packages:", err);
      message.error("Không thể tải danh sách gói dịch vụ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // 🟡 Thêm / sửa
  const handleSubmit = async (values) => {
  try {
    setLoading(true);

    if (editingPackage) {
      // 🟡 Cập nhật
      await api.put(`/service-package/${editingPackage.id}`, values);
      message.success("Cập nhật gói dịch vụ thành công!");
    } else {
      // 🟢 Tạo mới
      await api.post("/service-package", values);
      message.success("Tạo gói dịch vụ thành công!");
    }

    setIsModalVisible(false);
    form.resetFields();

    // 🔄 Tải lại danh sách
    const res = await api.get("/service-package");
    setPackages(res.data || []);
  } catch (err) {
    console.error("❌ Lỗi khi lưu gói dịch vụ:", err);
    message.error("Không thể lưu gói dịch vụ. Vui lòng thử lại!");
  } finally {
    setLoading(false);
  }
};

// 🟡 Khi bấm nút "Sửa"
const handleEdit = (record) => {
  setEditingPackage(record);
  form.setFieldsValue({
    name: record.name,
    description: record.description,
    price: record.price,
    duration: record.duration,
    maxSwaps: record.maxSwaps,
  });
  setIsModalVisible(true);
};

// 🔴 Khi bấm nút "Xóa"
const handleDelete = async (id) => {
  Modal.confirm({
    title: "Xác nhận xóa",
    content: "Bạn có chắc chắn muốn xóa gói dịch vụ này không?",
    okText: "Xóa",
    okType: "danger",
    cancelText: "Hủy",
    async onOk() {
      try {
        setLoading(true);
        await api.delete(`/service-package/${id}`);
        message.success("Đã xóa gói dịch vụ thành công!");
        const res = await api.get("/service-package");
        setPackages(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi xóa:", err);
        message.error("Không thể xóa gói dịch vụ!");
      } finally {
        setLoading(false);
      }
    },
  });
};

  // 📊 Cột hiển thị
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "Tên gói dịch vụ",
      dataIndex: "name",
      width: 200,
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      width: 150,
      render: (value) => value?.toLocaleString("vi-VN") || "—",
    },
    {
      title: "Thời hạn",
      dataIndex: "duration",
      width: 150,
      render: (_, record) => (
        <span>
          {record.maxSwaps} lần / {record.duration} ngày
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 500,
      ellipsis: false,
      render: (text) => (
        <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý Gói Dịch Vụ"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingPackage(null);
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            Thêm mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={packages}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingPackage ? "Chỉnh sửa gói dịch vụ" : "Tạo mới gói dịch vụ"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: "",
            description: "",
            price: "",
            duration: "",
            maxSwaps: "",
          }}
        >
          <Form.Item
            name="name"
            label="Tên gói"
            rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
          >
            <Input placeholder="Nhập tên gói dịch vụ" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1000}
              step={1000}
              placeholder="Nhập giá gói (vd: 200000)"
            />
          </Form.Item>

          <Form.Item label="Thời hạn gói (x lần / x ngày)">
            <Input.Group compact>
              <Form.Item
                name="maxSwaps"
                noStyle
                rules={[{ required: true, message: "Nhập số lần đổi" }]}
              >
                <InputNumber
                  min={1}
                  placeholder="Số lần đổi"
                  style={{ width: "50%" }}
                />
              </Form.Item>
              <Form.Item
                name="duration"
                noStyle
                rules={[{ required: true, message: "Nhập số ngày hiệu lực" }]}
              >
                <InputNumber
                  min={1}
                  placeholder="Số ngày hiệu lực"
                  style={{ width: "50%" }}
                />
              </Form.Item>
            </Input.Group>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              Ví dụ: 15 lần / 30 ngày
            </div>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả gói dịch vụ"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingPackage ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
