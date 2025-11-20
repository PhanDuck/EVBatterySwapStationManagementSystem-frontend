import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Spin,
  List,
  Typography,
  Divider,
  Alert,
} from "antd";
import { ArrowUpOutlined, ReloadOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
import { getCurrentUser } from "../../config/auth";
import { showToast } from "../../Utils/toastHandler";

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

  // --- STATE QUẢN LÝ MODAL ---
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [isRenewalModalVisible, setIsRenewalModalVisible] = useState(false);

  // --- STATE QUẢN LÝ LỰA CHỌN & TÍNH TOÁN ---
  const [selectedSubscription, setSelectedSubscription] = useState(null);  //gói đang dùng
  const [targetPackageId, setTargetPackageId] = useState(null); // ID gói cước target mới 

  const [calculation, setCalculation] = useState(null); 
  const [renewalCalculation, setRenewalCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCalculatingRenewal, setIsCalculatingRenewal] = useState(false); 

  const role = currentUser?.role;

  const fetchData = async () => {
    setLoading(true);
    try {
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

      // Chạy song song các API
      const [subscriptionRes, packageRes, driverRes] = await Promise.all(apiCalls);

      // Xử lý dữ liệu trả về (đề phòng cấu trúc API khác nhau)
      let subscriptions = [];
      if (Array.isArray(subscriptionRes?.data)) {
        subscriptions = subscriptionRes.data;
      } else if (subscriptionRes?.data?.data && Array.isArray(subscriptionRes.data.data)) {
        subscriptions = subscriptionRes.data.data;
      } else if (subscriptionRes?.data) {
        subscriptions = [subscriptionRes.data];
      }

      setData(subscriptions.sort((a, b) => b.id - a.id)); // Sắp xếp mới nhất lên đầu
      setPackages(Array.isArray(packageRes?.data) ? packageRes.data : []);

      if (userRole !== "DRIVER" && driverRes) {
        setDrivers(Array.isArray(driverRes?.data) ? driverRes.data : []);
      }
    } catch (error) {
      showToast("error", error.response?.data || "Tải dữ liệu thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Hàm 2: Lấy tên tài xế hiển thị
   * Chức năng: Map từ ID tài xế sang Tên (Dùng useCallback để tối ưu cho useMemo)   ##
   */
  const driverName = useCallback((id) => {
    if (role === "DRIVER") return currentUser?.fullName;
    return drivers.find((d) => d.id === id)?.fullName || `ID: ${id}`;
  }, [role, currentUser, drivers]);

  /**
   * Hàm 3: Lấy tên gói cước hiển thị
   * Chức năng: Map từ ID gói sang Tên gói (Dùng useCallback để tối ưu cho useMemo)  ##
   */
  const packageName = useCallback((id) => {
    return packages.find((p) => p.id === id)?.name || `ID: ${id}`;
  }, [packages]);

  const currentPackage = useMemo(() => {
    return packages.find((p) => p.id === selectedSubscription?.packageId);
  }, [selectedSubscription, packages]);

  /**
   * Hàm 5: Lọc dữ liệu bảng
   * Chức năng: Filter dữ liệu theo từ khóa tìm kiếm (Driver name hoặc Package name)
   */
  const filteredData = useMemo(() => {
    if (role === "DRIVER") return data; //api lọc sẵn data theo driver rồi
    return data.filter(
      (item) =>
        driverName(item.driverId).toLowerCase().includes(search.toLowerCase()) ||
        packageName(item.packageId).toLowerCase().includes(search.toLowerCase()) //không phân biệt hoa thường
    );
  }, [data, search, role, driverName, packageName]);  // Memoized để tránh tính toán lại không cần thiết

  /**
   * Hàm 6: Mở modal nâng cấp
   * Chức năng: Reset state tạm và hiển thị modal
   */
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
      showToast("error", error.response?.data || "Tính toán chi phí nâng cấp thất bại!");
    } finally {
      setIsCalculating(false);
    }
  };

  //Gọi API momo tạo giao dịch thanh toán và redirect
   
  const handleConfirmUpgrade = async () => {
    if (calculation && !calculation.canUpgrade) {
      showToast("error", "Không thể nâng cấp. Vui lòng kiểm tra lại các điều kiện.");
      return;
    }
    if (!targetPackageId) {
      showToast("warning", "Vui lòng chọn một gói để nâng cấp.");
      return;
    }

    setSubmitting(true);
    try {
      const redirectUrl = encodeURIComponent(window.location.origin + "/payment/result");
      const res = await api.post(
        `/driver-subscription/upgrade/initiate?newPackageId=${targetPackageId}&redirectUrl=${redirectUrl}`
      );

      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl; // Chuyển hướng sang trang thanh toán
      } else {
        showToast("success", "Yêu cầu nâng cấp đã được xử lý!");
        setIsUpgradeModalVisible(false);
        fetchData();
      }
    } catch (error) {
      showToast("error", error.response?.data || "Bắt đầu nâng cấp thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const openRenewalModal = async (record) => {
    setSelectedSubscription(record);
    setIsRenewalModalVisible(true);
    setRenewalCalculation(null);
    const currentPackageId = record.packageId;
    setTargetPackageId(currentPackageId);
    setIsCalculatingRenewal(true);
    try {
      const res = await api.get("/driver-subscription/renewal/calculate", {
        params: { renewalPackageId: currentPackageId },
      });
      setRenewalCalculation(res.data);
    } catch (error) {
      showToast("error", error.response?.data || "Tính toán chi phí gia hạn thất bại!");
    } finally {
      setIsCalculatingRenewal(false);
    }
  };

  //Gọi API momo thanh toán gia hạn
   
  const handleConfirmRenewal = async () => {
    if (!targetPackageId) {
      showToast("warning", "Vui lòng chọn một gói để gia hạn.");
      return;
    }
    setSubmitting(true);
    try {
      const redirectUrl = encodeURIComponent(window.location.origin + "/payment/result");
      const res = await api.post(
        `/driver-subscription/renewal/initiate?renewalPackageId=${targetPackageId}&redirectUrl=${redirectUrl}`
      );

      if (res.data && res.data.payUrl) {
        window.location.href = res.data.payUrl;
      } else {
        showToast("success", "Yêu cầu gia hạn đã được xử lý thành công!");
        setIsRenewalModalVisible(false);
        fetchData();
      }
    } catch (error) {
      showToast("error", error.response?.data || "Bắt đầu gia hạn thất bại!");
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
            render: driverName, // Sử dụng hàm đã memoized
          },
        ]
      : []),
    {
      title: "Gói",
      dataIndex: "packageId",
      key: "packageId",
      render: packageName, // Sử dụng hàm đã memoized
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
    const formatCurrency = (value) => (typeof value === "number" ? `${value.toLocaleString()} đ` : "");
    const formatSwaps = (value) => (typeof value === "number" ? value : "");
    const alertType = calculation?.canUpgrade ? "success" : "error";
    const alertMessage = calculation?.canUpgrade ? "Bạn đủ điều kiện để nâng cấp" : "KHÔNG THỂ NÂNG CẤP";

    return (
      <Spin spinning={isCalculating}>
        {calculation && (
          <Card style={{ marginTop: 16 }} bordered={false}>
            <Title level={5}>Chi tiết thay đổi gói cước</Title>
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta title="Gói hiện tại" description={calculation.currentPackageName} />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Gói mới" description={calculation.newPackageName} />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Số lượt đổi còn lại" description={formatSwaps(calculation.remainingSwaps)} />
              </List.Item>
            </List>
            <Divider />
            <div style={{ backgroundColor: "#e6f7ff", border: "2px solid #1890ff", borderRadius: "6px", padding: "16px", marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "1.1em", color: "#0050b3" }}>Tổng tiền thanh toán: </Text>
              <Text strong style={{ fontSize: "1.3em", color: "#0050b3", marginLeft: "8px" }}>
                {formatCurrency(calculation.totalPaymentRequired)}
              </Text>
            </div>
            <Alert
              message={<Text strong style={{ fontSize: "1.1em" }}>{alertMessage}</Text>}
              description={!calculation?.canUpgrade ? calculation.message : null}
              type={alertType}
              showIcon
            />
            {calculation.recommendation && (
              <Text type="secondary" style={{ marginTop: 10, display: "block" }}>
                Gợi ý: {calculation.recommendation}
              </Text>
            )}
          </Card>
        )}
      </Spin>
    );
  };


  const renderRenewalCalculationDetails = () => {
    const formatCurrency = (value) => (typeof value === "number" ? `${value.toLocaleString()} đ` : "");

    return (
      <Spin spinning={isCalculatingRenewal}>
        {renewalCalculation && (
          <Card style={{ marginTop: 16 }} bordered={false}>
            <Title level={5}>Chi tiết gia hạn</Title>
            <List itemLayout="horizontal">
              <List.Item>
                <List.Item.Meta title="Tên gói gia hạn" description={renewalCalculation.renewalPackageName} />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Giá gốc" description={formatCurrency(renewalCalculation.originalPrice)} />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Số tiền được giảm" description={formatCurrency(renewalCalculation.totalDiscount)} />
              </List.Item>
            </List>
            <Divider />
            <div style={{ backgroundColor: "#f6ffed", border: "2px solid #52c41a", borderRadius: "6px", padding: "16px", marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "1.1em", color: "#274e0f" }}>Tổng tiền thanh toán: </Text>
              <Text strong style={{ fontSize: "1.3em", color: "#52c41a", marginLeft: "8px" }}>
                {formatCurrency(renewalCalculation.finalPrice)}
              </Text>
            </div>
            <Alert
              message={<Text strong style={{ fontSize: "1.1em" }}>{renewalCalculation.message}</Text>}
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
      {/* Card chứa bảng dữ liệu */}
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

      {/* MODAL 1: NÂNG CẤP */}
      <Modal
        title="Nâng cấp gói cước"
        visible={isUpgradeModalVisible}
        onCancel={() => setIsUpgradeModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsUpgradeModalVisible(false)}>Hủy</Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleConfirmUpgrade}
            disabled={!targetPackageId || isCalculating || !calculation?.canUpgrade}
          >
            Xác nhận & Thanh toán
          </Button>,
        ]}
        width={700}
      >
        <p>
          <Text strong>Gói hiện tại:</Text> {packageName(selectedSubscription?.packageId)}
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

      {/* MODAL 2: GIA HẠN */}
      <Modal
        title="Gia hạn gói cước"
        visible={isRenewalModalVisible}
        onCancel={() => setIsRenewalModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsRenewalModalVisible(false)}>Hủy</Button>,
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