import React, { useState, useEffect, useMemo } from "react";
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Spin, Empty,} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CarOutlined, } from "@ant-design/icons";
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

  // 📦 Lấy thông tin người dùng (từ localStorage)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || {};
    } catch {
      return {};
    }
  })();

  // normalize role to uppercase string to avoid case mismatch
  const role = String(user?.role || "USER").trim().toUpperCase(); // e.g. "DRIVER", "ADMIN"
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
        const list = Array.isArray(res.data) ? res.data : (res.data?.data && Array.isArray(res.data.data) ? res.data.data : []);
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

  // 🧾 Cột bảng
  const columns = [
    {
      title: "Vehicle ID",
      dataIndex: "vehicleID",
      key: "vehicleID",
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
      render: (_, record) => (
        <span>
          <strong>{record.make}</strong> {record.model}
        </span>
      ),
    },
    {
      title: "Battery Type",
      dataIndex: "batteryType",
      key: "batteryType",
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
        const canEditOrDelete = !isDriver && (role === "ADMIN" || role === "STAFF" || (role === "USER" && record.userID === userId));
        return isDriver ? (
          <Tag color="blue">View only</Tag>
        ) : (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              disabled={!canEditOrDelete}
            >
              Edit
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.vehicleID)}
              disabled={!canEditOrDelete}
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
      plateNumber: values.plateNumber ?? values.licensePlate,
      make: values.make,
      model: values.model,
      batteryType: values.batteryType,
      status: values.status,
      userID: userId,
    };

    try {
      if (editingVehicle) {
        await api.put(`/vehicle/${editingVehicle.vehicleID}`, payload);
        setVehicles((prev) =>
          prev.map((v) =>
            v.vehicleID === editingVehicle.vehicleID ? { ...v, ...payload } : v
          )
        );
        message.success("Cập nhật phương tiện thành công!");
      } else {
        const res = await api.post("/vehicle", payload);
        // nếu backend trả về object mới thì push, nếu không có thì fallback dùng payload
        setVehicles((prev) => [res.data ?? { ...payload, vehicleID: res.data?.vehicleID ?? `VH-${Date.now()}` }, ...prev]);
        message.success("Thêm phương tiện thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error("Vehicle submit error:", err);
      if (err?.response?.status === 403) {
        message.error("Bạn không có quyền thực hiện hành động này.");
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

  const showRegisterBtn = role !== "DRIVER"; // driver cannot register

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

            {showRegisterBtn && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Register Vehicle
              </Button>
            )}
          </Space>
        }
      >
        <Spin spinning={loading}>
          {filteredData.length === 0 && !loading ? (
            <Empty description="Không có phương tiện" />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="vehicleID"
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
          <Form.Item
            name="plateNumber"
            label="License Plate"
            rules={[{ required: true, message: "Please input license plate!" }]}
          >
            <Input placeholder="Enter license plate" />
          </Form.Item>

          <Form.Item
            name="make"
            label="Make"
            rules={[{ required: true, message: "Please input make!" }]}
          >
            <Input placeholder="Tesla, BYD, NIO" />
          </Form.Item>

          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: "Please input model!" }]}
          >
            <Input placeholder="Model 3, Tang EV" />
          </Form.Item>

          <Form.Item
            name="batteryType"
            label="Battery Type"
            rules={[{ required: true, message: "Please select battery type!" }]}
          >
            <Select placeholder="Select battery type">
              <Option value="Tesla Battery">Tesla Battery</Option>
              <Option value="BYD Blade">BYD Blade</Option>
              <Option value="CATL NCM">CATL NCM</Option>
              <Option value="LFP Battery">LFP Battery</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status!" }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Maintenance">Maintenance</Option>
              <Option value="Inactive">Inactive</Option>
              <Option value="Suspended">Suspended</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVehicle ? "Update" : "Register"}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VehiclePage;
