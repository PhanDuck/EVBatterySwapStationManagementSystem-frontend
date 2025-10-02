import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined, DollarOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const PackagePage = () => {
  const [packages, setPackages] = useState([
    {
      id: 'PKG001',
      name: 'Basic Swap Plan',
      description: 'Perfect for casual users with limited battery swapping needs',
      price: 29.99,
      duration: 30,
      swapLimit: 10,
      features: ['10 battery swaps per month', 'Standard customer support', 'Basic mobile app access'],
      status: 'Active',
      popularity: 'High',
      subscribers: 1245,
    },
    {
      id: 'PKG002',
      name: 'Premium Swap Plan',
      description: 'Ideal for regular commuters and frequent travelers',
      price: 59.99,
      duration: 30,
      swapLimit: 25,
      features: ['25 battery swaps per month', 'Priority customer support', 'Advanced mobile app features', 'Swap reservation'],
      status: 'Active',
      popularity: 'Very High',
      subscribers: 2890,
    },
    {
      id: 'PKG003',
      name: 'Unlimited Swap Plan',
      description: 'For power users and commercial fleet operators',
      price: 99.99,
      duration: 30,
      swapLimit: -1, // -1 means unlimited
      features: ['Unlimited battery swaps', '24/7 premium support', 'Fleet management tools', 'Priority swap slots', 'API access'],
      status: 'Active',
      popularity: 'Medium',
      subscribers: 567,
    },
    {
      id: 'PKG004',
      name: 'Weekend Explorer',
      description: 'Special package for weekend trips and occasional use',
      price: 15.99,
      duration: 30,
      swapLimit: 5,
      features: ['5 battery swaps per month', 'Weekend priority', 'Tourist route support'],
      status: 'Discontinued',
      popularity: 'Low',
      subscribers: 123,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Package ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <Space>
          <GiftOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Package Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space direction="vertical" size="small">
          <strong style={{ fontSize: '16px' }}>{name}</strong>
          <span style={{ color: '#666', fontSize: '12px' }}>
            {record.description.substring(0, 50)}...
          </span>
        </Space>
      ),
    },
    {
      title: 'Pricing',
      key: 'pricing',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <DollarOutlined />
            <strong style={{ fontSize: '16px', color: '#52c41a' }}>
              ${record.price}/month
            </strong>
          </Space>
          <span style={{ color: '#666' }}>
            {record.swapLimit === -1 ? 'Unlimited' : record.swapLimit} swaps
          </span>
        </Space>
      ),
    },
    {
      title: 'Features',
      dataIndex: 'features',
      key: 'features',
      render: (features) => (
        <div>
          {features.slice(0, 2).map((feature, index) => (
            <div key={index} style={{ fontSize: '12px', color: '#666' }}>
              • {feature}
            </div>
          ))}
          {features.length > 2 && (
            <span style={{ color: '#1890ff', fontSize: '12px' }}>
              +{features.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'Active': 'green',
          'Discontinued': 'red',
          'Coming Soon': 'blue',
          'Limited': 'orange'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Popularity',
      dataIndex: 'popularity',
      key: 'popularity',
      render: (popularity) => {
        const colorMap = {
          'Very High': 'green',
          'High': 'blue',
          'Medium': 'orange',
          'Low': 'red'
        };
        return <Tag color={colorMap[popularity]}>{popularity}</Tag>;
      },
    },
    {
      title: 'Subscribers',
      dataIndex: 'subscribers',
      key: 'subscribers',
      render: (subscribers) => (
        <strong style={{ color: '#1890ff' }}>
          {subscribers.toLocaleString()}
        </strong>
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
    setEditingPackage(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...pkg,
      features: pkg.features.join('\n')
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this package?',
      content: 'This action cannot be undone and will affect existing subscribers.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setPackages(packages.filter(pkg => pkg.id !== id));
        message.success('Package deleted successfully');
      },
    });
  };

  const handleSubmit = (values) => {
    const processedValues = {
      ...values,
      features: values.features.split('\n').filter(f => f.trim() !== '')
    };

    if (editingPackage) {
      // Update existing package
      setPackages(packages.map(pkg => 
        pkg.id === editingPackage.id 
          ? { ...pkg, ...processedValues }
          : pkg
      ));
      message.success('Package updated successfully');
    } else {
      // Add new package
      const newPackage = {
        ...processedValues,
        id: `PKG${String(Math.max(...packages.map(p => parseInt(p.id.slice(3)))) + 1).padStart(3, '0')}`,
        subscribers: 0,
      };
      setPackages([...packages, newPackage]);
      message.success('Package created successfully');
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Package Management"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Create Package
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={packages}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} packages`,
          }}
        />
      </Card>

      <Modal
        title={editingPackage ? 'Edit Package' : 'Create New Package'}
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
            label="Package Name"
            rules={[{ required: true, message: 'Please input package name!' }]}
          >
            <Input placeholder="Enter package name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <TextArea 
              placeholder="Enter package description" 
              rows={3}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[{ required: true, message: 'Please input price!' }]}
            >
              <InputNumber 
                placeholder="Enter price" 
                min={0} 
                step={0.01}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration (days)"
              rules={[{ required: true, message: 'Please input duration!' }]}
            >
              <InputNumber 
                placeholder="Enter duration" 
                min={1} 
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="swapLimit"
              label="Swap Limit"
              rules={[{ required: true, message: 'Please input swap limit!' }]}
              help="Use -1 for unlimited swaps"
            >
              <InputNumber 
                placeholder="Enter limit or -1" 
                min={-1} 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Discontinued">Discontinued</Option>
                <Option value="Coming Soon">Coming Soon</Option>
                <Option value="Limited">Limited</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="popularity"
              label="Popularity"
              rules={[{ required: true, message: 'Please select popularity!' }]}
            >
              <Select placeholder="Select popularity">
                <Option value="Very High">Very High</Option>
                <Option value="High">High</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Low">Low</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="features"
            label="Features"
            rules={[{ required: true, message: 'Please input features!' }]}
            help="Enter each feature on a new line"
          >
            <TextArea 
              placeholder="Enter features (one per line)" 
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPackage ? 'Update' : 'Create'}
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

export default PackagePage;