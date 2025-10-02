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
  InputNumber,
  Select,
  Progress,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const BatteryPage = () => {
  const [batteries, setBatteries] = useState([
    {
      id: "BAT001",
      model: "Tesla Model S Battery",
      capacity: 100,
      currentCharge: 85,
      voltage: 400,
      status: "Available",
      health: "Good",
      cycles: 245,
      location: "Station A",
      lastMaintenance: "2024-01-15",
    },
    {
      id: "BAT002",
      model: "BYD Blade Battery",
      capacity: 80,
      currentCharge: 45,
      voltage: 350,
      status: "In Use",
      health: "Excellent",
      cycles: 123,
      location: "Station B",
      lastMaintenance: "2024-02-10",
    },
    {
      id: "BAT003",
      model: "CATL NCM Battery",
      capacity: 75,
      currentCharge: 0,
      voltage: 0,
      status: "Maintenance",
      health: "Poor",
      cycles: 890,
      location: "Workshop",
      lastMaintenance: "2024-03-05",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBattery, setEditingBattery] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: "Battery ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Space>
          <ThunderboltOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity) => `${capacity} kWh`,
    },
    {
      title: "Charge Level",
      dataIndex: "currentCharge",
      key: "currentCharge",
      render: (charge, record) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Progress
            percent={charge}
            size="small"
            status={
              charge < 20 ? "exception" : charge < 50 ? "active" : "success"
            }
          />
          <span>
            {charge}% ({((charge * record.capacity) / 100).toFixed(1)} kWh)
          </span>
        </Space>
      ),
    },
    {
      title: "Voltage",
      dataIndex: "voltage",
      key: "voltage",
      render: (voltage) => (
        <Space>
          <ThunderboltOutlined />
          {voltage} V
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          Available: "green",
          "In Use": "blue",
          Charging: "orange",
          Maintenance: "red",
          Reserved: "purple",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Health",
      dataIndex: "health",
      key: "health",
      render: (health) => {
        const colorMap = {
          Excellent: "green",
          Good: "blue",
          Fair: "orange",
          Poor: "red",
        };
        return <Tag color={colorMap[health]}>{health}</Tag>;
      },
    },
    {
      title: "Cycles",
      dataIndex: "cycles",
      key: "cycles",
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
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
    setEditingBattery(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (battery) => {
    setEditingBattery(battery);
    setIsModalVisible(true);
    form.setFieldsValue(battery);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to remove this battery?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk() {
        setBatteries(batteries.filter((battery) => battery.id !== id));
        message.success("Battery removed successfully");
      },
    });
  };

  const handleSubmit = (values) => {
    if (editingBattery) {
      // Update existing battery
      setBatteries(
        batteries.map((battery) =>
          battery.id === editingBattery.id ? { ...battery, ...values } : battery
        )
      );
      message.success("Battery updated successfully");
    } else {
      // Add new battery
      const newBattery = {
        ...values,
        id: `BAT${String(
          Math.max(...batteries.map((b) => parseInt(b.id.slice(3)))) + 1
        ).padStart(3, "0")}`,
        lastMaintenance: new Date().toISOString().split("T")[0],
      };
      setBatteries([...batteries, newBattery]);
      message.success("Battery added successfully");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Battery Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Battery
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={batteries}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} batteries`,
          }}
        />
      </Card>

      <Modal
        title={editingBattery ? "Edit Battery" : "Add New Battery"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="model"
            label="Battery Model"
            rules={[{ required: true, message: "Please input battery model!" }]}
          >
            <Input placeholder="Enter battery model" />
          </Form.Item>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item
              name="capacity"
              label="Capacity (kWh)"
              rules={[{ required: true, message: "Please input capacity!" }]}
            >
              <InputNumber
                placeholder="Enter capacity"
                min={1}
                max={200}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="currentCharge"
              label="Current Charge (%)"
              rules={[
                { required: true, message: "Please input current charge!" },
              ]}
            >
              <InputNumber
                placeholder="Enter charge level"
                min={0}
                max={100}
                style={{ width: "100%" }}
              />
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
              name="voltage"
              label="Voltage (V)"
              rules={[{ required: true, message: "Please input voltage!" }]}
            >
              <InputNumber
                placeholder="Enter voltage"
                min={0}
                max={1000}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="cycles"
              label="Charge Cycles"
              rules={[{ required: true, message: "Please input cycles!" }]}
            >
              <InputNumber
                placeholder="Enter cycle count"
                min={0}
                style={{ width: "100%" }}
              />
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
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select placeholder="Select status">
                <Option value="Available">Available</Option>
                <Option value="In Use">In Use</Option>
                <Option value="Charging">Charging</Option>
                <Option value="Maintenance">Maintenance</Option>
                <Option value="Reserved">Reserved</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="health"
              label="Health Status"
              rules={[
                { required: true, message: "Please select health status!" },
              ]}
            >
              <Select placeholder="Select health status">
                <Option value="Excellent">Excellent</Option>
                <Option value="Good">Good</Option>
                <Option value="Fair">Fair</Option>
                <Option value="Poor">Poor</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please input location!" }]}
          >
            <Input placeholder="Enter current location" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBattery ? "Update" : "Add"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BatteryPage;
