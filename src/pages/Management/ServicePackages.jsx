import React, { useState, useMemo } from "react";
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, Tag, message, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import api from "../../config/axios";

// Local helper that wraps axios and returns normalized result
async function callApi({
  method = "get",
  url,
  data = null,
  params = null,
  config = {},
}) {
  try {
    const res = await api.request({ method, url, data, params, ...config });
    return { ok: true, data: res.data };
  } catch (err) {
    let status = null;
    let messageText = "Network error";
    let payload = null;
    if (err && err.response) {
      status = err.response.status;
      payload = err.response.data;
      messageText =
        (err.response.data &&
          (err.response.data.message || err.response.data.error)) ||
        err.response.statusText ||
        messageText;
      // if unauthorized, clear stored tokens
      if (status === 401) {
        try { localStorage.removeItem('authToken'); sessionStorage.removeItem('authToken'); } catch { /* ignore storage errors */ }
      }
    } else if (err && err.request) {
      messageText = "No response from server";
    } else if (err && err.message) {
      messageText = err.message;
    }
    return { ok: false, status, message: messageText, payload };
  }
}

const { Option } = Select;

// start with empty list; we'll fetch from API
const samplePackages = [];

export default function ServicePackagesPage() {
  const [packages, setPackages] = useState(samplePackages);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [popularityFilter, setPopularityFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    const fetchPackages = async () => {
      setLoading(true);
      const res = await callApi({ method: 'get', url: '/service-packages' });
      if (!mounted) return;
      if (res.ok && Array.isArray(res.data)) setPackages(res.data);
      else setPackages([]);
      setLoading(false);
    };
    fetchPackages();
    return () => { mounted = false; };
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price ($)', dataIndex: 'price', key: 'price', render: (p) => `$${p}` },
    { title: 'Duration (days)', dataIndex: 'duration', key: 'duration' },
    { title: 'Max Swaps', dataIndex: 'maxSwaps', key: 'maxSwaps' },
    { title: 'Popularity', dataIndex: 'popularity', key: 'popularity', render: (v) => <Tag color={v > 30 ? 'green' : 'blue'}>{v}</Tag> },
    {
      title: 'Actions', key: 'actions', render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)}>Edit</Button>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)}>Remove</Button>
        </Space>
      )
    }
  ];

  function openEdit(record) {
    setEditing(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  }

  function openNew() {
    setEditing(null);
    form.resetFields();
    setIsModalVisible(true);
  }

  function handleDelete(id) {
    Modal.confirm({
      title: 'Delete package',
      content: 'Are you sure you want to remove this package?',
      okType: 'danger',
      onOk() {
        setPackages(prev => prev.filter(p => p.id !== id));
        message.success('Package removed');
      }
    });
  }

  function handleSubmit(values) {
    if (editing) {
      setPackages(prev => prev.map(p => p.id === editing.id ? { ...p, ...values } : p));
      message.success('Package updated');
    } else {
      const newPkg = { ...values, id: `PKG-${String(Math.floor(Math.random() * 900) + 100)}` };
      setPackages(prev => [newPkg, ...prev]);
      message.success('Package created');
    }
    setIsModalVisible(false);
    form.resetFields();
  }

  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const q = searchText.trim().toLowerCase();
      if (q) {
        const matches = (p.name || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (popularityFilter === 'high' && !(p.popularity > 30)) return false;
      if (popularityFilter === 'low' && !(p.popularity <= 30)) return false;

      if (dateRange && dateRange.length === 2) {
        const start = dayjs(dateRange[0]);
        const end = dayjs(dateRange[1]).endOf('day');
        const created = dayjs(p.createdAt);
        if (!created.isBetween(start, end, null, '[]')) return false;
      }

      return true;
    });
  }, [packages, searchText, popularityFilter, dateRange]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Service Packages"
        extra={
          <Space>
            <Input.Search placeholder="Search by id or name" onSearch={v => setSearchText(v)} onChange={e => setSearchText(e.target.value)} style={{ width: 220 }} allowClear />
            <Select value={popularityFilter} onChange={setPopularityFilter} style={{ width: 140 }}>
              <Select.Option value="all">All popularity</Select.Option>
              <Select.Option value="high">High (&gt;30)</Select.Option>
              <Select.Option value="low">Low (≤30)</Select.Option>
            </Select>
            <DatePicker.RangePicker onChange={(vals) => setDateRange(vals)} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>Add Package</Button>
          </Space>
        }
      >
    <Table columns={columns} dataSource={filteredPackages} rowKey={r => r.id} loading={loading} />
      </Card>

      <Modal title={editing ? 'Edit Package' : 'New Package'} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price ($)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration" label="Duration (days)" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxSwaps" label="Max Swaps" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="popularity" label="Popularity score">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{editing ? 'Update' : 'Add'}</Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
