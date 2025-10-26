import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  message,
  Spin,
  List,
  Typography,
  Divider,
  Alert,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

export default function DriverSubscriptionManagement() {
  const [data, setData] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [isDowngradeModalVisible, setIsDowngradeModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [targetPackageId, setTargetPackageId] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const role = currentUser?.role;

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await api.get("/Current");
      setCurrentUser(userRes.data);
      const userRole = userRes.data?.role;

      const apiCalls = [
        userRole === "DRIVER"
          ? api.get("/driver-subscription/my-subscriptions")
          : api.get("/driver-subscription"),
        api.get("/service-package"),
      ];

      if (userRole !== "DRIVER") {
        apiCalls.push(api.get("/users/role/DRIVER"));
      }

      const [subscriptionRes, packageRes, driverRes] = await Promise.all(apiCalls);

      setData(
        (Array.isArray(subscriptionRes?.data) ? subscriptionRes.data : []).sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        )
      );
      setPackages(Array.isArray(packageRes?.data) ? packageRes.data : []);
      
      if (userRole !== "DRIVER" && driverRes) {
        setDrivers(Array.isArray(driverRes?.data) ? driverRes.data : []);
      }

    } catch (err) {
      console.error(err);
      message.error("Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const driverName = (id) => {
    if (role === "DRIVER") return currentUser?.fullName;
    return drivers.find((d) => d.id === id)?.fullName || `ID: ${id}`;
  };

  const packageName = (id) =>
    packages.find((p) => p.id === id)?.name || `ID: ${id}`;

  const currentPackage = useMemo(() => {
    return packages.find((p) => p.id === selectedSubscription?.packageId);
  }, [selectedSubscription, packages]);

  const filteredData = useMemo(() => {
    if (role === "DRIVER") return data;
    return data.filter(
      (item) =>
        driverName(item.driverId).toLowerCase().includes(search.toLowerCase()) ||
        packageName(item.packageId).toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, drivers, packages, role]);

  const openUpgradeModal = (record) => {
    setSelectedSubscription(record);
    setIsUpgradeModalVisible(true);
    setCalculation(null);
    setTargetPackageId(null);
  };

  const handleUpgradePackageSelect = async (newPackageId) => {
    setTargetPackageId(newPackageId);
    if (!selectedSubscription) return;
    setIsCalculating(true);
    setCalculation(null); 
    try {
      const res = await api.get("/driver-subscription/upgrade/calculate", {
        params: { currentSubscriptionId: selectedSubscription.id, newPackageId },
      });
      setCalculation(res.data);
    } catch (error) {
      console.error("Calculation error:", error);
      message.error(error.response?.data?.message || "Không thể tính toán chi phí nâng cấp!");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (calculation && !calculation.canUpgrade) {
        message.error("Không thể nâng cấp. Vui lòng kiểm tra lại các điều kiện.");
        return;
    }
    if (!targetPackageId) {
      message.warning("Vui lòng chọn một gói để nâng cấp.");
      return;
    }
    setSubmitting(true);
    try {
      const redirectUrl = encodeURIComponent(window.location.origin + "/payment/result");
      const res = await api.post(
        `/driver-subscription/upgrade/initiate?newPackageId=${targetPackageId}&redirectUrl=${redirectUrl}`
      );

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        message.success("Yêu cầu nâng cấp đã được xử lý!");
        setIsUpgradeModalVisible(false);
        fetchData();
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      message.error(error.response?.data?.message || "Không thể bắt đầu nâng cấp!");
    } finally {
      setSubmitting(false);
    }
  };

  const openDowngradeModal = (record) => {
    setSelectedSubscription(record);
    setIsDowngradeModalVisible(true);
    setCalculation(null);
    setTargetPackageId(null);
  };

  const handleDowngradePackageSelect = async (newPackageId) => {
    setTargetPackageId(newPackageId);
    if (!selectedSubscription) return;
    setIsCalculating(true);
    setCalculation(null);
    try {
      const res = await api.get("/driver-subscription/downgrade/calculate", {
        params: { currentSubscriptionId: selectedSubscription.id, newPackageId },
      });
      setCalculation(res.data);
    } catch (error) {
      console.error("Calculation error:", error);
      message.error(error.response?.data?.message || "Không thể tính toán chi phí hạ cấp!");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConfirmDowngrade = async () => {
    if (calculation && !calculation.canDowngrade) {
        message.error("Không thể hạ cấp. Vui lòng kiểm tra lại các điều kiện.");
        return;
    }
    if (!targetPackageId) {
      message.warning("Vui lòng chọn một gói để hạ cấp.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/driver-subscription/downgrade/confirm?newPackageId=${targetPackageId}`);
      
      message.success("Hạ cấp gói thành công!");
      setIsDowngradeModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Downgrade error:", error);
      message.error(error.response?.data?.message || "Không thể hạ cấp!");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80, sorter: (a, b) => a.id - b.id },
    ...(role !== 'DRIVER' ? [{ title: "Driver", dataIndex: "driverId", key: "driverId", render: driverName }] : []),
    { title: "Package", dataIndex: "packageId", key: "packageId", render: packageName },
    { title: "Start Date", dataIndex: "startDate", key: "startDate", render: (text) => dayjs(text).format('DD/MM/YYYY') },
    { title: "End Date", dataIndex: "endDate", key: "endDate", render: (text) => dayjs(text).format('DD/MM/YYYY') },
    { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color={s === "ACTIVE" ? "green" : "red"}>{s}</Tag> },
    { title: "Remaining Swaps", dataIndex: "remainingSwaps", key: "remainingSwaps" },
    ...(role === "DRIVER" ? [{ title: "Actions", key: "actions", render: (_, record) => (
        <Space>
          <Button icon={<ArrowUpOutlined />} onClick={() => openUpgradeModal(record)} disabled={record.status !== "ACTIVE"}>Nâng cấp</Button>
          <Button icon={<ArrowDownOutlined />} type="primary" danger onClick={() => openDowngradeModal(record)} disabled={record.status !== "ACTIVE"}>Hạ cấp</Button>
        </Space>
    )}] : []),
  ];

  const renderCalculationDetails = (isDowngrade = false) => {
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'N/A';
        return `${value.toLocaleString()} đ`;
    };

    const formatSwaps = (value) => {
        if (typeof value !== 'number') return 'N/A';
        return value;
    };
  
    const alertType = isDowngrade
      ? (calculation?.canDowngrade ? 'success' : 'error')
      : (calculation?.canUpgrade ? 'success' : 'error');

    const alertMessage = () => {
      if (isDowngrade) {
        return calculation?.canDowngrade ? "Bạn đủ điều kiện để hạ cấp." : "KHÔNG THỂ HẠ CẤP";
      }
      if (calculation?.canUpgrade) {
        return `Phí nâng cấp: ${formatCurrency(calculation?.upgradeFee)}`;
      }
      return "KHÔNG THỂ NÂNG CẤP";
    };

    return (
      <Spin spinning={isCalculating}>
        {calculation && (
          <Card style={{ marginTop: 16 }} bordered={false}>
            <Title level={5}>Chi tiết thay đổi gói cước</Title>
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta title="Gói hiện tại" description={calculation.currentPackageName || 'N/A'} />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Gói mới" description={calculation.newPackageName || 'N/A'} />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Số lượt đổi còn lại" description={formatSwaps(calculation.remainingSwaps)} />
              </List.Item>
              <List.Item>
                  <List.Item.Meta title="Tổng tiền thanh toán" description={formatCurrency(calculation.totalPaymentRequired)} />
              </List.Item>
            </List>
            <Divider />
            <Alert
              message={<Text strong style={{ fontSize: "1.1em" }}>{alertMessage()}</Text>}
              description={!calculation?.canDowngrade && isDowngrade ? calculation.reason : (!calculation?.canUpgrade && !isDowngrade ? calculation.message : null)}
              type={alertType}
              showIcon
            />
            {calculation.recommendation && <Text type="secondary" style={{ marginTop: 10, display: 'block' }}>Gợi ý: {calculation.recommendation}</Text>}
          </Card>
        )}
      </Spin>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản lý gói cước của tôi" extra={role !== "DRIVER" && <Input placeholder="Tìm kiếm" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 250 }} />}>
        <Spin spinning={loading}>
          <Table dataSource={filteredData} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
        </Spin>
      </Card>

      <Modal title="Nâng cấp gói cước" visible={isUpgradeModalVisible} onCancel={() => setIsUpgradeModalVisible(false)} footer={[
        <Button key="back" onClick={() => setIsUpgradeModalVisible(false)}>Hủy</Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleConfirmUpgrade} disabled={!targetPackageId || isCalculating || !calculation?.canUpgrade}>
          Xác nhận & Thanh toán
        </Button>,
      ]} width={700}>
        <p><Text strong>Gói hiện tại:</Text> {packageName(selectedSubscription?.packageId)}</p>
        <Form layout="vertical">
          <Form.Item label="Chọn gói mới để nâng cấp:">
            <Select placeholder="Chọn gói cao cấp hơn" onChange={handleUpgradePackageSelect} value={targetPackageId}>
              {packages.filter((p) => currentPackage && p.price > currentPackage.price).map((p) => (
                <Option key={p.id} value={p.id}>{p.name} - {p.price.toLocaleString()}đ</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        {renderCalculationDetails(false)}
      </Modal>

      <Modal title="Hạ cấp gói cước" visible={isDowngradeModalVisible} onCancel={() => setIsDowngradeModalVisible(false)} footer={[
        <Button key="back" onClick={() => setIsDowngradeModalVisible(false)}>Hủy</Button>,
        <Button key="submit" type="primary" danger loading={submitting} onClick={handleConfirmDowngrade} disabled={!targetPackageId || isCalculating || !calculation?.canDowngrade}>
          Xác nhận Hạ cấp
        </Button>,
      ]} width={700}>
        <p><Text strong>Gói hiện tại:</Text> {packageName(selectedSubscription?.packageId)}</p>
        <Form layout="vertical">
          <Form.Item label="Chọn gói mới để hạ cấp:">
            <Select placeholder="Chọn gói thấp hơn" onChange={handleDowngradePackageSelect} value={targetPackageId}>
              {packages.filter((p) => currentPackage && p.price < currentPackage.price).map((p) => (
                <Option key={p.id} value={p.id}>{p.name} - {p.price.toLocaleString()}đ</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        {renderCalculationDetails(true)}
      </Modal>
    </div>
  );
}