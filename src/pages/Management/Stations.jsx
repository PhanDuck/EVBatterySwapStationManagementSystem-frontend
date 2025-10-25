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
  InputNumber,
  Select,
  Statistic,
  Row,
  Col,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  CarOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { getCurrentRole } from "../../config/auth"; // ✅ import role checker

const { Option } = Select;

const StationPage = () => {
  const [stations, setStations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batteryTypes, setBatteryTypes] = useState([]);
  const Role = JSON.parse(localStorage.getItem('currentUser'))?.role; // Get role directly

  // ---------------------------
  // 🚀 1. FETCH ALL STATIONS & BATTERY TYPES
  // ---------------------------
  useEffect(() => {
    fetchStations();
    fetchBatteryTypes();
  }, []);

  const fetchStations = async () => {
    let apiPath = Role === "ADMIN" ? "/station" : "/staff-station-assignment/my-stations";
    try {
      const res = await api.get(apiPath);
      setStations(res.data.sort((a, b) => b.id - a.id));
    } catch (err) {
      message.error("Failed to fetch stations");
      console.error(err);
    }
  };

  const fetchBatteryTypes = async () => {
    try {
      const res = await api.get("/battery-type");
      setBatteryTypes(res.data);
    } catch (err) {
      message.error("Failed to fetch battery types");
      console.error(err);
    }
  };

  // ---------------------------
  // 🚀 2. CREATE / UPDATE STATION
  // ---------------------------
  const handleSubmit = async (values) => {
    try {
      if (editingStation) {
        await api.put(`/station/${editingStation.id}`, values);
        message.success("Station updated successfully");
      } else {
        await api.post("/station", values);
        message.success("Station created successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchStations();
    } catch (err) {
      message.error("Failed to save station");
      console.error(err);
    }
  };

  // ---------------------------
  // 🚀 3. DELETE STATION (Hard Delete)
  // ---------------------------
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Bạn có chắc là xóa trạm này?",
      content: "Hành động này sẽ xóa vỉnh viễn trạm.",
      okText: "Có, Xóa",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          // Calling the correct DELETE API endpoint
          await api.delete(`/station/${id}`);
          message.success("Trạm được xóa thành công");
          // Refresh the station list after deletion
          fetchStations();
        } catch (err) {
          message.error("Thất bại khi xóa trạm");
          console.error(err);
        }
      },
    });
  };

  // ---------------------------
  // Handlers
  // ---------------------------
  const handleAdd = () => {
    setEditingStation(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setIsModalVisible(true);
    form.setFieldsValue(station);
  };

  // ---------------------------
  // Columns
  // ---------------------------
  const columns = [
    {
      title: "Station ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "Station Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "location",
      key: "location",
      width: 340,
      render: (text) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {text}
        </div>
      ),
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (capacity, record) => (
        <Space direction="vertical" size="small">
          <span>
            <strong>{record.currentBatteryCount || 0}</strong> / {capacity} slots
          </span>
          <div
            style={{  
              width: "100px",
              height: "6px",
              backgroundColor: "#bec2bf",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(record.currentBatteryCount / capacity) * 100}%`,
                height: "100%",
                backgroundColor:
                  record.currentBatteryCount > capacity * 0.5
                    ? "#52c41a"
                    : record.currentBatteryCount > capacity * 0.2
                    ? "#faad14"
                    : "#ff4d4f",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          ACTIVE: "green",
          MAINTENANCE: "orange",
          INACTIVE: "red",
          "UNDER CONSTRUCTION": "blue",
        };
        return <Tag color={colorMap[status?.toUpperCase()] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Contact Info",
      dataIndex: "contactInfo",
      key: "contactInfo",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        Role === "ADMIN" ? ( // Corrected role check from "Admin" to "ADMIN"
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
              Delete
            </Button>
          </Space>
        ) : (
          <Tag color="default">View Only</Tag>
        ),
    },
  ];

  // ---------------------------
  // Filters + Summary
  // ---------------------------
  const filteredStations = useMemo(() => {
    const q = searchText?.trim().toLowerCase();
    return stations.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q) {
        const name = (s.name || "").toLowerCase();
        const address = (s.location || "").toLowerCase();
        if (!name.includes(q) && !address.includes(q)) return false;
      }
      return true;
    });
  }, [stations, searchText, statusFilter]);

  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.status === "ACTIVE").length;
  const totalCapacity = stations.reduce((sum, s) => sum + (s.capacity || 0), 0);

  // ---------------------------
  // JSX Render
  // ---------------------------
  return (
    <div style={{ padding: "24px" }}>
      {/* Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Total Stations"
              value={totalStations}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Active Stations"
              value={activeStations}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic title="Total Capacity" value={totalCapacity} suffix="slots" />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        title="Station Management"
        extra={
          <Space>
            <Input
              placeholder="Search by name or address"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              value={searchText}
            />
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 180 }}
            >
              <Option value="all">All status</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="MAINTENANCE">Maintenance</Option>
              <Option value="INACTIVE">Inactive</Option>
              <Option value="UNDER CONSTRUCTION">Under Construction</Option>
            </Select>
            {Role === "ADMIN" && ( // Corrected role check from "Admin" to "ADMIN"
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Station
              </Button>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredStations}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} stations`,
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={editingStation ? "Edit Station" : "Add New Station"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Station Name"
                rules={[{ required: true, message: "Please input station name!" }]}
              >
                <Input placeholder="Enter station name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Address"
                rules={[{ required: true, message: "Please input address!" }]}
              >
                <Input placeholder="Enter station address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: "Please input city!" }]}
              >
                <Input placeholder="e.g. TP.HCM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: "Please input district!" }]}
              >
                <Input placeholder="e.g. Quận 7" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="latitude"
                label="Latitude"
                rules={[{ required: true, message: "Please input latitude!" }]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="e.g. 10.7300" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="longitude"
                label="Longitude"
                rules={[{ required: true, message: "Please input longitude!" }]}
              >
                <InputNumber style={{ width: "100%" }} placeholder="e.g. 106.7000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Capacity (slots)"
                rules={[{ required: true, message: "Please input capacity!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactInfo"
                label="Contact Phone"
                rules={[{ required: true, message: "Please input phone number!" }]}
              >
                <Input placeholder="Enter contact phone" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="batteryTypeId"
                label="Battery Type"
                rules={[{ required: true, message: "Please select a battery type!" }]}
              >
                <Select placeholder="Select a battery type">
                  {batteryTypes.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name} (Voltage: {type.voltage}, Capacity: {type.capacityAh}Ah)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {editingStation && (
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status!" }]}
                >
                  <Select placeholder="Select status">
                    <Option value="ACTIVE">Active</Option>
                    <Option value="MAINTENANCE">Maintenance</Option>
                    <Option value="INACTIVE">Inactive</Option>
                    <Option value="UNDER CONSTRUCTION">Under Construction</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStation ? "Update" : "Create"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StationPage;