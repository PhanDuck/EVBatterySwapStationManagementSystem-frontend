import { Button } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";
import { clearAuth } from "../../config/auth";

const LogoutBtn = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Sử dụng clearAuth để xóa tất cả thông tin xác thực
    clearAuth();
    sessionStorage.clear();
    navigate("/login", { replace: true }); // quay lại login
    window.location.reload();
  };
  return (
    <div>
      <Button
        type="primary"
        danger
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        block
      >
        Đăng xuất
      </Button>
    </div>
  );
};

export default LogoutBtn;
