import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CarOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function RoleSidebar({ role = "ADMIN" }) {
  const location = useLocation();

  // =============================
  // 🌐 Cấu hình menu theo vai trò
  // =============================
  const menuConfig = {
    ADMIN: [
      { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/admin/dashboard" },
      { key: "users", label: "Users", icon: <UserOutlined />, path: "/admin/users" },
      { key: "stations", label: "Stations", icon: <ThunderboltOutlined />, path: "/admin/stations" },
      { key: "vehicles", label: "Vehicles", icon: <CarOutlined />, path: "/admin/vehicles" },
      { key: "transactions", label: "Transactions", icon: <DollarOutlined />, path: "/admin/transactions" },
      { key: "support", label: "Support Tickets", icon: <CustomerServiceOutlined />, path: "/admin/support" },
      { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/admin/settings" },
    ],

    STAFF: [
      { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/staff/dashboard" },
      { key: "stations", label: "Manage Stations", icon: <ThunderboltOutlined />, path: "/staff/stations" },
      { key: "vehicles", label: "Assigned Vehicles", icon: <CarOutlined />, path: "/staff/vehicles" },
      { key: "support", label: "Support", icon: <CustomerServiceOutlined />, path: "/staff/support" },
    ],

    CUSTOMER: [
      { key: "home", label: "Home", icon: <HomeOutlined />, path: "/customer/home" },
      { key: "bookings", label: "My Bookings", icon: <CalendarOutlined />, path: "/customer/bookings" },
      { key: "transactions", label: "My Transactions", icon: <DollarOutlined />, path: "/customer/transactions" },
      { key: "support", label: "Support", icon: <CustomerServiceOutlined />, path: "/customer/support" },
      { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/customer/settings" },
    ],
  };

  // Danh sách menu dựa vào role
  const items = menuConfig[role] || [];

  // Tự động chọn mục đang ở
  const selectedKey =
    items.find((item) => location.pathname.includes(item.key))?.key || items[0]?.key;

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="70"
      theme="dark"
      className="min-h-screen"
      style={{ position: "sticky", top: 0, left: 0, zIndex: 50 }}
    >
      {/* Logo hoặc tiêu đề */}
      <div
        className="text-white text-center py-4 text-lg font-bold tracking-wide"
        style={{ background: "#001529" }}
      >
        {role === "ADMIN"
          ? "EV ADMIN"
          : role === "STAFF"
          ? "EV STAFF"
          : "EV CUSTOMER"}
      </div>

      {/* Menu động */}
      <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
        {items.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <Link to={item.path}>{item.label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
}
