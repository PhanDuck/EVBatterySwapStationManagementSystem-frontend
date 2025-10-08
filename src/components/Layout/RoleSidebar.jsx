import { NavLink } from "react-router-dom";
import { FiUsers, FiMap, FiTruck, FiCalendar, FiCreditCard, FiHelpCircle } from "react-icons/fi";
import { Tooltip } from "antd";

export default function RoleSidebar({ role = "ADMIN", collapsed = false }) {
  const base = role ? role.toLowerCase() : "";

  const menu = {
    ADMIN: [
      { path: "users", label: "Quản lý người dùng", icon: <FiUsers /> },
      { path: "stations", label: "Trạm sạc", icon: <FiMap /> },
      { path: "vehicles", label: "Xe điện", icon: <FiTruck /> },
      { path: "bookings", label: "Đặt lịch", icon: <FiCalendar /> },
      { path: "transactions", label: "Giao dịch", icon: <FiCreditCard /> },
      { path: "tickets", label: "Hỗ trợ", icon: <FiHelpCircle /> },
    ],
    STAFF: [
      { path: "bookings", label: "Đặt lịch", icon: <FiCalendar /> },
      { path: "stations", label: "Trạm sạc", icon: <FiMap /> },
      { path: "vehicles", label: "Xe điện", icon: <FiTruck /> },
      { path: "tickets", label: "Hỗ trợ", icon: <FiHelpCircle /> },
    ],
    DRIVER: [
      { path: "bookings", label: "Lịch đặt của tôi", icon: <FiCalendar /> },
      { path: "transactions", label: "Giao dịch", icon: <FiCreditCard /> },
    ],
  };

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-60"} bg-gray-900 text-white p-4 min-h-screen`}
      style={{ transition: "width 220ms ease" }}
    >
      <div className={`mb-6 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <div
          className={`w-10 h-10 bg-yellow-500 rounded flex items-center justify-center text-black font-bold ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          EV
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
              <div className="text-sm font-bold">EV Battery</div>
              <div className="text-xs text-gray-300">{role}</div>
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
                isActive ? "bg-yellow-600 text-white font-semibold" : "text-gray-200 hover:bg-gray-800 hover:text-white"
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
