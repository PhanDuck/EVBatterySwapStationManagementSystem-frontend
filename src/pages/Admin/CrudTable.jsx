import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, Form, Input, Table, Space, Popconfirm, message } from "antd";
import api from "../../config/axios";

const CrudTable = ({ title, resource, columns, formFields, idKey = "id" }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get(resource);
      setData(res.data || []);
    } catch (e) {
      message.error("Tải dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, [resource]);

  const onCreate = () => { setEditing(null); form.resetFields(); setOpen(true); };
  const onEdit = (record) => { setEditing(record); form.setFieldsValue(record); setOpen(true); };
  const onDelete = async (record) => {
    try {
      await api.delete(`${resource}/${record[idKey]}`);
      message.success("Đã xóa");
      fetchList();
    } catch { message.error("Xóa thất bại"); }
  };

  const submit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await api.put(`${resource}/${editing[idKey]}`, values);
        message.success("Đã cập nhật");
      } else {
        await api.post(resource, values);
        message.success("Đã tạo");
      }
      setOpen(false);
      fetchList();
    } catch { message.error("Lưu thất bại"); }
  };

  const actionCol = useMemo(() => ({
    title: "Hành động",
    key: "actions",
    render: (_, record) => (
      <Space>
        <Button size="small" onClick={() => onEdit(record)}>Sửa</Button>
        <Popconfirm title="Xóa bản ghi?" onConfirm={() => onDelete(record)}>
          <Button size="small" danger>Xóa</Button>
        </Popconfirm>
      </Space>
    )
  }), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button type="primary" onClick={onCreate}>Thêm mới</Button>
      </div>
      <Table rowKey={idKey} columns={[...columns, actionCol]} dataSource={data} loading={loading} />

      <Modal title={editing ? "Cập nhật" : "Tạo mới"} open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form layout="vertical" form={form}>
          {formFields.map((f) => (
            <Form.Item key={f.name} name={f.name} label={f.label} rules={f.rules}>
              {f.input || <Input />}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default CrudTable;


