import { NavLink } from "react-router-dom";
import { FiUsers, FiMap, FiTruck, FiCalendar, FiCreditCard, FiHelpCircle, FiBatteryCharging, FiSettings } from "react-icons/fi";
import { Tooltip } from "antd";
import { MdOutlinePayments } from "react-icons/md";
import { TbMessageCircleQuestion } from "react-icons/tb";


export default function RoleSidebar({ role = "ADMIN", collapsed = false }) {
  const base = role ? role.toLowerCase() : "";

  // static sidebar color (revert customization)
  const roleColor = '#001529';
  const textColor = '#fff';

  const menu = {
    ADMIN: [
      { path: "users", label: "Quản lý người dùng", icon: <FiUsers /> },
      { path: "stations", label: "Trạm đổi pin", icon: <FiMap /> },
      { path: "batteries", label: "Quản lý pin", icon: <FiBatteryCharging /> },
      { path: "vehicles", label: "Xe điện", icon: <FiTruck /> },
      { path: "bookings", label: "Đặt lịch", icon: <FiCalendar /> },
      { path: "service-packages", label: "Gói cước", icon: <FiCreditCard /> },
      { path: "transactions", label: "Giao dịch", icon: <MdOutlinePayments /> },
      { path: "tickets", label: "Hỗ trợ", icon: <TbMessageCircleQuestion /> },
    ],
    STAFF: [
      { path: "bookings", label: "Đặt lịch", icon: <FiCalendar /> },
      { path: "stations", label: "Trạm đổi pin", icon: <FiMap /> },
      { path: "tickets", label: "Hỗ trợ", icon: <TbMessageCircleQuestion /> },
      { path: "inventories", label: "Quản lý tồn kho", icon: <FiSettings /> },
    ],
    DRIVER: [
      { path: "bookings", label: "Lịch đặt của tôi", icon: <FiCalendar /> },
      { path: "vehicles", label: "Xe điện", icon: <FiTruck /> },
      { path: "transactions", label: "Giao dịch", icon: <MdOutlinePayments /> },
      { path: "driver-subscription", label: "Quản lý đăng ký", icon: <FiHelpCircle /> },
      { path: "tickets", label: "Hỗ trợ", icon: <TbMessageCircleQuestion /> },
    ],
  };


  return (
    <aside
      className={`${collapsed ? "w-20" : ""} p-4 min-h-screen`}
      style={{ transition: "width 220ms ease", background: roleColor, color: textColor }}
    >
      <div className={`mb-6 flex items-baseline gap-3 ${collapsed ? "justify-center" : ""}`}>
        <div style={{ paddingBottom: 12 }}>
          <div
            className={`w-10 h-10 rounded flex items-center justify-center font-bold ${
              collapsed ? "mx-auto" : ""
            }`}
            style={{ background: '#f5af19', color: '#111' }}
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
              <div className="text-lg font-bold" style={{ opacity: 0.85 }}>{role}</div>
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
                isActive ? "active text-white font-semibold" : "text-gray-200 hover:bg-gray-800 hover:text-white"
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
