import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getCurrentRole } from "../config/auth";

const PrivateRoute = ({ roles }) => {
  const authed = isAuthenticated();
  const role = getCurrentRole();

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
