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
  const [batteryTypes, setBatteryTypes] = useState([]);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || {};
    } catch {
      return {};
    }
  })();

  const role = String(user?.role || "USER").trim().toUpperCase();
  const isDriver = role === "DRIVER";

  // 🚗 Lấy danh sách vehicle
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res =
          role === "ADMIN" || role === "STAFF"
            ? await api.get("/vehicle")
            : await api.get("/vehicle/my-vehicles");

        const list = (
          Array.isArray(res.data)
            ? res.data
            : res.data?.data && Array.isArray(res.data.data)
            ? res.data.data
            : []
        ).sort((a, b) => b.id - a.id);

        setVehicles(list);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách phương tiện!");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [role]);

  // 🔋 Lấy loại pin
  useEffect(() => {
    const fetchBatteryTypes = async () => {
      try {
        const res = await api.get("/battery-type");
        setBatteryTypes(res.data || []);
      } catch (error) {
        console.error("Không thể tải danh sách loại pin:", error);
      }
    };
    fetchBatteryTypes();
  }, []);

  const getBatteryTypeName = (id) => {
    const type = batteryTypes.find((t) => t.id === id);
    return type ? type.name : "Không xác định";
  };

  // 🧾 Cột bảng
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      render: (text) => (
        <Space>
          <CarOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: "Biển số xe",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "Dòng xe",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Loại pin",
      dataIndex: "batteryTypeId",
      key: "batteryTypeId",
      render: (id) => getBatteryTypeName(id),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => {
        const isDriver = role === "DRIVER";
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
              Cập nhật
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.id)}
              disabled={record.status === 'INACTIVE'}
            >
              Xóa
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
        await api.put(`/vehicle/${editingVehicle.id}`, payload);
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingVehicle.id ? { ...v, ...payload } : v))
        );
        message.success("Cập nhật phương tiện thành công!");
      } else {
        const res = await api.post("/vehicle", payload);
        const newVehicle = res?.data || { ...payload, id: Date.now() };
        setVehicles((prev) => [newVehicle, ...prev]);
        message.success("Đăng ký phương tiện thành công!");
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error("❌ Vehicle submit error:", err);
      message.error("Không thể lưu thông tin phương tiện!");
    }
  };

  // 🔴 SOFT DELETE
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Bạn có chắc muốn vô hiệu hóa xe này?",
      content: "Hành động này sẽ chuyển trạng thái xe thành INACTIVE.",
      okText: "Vô hiệu hóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await api.delete(`/vehicle/${id}`);
          setVehicles((prev) =>
            prev.map((v) =>
              v.id === id ? { ...v, status: "INACTIVE" } : v
            )
          );
          message.success("Đã vô hiệu hóa phương tiện!");
        } catch (err) {
          console.error(err);
          message.error("Không thể vô hiệu hóa phương tiện!");
        }
      },
    });
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalVisible(true);
    form.setFieldsValue({
      vin: vehicle.vin,
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      batteryTypeId: vehicle.batteryTypeId,
    });
  };

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const filteredData = useMemo(() => {
    return vehicles.filter((v) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !(v.model || "").toLowerCase().includes(q) &&
          !(v.plateNumber || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [vehicles, searchText]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Vehicle Management"
        extra={
          <Space>
            <Input
              placeholder="Search by model or plate"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            {isDriver && (
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
              rowKey={(record) => record.id || record.vin}
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
            name="vin"
            label="Mã VIN (Vehicle Identification Number)"
            rules={[
              { required: true, message: "Vui lòng nhập mã VIN!" },
              { min: 5, message: "Mã VIN phải có ít nhất 5 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập mã VIN (số khung xe)" />
          </Form.Item>

          <Form.Item
            name="plateNumber"
            label="Biển số xe"
            rules={[{ required: true, message: "Vui lòng nhập biển số xe!" }]}
          >
            <Input placeholder="VD: 83A-12345" />
          </Form.Item>

          <Form.Item
            name="model"
            label="Dòng xe"
            rules={[{ required: true, message: "Vui lòng nhập dòng xe!" }]}
          >
            <Input placeholder="VD: Model 3, VinFast Feliz..." />
          </Form.Item>

          <Form.Item
            name="batteryTypeId"
            label="Loại pin"
            rules={[{ required: true, message: "Vui lòng chọn loại pin!" }]}
          >
            <Select placeholder="Chọn loại pin">
              {batteryTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

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