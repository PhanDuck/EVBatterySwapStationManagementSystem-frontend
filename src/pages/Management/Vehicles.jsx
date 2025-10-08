import React, { useState } from "react";
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
  ThunderboltOutlined, // thay cho BatteryOutlined
} from "@ant-design/icons";

const { Option } = Select;

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([
    {
      id: "VH001",
      licensePlate: "ABC-123",
      make: "Tesla",
      model: "Model 3",
      year: 2023,
      batteryType: "Tesla Battery",
      currentBattery: "BAT001",
      ownerName: "John Doe",
      ownerPhone: "+1-555-1234",
      status: "Active",
      lastSwap: "2024-03-15",
      totalSwaps: 45,
    },
    {
      id: "VH002",
      licensePlate: "XYZ-789",
      make: "BYD",
      model: "Tang EV",
      year: 2022,
      batteryType: "BYD Blade",
      currentBattery: "BAT002",
      ownerName: "Jane Smith",
      ownerPhone: "+1-555-5678",
      status: "Active",
      lastSwap: "2024-03-14",
      totalSwaps: 32,
    },
    {
      id: "VH003",
      licensePlate: "DEF-456",
      make: "NIO",
      model: "ES8",
      year: 2023,
      batteryType: "CATL NCM",
      currentBattery: "None",
      ownerName: "Mike Johnson",
      ownerPhone: "+1-555-9012",
      status: "Maintenance",
      lastSwap: "2024-03-10",
      totalSwaps: 18,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();

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
      dataIndex: "licensePlate",
      key: "licensePlate",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Vehicle Info",
      key: "vehicleInfo",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <strong>
              {record.make} {record.model}
            </strong>
          </span>
          <span style={{ color: "#666" }}>Year: {record.year}</span>
        </Space>
      ),
    },
    {
      title: "Battery Info",
      key: "batteryInfo",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>{record.batteryType}</span>
          <Space>
            <ThunderboltOutlined />
            <span
              style={{
                color: record.currentBattery === "None" ? "#ff4d4f" : "#52c41a",
              }}
            >
              {record.currentBattery}
            </span>
          </Space>
        </Space>
      ),
    },
    {
      title: "Owner Info",
      key: "ownerInfo",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <strong>{record.ownerName}</strong>
          </span>
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
      title: "Swap Stats",
      key: "swapStats",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>Total: {record.totalSwaps}</span>
          <span style={{ color: "#666" }}>Last: {record.lastSwap}</span>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
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
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalVisible(true);
    form.setFieldsValue(vehicle);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to remove this vehicle?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
        message.success("Vehicle removed successfully");
      },
    });
  };

  const handleSubmit = (values) => {
    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.id === editingVehicle.id ? { ...vehicle, ...values } : vehicle
        )
      );
      message.success("Vehicle updated successfully");
    } else {
      // Add new vehicle
      const newVehicle = {
        ...values,
        id: `VH${String(
          Math.max(...vehicles.map((v) => parseInt(v.id.slice(2)))) + 1
        ).padStart(3, "0")}`,
        lastSwap: "Never",
        totalSwaps: 0,
      };
      setVehicles([...vehicles, newVehicle]);
      message.success("Vehicle registered successfully");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Vehicle Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Register Vehicle
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={vehicles}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
            }}
          >
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
              name="year"
              label="Year"
              rules={[{ required: true, message: "Please input year!" }]}
            >
              <Input placeholder="2023" />
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item
              name="batteryType"
              label="Battery Type"
              rules={[
                { required: true, message: "Please select battery type!" },
              ]}
            >
              <Select placeholder="Select battery type">
                <Option value="Tesla Battery">Tesla Battery</Option>
                <Option value="BYD Blade">BYD Blade</Option>
                <Option value="CATL NCM">CATL NCM</Option>
                <Option value="LFP Battery">LFP Battery</Option>
              </Select>
            </Form.Item>

            <Form.Item name="currentBattery" label="Current Battery">
              <Input placeholder="BAT001 or None" />
            </Form.Item>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
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
              rules={[
                { required: true, message: "Please input phone number!" },
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </div>

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