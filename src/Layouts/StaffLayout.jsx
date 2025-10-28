import React from "react";
import { Layout, Menu } from "antd";
import { Outlet, Link } from "react-router-dom";
import {
  DashboardOutlined,
  ToolOutlined,
  SwapOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const StaffLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="text-white text-center py-4 text-xl font-bold">
          Staff Panel
        </div>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/staff/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="inventory" icon={<ToolOutlined />}>
            <Link to="/staff/inventory">Inventory</Link>
          </Menu.Item>
          <Menu.Item key="swaps" icon={<SwapOutlined />}>
            <Link to="/staff/swaps">Swap Transactions</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main content */}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: 0,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          Staff Dashboard
        </Header>
        <Content style={{ margin: "16px" }}>
          <div
            style={{
              padding: 24,
              background: "#fff",
              minHeight: "calc(100vh - 120px)",
            }}
          >
            <Outlet /> {/* hiển thị nội dung trang con */}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;
