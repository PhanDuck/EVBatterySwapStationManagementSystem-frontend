import React from "react";
import "./Navbar.css";
import { Button } from "antd";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="menu flex items-center justify-between border-b-blue-950 bg-blue-900 p-4">
      <div className="menu__logo">
        <a href="/">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        </a>
      </div>
      <div className="menu_right flex gap-2 rounded-lg p-2">
        <Link to="/login">
          <Button
            type="primary"
            style={{
              backgroundColor: "#FFC107",
              borderColor: "#FFC107",
              color: "#212529",
            }}
          >
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button
            type="primary"
            style={{
              backgroundColor: "#03A9F4",
              borderColor: "#03A9F4",
              color: "#fff",
            }}
          >
            Register
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
