import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button, Tooltip } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import MainLayout from "../../components/Layout/MainLayout";
import RoleSidebar from "../../components/Layout/RoleSidebar";
import Bookings from "../Management/Bookings";
import Transactions from "../Management/Transactions";
import Vehicles from "../Management/Vehicles";
import DriverSubscriptionManagement from "../Management/DriverSubscriptionManagement";
import PackagesPage from "../Shared/Packages";
import SupportTickets from "../Management/SupportTickets";
import Profile from "../Management/Profile";

export default function DriverDashboard() {
  const navigate = useNavigate();
  return (
    <MainLayout sidebar={<RoleSidebar role="DRIVER" />} title="Trang tài xế">
      <div className="p-4" style={{ position: "relative", minHeight: "100vh" }}>
        <Routes>
          <Route index element={<Navigate to="bookings" />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="driver-subscription" element={<DriverSubscriptionManagement />}/>
          <Route path="upgrade-plan" element={<PackagesPage />} />
          <Route path="tickets" element={<SupportTickets />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<div>Không tìm thấy trang!</div>} />
        </Routes>
        <Tooltip title="Đổi Pin Nhanh">
          <Button
            type="primary"
            shape="circle" // Hình tròn
            icon={<QrcodeOutlined style={{ fontSize: "24px" }} />}
            size="large"
            style={{
              position: "fixed",
              bottom: 40,
              right: 40,
              width: 60,
              height: 60,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #1890ff)", 
              border: "none",
            }}
            onClick={() => navigate("/quick-swap")}
          />
        </Tooltip>
      </div>
    </MainLayout>
  );
}
