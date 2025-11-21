import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Table,
  Typography,
  Tag,
  Empty,
  Skeleton,
} from "antd";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CreditCardOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
import handleApiError from "../../Utils/handleApiError";

const { Title } = Typography;

// Màu sắc
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#4ECDC4",
  "#FF6B6B",
  "#45B7D1",
  "#C7F46D",
  "#779ECB",
];
const BATTERY_COLORS = {
  "Enhanced 54V-24Ah": "#FF6B6B",
  "Premium 52V-22Ah": "#4ECDC4",
  "Standard 48V-20Ah": "#45B7D1",
};

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching dashboard data...");
      // Gọi API với timeout 30 giây (nếu quá lâu sẽ timeout)
      const response = await api.get("/dashboard", {
        timeout: 30000,
      });
      console.log("Dashboard response:", response.data);
      setDashboardData(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      // Nếu timeout, hiển thị message thân thiện
      if (err.code === "ECONNABORTED") {
        setError("API đang xử lý quá lâu. Vui lòng thử lại sau.");
      } else {
        const errorMsg =
          err.response?.data?.message || err.message || "Lỗi không xác định";
        setError(errorMsg);
      }
      handleApiError(err, "tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Card style={{ borderColor: "#ff4d4f" }}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2 style={{ color: "#ff4d4f" }}>❌ Lỗi tải dữ liệu</h2>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>{error}</p>
            <button
              onClick={fetchDashboardData}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Thử lại
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "24px" }}>
        <Title level={2} style={{ marginBottom: "24px" }}>
          Dashboard Tổng Quan
        </Title>

        {/* KPI Cards Skeleton */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Col xs={24} sm={12} lg={4.8} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Skeleton */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24}>
            <Card title="Doanh Thu Theo Tháng">
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={12}>
            <Card title="Tỷ Lệ Sử Dụng Trạm">
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Phân Bố Loại Pin">
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </Col>
        </Row>

        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "20px", color: "#666" }}>
            Đang tải dữ liệu dashboard...
            <br />
            <small style={{ color: "#999" }}>
              (Nếu quá lâu, vui lòng thử lại)
            </small>
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ padding: "24px" }}>
        <Empty description="Không thể tải dữ liệu dashboard" />
      </div>
    );
  }

  const overview = dashboardData?.overview || {};
  const revenue = dashboardData?.revenue || {};
  const users = dashboardData?.users || {};
  const stations = dashboardData?.stations || {};
  const batteries = dashboardData?.batteries || {};
  const recentTransactions = dashboardData?.recentTransactions || [];

  // Xử lý dữ liệu doanh thu theo tháng
  const monthlyRevenueData = (revenue?.monthlyRevenues || []).map((item) => ({
    month: dayjs(item.month).format("MM/YYYY"),
    revenue: item.revenue || 0,
    transactions: item.transactionCount || 0,
  }));

  // Xử lý dữ liệu sử dụng trạm
  const stationUtilizationData = (stations?.stationUtilizations || []).map(
    (station) => ({
      name: station.stationName.replace("Trạm Đổi Pin ", ""),
      utilization: station.utilizationRate || 0, // Giá trị này dùng làm kích thước lát cắt
      used: station.usedSlots || 0,
      total: station.totalSlots || 0,
    })
  );

  // Xử lý dữ liệu phân bố pin
  const batteryDistributionData = (
    batteries?.batteryTypeDistributions || []
  ).map((item) => ({
    name: item.batteryType,
    value: item.count || 0,
  }));

  // Cột cho bảng giao dịch
  const transactionColumns = [
    {
      title: "ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 60,
    },
    {
      title: "Tài xế",
      dataIndex: "driverName",
      key: "driverName",
    },
    {
      title: "Trạm",
      dataIndex: "stationName",
      key: "stationName",
      render: (text) => text.replace("Trạm Đổi Pin ", ""),
    },
    {
      title: "Biển số",
      dataIndex: "vehicleLicensePlate",
      key: "vehicleLicensePlate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "COMPLETED" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "transactionTime",
      key: "transactionTime",
      render: (time) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2} style={{ marginBottom: "24px" }}>
        Dashboard Tổng Quan
      </Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={4.8}>
          <Card hoverable>
            <Statistic
              title="Tổng doanh thu"
              value={overview?.totalRevenue || 0}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: "#cf1322", fontSize: "18px" }}
              prefix={<CreditCardOutlined style={{ color: "#cf1322" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4.8}>
          <Card hoverable>
            <Statistic
              title="Tổng đặt lịch"
              value={overview?.totalTransactions || 0}
              valueStyle={{ color: "#722ed1", fontSize: "18px" }}
              prefix={<CalendarOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4.8}>
          <Card hoverable>
            <Statistic
              title="Tổng người dùng"
              value={users?.totalUsers || 0}
              valueStyle={{ color: "#3f8600", fontSize: "18px" }}
              prefix={<UserOutlined style={{ color: "#3f8600" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4.8}>
          <Card hoverable>
            <Statistic
              title="Tổng trạm"
              value={stations?.totalStations || 0}
              valueStyle={{ color: "#1890ff", fontSize: "18px" }}
              prefix={<EnvironmentOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={4.8}>
          <Card hoverable>
            <Statistic
              title="Tổng pin"
              value={batteries?.totalBatteries || 0}
              valueStyle={{ color: "#faad14", fontSize: "18px" }}
              prefix={<ThunderboltOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Monthly Revenue Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24}>
          <Card title="Doanh Thu Theo Tháng" hoverable>
            {monthlyRevenueData.length > 0 ? (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "revenue") {
                          return [formatCurrency(value), "Doanh Thu"];
                        }
                        return [value, "Đặt lịch"];
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      fill="#8884d8"
                      name="Doanh Thu (VND)"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="transactions"
                      fill="#82ca9d"
                      name="Số Giao Dịch"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Station Utilization (PIE CHART) & Battery Distribution (PIE CHART) */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="Tỷ Lệ Sử Dụng Trạm" hoverable>
            {stationUtilizationData.length > 0 ? (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stationUtilizationData}
                      dataKey="utilization"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      // **Đã xóa thuộc tính label và labelLine để tránh đè chữ**
                      labelLine={false}
                    >
                      {stationUtilizationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value.toFixed(2)}%`, "Tỷ Lệ"]}
                      labelFormatter={(label) => `Trạm: ${label}`}
                    />
                    {/* Sử dụng Legend để hiển thị tên trạm */}
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Phân Bố Loại Pin" hoverable>
            {batteryDistributionData.length > 0 ? (
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={batteryDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {batteryDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            BATTERY_COLORS[entry.name] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}`, "Số lượng pin"]}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions Table */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Đặt lịch Gần Đây" hoverable>
            {recentTransactions && recentTransactions.length > 0 ? (
              <Table
                columns={transactionColumns}
                dataSource={recentTransactions.map((item, index) => ({
                  ...item,
                  key: item.transactionId || index,
                }))}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            ) : (
              <Empty description="Không có đặt lịch" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
