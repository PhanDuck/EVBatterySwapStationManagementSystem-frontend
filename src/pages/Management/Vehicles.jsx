import React, { useState, useEffect, useMemo } from "react";
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
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Option } = Select;

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 📌 Fetch all vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await api.get("/vehicle");
        setVehicles(res.data || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách phương tiện");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const columns = [
    {
      title: "Vehicle ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Space>
          <CarOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "License Plate",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Make / Model",
      key: "makeModel",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <strong>{record.make}</strong> {record.model}
          </span>
        </Space>
      ),
    },
    {
      title: "Battery Type",
      dataIndex: "vin",
      key: "vin",
    },
    {
      title: "Owner",
      key: "owner",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>{record.ownerName}</span>
          <span style={{ color: "#666" }}>{record.ownerPhone}</span>
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
          Maintenance: "orange",
          Inactive: "red",
          Suspended: "volcano",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
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
          <Button
            type="primary"
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

  //  CREATE or UPDATE
  const handleSubmit = async (values) => {
    try {
      if (editingVehicle) {
        // PUT update
        await api.put(`/vehicle/${editingVehicle.id}`, values);
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === editingVehicle.id ? { ...v, ...values } : v
          )
        );
        message.success("Cập nhật phương tiện thành công!");
      } else {
        // POST create
        const res = await api.post("/vehicle", values);
        setVehicles((prev) => [...prev, res.data]);
        message.success("Thêm phương tiện thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error("Vehicle submit error:", err);
      message.error("Không thể lưu thông tin phương tiện!");
    }
  };

  // 🟠 DELETE
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xóa phương tiện này?",
      content: "Hành động này không thể hoàn tác.",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/vehicle/${id}`);
          setVehicles((prev) => prev.filter((v) => v.id !== id));
          message.success("Đã xóa phương tiện!");
        } catch (err) {
          console.error(err);
          message.error("Không thể xóa phương tiện!");
        }
      },
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalVisible(true);
    form.setFieldsValue(vehicle);
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const filteredData = useMemo(() => {
    return vehicles.filter((v) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !v.model?.toLowerCase().includes(q) &&
          !v.licensePlate?.toLowerCase().includes(q) &&
          !v.ownerName?.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vehicles, searchText, statusFilter]);

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Vehicle Management"
        extra={
          <Space>
            <Input
              placeholder="Search by model, plate, or owner"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Maintenance">Maintenance</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Register Vehicle
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} vehicles`,
          }}
        />
      </Card>

      <Modal
        title={editingVehicle ? "Edit Vehicle" : "Register New Vehicle"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="licensePlate"
            label="License Plate"
            rules={[{ required: true, message: "Please input license plate!" }]}
          >
            <Input placeholder="Enter license plate" />
          </Form.Item>

          <Form.Item
            name="make"
            label="Make"
            rules={[{ required: true, message: "Please input make!" }]}
          >
            <Input placeholder="Tesla, BYD, NIO" />
          </Form.Item>

          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: "Please input model!" }]}
          >
            <Input placeholder="Model 3, Tang EV" />
          </Form.Item>

          <Form.Item
            name="batteryType"
            label="Battery Type"
            rules={[{ required: true, message: "Please select battery type!" }]}
          >
            <Select placeholder="Select battery type">
              <Option value="Tesla Battery">Tesla Battery</Option>
              <Option value="BYD Blade">BYD Blade</Option>
              <Option value="CATL NCM">CATL NCM</Option>
              <Option value="LFP Battery">LFP Battery</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="ownerName"
            label="Owner Name"
            rules={[{ required: true, message: "Please input owner name!" }]}
          >
            <Input placeholder="Enter owner name" />
          </Form.Item>

          <Form.Item
            name="ownerPhone"
            label="Owner Phone"
            rules={[{ required: true, message: "Please input phone number!" }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status!" }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Maintenance">Maintenance</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Suspended">Suspended</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVehicle ? "Update" : "Register"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehiclePage;
