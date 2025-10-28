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
  Row, 
  Col, 
  Typography, 
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  SwapOutlined, 
  ThunderboltOutlined, 
  HeartOutlined, 
  CalendarOutlined, 
  EnvironmentOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Option } = Select;
const { Title, Text } = Typography;

const VehiclePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [batteryTypes, setBatteryTypes] = useState([]);
  const [stations, setStations] = useState([]);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleHistory, setVehicleHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || {};
    } catch {
      return {};
    }
  })();

  const role = String(user?.role || "USER").trim().toUpperCase();
  const isDriver = role === "DRIVER";

// --- Component Modal Lịch sử Đổi Pin ---
const VehicleSwapHistoryModal = ({
  open,
  onClose,
  vehicleHistory,
  loading,
  //vehicleId,
  stations,
}) => {
  const swapCount = vehicleHistory.length;

  // ⚙️ Component con hiển thị thông tin pin
  const BatteryInfoCard = ({ title, batteryData, type }) => {
    const color = type === "new" ? "#52c41a" : "#faad14"; // Xanh cho Pin Mới (Swap In), Vàng cho Pin Cũ (Swap Out)

    const isSwapIn = type === "new";
    const batteryId = isSwapIn
      ? batteryData?.swapOutBatteryId
      : batteryData?.swapInBatteryId;
    const model = isSwapIn
      ? batteryData?.swapOutBatteryModel
      : batteryData?.swapInBatteryModel;
    const chargeLevel = isSwapIn
      ? batteryData?.swapOutBatteryChargeLevel
      : batteryData?.swapInBatteryChargeLevel;
    const soh = isSwapIn
      ? batteryData?.swapOutBatteryHealth
      : batteryData?.swapInBatteryHealth;

    return (
      <Card
        bordered
        title={
          <Text strong style={{ color: color }}>
            {title}
          </Text>
        }
        style={{
          minHeight: 250,
          borderColor: color,
        }}
        headStyle={{ backgroundColor: "#fafafa" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {/* 1. ID Pin */}
          <Row justify="space-between" style={{ paddingBottom: 5 }}>
            <Col>
              <Text strong>ID Pin:</Text>
            </Col>
            <Col>
              <Text>{batteryId || "—"}</Text>
            </Col>
          </Row>
          <Divider style={{ margin: "5px 0" }} />

          {/* 2. Loại Pin (Model) */}
          <Row justify="space-between" style={{ paddingBottom: 5 }}>
            <Col>
              <Text strong>Loại Pin:</Text>
            </Col>
            <Col>
              <Text>{model || "—"}</Text>
            </Col>
          </Row>
          <Divider style={{ margin: "5px 0" }} />

          {/* 3. Mức sạc (Charge Level) */}
          <Row justify="space-between" style={{ paddingBottom: 5 }}>
            <Col>
              <Text strong>
                <ThunderboltOutlined style={{ color: "#faad14" }} /> Mức sạc (%):
              </Text>
            </Col>
            <Col>
              <Tag color={chargeLevel > 70 ? "green" : "orange"}>
                {chargeLevel || "—"}
              </Tag>
            </Col>
          </Row>
          <Divider style={{ margin: "5px 0" }} />

          {/* 4. Tình trạng pin (State of Health) */}
          <Row justify="space-between">
            <Col>
              <Text strong>
                <HeartOutlined style={{ color: "#ff4d4f" }} /> Tình trạng pin (%):
              </Text>
            </Col>
            <Col>
              <Tag color={soh > 70 ? "green" : "orange"}>
                {soh || "—"}
              </Tag>
            </Col>
          </Row>
        </Space>
      </Card>
    );
  };

  const HistoryItem = ({ transaction, index, totalSwaps }) => {
    // 💡 Sử dụng JS Date Object để định dạng thay vì moment
    const date = new Date(transaction.endTime);
    const timeString = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateString = date.toLocaleDateString("vi-VN");
    const dateTimeFormatted = `${timeString} ${dateString}`;
    const station = stations.find(s => s.id === transaction.stationId);
    const stationName = station ? station.name : "Trạm không rõ";
    const swapNumber = totalSwaps - index;

      return (
        <Card
          style={{ marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          bodyStyle={{ padding: "16px" }}
        >
          {/* Header - ID Giao dịch, Thời gian, Trạm */}
          <Row
            justify="space-between"
            align="middle"
            style={{
              marginBottom: 15,
              paddingBottom: 10,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Lần giao dịch {swapNumber}
              </Title>
              <Text type="secondary" style={{ fontSize: "0.85em" }}>
                ID: <Text code>{transaction.id}</Text>
              </Text>
              <Space size="small" style={{ marginTop: 4 }}>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Text type="secondary" style={{ fontSize: "0.85em" }}>
                  {dateTimeFormatted}
                </Text>
              </Space>
            </Col>
            <Col style={{ textAlign: "right" }}>
              <Space size="small">
                <EnvironmentOutlined style={{ color: "#52c41a" }} />
                <Text strong>{stationName}</Text>
              </Space>
              {/* <Text
                type="secondary"
                style={{ display: "block", fontSize: "0.85em" }}
              >
                NV: {transaction.staffName || "N/A"}
              </Text> */}
            </Col>
          </Row>

        {/* Pin Cũ vs Pin Mới */}
        <Row gutter={16} align="middle">
          <Col span={11}>
            <BatteryInfoCard
              title="Pin cũ (Đã tháo ra)"
              batteryData={transaction}
              type="old"
            />
          </Col>
          <Col span={2} style={{ textAlign: "center" }}>
            <SwapOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
          </Col>
          <Col span={11}>
            <BatteryInfoCard
              title="Pin mới (Đã lắp vào)"
              batteryData={transaction}
              type="new"
            />
          </Col>
        </Row>
      </Card>
    );
  };
  
  return (
    <Modal
      title={
        <Title level={3} style={{ margin: 0 }}>
          Lịch sử đổi pin của xe
        </Title>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000} // Tăng chiều rộng để phù hợp với 2 cột
      destroyOnClose={true}
    >
      <Spin spinning={loading}>
        {swapCount === 0 && !loading ? (
          <Empty description="Phương tiện này chưa có lịch sử đổi pin." />
        ) : (
          <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
            {/* Sắp xếp history theo endTime mới nhất trước */}
            {vehicleHistory.map((item, index) => (
              <HistoryItem 
                transaction={item} 
                key={item.id} 
                index={index} 
                totalSwaps={swapCount} // ⬅️ Thêm totalSwaps
              />
            ))}
          </div>
        )}
      </Spin>
    </Modal>
  );
};

  // 🔄 Lấy số lần đổi pin cho tất cả các xe 
  const fetchSwapCountsForAllVehicles = async (initialVehicles) => {
    if (initialVehicles.length === 0) return;

    try {
      // Tạo một mảng promises để gọi API cho từng xe
      const countPromises = initialVehicles.map(async (vehicle) => {
        try {
          // Giả định API cho số lần đổi pin của một xe là /swap-transaction/vehicle/{id}/count
          const res = await api.get(
            `/swap-transaction/vehicle/${vehicle.id}/count`
          );
          // Giả sử API trả về đối tượng { count: N } hoặc chỉ là số N
          const count = res.data?.count !== undefined ? res.data.count : (typeof res.data === 'number' ? res.data : 0);
          return { id: vehicle.id, swapCount: count };
        } catch (error) {
          console.error(`Lỗi tải SwapCount cho xe ${vehicle.id}:`, error);
          return { id: vehicle.id, swapCount: 0 };
        }
      });

      // Chờ tất cả promises hoàn thành
      const results = await Promise.all(countPromises);
      const countMap = results.reduce((map, item) => {
        map[item.id] = item.swapCount;
        return map;
      }, {});

      // Cập nhật state vehicles với swapCount
      setVehicles((prev) =>
        prev.map((v) => ({ ...v, swapCount: countMap[v.id] || 0 }))
      );
    } catch (error) {
      console.error("Lỗi tổng thể khi tải SwapCounts:", error);
    }
  };

  // 🚗 Lấy danh sách vehicle và tính SwapCount ngay lập tức
    useEffect(() => {
        const fetchVehiclesAndCounts = async () => {
            setLoading(true);
            let initialVehicleList = [];

            try {
                // 1. Tải danh sách xe
                const res =
                    role === "ADMIN" || role === "STAFF"
                        ? await api.get("/vehicle")
                        : await api.get("/vehicle/my-vehicles");

                initialVehicleList = (
                    Array.isArray(res.data)
                        ? res.data
                        : res.data?.data && Array.isArray(res.data.data)
                            ? res.data.data
                            : []
                ).sort((a, b) => b.id - a.id);

                // 2. Tải số lần đổi pin cho TẤT CẢ các xe
                const vehiclesWithCounts = await Promise.all(
                    initialVehicleList.map(async (vehicle) => {
                        try {
                            // SỬ DỤNG API CÓ SẴN ĐỂ LẤY LỊCH SỬ VÀ ĐẾM SỐ LẦN ĐỔI PIN
                            const historyRes = await api.get(
                                `/swap-transaction/vehicle/${vehicle.id}/history`
                            );
                            
                            const historyList = Array.isArray(historyRes.data)
                                ? historyRes.data
                                : historyRes.data?.data || [];
                            
                            // Gán swapCount bằng số lượng giao dịch đã nhận được
                            const swapCount = historyList.length;

                            return { ...vehicle, swapCount: swapCount };
                        } catch (error) {
                            // Nếu có lỗi, mặc định số lần đổi pin là 0
                            console.error(`Lỗi tải SwapCount cho xe ${vehicle.id}:`, error);
                            return { ...vehicle, swapCount: 0 };
                        }
                    })
                );

                // 3. CẬP NHẬT state vehicles với dữ liệu đầy đủ
                setVehicles(vehiclesWithCounts);

            } catch (err) {
                message.error("Không thể tải danh sách phương tiện!");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVehiclesAndCounts();
        // Loại bỏ fetchSwapCountsForAllVehicles khỏi dependency array vì nó không còn tồn tại
    }, [role]);

  // 📍 Lấy danh sách trạm
  useEffect(() => {
    const fetchStations = async () => {
        try {
            const res = await api.get("/station");
            setStations(res.data || []);
        } catch (error) {
            console.error("Không thể tải danh sách trạm:", error);
        }
    };
    fetchStations();
  }, []);

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

  // 🆕 Hàm xử lý xem lịch sử
  const handleViewHistory = async (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setIsHistoryModalVisible(true);
    setHistoryLoading(true);
    setVehicleHistory([]); // Xóa lịch sử cũ

    try {
      const res = await api.get(
        `/swap-transaction/vehicle/${vehicleId}/history`
      );
      const historyList = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const newSwapCount = historyList.length;

      setVehicleHistory(
        historyList.sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
      );

      setVehicles(prevVehicles =>
          prevVehicles.map(v => 
              v.id === vehicleId 
                  ? { ...v, swapCount: newSwapCount } 
                  : v
          )
      );

    } catch (error) {
      message.error("Không thể tải lịch sử đổi pin.");
      console.error("❌ Lỗi tải lịch sử đổi pin:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryModalClose = () => {
    setIsHistoryModalVisible(false);
    setSelectedVehicleId(null);
    setVehicleHistory([]);
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Lần đổi pin",
      dataIndex: "swapCount", 
      key: "swapCount",
      width: 120,
      sorter: (a, b) => (a.swapCount || 0) - (b.swapCount || 0),
      render: (swapCount, record) => (
        <Button
          type="link"
          onClick={() => handleViewHistory(record.id)}
          style={{ padding: 0, height: 'auto', lineHeight: 'normal' }}
        >
          <Text style={{ color: '#000000ff' }}>
            {swapCount === undefined ? <Spin size="small" /> : swapCount}
          </Text>
        </Button>
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
              Sửa
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
        const newVehicle = res?.data || { ...payload, id: Date.now(), swapCount: 0, status: "ACTIVE" };
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
        title="Quản lý xe"
        extra={
          <Space>
            <Input
              placeholder="Tìm theo dòng xe hoặc biển số"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            {isDriver && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Đăng ký xe mới
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
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trên ${total} xe`,
              }}
            />
          )}
        </Spin>
      </Card>

      <Modal
        title={editingVehicle ? "Chỉnh sửa phương tiện" : "Đăng ký phương tiện mới"}
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

      {/* 🆕 Modal Lịch sử Đổi Pin mới */}
      <VehicleSwapHistoryModal
        open={isHistoryModalVisible}
        onClose={handleHistoryModalClose}
        vehicleHistory={vehicleHistory}
        loading={historyLoading}
        vehicleId={selectedVehicleId}
        stations={stations}
      />
    </div>
  );
};

export default VehiclePage;