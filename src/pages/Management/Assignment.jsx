import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  Tooltip,
  Modal,
  Form,
  Select,
  Input,
  Row,
  Col,
} from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  UserAddOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

const { Option } = Select;

// --- SUB-COMPONENT: Modal Phân Quyền ---
const AssignStaffModal = ({
  open,
  onCancel,
  onSuccess,
  staffList,
  stationList,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Xử lý Phân Quyền Staff
  const handleAssign = async (values) => {
    setSubmitting(true);
    try {
      await api.post("/staff-station-assignment", values);
      showToast(
        "success",
        `Phân quyền nhân viên ${values.staffId} quản lý trạm ${values.stationId} thành công!`
      );
      form.resetFields();
      onSuccess();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          error.response?.data ||
          "Phân quyền thất bại!"
      );
    }
  };

  return (
    <Modal
      title="Phân quyền nhân viên quản lý trạm"
      open={open}
      onCancel={onCancel}
      confirmLoading={submitting}
      onOk={() => form.submit()}
      okText="Phân quyền"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={handleAssign}>
        <Form.Item
          name="staffId"
          label="Chọn nhân viên"
          rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
        >
          <Select
            placeholder="Chọn một nhân viên"
            showSearch
            optionFilterProp="children"
            loading={!staffList.length}
          >
            {/* Lọc danh sách chỉ lấy các user có role là STAFF */}
            {staffList
              .filter((user) => user.role === "STAFF")
              .map((staff) => (
                <Option key={staff.id} value={staff.id}>
                  {staff.fullName} (ID: {staff.id})
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="stationId"
          label="Chọn trạm"
          rules={[{ required: true, message: "Vui lòng chọn trạm!" }]}
        >
          <Select
            placeholder="Chọn một trạm"
            showSearch
            optionFilterProp="children"
            loading={!stationList.length}
          >
            {stationList.map((station) => (
              <Option key={station.id} value={station.id}>
                {station.name} (ID: {station.id})
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function AssignmentPage() {
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [stations, setStations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState({ staff: "", station: "" });

  // 1. Tải Assignments
  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/staff-station-assignment");
      setAssignments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setAssignments([]);
      showToast(
        "error",
        error.response?.data ||
          "Lấy danh sách phân quyền nhân viên thất bại, vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Tải Staff & Station
  const fetchResources = async () => {
    // Nếu đã có dữ liệu thì không tải lại
    if (staffs.length > 0 && stations.length > 0) return true;
    setLoadingResources(true);
    try {
      const [staffRes, stationRes] = await Promise.all([
        api.get("/admin/user"),
        api.get("/station"),
      ]);

      setStaffs(Array.isArray(staffRes.data) ? staffRes.data : []);
      setStations(Array.isArray(stationRes.data) ? stationRes.data : []);
      return true;
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          error.response?.data ||
          "Không thể tải danh sách Nhân viên hoặc Trạm."
      );
      return false;
    } finally {
      setLoadingResources(false);
    }
  };

  // 3. Xử lý mở Modal
  const handleOpenModal = async () => {
    const success = await fetchResources();
    if (success) setIsModalOpen(true);
  };

  // 4. Xử lý Xóa (Unassign)
  const handleUnassign = async (staffId, stationId) => {
    try {
      await api.delete(
        `${"/staff-station-assignment"}/staff/${staffId}/station/${stationId}`
      );
      showToast(
        "success",
        `Đã xóa phân quyền Nhân viên ${staffId} khỏi Trạm ${stationId}`
      );
      fetchAssignments(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      showToast(
        "error",
        error.response?.data ||
          "Xóa phân quyền nhân viên thất bại, vui lòng thử lại!"
      );
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // 5. Logic lọc hiển thị (UseMemo)
  const filteredData = useMemo(() => {
    const searchStaff = searchText.staff.trim().toLowerCase();
    const searchStation = searchText.station.trim().toLowerCase();

    if (!searchStaff && !searchStation) return assignments;

    return assignments.filter((item) => {
      // Logic: Tìm theo Tên hoặc ID
      const staffMatch =
        !searchStaff ||
        item.staffName?.toLowerCase().includes(searchStaff) ||
        String(item.staffId).includes(searchStaff);

      const stationMatch =
        !searchStation ||
        item.stationName?.toLowerCase().includes(searchStation) ||
        String(item.stationId).includes(searchStation);

      // Chỉ hiển thị khi cả 2 điều kiện tìm kiếm đều thỏa mãn
      return staffMatch && stationMatch;
    });
    // Dependency: Phụ thuộc vào assignments (dữ liệu gốc), và 2 giá trị tìm kiếm
  }, [assignments, searchText]);

  // 6. Cấu hình cột
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      render: (text) => <strong>{text}</strong>,
      width: 50,
    },
    {
      title: (
        <Space>
          <UserOutlined />
          Nhân viên
        </Space>
      ),
      dataIndex: "staffName",
      key: "staffName",
      render: (text, record) => (
        <Tooltip title={`Staff ID: ${record.staffId}`}>
          <Tag color="blue">{text}</Tag>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: (
        <Space>
          <EnvironmentOutlined />
          Trạm
        </Space>
      ),
      // Sử dụng trường stationName đã được ánh xạ
      dataIndex: "stationName",
      key: "stationName",
      render: (text, record) => (
        <Tooltip title={`Trạm ID: ${record.stationId}`}>
          <Tag color="green">{text}</Tag>
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: (
        <Space>
          <CalendarOutlined />
          Ngày phân quyền
        </Space>
      ),
      dataIndex: "assignedAt",
      key: "assignedAt",
      render: (_, record) => {
        // Ưu tiên assignedAt (từ API response)
        const dateString = record.assignedAt || record.createdAt;

        if (!dateString) return "";

        const dateObj = new Date(dateString);

        // Kiểm tra ngày hợp lệ
        if (isNaN(dateObj.getTime())) return "";

        // Định dạng ngày: DD/MM/YYYY
        return dateObj.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
      width: 150,
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận xóa phân quyền này?"
          description={`Xóa phân quyền nhân viên ID ${record.staffId} khỏi trạm ID ${record.stationId}?`}
          onConfirm={() => handleUnassign(record.staffId, record.stationId)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Tooltip title="Xóa phân quyền nhân viên khỏi trạm này">
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              danger
              size="small"
              disabled={loading}
            >
              Xóa
            </Button>
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  // --- 7. RENDER UI ---
  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Quản lý phân quyền"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={handleOpenModal}
              loading={loadingResources}
            >
              Phân quyền
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchAssignments();
              }}
              loading={loading}
            >
              Tải lại
            </Button>
          </Space>
        }
      >
        {/* Thanh tìm kiếm */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {/* 1. Tìm Staff (Lọc theo Staff ID/Name) */}
          <Col xs={24} sm={12}>
            <Input
              prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Tìm nhân viên (Tên/ID)"
              allowClear
              onChange={(e) =>
                setSearchText((prev) => ({ ...prev, staff: e.target.value }))
              }
            />
          </Col>

          {/* 2. Tìm Trạm (Lọc theo Station ID/Name) */}
          <Col xs={24} sm={12}>
            <Input
              prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Tìm trạm"
              allowClear
              onChange={(e) =>
                setSearchText((prev) => ({ ...prev, station: e.target.value }))
              }
            />
          </Col>
        </Row>

        {/* Bảng Hiển thị Assignments */}
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey={(record) =>
            record.id || `${record.staffId}-${record.stationId}`
          }
          pagination={{ showTotal: (total) => `Tổng ${total} phân quyền` }}
          scroll={{ x: 700 }}
        />
      </Card>

      {/* Modal cho chức năng Gán Staff-Station */}
      <AssignStaffModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchAssignments();
        }}
        staffList={staffs}
        stationList={stations}
      />
    </div>
  );
}
