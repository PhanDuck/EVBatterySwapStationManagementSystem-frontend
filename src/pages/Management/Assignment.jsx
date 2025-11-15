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

const STAFF_ROLE = "STAFF";
const { Option } = Select;

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
      await api.post("/staff-station-assignment", values);
      showToast(
        "success",  
        `Phân quyền nhân viên ${values.staffId} quản lý trạm ${values.stationId} thành công!`
      );
      onSuccess();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        "Phân quyền nhân viên thất bại, vui lòng thử lại!";
      showToast("error", message);
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
            loading={loading}
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
            loading={loading}
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
  const [assignments, setAssignments] = useState([]);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [auxLoading, setAuxLoading] = useState(false);
  const [allStaffs, setAllStaffs] = useState([]);
  const [allStations, setAllStations] = useState([]);
  const [searchStaffId, setSearchStaffId] = useState("");
  const [searchStationId, setSearchStationId] = useState("");

  // --- A. FUNCTIONS TẢI DỮ LIỆU CHÍNH ---

  // Tải TẤT CẢ các assignment Staff-Station (GET /api/staff-station-assignment)
  const fetchAllAssignments = useCallback(async () => {
    setLoading(true);
    try {
      // API: GET /api/staff-station-assignment
      const res = await api.get("/staff-station-assignment");
      const data = Array.isArray(res.data) ? res.data : [];
      setAssignments(data);
    } catch (error) {
      const message =
        error.response?.data ||
        "Lấy danh sách phân quyền nhân viên thất bại, vui lòng thử lại!";
      showToast("error", message);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải danh sách Staff và Trạm (Cho Modal Gán và Ánh xạ tên)
  const fetchAuxiliaryData = useCallback(async () => {
    setAuxLoading(true);
    let success = true;

    // Tải Staff
    try {
      const staffRes = await api.get("/admin/user");
      const staffsFetched = Array.isArray(staffRes.data) ? staffRes.data : [];
      setAllStaffs(staffsFetched);
    } catch (error) {
      success = false;
      const message =
        error.response?.data ||
        "Lấy danh sách nhân viên thất bại, vui lòng thử lại!";
      showToast("error", message);
    }

    // Tải Trạm
    try {
      const stationRes = await api.get("/station");
      const stationsFetched = Array.isArray(stationRes.data)
        ? stationRes.data
        : [];
      setAllStations(stationsFetched);
    } catch (error) {
      success = false;
      const message =
        error.response?.data ||
        "Lấy danh sách trạm thất bại, vui lòng thử lại!";
      showToast("error", message);
    }

    setAuxLoading(false); // Kết thúc loading cho dữ liệu phụ
    return success;
  }, []);

  // Xử lý mở Modal Phân quyền: Gọi API phụ nếu chưa có dữ liệu
  const handleOpenAssignModal = async () => {
    // Kiểm tra nếu chưa có dữ liệu Staff/Station hoặc danh sách rỗng
    if (allStaffs.length === 0 || allStations.length === 0) {
        const success = await fetchAuxiliaryData();
        if (!success) {
            // Nếu fetch thất bại, không mở modal
            return;
        }
    }
    setIsAssignModalVisible(true);
  }

  // --- B. HÀM XỬ LÝ THAO TÁC DELETE ---

  // Xử lý HỦY GÁN
  const handleUnassign = async (staffId, stationId) => {
    setLoading(true);
    try {
      await api.delete(
        `${"/staff-station-assingment"}/staff/${staffId}/station/${stationId}`
      );

      showToast(
        "success",
        `Xóa phân quyền Nhân viên ${staffId} khỏi Trạm ${stationId} thành công.`
      );
      await fetchAllAssignments(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      const message =
        error.response?.data ||
        "Xóa phân quyền nhân viên thất bại, vui lòng thử lại!";
      showToast("error", message);
    }
  };

  // --- C. EFFECT CHẠY LẦN ĐẦU ---
  useEffect(() => {
    fetchAllAssignments();
  }, [fetchAllAssignments]);

  // --- D. ÁNH XẠ DỮ LIỆU ĐỂ HIỂN THỊ TÊN, ID VÀ LỌC (SỬ DỤNG useMemo ĐỂ LỌC) ---
  const filteredAndMappedAssignments = useMemo(() => {
    // Lấy giá trị tìm kiếm đã chuẩn hóa
    const staffSearchValue = (searchStaffId || "").trim().toLowerCase();
    const stationSearchValue = (searchStationId || "").trim().toLowerCase();

    // Lọc dữ liệu (Không cần ánh xạ vì API đã trả về staffName/stationName)
    return assignments.filter((record) => {
      // Đảm bảo các trường name tồn tại để gọi .toLowerCase()
      const currentStaffName = (record.staffName || "").toLowerCase();
      const currentStationName = (record.stationName || "").toLowerCase();
      
      const staffMatch = staffSearchValue
        ? currentStaffName.includes(staffSearchValue) || String(record.staffId).includes(staffSearchValue)
        : true;

      const stationMatch = stationSearchValue
        ? currentStationName.includes(stationSearchValue) || String(record.stationId).includes(stationSearchValue)
        : true;

      // Chỉ hiển thị khi cả 2 điều kiện tìm kiếm đều thỏa mãn
      return staffMatch && stationMatch;
    });
    // Dependency: Phụ thuộc vào assignments (dữ liệu gốc), và 2 giá trị tìm kiếm
  }, [assignments, searchStaffId, searchStationId]);
  
  // --- E. ĐỊNH NGHĨA CỘT CHO BẢNG ---

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
      width: 200,
    },
    {
      title: (
        <Space size={4}>
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
      // sorter: (a, b) => {
      //   const dateA = a.assignedAt// Sử dụng assignedAt để so sánh
      //   const dateB = b.assignedAt
      //   return new Date(dateA) - new Date(dateB);
      // },
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 100,
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
              onClick={handleOpenAssignModal}
              loading={loading || auxLoading}
            >
              Phân quyền
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchAllAssignments();
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
              placeholder="Tìm nhân viên"
              onChange={(e) => setSearchStaffId(e.target.value)}
              value={searchStaffId}
              allowClear
            />
          </Col>

          {/* 2. Tìm Trạm (Lọc theo Station ID/Name) */}
          <Col xs={24} sm={12}>
            <Input
              prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
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
          dataSource={filteredAndMappedAssignments}
          loading={loading}
          rowKey={(record) => record.id || `${record.staffId}-${record.stationId}`}
          pagination={{
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trên ${total} phân quyền`,
          }}
          scroll={{ x: 700 }}
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
        loading={auxLoading}
      />
    </div>
  );
}
