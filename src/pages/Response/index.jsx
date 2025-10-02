import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Rate, Timeline } from 'antd';
import { PlusOutlined, EyeOutlined, SendOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const ResponsePage = () => {
  const [responses, setResponses] = useState([
    {
      id: 'RSP001',
      ticketId: 'TKT001',
      ticketSubject: 'Battery swap not working at Station A',
      responseText: 'Thank you for reporting this issue. Our technical team has been notified and will investigate the problem at Station A immediately. We expect to have this resolved within 2 hours.',
      responseType: 'Initial Response',
      respondedBy: 'Sarah Johnson',
      respondedAt: '2024-03-15 15:00:00',
      customerName: 'John Doe',
      status: 'Sent',
      rating: null,
      isInternal: false,
    },
    {
      id: 'RSP002',
      ticketId: 'TKT001',
      ticketSubject: 'Battery swap not working at Station A',
      responseText: 'Internal note: Station A diagnostic completed. Issue was with the payment terminal connection. Maintenance team dispatched.',
      responseType: 'Internal Note',
      respondedBy: 'Tech Team',
      respondedAt: '2024-03-15 15:30:00',
      customerName: 'John Doe',
      status: 'Internal',
      rating: null,
      isInternal: true,
    },
    {
      id: 'RSP003',
      ticketId: 'TKT001',
      ticketSubject: 'Battery swap not working at Station A',
      responseText: 'Good news! The issue at Station A has been resolved. The payment terminal has been fixed and all systems are now operational. Please try your battery swap again. If you encounter any further issues, please let us know.',
      responseType: 'Resolution',
      respondedBy: 'Sarah Johnson',
      respondedAt: '2024-03-15 17:30:00',
      customerName: 'John Doe',
      status: 'Sent',
      rating: 5,
      isInternal: false,
    },
    {
      id: 'RSP004',
      ticketId: 'TKT002',
      ticketSubject: 'Billing issue with Premium plan',
      responseText: 'We have reviewed your billing statement and confirmed the duplicate charge. A full refund of $59.99 has been processed and should appear in your account within 3-5 business days. We apologize for the inconvenience.',
      responseType: 'Resolution',
      respondedBy: 'Billing Team',
      respondedAt: '2024-03-15 11:00:00',
      customerName: 'Jane Smith',
      status: 'Sent',
      rating: 4,
      isInternal: false,
    },
    {
      id: 'RSP005',
      ticketId: 'TKT004',
      ticketSubject: 'Mobile app crashes during payment',
      responseText: 'Thank you for reporting this bug. We have released a hotfix in app version 2.1.3 that addresses the iOS 17 payment crash issue. Please update your app from the App Store and the issue should be resolved.',
      responseType: 'Resolution',
      respondedBy: 'Mobile Team',
      respondedAt: '2024-03-13 15:45:00',
      customerName: 'Sarah Wilson',
      status: 'Sent',
      rating: 5,
      isInternal: false,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);
  const [viewingTicketResponses, setViewingTicketResponses] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Response ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <Space>
          <SendOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Ticket Info',
      key: 'ticketInfo',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <strong>{record.ticketId}</strong>
          <span style={{ color: '#666', fontSize: '12px' }}>
            {record.ticketSubject}
          </span>
        </Space>
      ),
    },
    {
      title: 'Response Preview',
      dataIndex: 'responseText',
      key: 'responseText',
      ellipsis: true,
      render: (text) => (
        <div style={{ maxWidth: '200px' }}>
          {text.substring(0, 100)}...
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'responseType',
      key: 'responseType',
      render: (type) => {
        const colorMap = {
          'Initial Response': 'blue',
          'Follow Up': 'orange',
          'Resolution': 'green',
          'Internal Note': 'purple',
          'Escalation': 'red'
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      },
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: 'Responded By',
      dataIndex: 'respondedBy',
      key: 'respondedBy',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const colorMap = {
          'Sent': 'green',
          'Draft': 'orange',
          'Internal': 'purple',
          'Failed': 'red'
        };
        return (
          <Space direction="vertical" size="small">
            <Tag color={colorMap[status]}>{status}</Tag>
            {record.isInternal && <Tag size="small">Internal</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        rating ? <Rate disabled defaultValue={rating} style={{ fontSize: '14px' }} /> : '-'
      ),
    },
    {
      title: 'Responded At',
      dataIndex: 'respondedAt',
      key: 'respondedAt',
      render: (respondedAt) => (
        <Space direction="vertical" size="small">
          <span style={{ fontSize: '12px' }}>{respondedAt.split(' ')[0]}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>
            <ClockCircleOutlined /> {respondedAt.split(' ')[1]}
          </span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle" direction="vertical">
          <Space size="small">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewTicketResponses(record.ticketId)}
            >
              View All
            </Button>
            <Button 
              icon={<SendOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  const handleViewTicketResponses = (ticketId) => {
    const ticketResponses = responses.filter(r => r.ticketId === ticketId);
    setViewingTicketResponses(ticketResponses);
    setIsViewModalVisible(true);
  };

  const handleEdit = (response) => {
    setEditingResponse(response);
    setIsModalVisible(true);
    form.setFieldsValue(response);
  };

  const handleSubmit = (values) => {
    if (editingResponse) {
      // Update existing response
      setResponses(responses.map(response => 
        response.id === editingResponse.id 
          ? { ...response, ...values, respondedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : response
      ));
      message.success('Response updated successfully');
    } else {
      // Add new response
      const newResponse = {
        ...values,
        id: `RSP${String(Math.max(...responses.map(r => parseInt(r.id.slice(3)))) + 1).padStart(3, '0')}`,
        respondedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: 'Sent',
        rating: null,
      };
      setResponses([...responses, newResponse]);
      message.success('Response sent successfully');
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const getResponseStats = () => {
    const total = responses.length;
    const sent = responses.filter(r => r.status === 'Sent').length;
    const internal = responses.filter(r => r.isInternal).length;
    const avgRating = responses.filter(r => r.rating).reduce((sum, r, _, arr) => sum + r.rating / arr.length, 0);
    
    return { total, sent, internal, avgRating };
  };

  const stats = getResponseStats();

  return (
    <div style={{ padding: '24px' }}>
      {/* Quick Stats */}
      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {stats.total}
            </div>
            <div style={{ color: '#666' }}>Total Responses</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {stats.sent}
            </div>
            <div style={{ color: '#666' }}>Sent</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
              {stats.internal}
            </div>
            <div style={{ color: '#666' }}>Internal</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
              {stats.avgRating.toFixed(1)}
            </div>
            <div style={{ color: '#666' }}>Avg Rating</div>
          </div>
        </Card>
      </div>

      <Card
        title="Response Management"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingResponse(null);
              setIsModalVisible(true);
              form.resetFields();
            }}
          >
            Create Response
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={responses}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} responses`,
          }}
        />
      </Card>

      {/* View Ticket Responses Modal */}
      <Modal
        title={`Ticket Responses - ${viewingTicketResponses?.[0]?.ticketId}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {viewingTicketResponses && (
          <div>
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '6px' }}>
              <strong>Subject:</strong> {viewingTicketResponses[0]?.ticketSubject}
            </div>
            <Timeline
              items={viewingTicketResponses.map(response => ({
                color: response.isInternal ? 'purple' : response.responseType === 'Resolution' ? 'green' : 'blue',
                children: (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Space>
                        <Tag color={response.isInternal ? 'purple' : 'blue'}>
                          {response.responseType}
                        </Tag>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          by {response.respondedBy}
                        </span>
                      </Space>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {response.respondedAt}
                      </span>
                    </div>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: response.isInternal ? '#f6f4ff' : '#f6ffed', 
                      borderRadius: '6px',
                      border: `1px solid ${response.isInternal ? '#d3adf7' : '#b7eb8f'}`
                    }}>
                      {response.responseText}
                    </div>
                    {response.rating && (
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ marginRight: '8px' }}>Customer Rating:</span>
                        <Rate disabled defaultValue={response.rating} style={{ fontSize: '14px' }} />
                      </div>
                    )}
                  </div>
                ),
              }))}
            />
          </div>
        )}
      </Modal>

      {/* Edit/Create Response Modal */}
      <Modal
        title={editingResponse ? 'Edit Response' : 'Create New Response'}
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
            name="ticketId"
            label="Ticket ID"
            rules={[{ required: true, message: 'Please input ticket ID!' }]}
          >
            <Input placeholder="Enter ticket ID (e.g., TKT001)" />
          </Form.Item>

          <Form.Item
            name="responseText"
            label="Response Message"
            rules={[{ required: true, message: 'Please input response message!' }]}
          >
            <TextArea 
              placeholder="Enter your response message" 
              rows={4}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="responseType"
              label="Response Type"
              rules={[{ required: true, message: 'Please select response type!' }]}
            >
              <Select placeholder="Select response type">
                <Option value="Initial Response">Initial Response</Option>
                <Option value="Follow Up">Follow Up</Option>
                <Option value="Resolution">Resolution</Option>
                <Option value="Internal Note">Internal Note</Option>
                <Option value="Escalation">Escalation</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="respondedBy"
              label="Responded By"
              rules={[{ required: true, message: 'Please input responder name!' }]}
            >
              <Input placeholder="Enter responder name" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="isInternal"
              label="Internal Response"
              rules={[{ required: true, message: 'Please select if internal!' }]}
            >
              <Select placeholder="Select if internal">
                <Option value={false}>Customer Response</Option>
                <Option value={true}>Internal Note</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="customerName"
              label="Customer Name"
              rules={[{ required: true, message: 'Please input customer name!' }]}
            >
              <Input placeholder="Enter customer name" />
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingResponse ? 'Update' : 'Send Response'}
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

export default ResponsePage;