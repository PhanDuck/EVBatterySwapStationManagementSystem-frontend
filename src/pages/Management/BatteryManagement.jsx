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
import handleApiError from "../../Utils/handleApiError";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;
const { TextArea } = Input;

export default function BatteryManagement() {
  const [batteries, setBatteries] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBattery, setEditingBattery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [batteryTypes, setBatteryTypes] = useState([]);
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [form] = Form.useForm();
  const [typeForm] = Form.useForm();

  const user = JSON.parse(
    localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")
  );
  const role = user?.role;
  const stationId = user?.stationId;

  // 🟢 Fetch data (Battery + Type + Station)
  const fetchAllData = async () => {
    setLoading(true);
    setLoadingTypes(true);
    try {
      let batteryRes;

      if (role === "ADMIN") {
        batteryRes = await api.get("/battery");
      } else if (role === "STAFF" && stationId) {
        batteryRes = await api.get(`/battery?stationId=${stationId}`);
      } else {
        showToast("warning", "Bạn không có quyền xem trang này!");
        return;
      }

      const typeRes = await api
        .get("/battery-type")
        .catch(() => ({ data: [] }));
      const typeData = typeRes?.data || [];
      setBatteryTypes(typeData.sort((a, b) => b.id - a.id)); // Lưu loại pin

      // 🔁 Map battery type name + station name
      const mapped = (batteryRes?.data || []).map((b) => ({
        ...b,
        key: b.id, // Thêm key
      }));
      setBatteries(mapped.sort((a, b) => b.id - a.id)); // Sắp xếp theo ID giảm dần
    } catch (error) {
      const message = error.response?.data || "Tải dữ liệu thất bại, vui lòng thử lại!";
      showToast("error", message);
    } finally {
      setLoading(false);
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [role, stationId]);

  // 🟡 Submit (Create / Update)
  const handleSubmit = async (values) => {
    const data = {
      ...values,
      usageCount: editingBattery ? values.usageCount ?? 0 : 0,
      manufactureDate: values.manufactureDate?.format("YYYY-MM-DD"),
      lastMaintenanceDate: values.lastMaintenanceDate?.format("YYYY-MM-DD"),
    };

    try {
      if (editingBattery) {

        res = await api.put(`/battery/${editingBattery.id}`, data);
        showToast("success", "Cập nhật pin thành công!");
        fetchAllData();
        // setBatteries((prev) =>
        //   prev.map((b) => (b.id === editingBattery.id ? { ...b, ...data } : b))
        // );
      } else {
        res = await api.post("/battery", data);
        showToast("success", "Thêm pin mới thành công!");
        fetchAllData();
        // setBatteries((prev) => [...prev, res.data]);

      }
      fetchAllData();

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      const message = error.response?.data || "Lưu thông tin pin thất bại, vui lòng thử lại!";
      showToast("error", message);
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
          showToast("success", "Đã xóa thành công!");
        } catch (error) {
          const message = error.response?.data || "Xóa pin thất bại, vui lòng thử lại!";
          showToast("error", message);
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

  // 🟡 Submit (Create / Update Type) - POST/PUT /api/battery-type
  const handleTypeSubmit = async (values) => {
    const data = {
      ...values,
      voltage: parseFloat(values.voltage),
      capacity: parseFloat(values.capacity),
      weight: parseFloat(values.weight),
    };

    try {
      if (editingType) {
        // Cập nhật (PUT /api/battery-type/{id})
        await api.put(`/battery-type/${editingType.id}`, data);

        showToast("success", "Cập nhật loại pin thành công!");
        // Cập nhật lại list loại pin

        setBatteryTypes((prev) =>
          prev.map((t) => (t.id === editingType.id ? { ...t, ...data } : t))
        );
      } else {
        const res = await api.post("/battery-type", data);

        showToast("success", "Thêm loại pin mới thành công!");
        // Thêm bản ghi mới vào đầu danh sách
        setBatteryTypes((prev) => [res.data, ...prev]);
      }
      // Sau khi thêm/sửa, refresh cả bảng Pin thường để cập nhật tên Loại Pin nếu cần
      fetchAllData();
      setIsTypeModalVisible(false);
      typeForm.resetFields();
    } catch (error) {
      const message = error.response?.data || "Lưu thông tin loại pin thất bại, vui lòng thử lại!";
      showToast("error", message);
    }
  };

  // ✏️ Sửa Loại Pin
  const handleTypeEdit = (record) => {
    setEditingType(record);
    setIsTypeModalVisible(true);
    // Gán giá trị vào form.
    typeForm.setFieldsValue({
      ...record,
      // Chuyển các giá trị số về String để InputNumber hiển thị chính xác
      voltage: String(record.voltage || 0),
      capacity: String(record.capacity || 0),
      weight: String(record.weight || 0),
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
        return <Tag color={parseFloat(v) >= 70 ? "green" : "orange"}>{v}</Tag>;
      },
    },
    { title: "Trạm hiện tại", dataIndex: "stationName", width: 200 },
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
      render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : ""),
      sorter: (a, b) =>
        dayjs(a.manufactureDate).unix() - dayjs(b.manufactureDate).unix(),
    },
    {
      title: "Bảo trì lần cuối",
      dataIndex: "lastMaintenanceDate",
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : ""),
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

  const batteryTypeColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: "descend",
    },
    { title: "Tên loại pin", dataIndex: "name", key: "name", width: 180 },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 250,
      render: (text) => (
        <span
          style={{
            display: "block",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Điện áp (V)",
      dataIndex: "voltage",
      key: "voltage",
      width: 120,
    },
    {
      title: "Dung lượng (Ah)",
      dataIndex: "capacity",
      key: "capacity",
      width: 150,
    },
    {
      title: "Khối lượng (kg)",
      dataIndex: "weight",
      key: "weight",
      width: 150,
    },
    {
      title: "Kích thước (cm)",
      dataIndex: "dimensions",
      key: "dimensions",
      width: 150,
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleTypeEdit(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  // 🔍 Lọc dữ liệu Pin thường
  const filteredBatteries = batteries.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.model?.toLowerCase().includes(q) ||
      b.batteryTypeName?.toLowerCase().includes(q) ||
      b.stationName?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    );
  });

  // 🔍 Lọc dữ liệu Loại Pin
  const filteredTypes = batteryTypes.filter((t) => {
    if (!typeSearch) return true;
    const q = typeSearch.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.dimensions?.toLowerCase().includes(q) ||
      t.id.toString().includes(q)
    );
  });

  return (
    <div style={{ padding: 24 }}>
      {/* BẢNG QUẢN LÝ PIN */}
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
                Thêm
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

      {/* Khoảng cách giữa hai bảng */}
      <div style={{ margin: "40px 0" }} />

      {/* BẢNG QUẢN LÝ LOẠI PIN */}
      <Card
        title="Quản lý Loại Pin"
        extra={
          <Space>
            <Input
              placeholder="Tìm theo tên / mô tả / kích thước"
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingType(null);
                typeForm.resetFields();
                setIsTypeModalVisible(true);
              }}
            >
              Tạo mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={batteryTypeColumns}
          dataSource={filteredTypes}
          rowKey="id"
          loading={loadingTypes}
          pagination={{
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trên tổng ${total} loại pin`,
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
            rules={[
              { required: true, message: "Vui lòng nhập tình trạng pin" },
            ]}
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

      <Modal
        title={editingType ? "Chỉnh sửa Loại Pin" : "Thêm mới Loại Pin"}
        open={isTypeModalVisible}
        onCancel={() => setIsTypeModalVisible(false)}
        footer={null}
      >
        <Form form={typeForm} layout="vertical" onFinish={handleTypeSubmit}>
          <Form.Item
            name="name"
            label="Tên loại pin"
            rules={[{ required: true, message: "Vui lòng nhập tên loại pin" }]}
          >
            <Input placeholder="Ví dụ: Standard 48V-20Ah" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={2} placeholder="Mô tả chi tiết về loại pin" />
          </Form.Item>
          <Form.Item
            name="voltage"
            label="Điện áp (V)"
            rules={[{ required: true, message: "Vui lòng nhập điện áp" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} addonAfter="V" />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Dung lượng (Ah)"
            rules={[{ required: true, message: "Vui lòng nhập dung lượng" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} addonAfter="Ah" />
          </Form.Item>
          <Form.Item
            name="weight"
            label="Khối lượng (kg)"
            rules={[{ required: true, message: "Vui lòng nhập khối lượng" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} addonAfter="kg" />
          </Form.Item>
          <Form.Item
            name="dimensions"
            label="Kích thước (cm)"
            rules={[{ required: true, message: "Vui lòng nhập kích thước" }]}
          >
            <Input placeholder="Ví dụ: 30x15x10 cm" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingType ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => setIsTypeModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
