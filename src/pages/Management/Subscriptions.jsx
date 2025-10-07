import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Select, DatePicker, Statistic, Row, Col, message } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, PlayCircleOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 'SUB001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      packageId: 'PKG001',
      packageName: 'Basic Swap Plan',
      status: 'Active',
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      nextBilling: '2024-04-01',
      monthlyPrice: 29.99,
      swapsUsed: 7,
      swapsLimit: 10,
      autoRenewal: true,
      paymentMethod: 'Credit Card',
    },
    {
      id: 'SUB002',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      packageId: 'PKG002',
      packageName: 'Premium Swap Plan',
      status: 'Active',
      startDate: '2024-02-15',
      endDate: '2024-03-15',
      nextBilling: '2024-03-15',
      monthlyPrice: 59.99,
      swapsUsed: 18,
      swapsLimit: 25,
      autoRenewal: true,
      paymentMethod: 'PayPal',
    },
    {
      id: 'SUB003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      packageId: 'PKG003',
      packageName: 'Unlimited Swap Plan',
      status: 'Suspended',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      nextBilling: null,
      monthlyPrice: 99.99,
      swapsUsed: 45,
      swapsLimit: -1, // Unlimited
      autoRenewal: false,
      paymentMethod: 'Credit Card',
    },
    {
      id: 'SUB004',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      packageId: 'PKG001',
      packageName: 'Basic Swap Plan',
      status: 'Expired',
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      nextBilling: null,
      monthlyPrice: 29.99,
      swapsUsed: 10,
      swapsLimit: 10,
      autoRenewal: false,
      paymentMethod: 'Apple Pay',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Subscription ID',
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
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <strong>{record.customerName}</strong>
          <span style={{ color: '#666', fontSize: '12px' }}>
            {record.customerEmail}
          </span>
        </Space>
      ),
    },
    {
      title: 'Package',
      key: 'package',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <strong>{record.packageName}</strong>
          <span style={{ color: '#666', fontSize: '12px' }}>
            ${record.monthlyPrice}/month
          </span>
        </Space>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (_, record) => {
        const percentage = record.swapsLimit === -1 ? 0 : (record.swapsUsed / record.swapsLimit) * 100;
        const isUnlimited = record.swapsLimit === -1;
        
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <span>
              <strong>{record.swapsUsed}</strong>
              {!isUnlimited && `/${record.swapsLimit}`} swaps
            </span>
            {!isUnlimited && (
              <div style={{ 
                width: '80px', 
                height: '6px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: percentage > 80 ? '#ff4d4f' : 
                                    percentage > 60 ? '#faad14' : '#52c41a',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'Active': 'green',
          'Suspended': 'orange',
          'Expired': 'red',
          'Cancelled': 'default',
          'Pending': 'blue'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span style={{ fontSize: '12px' }}>
            {record.startDate} to {record.endDate}
          </span>
          {record.nextBilling && (
            <span style={{ color: '#1890ff', fontSize: '12px' }}>
              Next: {record.nextBilling}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Auto Renewal',
      dataIndex: 'autoRenewal',
      key: 'autoRenewal',
      render: (autoRenewal) => (
        <Tag color={autoRenewal ? 'green' : 'default'}>
          {autoRenewal ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle" direction="vertical">
          <Space size="small">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
            {record.status === 'Active' ? (
              <Button 
                icon={<StopOutlined />} 
                size="small"
                onClick={() => handleSuspend(record.id)}
              >
                Suspend
              </Button>
            ) : record.status === 'Suspended' ? (
              <Button 
                type="primary"
                icon={<PlayCircleOutlined />} 
                size="small"
                onClick={() => handleReactivate(record.id)}
              >
                Reactivate
              </Button>
            ) : null}
          </Space>
        </Space>
      ),
    },
  ];

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...subscription,
      startDate: dayjs(subscription.startDate),
      endDate: dayjs(subscription.endDate),
      nextBilling: subscription.nextBilling ? dayjs(subscription.nextBilling) : null,
    });
  };

  const handleSuspend = (id) => {
    Modal.confirm({
      title: 'Suspend Subscription',
      content: 'Are you sure you want to suspend this subscription?',
      okText: 'Yes, Suspend',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setSubscriptions(subscriptions.map(sub => 
          sub.id === id 
            ? { ...sub, status: 'Suspended', nextBilling: null }
            : sub
        ));
        message.success('Subscription suspended successfully');
      },
    });
  };

  const handleReactivate = (id) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === id 
        ? { ...sub, status: 'Active', nextBilling: dayjs().add(1, 'month').format('YYYY-MM-DD') }
        : sub
    ));
    message.success('Subscription reactivated successfully');
  };

  const handleSubmit = (values) => {
    const processedValues = {
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
      nextBilling: values.nextBilling ? values.nextBilling.format('YYYY-MM-DD') : null,
    };

    if (editingSubscription) {
      setSubscriptions(subscriptions.map(sub => 
        sub.id === editingSubscription.id 
          ? { ...sub, ...processedValues }
          : sub
      ));
      message.success('Subscription updated successfully');
    }
    
    setIsModalVisible(false);
    form.resetFields();
  };

  // Calculate statistics
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;
  const monthlyRevenue = subscriptions
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + s.monthlyPrice, 0);
  const averageUsage = subscriptions
    .filter(s => s.status === 'Active' && s.swapsLimit > 0)
    .reduce((sum, s, _, arr) => sum + (s.swapsUsed / s.swapsLimit) / arr.length, 0) * 100;

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Subscriptions"
              value={totalSubscriptions}
              prefix={<GiftOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Subscriptions"
              value={activeSubscriptions}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monthly Revenue"
              value={monthlyRevenue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Usage Rate"
              value={averageUsage || 0}
              precision={1}
              suffix="%"
              valueStyle={{ color: averageUsage > 70 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Subscription Management"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSubscription(null);
              setIsModalVisible(true);
              form.resetFields();
            }}
          >
            Create Subscription
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={subscriptions}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} subscriptions`,
          }}
        />
      </Card>

      <Modal
        title={editingSubscription ? 'Edit Subscription' : 'Create New Subscription'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Suspended">Suspended</Option>
                <Option value="Expired">Expired</Option>
                <Option value="Cancelled">Cancelled</Option>
                <Option value="Pending">Pending</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="autoRenewal"
              label="Auto Renewal"
              rules={[{ required: true, message: 'Please select auto renewal!' }]}
            >
              <Select placeholder="Select auto renewal">
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: 'Please select start date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: 'Please select end date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="nextBilling"
            label="Next Billing Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingSubscription ? 'Update' : 'Create'}
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

export default SubscriptionsPage;