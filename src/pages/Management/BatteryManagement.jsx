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
  Select,
  DatePicker,
  Tag,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../config/axios";

const { Option } = Select;

export default function BatteryManagement() {
  const [batteries, setBatteries] = useState([]);
  const [batteryTypes, setBatteryTypes] = useState([]);
  const [stations, setStations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBattery, setEditingBattery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  const user = JSON.parse(
    localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
  );
  const role = user?.role;
  const stationId = user?.stationId;

  // 🟢 Fetch data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        let batteryRes;

        if (role === "ADMIN") {
          batteryRes = await api.get("/battery");
        } else if (role === "STAFF" && stationId) {
          batteryRes = await api.get(`/battery?stationId=${stationId}`);
        } else {
          message.warning("Bạn không có quyền xem trang này!");
          return;
        }

        const [typeRes, stationRes] = await Promise.all([
          api.get("/battery-type").catch(() => ({ data: [] })),
          api.get("/station").catch(() => ({ data: [] })),
        ]);

        const typeData = typeRes?.data || [];
        const stationData = stationRes?.data || [];

        setBatteryTypes(typeData);
        setStations(stationData);

        // 🔁 Map battery type name + station name
        const mapped = (batteryRes?.data || []).map((b) => ({
          ...b,
          batteryTypeName:
            typeData.find((t) => t.id === b.batteryTypeId)?.name ||
            "Không xác định",
          currentStationName:
            stationData.find((s) => s.id === b.currentStation)?.name ||
            "Không xác định",
        }));
        setBatteries(mapped.sort((a, b) => b.id - a.id)); // Sắp xếp theo ID giảm dần
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        message.error("Không thể tải danh sách pin!");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 🟡 Submit (Create / Update)
  const handleSubmit = async (values) => {
    const data = {
      ...values,
      usageCount: editingBattery ? values.usageCount ?? 0 : 0,
      manufactureDate: values.manufactureDate?.format("YYYY-MM-DD"),
      lastMaintenanceDate: values.lastMaintenanceDate?.format("YYYY-MM-DD"),
    };

    try {
      let res;
      if (editingBattery) {
        res = await api.put(`/battery/${editingBattery.id}`, data);
        message.success("Cập nhật pin thành công!");
        setBatteries((prev) =>
          prev.map((b) => (b.id === editingBattery.id ? { ...b, ...data } : b))
        );
      } else {
        res = await api.post("/battery", data);
        message.success("Thêm pin mới thành công!");
        setBatteries((prev) => [...prev, res.data]);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Không thể lưu thông tin pin!");
    }
  };

  // 🔴 Xóa
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa pin này?",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/battery/${record.id}`);
          setBatteries((prev) => prev.filter((b) => b.id !== record.id));
          message.success("Đã xóa thành công!");
        } catch {
          message.error("Không thể xóa pin này!");
        }
      },
    });
  };

  // ✏️ Sửa
  const handleEdit = (record) => {
    setEditingBattery(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      manufactureDate: record.manufactureDate
        ? dayjs(record.manufactureDate)
        : null,
      lastMaintenanceDate: record.lastMaintenanceDate
        ? dayjs(record.lastMaintenanceDate)
        : null,
    });
  };

  // 📊 Cột bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: "descend",
    },
    { title: "Mẫu pin", dataIndex: "model", width: 150 },
    { title: "Loại pin", dataIndex: "batteryTypeName", width: 150 },
    { title: "Dung lượng (kWh)", dataIndex: "capacity", width: 150 },
    {
      title: "Tình trạng pin (%)",
      dataIndex: "stateOfHealth",
      width: 180,
      render: (v) => {
        return <Tag color={parseFloat(v) >= 70 ? "green" : "orange"}>
                  {v}
                </Tag>;
      },
    },
    { title: "Trạm hiện tại", dataIndex: "currentStationName", width: 200 },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      render: (value) => {
        const color =
          value === "AVAILABLE"
            ? "green"
            : value === "IN_USE"
            ? "blue"
            : value === "MAINTENANCE"
            ? "orange"
            : "red";
        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "manufactureDate",
      width: 160,
      render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—"),
      sorter: (a, b) =>
        dayjs(a.manufactureDate).unix() - dayjs(b.manufactureDate).unix(),
    },
    {
      title: "Bảo trì lần cuối",
      dataIndex: "lastMaintenanceDate",
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—"),
      sorter: (a, b) =>
        dayjs(a.lastMaintenanceDate).unix() -
        dayjs(b.lastMaintenanceDate).unix(),
    },
    { title: "Số lần đã sử dụng", dataIndex: "usageCount", width: 150 },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 160,
      render: (_, record) => {
        const canEdit =
          role === "ADMIN" ||
          (role === "STAFF" && record.currentStation === stationId);

        return (
          <Space>
            {canEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => handleEdit(record)}
              >
                Sửa
              </Button>
            )}
            {role === "ADMIN" && (
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record)}
              >
                Xóa
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý pin"
        extra={
          <Space>
            <Input
              placeholder="Tìm mẫu / loại / trạm / trạng thái"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 300 }}
            />
            {role === "ADMIN" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingBattery(null);
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Thêm mới
              </Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={batteries.filter((b) => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
              b.model?.toLowerCase().includes(q) ||
              b.batteryTypeName?.toLowerCase().includes(q) ||
              b.currentStationName?.toLowerCase().includes(q) ||
              b.status?.toLowerCase().includes(q)
            );
          })}
          rowKey="id"
          loading={loading}
          pagination={{
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trên tổng ${total} pin`,
            }}
          scroll={{ x: 1200 }}
          
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingBattery ? "Chỉnh sửa thông tin Pin" : "Thêm mới Pin"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="model"
            label="Mẫu Pin"
            rules={[{ required: true, message: "Vui lòng nhập mẫu" }]}
          >
            <Input placeholder="Nhập mẫu pin" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Dung lượng (kWh)"
            rules={[{ required: true, message: "Vui lòng nhập dung lượng" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            name="stateOfHealth"
            label="Tình trạng pin (%)"
            rules={[{ required: true, message: "Vui lòng nhập tình trạng pin" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={100} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="AVAILABLE">AVAILABLE</Option>
              <Option value="MAINTENANCE">MAINTENANCE</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="batteryTypeId"
            label="Loại pin"
            rules={[{ required: true, message: "Vui lòng chọn loại pin" }]}
          >
            <Select placeholder="Chọn loại pin">
              {batteryTypes.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* <Form.Item name="currentStation" label="Trạm hiện tại">
            <Select placeholder="Chọn trạm">
              {stations.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item> */}

          <Form.Item
            name="manufactureDate"
            label="Ngày sản xuất"
            rules={[{ required: true, message: "Vui lòng chọn ngày sản xuất" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="lastMaintenanceDate"
            label="Ngày bảo trì gần nhất"
            // rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBattery ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}