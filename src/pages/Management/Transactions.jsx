import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Button, Space, Tag, DatePicker, Select, Statistic, Row, Col, Input, Modal, Form, message,} from "antd";
import { DollarOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,} from "@ant-design/icons";
import api from "../../config/axios"; 

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // 🔹 Fetch dữ liệu từ API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/transaction"); // 🟢 chỉnh endpoint đúng với backend của bạn
      const list = res.data || [];
      setTransactions(list);
      setFilteredTransactions(list);
    } catch (err) {
      console.error("Fetch transactions error:", err);
      message.error("Không thể tải danh sách giao dịch!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 🔹 Lọc dữ liệu
  const handleFilter = useCallback(() => {
    let filtered = [...transactions];

    if (searchText) {
      filtered = filtered.filter(
        (t) =>
          t.id?.toString().toLowerCase().includes(searchText.toLowerCase()) ||
          t.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
          t.customerEmail?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter((t) => {
        const datePart = (t.timestamp || "").split(" ")[0];
        return datePart >= start && datePart <= end;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchText, statusFilter, typeFilter, dateRange]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  // 🔹 Create / Update transaction
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        // Update
        await api.put(`/swap-transaction/${editing.id}`, values);
        message.success("Cập nhật giao dịch thành công!");
      } else {
        // Create
        await api.post("/swap-transaction", values);
        message.success("Tạo giao dịch mới thành công!");
      }
      setModalVisible(false);
      setEditing(null);
      fetchTransactions();
    } catch (err) {
      console.error("Save transaction error:", err);
      message.error("Không thể lưu giao dịch!");
    }
  };

  // 🔹 Delete transaction
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa giao dịch này?",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/swap-transaction/${id}`);
          message.success("Xóa thành công!");
          fetchTransactions();
        } catch (err) {
          console.error("Delete transaction error:", err);
          message.error("Không thể xóa giao dịch!");
        }
      },
    });
  };

  // 🔹 Columns bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (type) => {
        const colors = {
          "Battery Swap": "blue",
          Subscription: "green",
          Refund: "orange",
          Penalty: "red",
        };
        return <Tag color={colors[type] || "default"}>{type}</Tag>;
      },
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (amount) => (
        <span style={{ color: amount >= 0 ? "green" : "red" }}>
          ${Math.abs(amount).toFixed(2)}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      render: (_, r) => (
        <>
          <strong>{r.customerName}</strong>
          <div style={{ fontSize: 12, color: "#888" }}>{r.customerEmail}</div>
        </>
      ),
    },
    { title: "Phương thức thanh toán", dataIndex: "paymentMethod" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const colorMap = {
          Completed: "green",
          Pending: "blue",
          Failed: "red",
          Processed: "orange",
          Cancelled: "gray",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <h2>Quản lý giao dịch</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Thêm giao dịch
        </Button>
      </Row>

      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
        >
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="Completed">Completed</Option>
          <Option value="Pending">Pending</Option>
          <Option value="Failed">Failed</Option>
          <Option value="Processed">Processed</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 150 }}
        >
          <Option value="all">Tất cả loại</Option>
          <Option value="Battery Swap">Battery Swap</Option>
          <Option value="Subscription">Subscription</Option>
          <Option value="Refund">Refund</Option>
          <Option value="Penalty">Penalty</Option>
        </Select>
        <RangePicker onChange={(vals) => setDateRange(vals?.map((d) => d.format("YYYY-MM-DD")))} />
      </Space>

      <Table
        loading={loading}
        columns={columns}
        dataSource={filteredTransactions}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      {/* Modal thêm/sửa */}
      <Modal
        title={editing ? "Cập nhật giao dịch" : "Thêm giao dịch mới"}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Loại giao dịch"
            name="type"
            rules={[{ required: true, message: "Chọn loại giao dịch" }]}
          >
            <Select>
              <Option value="Battery Swap">Battery Swap</Option>
              <Option value="Subscription">Subscription</Option>
              <Option value="Refund">Refund</Option>
              <Option value="Penalty">Penalty</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Số tiền ($)"
            name="amount"
            rules={[{ required: true, message: "Nhập số tiền" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Tên khách hàng" name="customerName">
            <Input />
          </Form.Item>

          <Form.Item label="Email khách hàng" name="customerEmail">
            <Input />
          </Form.Item>

          <Form.Item label="Phương thức thanh toán" name="paymentMethod">
            <Input />
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value="Completed">Completed</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Failed">Failed</Option>
              <Option value="Processed">Processed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
