
import React from "react";
import "./NavBar.css";
import { Button, Dropdown } from "antd";
import { Link, useNavigate } from "react-router-dom";
//import { clearAuth } from "../../config/auth";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { isAuthenticated } from "../../config/auth";
import LogoutBtn from "../LogoutBtn/LogoutBtn";

const Navbar = () => {
  const navigate = useNavigate();

  // const isAuthenticated = !!(localStorage.getItem("authToken") || sessionStorage.getItem("authToken"));
  const authed = isAuthenticated();



  const handleGuardedNav = (path) => {
    if (!authed) {
      navigate("/login");
      return;
    }
    navigate(path);
  };
  

  const swapMenuItems = [
    {
      key: "nearest",
      label: <Link to="/stations/nearby">Tìm trạm gần nhất</Link>,
    },
    {
      key: "booking",
      label: (
        <span onClick={() => handleGuardedNav("/stations/booking")}>
          Đặt lịch
        </span>
      ),
    },
  ];

  return (
    // Cải thiện: Tăng chiều cao và sử dụng shadow nhẹ (box-shadow được định nghĩa trong CSS)
    <nav className="menu flex items-center justify-between border-b-blue-950 bg-blue-900 px-8 py-4">
      {/* Logo: Điều chỉnh để logo và chữ sát nhau */}
      <div className="menu__logo text-white font-bold text-xl flex items-center">
        <Link
          to="/"
          className="flex items-center"
          style={{ textDecoration: "none", color: "white" }}
        >
          <img
            alt="EV logo"
            src="https://img.icons8.com/?size=100&id=A6Ktz1n8GdNX&format=png&color=FFFFFF" // Đổi logo sang màu trắng
            style={{ width: 30, height: 30, marginRight: 8 }}
          />
          <span>EV Battery Swap</span>
        </Link>
      </div>

<<<<<<< HEAD
            {/* Menu chính: Dùng class gap-8 thay vì gap-6 để thoáng hơn */}
            <div className="menu_left flex items-center gap-8 text-white">
                <Link to="/" className="hover:text-yellow-400 transition-colors">Trang chủ</Link>
                <Link to="/about" className="hover:text-yellow-400 transition-colors">Về chúng tôi</Link>
                <Dropdown
                    menu={{ items: swapMenuItems }}
                    placement="bottom" // Đặt xuống dưới (bottom) trông tự nhiên hơn
                    trigger={["hover"]}
                >
                    {/* Bọc trong span hoặc div để dễ styling hover */}
                    <span onClick={(e) => e.preventDefault()} className="cursor-pointer hover:text-yellow-400 transition-colors">
                        Trạm đổi pin
                    </span>
                </Dropdown>
                <Link to="/packages" className="hover:text-yellow-400 transition-colors">Gói dịch vụ</Link>
                <Link to="/support" className="hover:text-yellow-400 transition-colors">Hỗ trợ</Link>
            </div>

            {/* Nút bấm */}
            <div className="menu_right flex gap-3"> {/* Tăng gap lên 3 */}
                {!isAuthenticated ? (
                    <>
                        <Link to="/login">
                            <Button 
                                type="default" 
                                style={{ backgroundColor: "#FFC107", color: "#1F2937", borderColor: "#FFC107", fontWeight: 'bold' }}> {/* Nút Đăng nhập nổi bật */}
                                Đăng nhập
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button 
                                type="default" 
                                style={{ backgroundColor: "transparent", color: "#fff", borderColor: "#fff" }}> {/* Nút Đăng ký làm nút phụ */}
                                Đăng ký
                            </Button>
                        </Link>
                    </>
                ) : (
                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                )}
            </div>
        </nav>
    );
=======
      {/* Menu chính: Dùng class gap-8 thay vì gap-6 để thoáng hơn */}
      <div className="menu_left flex items-center gap-8 text-white">
        <Link to="/about" className="hover:text-yellow-400 transition-colors">
          Về chúng tôi
        </Link>
        <Dropdown
          menu={{ items: swapMenuItems }}
          placement="bottom" // Đặt xuống dưới (bottom) trông tự nhiên hơn
          trigger={["hover"]}
        >
          {/* Bọc trong span hoặc div để dễ styling hover */}
          <span
            onClick={(e) => e.preventDefault()}
            className="cursor-pointer hover:text-yellow-400 transition-colors"
          >
            Trạm đổi pin
          </span>
        </Dropdown>
        <Link
          to="/packages"
          className="hover:text-yellow-400 transition-colors"
        >
          Gói dịch vụ
        </Link>
      </div>

      {/* Nút bấm */}
      <div className="menu_right flex gap-3">
        {" "}
        {/* Tăng gap lên 3 */}
        {!authed ? (
          <>
            <Link to="/login">
              <Button
                type="default"
                style={{
                  backgroundColor: "#FFC107",
                  color: "#1F2937",
                  borderColor: "#FFC107",
                  fontWeight: "bold",
                }}
              >
                {" "}
                {/* Nút Đăng nhập nổi bật */}
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register">
              <Button
                type="default"
                style={{
                  backgroundColor: "transparent",
                  color: "#fff",
                  borderColor: "#fff",
                }}
              >
                {" "}
                {/* Nút Đăng ký làm nút phụ */}
                Đăng ký
              </Button>
            </Link>
          </>
        ) : (
          <LogoutBtn />
        )}
      </div>
    </nav>
  );
>>>>>>> f5ea1d0 (Cap nhat giao dien + them thanh toan)
};

export default Navbar;
