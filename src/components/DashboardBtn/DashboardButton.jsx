import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { MdSpaceDashboard } from "react-icons/md";

const DashboardButton = () => {
  const navigate = useNavigate();

  // Giả sử role được lưu trong localStorage (thường là vậy trong project của bạn)
  const role = JSON.parse(localStorage.getItem("currentUser"))?.role;
console.log(role);
  const handleNavigate = () => {
    let path = "/";

    switch (role) {
      case "ADMIN":
        path = "/admin";
        break;
      case "STAFF":
        path = "/staff";
        break;
      case "DRIVER":
        path = "/driver";
        break;
      default:
        path = "/"; // fallback
        break;
    }

    navigate(path);
  };

  return (
    <Button
      type="primary"
      icon={<MdSpaceDashboard  />}
      onClick={handleNavigate}
      style={{
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      Dashboard
    </Button>
  );
};

export default DashboardButton;
