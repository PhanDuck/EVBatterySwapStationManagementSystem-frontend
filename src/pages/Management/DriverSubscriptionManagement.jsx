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
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
import handleApiError from "../../Utils/handleApiError";
import { getCurrentUser } from "../../config/auth";
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
  const [isRenewalModalVisible, setIsRenewalModalVisible] = useState(false);

  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [targetPackageId, setTargetPackageId] = useState(null);

  const [calculation, setCalculation] = useState(null);
  const [renewalCalculation, setRenewalCalculation] = useState(null);

  const [isCalculating, setIsCalculating] = useState(false);
  const [isCalculatingRenewal, setIsCalculatingRenewal] = useState(false);

  const role = currentUser?.role;

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy user từ localStorage thay vì gọi API
      const user = getCurrentUser();
      setCurrentUser(user);
      const userRole = user?.role;

      const apiCalls = [
        userRole === "DRIVER"
          ? api.get("/driver-subscription/my-subscriptions")
          : api.get("/subscription/all-subscriptions"),
        api.get("/service-package"),
      ];

      if (userRole !== "DRIVER") {
        apiCalls.push(api.get("/users/role/DRIVER"));
      }

      const [subscriptionRes, packageRes, driverRes] = await Promise.all(
        apiCalls
      );

      // Xử lý response data - có thể là array hoặc object với property data
      let subscriptions = [];
      if (Array.isArray(subscriptionRes?.data)) {
        subscriptions = subscriptionRes.data;
      } else if (
        subscriptionRes?.data?.data &&
        Array.isArray(subscriptionRes.data.data)
      ) {
        subscriptions = subscriptionRes.data.data;
      } else if (subscriptionRes?.data) {
        subscriptions = [subscriptionRes.data];
      }

      setData(subscriptions.sort((a, b) => b.id - a.id));
      setPackages(Array.isArray(packageRes?.data) ? packageRes.data : []);

      if (userRole !== "DRIVER" && driverRes) {
        setDrivers(Array.isArray(driverRes?.data) ? driverRes.data : []);
      }
    } catch (error) {
      handleApiError(error, "tải dữ liệu");
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
        driverName(item.driverId)
          .toLowerCase()
          .includes(search.toLowerCase()) ||
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
        params: {
          currentSubscriptionId: selectedSubscription.id,
          newPackageId,
        },
      });
      setCalculation(res.data);
    } catch (error) {
      handleApiError(error, "tính toán chi phí nâng cấp");
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
      const redirectUrl = encodeURIComponent(
        window.location.origin + "/payment/result"
      );
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
      handleApiError(error, "bắt đầu nâng cấp");
    } finally {
      setSubmitting(false);
    }
  };

  const openRenewalModal = async (record) => {
    setSelectedSubscription(record);
    setIsRenewalModalVisible(true);
    setRenewalCalculation(null);

    // Tự động set gói hiện tại làm gói gia hạn
    const currentPackageId = record.packageId;
    setTargetPackageId(currentPackageId);

    // Tự động gọi API calculate cho gói hiện tại
    setIsCalculatingRenewal(true);
    try {
      const res = await api.get("/driver-subscription/renewal/calculate", {
        params: { renewalPackageId: currentPackageId },
      });
      setRenewalCalculation(res.data);
    } catch (error) {
      handleApiError(error, "tính toán chi phí gia hạn");
    } finally {
      setIsCalculatingRenewal(false);
    }
  };

  const handleConfirmRenewal = async () => {
    if (!targetPackageId) {
      message.warning("Vui lòng chọn một gói để gia hạn.");
      return;
    }
    setSubmitting(true);
    try {
      const redirectUrl = encodeURIComponent(
        window.location.origin + "/payment/result"
      );
      const res = await api.post(
        `/driver-subscription/renewal/initiate?renewalPackageId=${targetPackageId}&redirectUrl=${redirectUrl}`
      );

      // Sửa lại để kiểm tra "payUrl" thay vì "paymentUrl"
      if (res.data && res.data.payUrl) {
        window.location.href = res.data.payUrl;
      } else {
        message.success("Yêu cầu gia hạn đã được xử lý thành công!");
        setIsRenewalModalVisible(false);
        fetchData();
      }
    } catch (error) {
      handleApiError(error, "bắt đầu gia hạn");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    ...(role !== "DRIVER"
      ? [
          {
            title: "Driver",
            dataIndex: "driverId",
            key: "driverId",
            render: driverName,
          },
        ]
      : []),
    {
      title: "Gói",
      dataIndex: "packageId",
      key: "packageId",
      render: packageName,
    },
    {
      title: "Ngày đăng kí",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={s === "ACTIVE" ? "green" : "red"}>{s}</Tag>,
    },
    {
      title: "Lần đổi còn lại",
      dataIndex: "remainingSwaps",
      key: "remainingSwaps",
    },
    ...(role === "DRIVER"
      ? [
          {
            title: "Thao tác",
            key: "actions",
            fixed: "right",
            render: (_, record) => (
              <Space>
                <Button
                  icon={<ArrowUpOutlined />}
                  onClick={() => openUpgradeModal(record)}
                  disabled={record.status !== "ACTIVE"}
                >
                  Nâng cấp
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  type="primary"
                  onClick={() => openRenewalModal(record)}
                  disabled={record.status !== "ACTIVE"}
                >
                  Gia hạn
                </Button>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const renderCalculationDetails = () => {
    const formatCurrency = (value) => {
      if (typeof value !== "number") return "";
      return `${value.toLocaleString()} đ`;
    };

    const formatSwaps = (value) => {
      if (typeof value !== "number") return "";
      return value;
    };

    const alertType = calculation?.canUpgrade ? "success" : "error";

    const alertMessage = () => {
      return calculation?.canUpgrade
        ? "Bạn đủ điều kiện để nâng cấp"
        : "KHÔNG THỂ NÂNG CẤP";
    };

    return (
      <Spin spinning={isCalculating}>
        {calculation && (
          <Card style={{ marginTop: 16 }} bordered={false}>
            <Title level={5}>Chi tiết thay đổi gói cước</Title>
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta
                  title="Gói hiện tại"
                  description={calculation.currentPackageName}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title="Gói mới"
                  description={calculation.newPackageName}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title="Số lượt đổi còn lại"
                  description={formatSwaps(calculation.remainingSwaps)}
                />
              </List.Item>
            </List>
            <Divider />
            <div
              style={{
                backgroundColor: "#e6f7ff",
                border: "2px solid #1890ff",
                borderRadius: "6px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <Text strong style={{ fontSize: "1.1em", color: "#0050b3" }}>
                Tổng tiền thanh toán:{" "}
              </Text>
              <Text
                strong
                style={{
                  fontSize: "1.3em",
                  color: "#0050b3",
                  marginLeft: "8px",
                }}
              >
                {formatCurrency(calculation.totalPaymentRequired)}
              </Text>
            </div>
            <Alert
              message={
                <Text strong style={{ fontSize: "1.1em" }}>
                  {alertMessage()}
                </Text>
              }
              description={
                !calculation?.canUpgrade ? calculation.message : null
              }
              type={alertType}
              showIcon
            />
            {calculation.recommendation && (
              <Text
                type="secondary"
                style={{ marginTop: 10, display: "block" }}
              >
                Gợi ý: {calculation.recommendation}
              </Text>
            )}
          </Card>
        )}
      </Spin>
    );
  };

  const renderRenewalCalculationDetails = () => {
    const formatCurrency = (value) => {
      if (typeof value !== "number") return "";
      return `${value.toLocaleString()} đ`;
    };

    return (
      <Spin spinning={isCalculatingRenewal}>
        {renewalCalculation && (
          <Card style={{ marginTop: 16 }} bordered={false}>
            <Title level={5}>Chi tiết gia hạn</Title>
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta
                  title="Tên gói gia hạn"
                  description={renewalCalculation.renewalPackageName}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title="Giá gốc"
                  description={formatCurrency(renewalCalculation.originalPrice)}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title="Số tiền được giảm"
                  description={formatCurrency(renewalCalculation.totalDiscount)}
                />
              </List.Item>
            </List>
            <Divider />
            <div
              style={{
                backgroundColor: "#f6ffed",
                border: "2px solid #52c41a",
                borderRadius: "6px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <Text strong style={{ fontSize: "1.1em", color: "#274e0f" }}>
                Tổng tiền thanh toán:{" "}
              </Text>
              <Text
                strong
                style={{
                  fontSize: "1.3em",
                  color: "#52c41a",
                  marginLeft: "8px",
                }}
              >
                {formatCurrency(renewalCalculation.finalPrice)}
              </Text>
            </div>
            <Alert
              message={
                <Text strong style={{ fontSize: "1.1em" }}>
                  {renewalCalculation.message}
                </Text>
              }
              description={renewalCalculation.recommendation}
              type="info"
              showIcon
            />
          </Card>
        )}
      </Spin>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý gói cước của tôi"
        extra={
          role !== "DRIVER" && (
            <Input
              placeholder="Tìm kiếm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 250 }}
            />
          )
        }
      >
        <Spin spinning={loading}>
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 8 }}
          />
        </Spin>
      </Card>

      <Modal
        title="Nâng cấp gói cước"
        visible={isUpgradeModalVisible}
        onCancel={() => setIsUpgradeModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsUpgradeModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleConfirmUpgrade}
            disabled={
              !targetPackageId || isCalculating || !calculation?.canUpgrade
            }
          >
            Xác nhận & Thanh toán
          </Button>,
        ]}
        width={700}
      >
        <p>
          <Text strong>Gói hiện tại:</Text>{" "}
          {packageName(selectedSubscription?.packageId)}
        </p>
        <Form layout="vertical">
          <Form.Item label="Chọn gói mới để nâng cấp:">
            <Select
              placeholder="Chọn gói cao cấp hơn"
              onChange={handleUpgradePackageSelect}
              value={targetPackageId}
            >
              {packages
                .filter((p) => currentPackage && p.price > currentPackage.price)
                .map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.name} - {p.price.toLocaleString()}đ
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
        {renderCalculationDetails()}
      </Modal>

      <Modal
        title="Gia hạn gói cước"
        visible={isRenewalModalVisible}
        onCancel={() => setIsRenewalModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsRenewalModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleConfirmRenewal}
            disabled={!targetPackageId || isCalculatingRenewal}
          >
            Xác nhận & Thanh toán
          </Button>,
        ]}
        width={700}
      >
        <Alert
          message="Thông báo"
          description="Bạn chỉ có thể gia hạn đúng gói cước hiện tại mà bạn đang sử dụng."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <p>
          <Text strong>Gói gia hạn:</Text>{" "}
          <Tag color="blue" style={{ fontSize: "14px", padding: "4px 12px" }}>
            {packageName(selectedSubscription?.packageId)}
          </Tag>
        </p>
        {renderRenewalCalculationDetails()}
      </Modal>
    </div>
  );
}
