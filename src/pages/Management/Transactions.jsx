import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Space,
  Tag,
  DatePicker,
  Select,
  Row,
  Input,
  Modal,
  Form,

} from "antd";
import {
  SearchOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import MomoLogo from "../../assets/img/MoMoLogo.svg";
import dayjs from "dayjs"; 
import { showToast } from "../../Utils/toastHandler";

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // 🔹 Fetch dữ liệu từ API
  const fetchTransactions = async () => {
    setLoading(true);
    const Role = JSON.parse(localStorage.getItem("currentUser")).role;
    let apiPath = Role === "DRIVER" ? "/payment/my-payments" : "/payment";
    try {
      const res = await api.get(apiPath); // 🟢 chỉnh endpoint đúng với backend của bạn
      const list = (res.data || []).sort((a, b) => b.id - a.id); // Sắp xếp ID giảm dần
      setTransactions(list);
      setFilteredTransactions(list);
    } catch (error) {
      showToast("error", error.response?.data || "Lỗi khi tải danh sách giao dịch");
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
        showToast("success", "Cập nhật giao dịch thành công!");
      } else {
        // Create
        await api.post("/swap-transaction", values);
        showToast("success", "Tạo giao dịch mới thành công!");
      }
      setModalVisible(false);
      setEditing(null);
      fetchTransactions();
    } catch (error) {
      showToast("error", error.response?.data || "Lỗi khi lưu giao dịch");
    }
  };

  // 🔹 Columns bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <strong>{text}</strong>,
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: "descend",
    },

    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (amount) => (
        <span style={{ color: amount >= 0 ? "green" : "red" }}>
          {Math.abs(amount).toLocaleString("vi-VN")} ₫
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
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      render: (paymentMethod) => (
        <div className=" flex items-center justifiy-center gap-2">
          {paymentMethod}
          <div className="w-8 h-8">
            <img src={MomoLogo} alt="MomoLogo" />
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const colorMap = {
          COMPLETED: "green",
          PENDING: "blue",
          FAILED: "red",
          PROCESSED: "orange",
          CANCELLED: "gray",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "paymentDate",
      sorter: (a, b) =>
        dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <h2>Quản lý giao dịch</h2>
      </Row>

      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

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
        <RangePicker
          onChange={(vals) =>
            setDateRange(vals?.map((d) => d.format("YYYY-MM-DD")))
          }
        />
      </Space>

      <Table
        loading={loading}
        columns={columns}
        dataSource={filteredTransactions}
        rowKey="id"
        pagination={{
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trên tổng ${total} giao dịch`,
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
            label="Số tiền ($) "
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
