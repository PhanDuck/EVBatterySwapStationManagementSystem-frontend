import React, { useState, useEffect } from "react";
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
  Divider,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import {
  BellOutlined,
  DownOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./Dashboard.css";

const { Header, Content, Footer, Sider } = Layout;

export default function MainLayout({ children, sidebar, title }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem("sidebarCollapsed");
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    navigate("/login");
  };

  function getDisplayName() {
    try {
      const sessionName =
        sessionStorage.getItem("currentUser") ||
        localStorage.getItem("currentUser");
      const userObject = JSON.parse(sessionName);
      console.log(userObject.fullName);
      return userObject.fullName;
    } catch {
      // ignore
      console.log("Can't get UserInfo");
    }
  }

  const menu = (
    <Menu>
      <Menu.Item key="1">Item 1</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2">
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Menu.Item>
    </Menu>
  );
  const items = [
    {
      key: "1",
      label: (
        <a>
          Setting
        </a>
      ),
    },
    {
      // Logout button
      key: "2",
      label: (
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      ),
    },
  ];
  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    } catch {
      // noop
    }
  }, [collapsed]);

  // static sidebar/header colors (revert customization)
  const roleColor = "#001529";
  const headerColor = "#06263d";
  const headerBorder = "rgba(255,255,255,0.06)";

  return (
    <Layout className="ev-dashboard" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        breakpoint="lg"
        collapsedWidth={80}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: `linear-gradient(180deg, ${headerColor}, ${roleColor})`,
            padding: "18px 24px",
            borderBottom: `1px solid ${headerBorder}`,
          }}
        >
          <Button
            type="text"
            icon={<IoMenu size={28} color="#fff" />}
            onClick={() => setCollapsed((c) => !c)}
          />
          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontWeight: "bolder",
              fontSize: "20px",
              textTransform: "uppercase",
              display: collapsed ? "none" : "block",
            }}
          >
            EV Battery
          </h1>
        </div>

        {/* Sidebar nội dung - forward collapsed prop if sidebar is a React element */}
        {React.isValidElement(sidebar)
          ? React.cloneElement(sidebar, { collapsed })
          : sidebar}
      </Sider>

      {/* Main content */}
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            height: "72px",
            boxShadow: "2px 2px 13px -1px rgba(0,0,0,0.75)",
          }}
        >
          {/* Ô tìm kiếm */}

          {/* Nút thông báo + Avatar + Logout */}
          <Space size="middle">
            {/* <Badge count={3} size="small">
              <Button type="text" icon={<BellOutlined />} />
            </Badge> */}
            <Avatar
              size="small"
              style={{ backgroundColor: "#1890ff" }}
              icon={<UserOutlined />}
            />
            <Dropdown menu={{ items }} placement="bottom">
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <span style={{ fontWeight: "500", fontSize: "16px" }}>
                    {getDisplayName()}
                  </span>
                </Space>
              </a>
            </Dropdown>
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
