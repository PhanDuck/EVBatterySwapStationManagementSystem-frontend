import React from "react";
import { Button } from "antd";
import { clearAuth, getCurrentUser } from "../../config/auth";

const DashboardHeader = ({ title }) => {
  const user = getCurrentUser();
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {user?.fullName || user?.FullName ? (
          <p className="text-gray-500 text-sm">Xin chào, {user.fullName || user.FullName}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={() => (window.location.href = "/")}>Trang chủ</Button>
        <Button danger onClick={() => { clearAuth(); window.location.href = "/"; }}>Đăng xuất</Button>
      </div>
    </div>
  );
};

export default DashboardHeader;


