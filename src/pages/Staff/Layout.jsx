import React from "react";
import { Layout, Menu } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

const { Sider, Content } = Layout;

const StaffLayout = () => {
  const location = useLocation();
  const selectedKey = location.pathname.replace("/staff/", "") || "overview";
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <div className="text-white px-4 py-3 font-semibold">Staff Panel</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}
          items={[
            { key: "overview", label: <Link to="/staff">Tổng quan</Link> },
            { key: "inventory", label: <Link to="/staff/inventory">Tồn kho pin</Link> },
            { key: "swaps", label: <Link to="/staff/swaps">Giao dịch đổi pin</Link> },
          ]}
        />
      </Sider>
      <Layout>
        <DashboardHeader title="Khu vực Nhân viên Trạm" />
        <Content style={{ margin: 16 }}>
          <div className="bg-white rounded shadow p-4">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;


