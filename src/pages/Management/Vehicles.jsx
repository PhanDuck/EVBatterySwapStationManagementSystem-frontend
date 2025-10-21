import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Option } = Select;

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batteryTypes, setBatteryTypes] = useState([]);

  // 📦 Lấy thông tin người dùng (từ localStorage)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || {};
    } catch {
      return {};
    }
  })();

  // normalize role to uppercase string to avoid case mismatch
  const role = String(user?.role || "USER")
    .trim()
    .toUpperCase(); // e.g. "DRIVER", "ADMIN"
  const userId = user?.userID || user?.id || null;

  // 📦 Load vehicles theo role (ADMIN/STAFF => all, DRIVER => /vehicle/my-vehicles, USER => filter own)
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        let res;

        if (role === "ADMIN" || role === "STAFF") {
          // Admin & Staff lấy tất cả
          res = await api.get("/vehicle");
        } else {
          // USER hoặc fallback: lấy tất cả rồi filter theo userId nếu có
          res = await api.get("/vehicle/my-vehicles");
        }

        // Normalize response shape
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data && Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setVehicles(list);
      } catch (err) {
        console.error("Fetch vehicles error:", err);
        if (err?.response?.status === 403) {
          message.error("Không có quyền truy cập dữ liệu này!");
        } else if (err?.response?.status === 401) {
          message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else {
          message.error("Không thể tải danh sách phương tiện!");
        }
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [role, userId]);
  useEffect(() => {
    const fetchBatteryTypes = async () => {
      try {
        const res = await api.get("/battery-type");
        setBatteryTypes(res.data);
      } catch (error) {
        console.error("Không thể tải danh sách loại pin:", error);
      }
    };
    fetchBatteryTypes();
  }, []);

  // --- Thêm hàm tra cứu nhanh ---
  const getBatteryTypeName = (id) => {
    const type = batteryTypes.find((t) => t.id === id);
    return type ? type.name : "Không xác định";
  };

  // 🧾 Cột bảng
  const columns = [
    {
      title: "Vehicle ID",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Space>
          <CarOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "License Plate",
      dataIndex: "plateNumber",
      key: "plateNumber",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Make / Model",
      key: "makeModel",
      render: (_, record) => <span>{record.model}</span>,
    },
    {
      title: "Battery Type",
      dataIndex: "batteryTypeId", // Giữ ID từ data
      key: "batteryTypeId",
      render: (id) => getBatteryTypeName(id),
    },
    {
      title: "Owner ID",
      dataIndex: "userID",
      key: "userID",
      render: (v) => v || "—",
    },
    {
      /* Status column removed per request */
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        // DRIVER: view-only (no edit/delete)
        const isDriver = role === "DRIVER";
        // const canEditOrDelete =
        //   !isDriver &&
        //   (role === "ADMIN" ||
        //     role === "STAFF" ||
        //     (role === "USER" && record.userID === userId));
        return isDriver ? (
          <Tag color="blue">View only</Tag>
        ) : (
          <Space>
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
              onClick={() => handleDelete(record.vehicleID)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  // 🟢 CREATE / UPDATE
  const handleSubmit = async (values) => {
    const payload = {
      vin: values.vin,
      plateNumber: values.plateNumber,
      model: values.model,
      batteryTypeId: values.batteryTypeId,
    };

    try {
      if (editingVehicle) {
        // 🟡 Cập nhật phương tiện
        await api.put(`/vehicle/${editingVehicle.id}`, payload);

        setVehicles((prev) =>
          prev.map((v) =>
            v.id === editingVehicle.id ? { ...v, ...payload } : v
          )
        );

        message.success("Cập nhật phương tiện thành công!");
      } else {
        // 🟢 Tạo mới phương tiện
        const res = await api.post("/vehicle", payload);
        const newVehicle = res?.data || { ...payload, id: Date.now() };

        setVehicles((prev) => [newVehicle, ...prev]);
        message.success("Đăng ký phương tiện thành công!");
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error("❌ Vehicle submit error:", err);

      if (err?.response?.status === 403) {
        message.error("Bạn không có quyền thực hiện hành động này!");
      } else if (err?.response?.status === 400) {
        message.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!");
      } else {
        message.error("Không thể lưu thông tin phương tiện!");
      }
    }
  };

  // 🔴 DELETE
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xóa phương tiện này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await api.delete(`/vehicle/${id}`);
          setVehicles((prev) => prev.filter((v) => v.vehicleID !== id));
          message.success("Đã xóa phương tiện!");
        } catch (err) {
          console.error(err);
          if (err?.response?.status === 403) {
            message.error("Bạn không có quyền xóa phương tiện này.");
          } else {
            message.error("Không thể xóa phương tiện!");
          }
        }
      },
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalVisible(true);
    // normalize naming: use plateNumber in form
    form.setFieldsValue({
      plateNumber: vehicle.plateNumber,
      make: vehicle.make,
      model: vehicle.model,
      batteryType: vehicle.batteryType,
      status: vehicle.status,
    });
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // 🔍 Filter
  const filteredData = useMemo(() => {
    return vehicles.filter((v) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !(v.make || "").toLowerCase().includes(q) &&
          !(v.model || "").toLowerCase().includes(q) &&
          !(v.plateNumber || "").toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vehicles, searchText, statusFilter]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Vehicle Management"
        extra={
          <Space>
            <Input
              placeholder="Search by model, plate, or make"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Maintenance">Maintenance</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Suspended">Suspended</Option>
            </Select>

            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Register Vehicle
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          {filteredData.length === 0 && !loading ? (
            <Empty description="Không có phương tiện" />
          ) : (
            <Table
              columns={columns}
              dataSource={vehicles}
              rowKey={(record) => record.vehicleID || record.id || record.vin}
              pagination={{
                pageSize: 10,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} vehicles`,
              }}
            />
          )}
        </Spin>
      </Card>

      <Modal
        title={editingVehicle ? "Edit Vehicle" : "Register New Vehicle"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Mã VIN */}
          <Form.Item
            name="vin"
            label="Mã VIN (Vehicle Identification Number)"
            rules={[
              { required: true, message: "Vui lòng nhập mã VIN!" },
              { min: 5, message: "Mã VIN phải có ít nhất 5 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập mã VIN (số khung xe)" />
          </Form.Item>

          {/* Biển số xe */}
          <Form.Item
            name="plateNumber"
            label="Biển số xe"
            rules={[{ required: true, message: "Vui lòng nhập biển số xe!" }]}
          >
            <Input placeholder="VD: 83A-12345" />
          </Form.Item>

          {/* Dòng xe */}
          <Form.Item
            name="model"
            label="Dòng xe"
            rules={[{ required: true, message: "Vui lòng nhập dòng xe!" }]}
          >
            <Input placeholder="VD: Model 3, VinFast Feliz..." />
          </Form.Item>

          {/* Loại pin */}
          <Form.Item
            name="batteryTypeId"
            label="Loại pin"
            rules={[{ required: true, message: "Vui lòng chọn loại pin!" }]}
          >
            <Select placeholder="Chọn loại pin">
              {batteryTypes && batteryTypes.length > 0 ? (
                batteryTypes.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))
              ) : (
                <Option disabled>Không có dữ liệu loại pin</Option>
              )}
            </Select>
          </Form.Item>

          {/* Nút thao tác */}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVehicle ? "Cập nhật" : "Đăng ký"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehiclePage;
