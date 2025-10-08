import React, { useState } from "react";
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Select, Tag, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const samplePackages = [
  { id: 'PKG-001', name: 'Basic Swap', price: 5, duration: 30, maxSwaps: 1, popularity: 12 },
  { id: 'PKG-002', name: 'Monthly Saver', price: 50, duration: 30, maxSwaps: 20, popularity: 54 },
  { id: 'PKG-003', name: 'Unlimited Pro', price: 120, duration: 90, maxSwaps: 999, popularity: 8 },
];

export default function ServicePackagesPage() {
  const [packages, setPackages] = useState(samplePackages);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

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

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Service Packages"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openNew}>Add Package</Button>}
      >
        <Table columns={columns} dataSource={packages} rowKey={r => r.id} />
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
