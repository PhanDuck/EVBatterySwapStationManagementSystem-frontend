import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getCurrentRole } from "../config/auth";

const PrivateRoute = ({ roles }) => {
  const authed = isAuthenticated();
  const role = getCurrentRole();



  if (!authed) {
    // Nếu chưa đăng nhập
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {

    // Nếu đăng nhập rồi nhưng không có quyền truy cập route này
    return <Navigate to={`/${role}`} replace />;
  }

  // ✅ Nếu hợp lệ thì cho hiển thị route con

  return <Outlet />;
};

export default PrivateRoute;