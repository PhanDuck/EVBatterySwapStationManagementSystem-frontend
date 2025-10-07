import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import RoleSidebar from "../../components/Layout/RoleSidebar";

import Bookings from "../Management/Bookings";
import Transactions from "../Management/Transactions";

export default function DriverDashboard() {
  return (
    <MainLayout sidebar={<RoleSidebar role="DRIVER" />} title="Driver Dashboard">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Trang tài xế</h1>
        <Routes>
          <Route index element={<Navigate to="bookings" />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="*" element={<div>Không tìm thấy trang!</div>} />
        </Routes>
      </div>
    </MainLayout>
  );
}
