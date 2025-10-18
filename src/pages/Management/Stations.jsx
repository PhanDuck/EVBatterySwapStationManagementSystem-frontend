import React, { useState, useEffect, useMemo } from "react";
import { Card, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Statistic, Row, Col, message, } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, ThunderboltOutlined, CarOutlined, } from "@ant-design/icons";
import api from "../../config/axios"; // <-- import API config

const { Option } = Select;

const StationPage = () => {
  const [stations, setStations] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ---------------------------
  // 🚀 1. FETCH ALL STATIONS
  // ---------------------------
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get("/station");
      setStations(res.data);
    } catch (err) {
      message.error("Failed to fetch stations");
      console.error(err);
    }
  };

  // ---------------------------
  // 🚀 2. CREATE / UPDATE STATION
  // ---------------------------
  const handleSubmit = async (values) => {
    try {
      if (editingStation) {
        // Update
        await api.put(`/station/${editingStation.id}`, values);
        message.success("Station updated successfully");
      } else {
        // Create
        await api.post("/station", values);
        message.success("Station created successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchStations(); // Refresh list
    } catch (err) {
      message.error("Failed to save station");
      console.error(err);
    }
  };

  // ---------------------------
  // 🚀 3. DELETE STATION
  // ---------------------------
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this station?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await api.delete(`/station/${id}`);
          message.success("Station deleted successfully");
          fetchStations();
        } catch (err) {
          message.error("Failed to delete station");
          console.error(err);
        }
      },
    });
  };

  // ---------------------------
  // Form handlers
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
            <strong>{record.availableSlots}</strong>
            {capacity} slots
          </span>
          <div
            style={{
              width: "100px",
              height: "6px",
              backgroundColor: "#f0f0f0",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${capacity * 100}%`,
                height: "100%",
                backgroundColor:
                  record.availableSlots > capacity * 0.5
                    ? "#52c41a"
                    : record.availableSlots > capacity * 0.2
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
          Active: "green",
          Maintenance: "orange",
          Inactive: "red",
          "Under Construction": "blue",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "Daily Stats",
      key: "stats",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <CarOutlined /> {record.dailySwaps || 0} swaps
          </span>
          <span>
            <ThunderboltOutlined /> ${record.revenue?.toFixed(2) || 0}
          </span>
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
            Delete
          </Button>
        </Space>
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
        const name = (s.name || "").toString().toLowerCase();
        const address = (s.location || s.address || "").toString().toLowerCase();
        const manager = (s.manager || "").toString().toLowerCase();
        if (!name.includes(q) && !address.includes(q) && !manager.includes(q))
          return false;
      }
      return true;
    });
  }, [stations, searchText, statusFilter]);

  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.status === "Active").length;
  const totalCapacity = stations.reduce((sum, s) => sum + (s.capacity || 0), 0);
  const totalAvailableSlots = stations.reduce(
    (sum, s) => sum + (s.availableSlots || 0),
    0
  );
  const totalDailySwaps = stations.reduce(
    (sum, s) => sum + (s.dailySwaps || 0),
    0
  );
  const totalRevenue = stations.reduce((sum, s) => sum + (s.revenue || 0), 0);

  // ---------------------------
  // JSX Render
  // ---------------------------
  return (
    <div style={{ padding: "24px" }}>
      {/* Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Total Stations"
              value={totalStations}
              prefix={<EnvironmentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Active Stations"
              value={activeStations}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Total Capacity"
              value={totalCapacity}
              suffix="slots"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Available Slots"
              value={totalAvailableSlots}
              valueStyle={{
                color:
                  totalAvailableSlots > totalCapacity * 0.5
                    ? "#3f8600"
                    : "#cf1322",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Daily Swaps"
              value={totalDailySwaps}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Daily Revenue"
              value={totalRevenue}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        title="Station Management"
        extra={
          <Space>
            <Input
              placeholder="Search name, address or manager"
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
              <Option value="Active">Active</Option>
              <Option value="Maintenance">Maintenance</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Under Construction">Under Construction</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Station
            </Button>
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
          <Form.Item
            name="name" 
            label="Station Name"
            rules={[{ required: true, message: "Please input station name!" }]}
          >
            <Input placeholder="Enter station name" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Address"
            rules={[{ required: true, message: "Please input address!" }]}
          >
            <Input.TextArea placeholder="Enter station address" rows={3} />
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
              label="Capacity (slots)"
              rules={[{ required: true, message: "Please input capacity!" }]}
            >
              <InputNumber
                placeholder="Enter capacity"
                min={1}
                max={100}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="availableSlots"
              label="Available Slots"
              rules={[
                { required: true, message: "Please input available slots!" },
              ]}
            >
              <InputNumber
                placeholder="Enter available slots"
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
                <Option value="Active">Active</Option>
                <Option value="Maintenance">Maintenance</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Under Construction">Under Construction</Option>
              </Select>
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
              name="manager"
              label="Station Manager"
              rules={[
                { required: true, message: "Please input manager name!" },
              ]}
            >
              <Input placeholder="Enter manager name" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Contact Phone"
              rules={[
                { required: true, message: "Please input phone number!" },
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </div>

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
