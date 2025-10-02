import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Rate } from 'antd';
import { PlusOutlined, EyeOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const SupportPage = () => {
  const [tickets, setTickets] = useState([
    {
      id: 'TKT001',
      subject: 'Battery swap not working at Station A',
      description: 'I tried to swap my battery at Station A but the machine is not responding. The screen shows an error message.',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1-555-1234',
      priority: 'High',
      status: 'Open',
      category: 'Technical Issue',
      stationId: 'ST001',
      vehicleId: 'VH001',
      createdAt: '2024-03-15 14:30:00',
      updatedAt: '2024-03-15 14:30:00',
      assignedTo: 'Support Team',
      rating: null,
    },
    {
      id: 'TKT002',
      subject: 'Billing issue with Premium plan',
      description: 'I was charged twice for my Premium swap plan this month. Please check my billing and issue a refund.',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      customerPhone: '+1-555-5678',
      priority: 'Medium',
      status: 'In Progress',
      category: 'Billing',
      stationId: null,
      vehicleId: 'VH002',
      createdAt: '2024-03-14 09:15:00',
      updatedAt: '2024-03-15 10:30:00',
      assignedTo: 'Billing Team',
      rating: null,
    },
    {
      id: 'TKT003',
      subject: 'Request for new station location',
      description: 'Please consider adding a battery swap station near the downtown mall area. Many EV owners in this area would benefit.',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+1-555-9012',
      priority: 'Low',
      status: 'Resolved',
      category: 'Feature Request',
      stationId: null,
      vehicleId: null,
      createdAt: '2024-03-10 16:45:00',
      updatedAt: '2024-03-14 11:20:00',
      assignedTo: 'Product Team',
      rating: 4,
    },
    {
      id: 'TKT004',
      subject: 'Mobile app crashes during payment',
      description: 'The mobile app crashes every time I try to make a payment for battery swap. Using iPhone 14 Pro with iOS 17.',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1-555-3456',
      priority: 'High',
      status: 'Closed',
      category: 'Mobile App',
      stationId: null,
      vehicleId: 'VH004',
      createdAt: '2024-03-12 11:30:00',
      updatedAt: '2024-03-13 15:45:00',
      assignedTo: 'Mobile Team',
      rating: 5,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <Space>
          <MessageOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      render: (subject) => <strong>{subject}</strong>,
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
          <span style={{ color: '#666', fontSize: '12px' }}>
            {record.customerPhone}
          </span>
        </Space>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colorMap = {
          'High': 'red',
          'Medium': 'orange',
          'Low': 'green',
          'Critical': 'purple'
        };
        return <Tag color={colorMap[priority]}>{priority}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'Open': 'blue',
          'In Progress': 'orange',
          'Resolved': 'green',
          'Closed': 'default',
          'Pending': 'purple'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag>{category}</Tag>,
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
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
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => (
        <Space direction="vertical" size="small">
          <span style={{ fontSize: '12px' }}>{createdAt.split(' ')[0]}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>
            <ClockCircleOutlined /> {createdAt.split(' ')[1]}
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
              onClick={() => handleView(record)}
            >
              View
            </Button>
            <Button 
              icon={<MessageOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            >
              Update
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  const handleView = (ticket) => {
    setViewingTicket(ticket);
    setIsViewModalVisible(true);
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setIsModalVisible(true);
    form.setFieldsValue(ticket);
  };

  const handleSubmit = (values) => {
    if (editingTicket) {
      // Update existing ticket
      setTickets(tickets.map(ticket => 
        ticket.id === editingTicket.id 
          ? { ...ticket, ...values, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : ticket
      ));
      message.success('Ticket updated successfully');
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const getStatusCounts = () => {
    const counts = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div style={{ padding: '24px' }}>
      {/* Quick Stats */}
      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {tickets.length}
            </div>
            <div style={{ color: '#666' }}>Total Tickets</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
              {statusCounts['Open'] || 0}
            </div>
            <div style={{ color: '#666' }}>Open</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
              {statusCounts['In Progress'] || 0}
            </div>
            <div style={{ color: '#666' }}>In Progress</div>
          </div>
        </Card>
        <Card size="small">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {statusCounts['Resolved'] || 0}
            </div>
            <div style={{ color: '#666' }}>Resolved</div>
          </div>
        </Card>
      </div>

      <Card
        title="Support Tickets"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTicket(null);
              setIsModalVisible(true);
              form.resetFields();
            }}
          >
            Create Ticket
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} tickets`,
          }}
        />
      </Card>

      {/* View Ticket Modal */}
      <Modal
        title={`Ticket Details - ${viewingTicket?.id}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {viewingTicket && (
          <div style={{ space: '16px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <strong>Subject:</strong> {viewingTicket.subject}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Description:</strong>
              <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                {viewingTicket.description}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><strong>Customer:</strong> {viewingTicket.customerName}</div>
              <div><strong>Email:</strong> {viewingTicket.customerEmail}</div>
              <div><strong>Phone:</strong> {viewingTicket.customerPhone}</div>
              <div><strong>Priority:</strong> <Tag color={viewingTicket.priority === 'High' ? 'red' : viewingTicket.priority === 'Medium' ? 'orange' : 'green'}>{viewingTicket.priority}</Tag></div>
              <div><strong>Status:</strong> <Tag color={viewingTicket.status === 'Open' ? 'blue' : viewingTicket.status === 'In Progress' ? 'orange' : 'green'}>{viewingTicket.status}</Tag></div>
              <div><strong>Category:</strong> {viewingTicket.category}</div>
              <div><strong>Assigned To:</strong> {viewingTicket.assignedTo}</div>
              <div><strong>Station ID:</strong> {viewingTicket.stationId || 'N/A'}</div>
              <div><strong>Vehicle ID:</strong> {viewingTicket.vehicleId || 'N/A'}</div>
              <div><strong>Created:</strong> {viewingTicket.createdAt}</div>
              <div><strong>Updated:</strong> {viewingTicket.updatedAt}</div>
              <div><strong>Rating:</strong> {viewingTicket.rating ? <Rate disabled defaultValue={viewingTicket.rating} /> : 'Not rated'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit/Create Ticket Modal */}
      <Modal
        title={editingTicket ? 'Update Ticket' : 'Create New Ticket'}
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
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Please select priority!' }]}
            >
              <Select placeholder="Select priority">
                <Option value="Critical">Critical</Option>
                <Option value="High">High</Option>
                <Option value="Medium">Medium</Option>
                <Option value="Low">Low</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select placeholder="Select status">
                <Option value="Open">Open</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Resolved">Resolved</Option>
                <Option value="Closed">Closed</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category!' }]}
            >
              <Select placeholder="Select category">
                <Option value="Technical Issue">Technical Issue</Option>
                <Option value="Billing">Billing</Option>
                <Option value="Mobile App">Mobile App</Option>
                <Option value="Feature Request">Feature Request</Option>
                <Option value="Account">Account</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="assignedTo"
              label="Assign To"
              rules={[{ required: true, message: 'Please assign to a team!' }]}
            >
              <Select placeholder="Select team">
                <Option value="Support Team">Support Team</Option>
                <Option value="Technical Team">Technical Team</Option>
                <Option value="Billing Team">Billing Team</Option>
                <Option value="Mobile Team">Mobile Team</Option>
                <Option value="Product Team">Product Team</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTicket ? 'Update' : 'Create'}
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

export default SupportPage;