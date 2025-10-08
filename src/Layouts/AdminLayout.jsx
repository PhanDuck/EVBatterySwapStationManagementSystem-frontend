import React from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token lưu trữ
    navigate("/login"); // Quay về trang đăng nhập
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="text-white text-center py-4 text-xl font-bold">
          Admin Panel
        </div>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/admin/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />}>
            <Link to="/admin/users">Users</Link>
          </Menu.Item>
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            <Link to="/admin/settings">Settings</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main content */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            Admin Dashboard
          </div>

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Header>

        <Content style={{ margin: "16px" }}>
          <div
            style={{
              padding: 24,
              background: "#fff",
              minHeight: "calc(100vh - 120px)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
