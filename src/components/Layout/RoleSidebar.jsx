import { NavLink } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiCreditCard,
  FiBatteryCharging,
  FiBox,
} from "react-icons/fi";
import {
  MdOutlinePayments,
  MdDashboard,
  MdElectricBike,
  MdLocationOn,
  MdOutlineQrCode2
} from "react-icons/md";
import { TbMessageCircleQuestion } from "react-icons/tb";
import { RiUserLocationLine } from "react-icons/ri";
import { Tooltip } from "antd";

export default function RoleSidebar({ role = "ADMIN", collapsed = false }) {
  const base = role ? role.toLowerCase() : "";

  // static sidebar color (revert customization)
  const roleColor = "#001529";
  const textColor = "#fff";

  const menu = {
    ADMIN: [
      { path: "overview", label: "Dashboard", icon: <MdDashboard /> },
      { path: "users", label: "Quản lý người dùng", icon: <FiUsers /> },
      {
        path: "stations",
        label: "Quản lý trạm đổi pin",
        icon: <MdLocationOn />,
      },
      { path: "batteries", label: "Quản lý pin", icon: <FiBatteryCharging /> },
      { path: "vehicles", label: "Quản lý xe điện", icon: <MdElectricBike /> },
      {
        path: "assignments",
        label: "Quản lý phân quyền",
        icon: <RiUserLocationLine />,
      },
      { path: "inventories", label: "Quản lý tồn kho", icon: <FiBox /> },
      { path: "bookings", label: "Quản lý đặt lịch", icon: <FiCalendar /> },
      {
        path: "qr",
        label: "Quản lý mã QR",
        icon: <MdOutlineQrCode2 />,
      },
      {
        path: "service-packages",
        label: "Quản lý gói cước",
        icon: <FiCreditCard />,
      },
      {
        path: "transactions",
        label: "Quản lý giao dịch",
        icon: <MdOutlinePayments />,
      },
      {
        path: "tickets",
        label: "Quản lý hỗ trợ",
        icon: <TbMessageCircleQuestion />,
      },
    ],
    STAFF: [
      { path: "bookings", label: "Quản lý đặt lịch", icon: <FiCalendar /> },
      {
        path: "stations",
        label: "Quản lý trạm đổi pin",
        icon: <MdLocationOn />,
      },
      { path: "inventories", label: "Quản lý kho", icon: <FiBox /> },
      {
        path: "tickets",
        label: "Quản lý hỗ trợ",
        icon: <TbMessageCircleQuestion />,
      },
    ],
    DRIVER: [
      { path: "bookings", label: "Lịch đặt của tôi", icon: <FiCalendar /> },
      { path: "vehicles", label: "Xe điện của tôi", icon: <MdElectricBike /> },
      {
        path: "transactions",
        label: "Giao dịch của tôi",
        icon: <MdOutlinePayments />,
      },
      {
        path: "driver-subscription",
        label: "Quản lý gói cước",
        icon: <FiCreditCard />,
      },
      { path: "tickets", label: "Hỗ trợ", icon: <TbMessageCircleQuestion /> },
    ],
  };

  return (
    <aside
      className={`${collapsed ? "w-20" : ""} p-4 min-h-screen`}
      style={{
        transition: "width 220ms ease",
        background: roleColor,
        color: textColor,
      }}
    >
      <div
        className={`mb-6 flex items-baseline gap-3 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div style={{ paddingBottom: 12 }}>
          <div
            className={`w-10 h-10 rounded flex items-center justify-center font-bold ${
              collapsed ? "mx-auto" : ""
            }`}
            style={{ background: "#f5af19", color: "#111" }}
          >
            EV
          </div>
        </div>
        <div
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: collapsed ? 0 : 140,
            opacity: collapsed ? 0 : 1,
            transition: "max-width 220ms ease, opacity 180ms ease",
          }}
        >
          {!collapsed && (
            <>
              <div className="text-lg font-bold" style={{ opacity: 0.85 }}>
                {role}
              </div>
            </>
          )}
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {menu[role]?.map((item) => (
          <NavLink
            key={item.path}
            to={`/${base}/${item.path}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "active text-white font-semibold"
                  : "text-gray-200 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            {/** show tooltip on icon when collapsed */}
            {collapsed ? (
              <Tooltip title={item.label} placement="right">
                <span className="text-lg">{item.icon}</span>
              </Tooltip>
            ) : (
              <span className="text-lg">{item.icon}</span>
            )}

            <span
              style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                maxWidth: collapsed ? 0 : 160,
                opacity: collapsed ? 0 : 1,
                transition: "max-width 220ms ease, opacity 180ms ease",
              }}
            >
              {!collapsed && item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
