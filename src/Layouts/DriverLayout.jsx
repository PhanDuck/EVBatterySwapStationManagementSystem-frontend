import React from "react";
import { Layout, Menu } from "antd";
import { Outlet, Link } from "react-router-dom";
import { DashboardOutlined, CarOutlined, HistoryOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const DriverLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="text-white text-center py-4 text-xl font-bold">
          Driver Panel
        </div>
        <Menu theme="dark" mode="inline">
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/driver/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="stations" icon={<CarOutlined />}>
            <Link to="/driver/stations">Stations Nearby</Link>
          </Menu.Item>
          <Menu.Item key="history" icon={<HistoryOutlined />}>
            <Link to="/driver/history">Swap History</Link>
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
          Driver Dashboard
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

export default DriverLayout;
