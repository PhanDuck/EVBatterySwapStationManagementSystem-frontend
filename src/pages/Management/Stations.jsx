import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Statistic, Row, Col, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, ThunderboltOutlined, CarOutlined } from '@ant-design/icons';

const { Option } = Select;

const StationPage = () => {
  const [stations, setStations] = useState([
    {
      id: 'ST001',
      name: 'Downtown Station A',
      address: '123 Main Street, City Center',
      capacity: 20,
      availableSlots: 15,
      operatingHours: '24/7',
      status: 'Active',
      manager: 'John Smith',
      phone: '+1-555-0123',
      batteryCount: 18,
      dailySwaps: 45,
      revenue: 2850.50,
    },
    {
      id: 'ST002',
      name: 'Mall Station B',
      address: '456 Shopping Ave, Mall District',
      capacity: 15,
      availableSlots: 8,
      operatingHours: '06:00 - 22:00',
      status: 'Active',
      manager: 'Sarah Johnson',
      phone: '+1-555-0456',
      batteryCount: 12,
      dailySwaps: 32,
      revenue: 1980.75,
    },
    {
      id: 'ST003',
      name: 'Highway Station C',
      address: '789 Highway 101, Exit 15',
      capacity: 25,
      availableSlots: 0,
      operatingHours: '24/7',
      status: 'Maintenance',
      manager: 'Mike Wilson',
      phone: '+1-555-0789',
      batteryCount: 0,
      dailySwaps: 0,
      revenue: 0,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Station ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <Space>
          <EnvironmentOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Station Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity, record) => (
        <Space direction="vertical" size="small">
          <span><strong>{record.availableSlots}</strong>/{capacity} slots</span>
          <div style={{ 
            width: '100px', 
            height: '6px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div 
              style={{
                width: `${(record.availableSlots / capacity) * 100}%`,
                height: '100%',
                backgroundColor: record.availableSlots > capacity * 0.5 ? '#52c41a' : 
                                record.availableSlots > capacity * 0.2 ? '#faad14' : '#ff4d4f',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </Space>
      ),
    },
    {
      title: 'Operating Hours',
      dataIndex: 'operatingHours',
      key: 'operatingHours',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'Active': 'green',
          'Maintenance': 'orange',
          'Inactive': 'red',
          'Under Construction': 'blue'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Manager',
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: 'Daily Stats',
      key: 'stats',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span><CarOutlined /> {record.dailySwaps} swaps</span>
          <span><ThunderboltOutlined /> ${record.revenue.toFixed(2)}</span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
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

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this station?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setStations(stations.filter(station => station.id !== id));
        message.success('Station deleted successfully');
      },
    });
  };

  const handleSubmit = (values) => {
    if (editingStation) {
      // Update existing station
      setStations(stations.map(station => 
        station.id === editingStation.id 
          ? { ...station, ...values }
          : station
      ));
      message.success('Station updated successfully');
    } else {
      // Add new station
      const newStation = {
        ...values,
        id: `ST${String(Math.max(...stations.map(s => parseInt(s.id.slice(2)))) + 1).padStart(3, '0')}`,
        batteryCount: 0,
        dailySwaps: 0,
        revenue: 0,
      };
      setStations([...stations, newStation]);
      message.success('Station created successfully');
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  // Calculate summary statistics
  const totalStations = stations.length;
  const activeStations = stations.filter(s => s.status === 'Active').length;
  const totalCapacity = stations.reduce((sum, s) => sum + s.capacity, 0);
  const totalAvailableSlots = stations.reduce((sum, s) => sum + s.availableSlots, 0);
  const totalDailySwaps = stations.reduce((sum, s) => sum + s.dailySwaps, 0);
  const totalRevenue = stations.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div style={{ padding: '24px' }}>
      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
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
              valueStyle={{ color: '#3f8600' }}
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
              valueStyle={{ color: totalAvailableSlots > totalCapacity * 0.5 ? '#3f8600' : '#cf1322' }}
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
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Station Management"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Station
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={stations}
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

      <Modal
        title={editingStation ? 'Edit Station' : 'Add New Station'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Station Name"
            rules={[{ required: true, message: 'Please input station name!' }]}
          >
            <Input placeholder="Enter station name" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input address!' }]}
          >
            <Input.TextArea 
              placeholder="Enter station address" 
              rows={2}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="capacity"
              label="Capacity (slots)"
              rules={[{ required: true, message: 'Please input capacity!' }]}
            >
              <InputNumber 
                placeholder="Enter capacity" 
                min={1} 
                max={100} 
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="availableSlots"
              label="Available Slots"
              rules={[{ required: true, message: 'Please input available slots!' }]}
            >
              <InputNumber 
                placeholder="Enter available slots" 
                min={0} 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="operatingHours"
              label="Operating Hours"
              rules={[{ required: true, message: 'Please input operating hours!' }]}
            >
              <Input placeholder="e.g., 24/7 or 06:00 - 22:00" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Maintenance">Maintenance</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Under Construction">Under Construction</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="manager"
              label="Station Manager"
              rules={[{ required: true, message: 'Please input manager name!' }]}
            >
              <Input placeholder="Enter manager name" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Contact Phone"
              rules={[{ required: true, message: 'Please input phone number!' }]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStation ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StationPage;