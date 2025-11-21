import { Avatar, Dropdown, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import { HiOutlineSparkles } from "react-icons/hi";
import LogoutBtn from "../Btn/LogoutBtn";
import ProfileBtn from "../Btn/ProfileBtn";
import HomeBtn from "../Btn/HomeBtn";

const BottomSideBar = ({ collapse }) => {
  const navigate = useNavigate();

  // Hàm lấy tên hiển thị
  function getDisplayName() {
    try {
      const sessionName =
        sessionStorage.getItem("currentUser") ||
        localStorage.getItem("currentUser");

      if (!sessionName) return "User";

      const userObject = JSON.parse(sessionName);
      return userObject?.fullName || "User";
    } catch {
      return "User";
    }
  }

  // Hàm lấy Role
  const getRole = () => {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (!userStr) return null;
      const userObject = JSON.parse(userStr);
      return userObject?.role || null;
    } catch {
      return null;
    }
  };

  const Role = getRole();

  const items = [
    {
      key: "1",
      label: <ProfileBtn />,
    },
    {
      key: "home",
      label: <HomeBtn />,
    },
    {
      key: "2",
      label: <LogoutBtn />,
    },
  ];

  return (
    <div
      style={{
        padding: "12px 16px",
        display: "flex",
        gap: "8px",
        flexDirection: "column",
        color: "#fff",
        alignItems: `${collapse ? "center" : "flex-start"}`,
      }}
    >
      <div>
        <Avatar
          size="small"
          style={{ backgroundColor: "#1890ff", marginRight: "8px" }}
          icon={<UserOutlined />}
        />
        {!collapse && (
          <Dropdown menu={{ items }} placement="top">
            {/* Thêm href="#" hoặc style cursor pointer để giống link hơn */}
            <a
              onClick={(e) => e.preventDefault()}
              style={{ cursor: "pointer" }}
            >
              <Space>
                <span style={{ fontWeight: 500 }}>{getDisplayName()}</span>
              </Space>
            </a>
          </Dropdown>
        )}
      </div>

      {/* Chỉ hiện nút nâng cấp nếu là DRIVER */}
      {Role === "DRIVER" && (
        <div>
          <button
            onClick={() => navigate("/driver/upgrade-plan")}
            style={{
              backgroundColor: "rgba(59,130,246,0.18)",
              padding: "8px 12px",
              borderRadius: "6px",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              width: collapse ? "auto" : "100%", // Tinh chỉnh width khi collapse
            }}
            className="hover:bg-linear-to-t from-sky-500 to-indigo-500 duration-500"
          >
            <div className="flex justify-between items-center gap-1 font-bold">
              <HiOutlineSparkles />
              {!collapse && <p style={{ margin: 0 }}>Nâng cấp gói</p>}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default BottomSideBar;
