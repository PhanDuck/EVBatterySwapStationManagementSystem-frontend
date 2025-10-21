import { Button } from 'antd';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";

const LogoutBtn = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.clear();
    navigate("/login", { replace: true }); // quay lại login
    window.location.reload(); // 💥 reload để reset toàn bộ state
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
          Logout
        </Button>
    </div>
  )
}

export default LogoutBtn
