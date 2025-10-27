import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
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
  DesktopOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import api from "../../config/axios"; 

// === KHAI BÁO CÁC API ===
const API_ASSIGNMENTS = "/staff-station-assignment";
// API thực tế: /api/admin/user
const API_USERS_ALL = "/admin/user";
// API thực tế: /api/station
const API_STATIONS_ALL = "/station";

const STAFF_ROLE = "STAFF";

const { Option } = Select;

/**
 * Component Modal Gán Staff vào Trạm
 * Admin dùng để gán 1 Staff vào 1 Trạm (POST /api/staff-station-assignment)
 */
const AssignStaffModal = ({
  isModalVisible,
  onCancel,
  onSuccess,
  staffList,
  stationList,
  loading,
}) => {
  const [form] = Form.useForm();

  // Xử lý Gán Staff
  const handleAssign = async (values) => {
    try {
      // API: POST /api/staff-station-assignment
      await api.post(API_ASSIGNMENTS, values);
      message.success(
        `✅ Phân quyền nhân viên ${values.staffId} quản lý trạm ${values.stationId} thành công!`
      );
      onSuccess();
    } catch (error) {
      message.error(
        `❌ Lỗi không thể phân quyền nhân viên: ${error.response?.data?.message || error.message}`
      );
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isModalVisible) {
      form.resetFields(); // Reset form khi modal đóng
    }
  }, [isModalVisible, form]);

  return (
    <Modal
      title="Phân quyền nhân viên quản lý trạm"
      open={isModalVisible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Phân quyền
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAssign}
        initialValues={{ staffId: undefined, stationId: undefined }}
      >
        <Form.Item
          name="staffId"
          label="Chọn nhân viên"
          rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
        >
          <Select
            placeholder="Chọn một nhân viên"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {/* Lọc danh sách chỉ lấy các user có authority (role) là STAFF */}
            {staffList
              .filter((user) => user.role === STAFF_ROLE)
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
            filterOption={(input, option) =>
              (option?.children ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
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

/**
 * Component Chính: Trang Quản lý Phân quyền Staff-Station
 * Chỉ dành cho Admin
 */
export default function AssignmentPage() {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);

  // State phụ cho Modal Gán (cần tải danh sách Staff và Trạm)
  const [allStaffs, setAllStaffs] = useState([]);
  const [allStations, setAllStations] = useState([]);

  // State cho chức năng Tìm kiếm
  const [searchStaffId, setSearchStaffId] = useState("");
  const [searchStationId, setSearchStationId] = useState("");

  // --- A. FUNCTIONS TẢI DỮ LIỆU CHÍNH ---

  // Tải TẤT CẢ các assignment Staff-Station (GET /api/staff-station-assignment)
  const fetchAllAssignments = useCallback(async () => {
    setLoading(true);
    try {
      // API: GET /api/staff-station-assignment
      const res = await api.get(API_ASSIGNMENTS);
      const data = Array.isArray(res.data) ? res.data : [];
      setAssignments(data);
      message.success(`Tải thành công ${data.length} phân quyền.`);
    } catch (err) {
      message.error("Không thể tải danh sách phân quyền!");
      console.error(
        "Lỗi API tải Phân quyền:",
        err.response?.data || err.message
      );
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải danh sách Staff và Trạm (Cho Modal Gán và Ánh xạ tên)
  const fetchAuxiliaryData = useCallback(async () => {
    // Tải Staff
    try {
      // API: GET /api/admin/user
      const staffRes = await api.get(API_USERS_ALL);
      // Giả định API trả về một mảng User object
      const staffsFetched = Array.isArray(staffRes.data) ? staffRes.data : [];
      setAllStaffs(staffsFetched);
    } catch (err) {
      message.warning(
        "Không thể tải danh sách nhân viên (Kiểm tra API /admin/user)."
      );
      console.error("Lỗi API tải nhân viên:", err.response?.data || err.message);
    }

    // Tải Trạm
    try {
      // API: GET /api/station
      const stationRes = await api.get(API_STATIONS_ALL);
      // Giả định API trả về một mảng Station object
      const stationsFetched = Array.isArray(stationRes.data)
        ? stationRes.data
        : [];
      setAllStations(stationsFetched);
    } catch (err) {
      message.warning("Không thể tải danh sách trạm (Kiểm tra API /station).");
      console.error("Lỗi API tải trạm:", err.response?.data || err.message);
    }
  }, []);

  // --- B. HÀM XỬ LÝ THAO TÁC DELETE ---

  // Xử lý HỦY GÁN (DELETE /api/staff-station-assignment/staff/{staffId}/station/{stationId})
  const handleUnassign = async (staffId, stationId) => {
    setLoading(true);
    try {
      await api.delete(
        `${API_ASSIGNMENTS}/staff/${staffId}/station/${stationId}`
      );

      message.success(
        `✅ Xóa phân quyền Nhân viên ${staffId} khỏi Trạm ${stationId} thành công.`
      );
      await fetchAllAssignments(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      message.error("❌ Lỗi không thể xóa phân quyền nhân viên này khỏi trạm.");
      console.error(error);
    }
    setLoading(false);
  };

  // --- C. EFFECT CHẠY LẦN ĐẦU ---
  useEffect(() => {
    // Tải dữ liệu chính và phụ khi vào trang
    fetchAllAssignments();
    fetchAuxiliaryData();
  }, [fetchAllAssignments, fetchAuxiliaryData]);

  // --- D. ÁNH XẠ DỮ LIỆU ĐỂ HIỂN THỊ TÊN, ID VÀ LỌC (SỬ DỤNG useMemo ĐỂ LỌC) ---
  const filteredAndMappedAssignments = useMemo(() => {
    // Tạo map (bản đồ) ID -> Tên để tra cứu nhanh chóng
    const staffMap = new Map(
      allStaffs.map((s) => [
        String(s.id),
        s.username || s.fullName || `ID: ${s.id}`,
      ])
    );
    const stationMap = new Map(allStations.map((t) => [String(t.id), t.name]));

    // Bước 1: Ánh xạ dữ liệu Assignment
    const mapped = assignments.map((record) => {
      const staffIdStr = String(record.staffId);
      const stationIdStr = String(record.stationId);

      const staffName = staffMap.get(staffIdStr);
      const stationName = stationMap.get(stationIdStr);

      return {
        ...record,
        // Thêm trường mới để hiển thị và lọc
        staffName: staffName || `ID: ${record.staffId}`,
        stationName: stationName || `ID: ${record.stationId}`,
      };
    });

    // Lấy giá trị tìm kiếm đã chuẩn hóa
    const staffSearchValue = (searchStaffId || "").trim().toLowerCase();
    const stationSearchValue = (searchStationId || "").trim().toLowerCase();

    // Bước 2: Lọc dữ liệu
    return mapped.filter((record) => {
      const staffMatch = staffSearchValue
        ? record.staffName.toLowerCase().includes(staffSearchValue)
        : true;

      const stationMatch = stationSearchValue
        ? record.stationName.toLowerCase().includes(stationSearchValue)
        : true;

      // Chỉ hiển thị khi cả 2 điều kiện tìm kiếm đều thỏa mãn (hoặc không tìm kiếm gì)
      return staffMatch && stationMatch;
    });
    // Dependency: Phụ thuộc vào assignments, allStaffs, allStations (dữ liệu gốc), và 2 giá trị tìm kiếm
  }, [assignments, allStaffs, allStations, searchStaffId, searchStationId]);

  // --- E. ĐỊNH NGHĨA CỘT CHO BẢNG ---

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: (
        <Space size={4}>
          <UserOutlined />
          Nhân viên
        </Space>
      ),
      // Sử dụng trường staffName đã được ánh xạ
      dataIndex: "staffName",
      key: "staffName",
      render: (text, record) => (
        <Tooltip title={`Staff ID: ${record.staffId}`}>
          <Tag color="blue">{text}</Tag>
        </Tooltip>
      ),
    },
    {
      title: (
        <Space size={4}>
          <DesktopOutlined />
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
    },
    {
      title: (
        <Space size={4}>
          <CalendarOutlined />
          Ngày phân quyền
        </Space>
      ),
      dataIndex: "assignedAt",
      key: "assignedAt", 
      render: (_, record) => {
        // Ưu tiên assignedAt (từ API response)
        const dateString = record.assignedAt || record.createdAt;

        if (!dateString) return "—";

        const dateObj = new Date(dateString);

        // Kiểm tra ngày hợp lệ
        if (isNaN(dateObj.getTime())) return "—";

        // Định dạng ngày: DD/MM/YYYY
        return dateObj.toLocaleDateString("vi-VN", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      },
      // sorter: (a, b) => {
      //   const dateA = a.assignedAt// Sử dụng assignedAt để so sánh
      //   const dateB = b.assignedAt
      //   return new Date(dateA) - new Date(dateB);
      // },
    },
    {
      title: "Thao tác",
      key: "actions",
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

  // --- F. RENDER UI ---

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Quản lý phân quyền"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setIsAssignModalVisible(true)}
              loading={loading}
            >
              Phân quyền
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchAllAssignments();
                fetchAuxiliaryData();
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
              prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Tìm nhân viên"
              onChange={(e) => setSearchStaffId(e.target.value)}
              value={searchStaffId}
              allowClear
            />
          </Col>              

          {/* 2. Tìm Trạm (Lọc theo Station ID/Name) */}
          <Col xs={24} sm={12}>
            <Input
              prefix={<DesktopOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Tìm trạm"
              onChange={(e) => setSearchStationId(e.target.value)}
              value={searchStationId}
              allowClear
            />
          </Col>
        </Row>

        {/* Bảng Hiển thị Assignments */}
        <Table
          columns={columns}
          // SỬ DỤNG DỮ LIỆU ĐÃ LỌC
          dataSource={filteredAndMappedAssignments}
          loading={loading}
          rowKey={(record) => `${record.staffId}-${record.stationId}`}
          pagination={{ 
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trên ${total} phân quyền`, 
            }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal cho chức năng Gán Staff-Station */}
      <AssignStaffModal
        isModalVisible={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        onSuccess={() => {
          setIsAssignModalVisible(false);
          fetchAllAssignments();
        }}
        staffList={allStaffs}
        stationList={allStations}
        loading={loading}
      />
    </div>
  );
}
