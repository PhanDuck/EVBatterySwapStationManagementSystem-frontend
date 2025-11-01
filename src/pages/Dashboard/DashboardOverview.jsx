import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Space,
  Spin,
  Empty,
  Typography,
  message,
} from "antd";
import {
  UserOutlined,
  CarOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ShopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../config/axios";
import dayjs from "dayjs";
import handleApiError from "../../Utils/handleApiError";

const { RangePicker } = DatePicker;
const { Title } = Typography;

// Màu sắc cho biểu đồ
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalStations: 0,
    totalBatteries: 0,
    totalRevenue: 0,
    totalBookings: 0,
    completedBookings: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [batteryStatusData, setBatteryStatusData] = useState([]);
  const [stationPerformanceData, setStationPerformanceData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Gọi các API để lấy dữ liệu thống kê (sử dụng đúng endpoints như các trang khác)
      const [usersRes, stationsRes, batteriesRes, bookingsRes, paymentsRes] =
        await Promise.all([
          api.get("/admin/user").catch(() => ({ data: [] })),
          api.get("/station").catch(() => ({ data: [] })),
          api.get("/battery").catch(() => ({ data: [] })),
          api.get("/booking").catch(() => ({ data: [] })),
          api.get("/payment").catch(() => ({ data: [] })),
        ]);

      // Normalize dữ liệu - xử lý cả trường hợp data trực tiếp hoặc data.data
      const users = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data?.data || [];
      const stations = Array.isArray(stationsRes.data)
        ? stationsRes.data
        : stationsRes.data?.data || [];
      const batteries = Array.isArray(batteriesRes.data)
        ? batteriesRes.data
        : batteriesRes.data?.data || [];
      const bookings = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data?.data || [];
      const payments = Array.isArray(paymentsRes.data)
        ? paymentsRes.data
        : paymentsRes.data?.data || [];

      // Lọc users theo status (loại bỏ DELETED)
      const activeUsers = users.filter(
        (u) => u.status?.toLowerCase() !== "deleted"
      );

      // Tính toán thống kê tổng quan
      const totalRevenue = payments.reduce((sum, p) => {
        // Chỉ tính các payment có status COMPLETED
        if (p.status === "COMPLETED") {
          return sum + (parseFloat(p.amount) || 0);
        }
        return sum;
      }, 0);

      setStatistics({
        totalUsers: activeUsers.length,
        totalStations: stations.length,
        totalBatteries: batteries.length,
        totalRevenue: totalRevenue,
        totalBookings: bookings.length,
        completedBookings: bookings.filter((b) => b.status === "COMPLETED")
          .length,
      });

      // Xử lý dữ liệu doanh thu theo ngày
      const revenueByDate = processRevenueData(payments, dateRange);
      setRevenueData(revenueByDate);

      // Xử lý dữ liệu trạng thái booking
      const bookingStatus = processBookingStatusData(bookings);
      setBookingStatusData(bookingStatus);

      // Xử lý dữ liệu trạng thái pin
      const batteryStatus = processBatteryStatusData(batteries);
      setBatteryStatusData(batteryStatus);

      // Xử lý dữ liệu hiệu suất trạm
      const stationPerformance = processStationPerformanceData(
        bookings,
        stations
      );
      setStationPerformanceData(stationPerformance);
    } catch (error) {
      handleApiError(error, "tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const processRevenueData = (payments, dateRange) => {
    // Lọc payments trong khoảng thời gian
    const [startDate, endDate] = dateRange;
    const filteredPayments = payments.filter((payment) => {
      if (payment.status !== "COMPLETED") return false;
      const paymentDate = dayjs(payment.paymentDate);
      return (
        paymentDate.isAfter(startDate.startOf("day")) &&
        paymentDate.isBefore(endDate.endOf("day"))
      );
    });

    // Nhóm theo ngày
    const revenueMap = {};
    filteredPayments.forEach((payment) => {
      const date = dayjs(payment.paymentDate).format("DD/MM");
      if (!revenueMap[date]) {
        revenueMap[date] = 0;
      }
      revenueMap[date] += parseFloat(payment.amount) || 0;
    });

    // Tạo mảng dữ liệu cho biểu đồ
    const dates = [];
    let currentDate = startDate.clone();
    while (
      currentDate.isBefore(endDate) ||
      currentDate.isSame(endDate, "day")
    ) {
      const dateStr = currentDate.format("DD/MM");
      dates.push({
        date: dateStr,
        revenue: revenueMap[dateStr] || 0,
      });
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const processBookingStatusData = (bookings) => {
    const statusMap = {};
    bookings.forEach((booking) => {
      const status = booking.status || "UNKNOWN";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const statusLabels = {
      PENDING: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      UNKNOWN: "Không xác định",
    };

    return Object.keys(statusMap)
      .filter((status) => statusMap[status] > 0)
      .map((status) => ({
        name: statusLabels[status] || status,
        value: statusMap[status],
      }));
  };

  const processBatteryStatusData = (batteries) => {
    const statusMap = {};
    batteries.forEach((battery) => {
      const status = battery.status || "UNKNOWN";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const statusLabels = {
      AVAILABLE: "Sẵn sàng",
      IN_USE: "Đang sử dụng",
      CHARGING: "Đang sạc",
      MAINTENANCE: "Bảo trì",
      DAMAGED: "Hỏng",
      UNKNOWN: "Không xác định",
    };

    return Object.keys(statusMap)
      .filter((status) => statusMap[status] > 0)
      .map((status) => ({
        name: statusLabels[status] || status,
        value: statusMap[status],
      }));
  };

  const processStationPerformanceData = (bookings, stations) => {
    const stationMap = {};
    bookings.forEach((booking) => {
      const stationId = booking.stationId;
      if (!stationMap[stationId]) {
        stationMap[stationId] = {
          total: 0,
          completed: 0,
        };
      }
      stationMap[stationId].total += 1;
      if (booking.status === "COMPLETED") {
        stationMap[stationId].completed += 1;
      }
    });

    return stations
      .map((station) => ({
        name: station.name || `Trạm ${station.id}`,
        bookings: stationMap[station.id]?.total || 0,
        completed: stationMap[station.id]?.completed || 0,
      }))
      .filter((s) => s.bookings > 0) // Chỉ hiển thị trạm có booking
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10); // Top 10 trạm
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu dashboard..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2}>Dashboard Tổng Quan</Title>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates) {
                setDateRange(dates);
              }
            }}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        </Space>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Tổng người dùng"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Tổng trạm đổi pin"
              value={statistics.totalStations}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Tổng số pin"
              value={statistics.totalBatteries}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Tổng doanh thu"
              value={statistics.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Tổng đặt chỗ"
              value={statistics.totalBookings}
              prefix={<CarOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable>
            <Statistic
              title="Đặt chỗ hoàn thành"
              value={statistics.completedBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ doanh thu */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu theo ngày" hoverable>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Không có dữ liệu doanh thu trong khoảng thời gian này" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái đặt chỗ" hoverable>
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Không có dữ liệu đặt chỗ" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ trạng thái pin và hiệu suất trạm */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Trạng thái pin" hoverable>
            {batteryStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={batteryStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {batteryStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Không có dữ liệu pin" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Top 10 trạm hoạt động tốt nhất" hoverable>
            {stationPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stationPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" name="Tổng đặt chỗ" fill="#8884d8" />
                  <Bar dataKey="completed" name="Hoàn thành" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Không có dữ liệu trạm" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
