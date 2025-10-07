import React, { useState } from "react";
import {
  Layout,
  Menu,
  theme,
  Button,
  Space,
  Avatar,
  Dropdown,
  Input,
  Badge,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import {
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./Dashboard.css";

const { Header, Content, Footer, Sider } = Layout;

export default function MainLayout({ children, sidebar, title }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#002140",
            padding: "18px 24px",
          }}
        >
          <Button
            type="text"
            icon={<IoMenu size={28} color="#fff" />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontWeight: "bolder",
              fontSize: "16px",
              textTransform: "uppercase",
              display: collapsed ? "none" : "block",
            }}
          >
            EV Battery Admin
          </h1>
        </div>

        {/* Sidebar nội dung */}
        {sidebar}
      </Sider>

      {/* Main content */}
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            height: "72px",
            boxShadow: "2px 2px 13px -1px rgba(0,0,0,0.75)",
          }}
        >
          {/* Ô tìm kiếm */}
          <div style={{ flex: 1, maxWidth: "400px", margin: "0 24px" }}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              style={{ borderRadius: "20px" }}
            />
          </div>

          {/* Nút thông báo + Avatar + Logout */}
          <Space size="middle">
            <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge>

            <Avatar
              size="small"
              style={{ backgroundColor: "#1890ff" }}
              icon={<UserOutlined />}
            />
            <span style={{ fontWeight: "500" }}>Admin</span>

            {/* Nút Logout */}
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>

        <Content style={{ marginTop: "6px" }}>
          <div
            style={{
              padding: 24,
              minHeight: "calc(100% - 18px)",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {title && <h1 className="text-2xl font-bold mb-4">{title}</h1>}
            {children}
          </div>
        </Content>

        <Footer
          style={{
            height: "18px",
            textAlign: "center",
            fontSize: "16px",
            justifyContent: "center",
            display: "flex",
            alignItems: "center",
          }}
        >
          ©{new Date().getFullYear()} Created by{" "}
          <span style={{ fontWeight: "bold", marginLeft: "4px" }}>TEAM 4</span>
        </Footer>
      </Layout>
    </Layout>
  );
}
