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
import { Link, Outlet, useNavigate } from "react-router-dom";
import { TiBatteryCharge } from "react-icons/ti";
import { FaCrown, FaUser } from "react-icons/fa";
import { BsFillEvStationFill } from "react-icons/bs";
import {
  MdCurrencyExchange,
  MdMessage,
  MdOutlineCardMembership,
  MdOutlineSupportAgent,
} from "react-icons/md";
import { RiEBikeFill } from "react-icons/ri";
import {
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label: <Link to={key}>{label}</Link>,
  };
}
import "./Dashboard.css";
import { IoMenu } from "react-icons/io5";
const items = [
  getItem("Account", "account", <FaUser size={24} />),
  getItem("Battery", "battery", <TiBatteryCharge size={24} />),
  getItem("Station", "station", <BsFillEvStationFill size={24} />),
  getItem("Vehicle", "vehicle", <RiEBikeFill size={24} />),
  getItem("Package", "package", <FaCrown size={24} />),
  getItem("Transactions", "transactions", <MdCurrencyExchange size={24} />),
  getItem(
    "Subscriptions",
    "subscriptions",
    <MdOutlineCardMembership size={24} />
  ),
  getItem("Support Ticket", "support", <MdOutlineSupportAgent size={24} />),
  getItem("Response Ticket", "response", <MdMessage size={24} />),
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // User dropdown menu items
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        console.log("Navigate to profile");
        break;
      case "settings":
        console.log("Navigate to settings");
        break;
      case "logout":
        // Clear any stored authentication data (if applicable)
        localStorage.removeItem("authToken");
        sessionStorage.clear();
        // Navigate to home page
        navigate("/");
        break;
      default:
        break;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
            EV Battery Station
          </h1>
        </div>
        {/* <div className="demo-logo-vertical" /> */}
        <Menu
          theme="dark"
          defaultSelectedKeys={["account"]}
          mode="inline"
          items={items}
        />
      </Sider>
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
          {/* Left side - Toggle and Title */}

          {/* Center - Search */}
          <div style={{ flex: 1, maxWidth: "400px", margin: "0 24px" }}>
            <Input
              placeholder="Search anything..."
              prefix={<SearchOutlined />}
              style={{ borderRadius: "20px" }}
            />
          </div>

          {/* Right side - Actions and User */}
          <Space size="middle">
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ fontSize: "16px" }}
              />
            </Badge>

            <Button
              type="text"
              icon={<SettingOutlined />}
              style={{ fontSize: "16px" }}
            />

            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <Space
                style={{
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "8px",
                }}
              >
                <Avatar
                  size="small"
                  style={{ backgroundColor: "#1890ff" }}
                  icon={<UserOutlined />}
                />
                <span style={{ fontWeight: "500" }}>Admin User</span>
              </Space>
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
            <Outlet />
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
          <p>
            ©{new Date().getFullYear()} Created by{" "}
            <span className="font-bold">TEAM 4</span>
          </p>
        </Footer>
      </Layout>
    </Layout>
  );
};
export default Dashboard;
