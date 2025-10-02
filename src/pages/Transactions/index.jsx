import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Space, Tag, DatePicker, Select, Statistic, Row, Col, Input } from 'antd';
import { DollarOutlined, SearchOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionsPage = () => {
  const [transactions] = useState([
    {
      id: 'TXN001',
      type: 'Battery Swap',
      amount: 15.50,
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      vehicleId: 'VH001',
      stationId: 'ST001',
      batteryFrom: 'BAT003',
      batteryTo: 'BAT001',
      status: 'Completed',
      paymentMethod: 'Credit Card',
      timestamp: '2024-03-15 14:30:00',
      packageUsed: 'Basic Swap Plan',
    },
    {
      id: 'TXN002',
      type: 'Subscription',
      amount: 59.99,
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      vehicleId: 'VH002',
      stationId: null,
      batteryFrom: null,
      batteryTo: null,
      status: 'Completed',
      paymentMethod: 'PayPal',
      timestamp: '2024-03-15 09:15:00',
      packageUsed: 'Premium Swap Plan',
    },
    {
      id: 'TXN003',
      type: 'Battery Swap',
      amount: 15.50,
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      vehicleId: 'VH003',
      stationId: 'ST002',
      batteryFrom: 'BAT004',
      batteryTo: 'BAT002',
      status: 'Failed',
      paymentMethod: 'Credit Card',
      timestamp: '2024-03-14 18:45:00',
      packageUsed: 'Unlimited Swap Plan',
    },
    {
      id: 'TXN004',
      type: 'Refund',
      amount: -15.50,
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      vehicleId: 'VH003',
      stationId: 'ST002',
      batteryFrom: null,
      batteryTo: null,
      status: 'Processed',
      paymentMethod: 'Credit Card',
      timestamp: '2024-03-14 19:00:00',
      packageUsed: null,
    },
    {
      id: 'TXN005',
      type: 'Battery Swap',
      amount: 15.50,
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      vehicleId: 'VH004',
      stationId: 'ST001',
      batteryFrom: 'BAT005',
      batteryTo: 'BAT003',
      status: 'Pending',
      paymentMethod: 'Apple Pay',
      timestamp: '2024-03-15 16:20:00',
      packageUsed: 'Basic Swap Plan',
    },
  ]);

  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colorMap = {
          'Battery Swap': 'blue',
          'Subscription': 'green',
          'Refund': 'orange',
          'Penalty': 'red'
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Space>
          <DollarOutlined />
          <span style={{ 
            color: amount >= 0 ? '#52c41a' : '#ff4d4f',
            fontWeight: 'bold'
          }}>
            ${Math.abs(amount).toFixed(2)}
          </span>
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
      title: 'Vehicle',
      dataIndex: 'vehicleId',
      key: 'vehicleId',
      render: (vehicleId) => vehicleId || '-',
    },
    {
      title: 'Station',
      dataIndex: 'stationId',
      key: 'stationId',
      render: (stationId) => stationId || '-',
    },
    {
      title: 'Battery Swap',
      key: 'batterySwap',
      render: (_, record) => {
        if (record.batteryFrom && record.batteryTo) {
          return (
            <Space direction="vertical" size="small">
              <span style={{ fontSize: '12px' }}>
                From: <strong>{record.batteryFrom}</strong>
              </span>
              <span style={{ fontSize: '12px' }}>
                To: <strong>{record.batteryTo}</strong>
              </span>
            </Space>
          );
        }
        return '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          'Completed': 'green',
          'Pending': 'blue',
          'Failed': 'red',
          'Processed': 'orange',
          'Cancelled': 'default'
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <Space direction="vertical" size="small">
          <span>{timestamp.split(' ')[0]}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>
            {timestamp.split(' ')[1]}
          </span>
        </Space>
      ),
    },
  ];

  // Filter transactions based on search and filters
  const handleFilter = useCallback(() => {
    let filtered = transactions;

    if (searchText) {
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(searchText.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        t.customerEmail.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchText, statusFilter, typeFilter]);

  // Calculate statistics
  const totalRevenue = filteredTransactions
    .filter(t => t.amount > 0 && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalRefunds = Math.abs(filteredTransactions
    .filter(t => t.amount < 0 && t.status === 'Processed')
    .reduce((sum, t) => sum + t.amount, 0));
  
  const totalTransactions = filteredTransactions.length;
  const completedTransactions = filteredTransactions.filter(t => t.status === 'Completed').length;

  // Trigger filter when inputs change
  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Refunds"
              value={totalRefunds}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={totalTransactions}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={(completedTransactions / totalTransactions * 100) || 0}
              precision={1}
              suffix="%"
              valueStyle={{ color: completedTransactions / totalTransactions > 0.8 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Transaction Management"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>
              Export
            </Button>
            <Button type="primary" icon={<FilterOutlined />}>
              Advanced Filter
            </Button>
          </Space>
        }
      >
        {/* Filters */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Input
            placeholder="Search by ID, name, or email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="Completed">Completed</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Failed">Failed</Option>
            <Option value="Processed">Processed</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>

          <Select
            placeholder="Filter by type"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 150 }}
          >
            <Option value="all">All Types</Option>
            <Option value="Battery Swap">Battery Swap</Option>
            <Option value="Subscription">Subscription</Option>
            <Option value="Refund">Refund</Option>
            <Option value="Penalty">Penalty</Option>
          </Select>

          <RangePicker />
        </div>

        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
        />
      </Card>
    </div>
  );
};

export default TransactionsPage;