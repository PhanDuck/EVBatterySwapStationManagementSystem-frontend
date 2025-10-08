import React, { useState, useMemo } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;

const AccountPage = () => {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      username: 'admin',
      email: 'admin@evstation.com',
      role: 'Admin',
      status: 'Active',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      username: 'john_doe',
      email: 'john@example.com',
      role: 'User',
      status: 'Active',
      createdAt: '2024-02-20',
    },
    {
      id: 3,
      username: 'jane_smith',
      email: 'jane@example.com',
      role: 'Operator',
      status: 'Inactive',
      createdAt: '2024-03-10',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'Admin' ? 'red' : role === 'Operator' ? 'blue' : 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'volcano'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
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
    setEditingAccount(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsModalVisible(true);
    form.setFieldsValue(account);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this account?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setAccounts(accounts.filter(account => account.id !== id));
        message.success('Account deleted successfully');
      },
    });
  };

  const handleSubmit = (values) => {
    if (editingAccount) {
      // Update existing account
      setAccounts(accounts.map(account => 
        account.id === editingAccount.id 
          ? { ...account, ...values }
          : account
      ));
      message.success('Account updated successfully');
    } else {
      // Add new account
      const newAccount = {
        id: Math.max(...accounts.map(a => a.id)) + 1,
        ...values,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAccounts([...accounts, newAccount]);
      message.success('Account created successfully');
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const filteredAccounts = useMemo(() => accounts.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (roleFilter !== 'all' && a.role !== roleFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!a.username.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q)) return false;
    }
    if (dateRange && dateRange.length === 2) {
      const created = a.createdAt;
      if (created < dateRange[0] || created > dateRange[1]) return false;
    }
    return true;
  }), [accounts, searchText, statusFilter, roleFilter, dateRange]);

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Account Management"
        extra={
          <Space>
            <Input placeholder="Search username or email" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 220 }} />
            <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 140 }}>
              <Option value="all">All Roles</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Operator">Operator</Option>
              <Option value="User">User</Option>
            </Select>
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
              <Option value="all">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
            <DatePicker.RangePicker onChange={(vals) => setDateRange(vals && vals.map(d => d.format('YYYY-MM-DD')))} />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Account
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      <Modal
        title={editingAccount ? 'Edit Account' : 'Add New Account'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select role">
              <Option value="Admin">Admin</Option>
              <Option value="Operator">Operator</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAccount ? 'Update' : 'Create'}
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

export default AccountPage;