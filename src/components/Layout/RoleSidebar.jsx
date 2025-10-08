import { Link } from "react-router-dom";

export default function RoleSidebar({ role }) {
  const base = role.toLowerCase();

  const menu = {
    ADMIN: [
      { path: "users", label: "👥 Quản lý người dùng" },
      { path: "stations", label: "🏭 Trạm sạc" },
      { path: "vehicles", label: "🚗 Xe điện" },
      { path: "bookings", label: "📅 Đặt lịch" },
      { path: "transactions", label: "💳 Giao dịch" },
      { path: "tickets", label: "🎫 Hỗ trợ" },
      { path: "inventory", label: "🎁 Tồn kho pin" },
      { path: "swaps", label: "🔄 Giao dịch đổi pin" },
    ],
    STAFF: [
      { path: "bookings", label: "📅 Đặt lịch" },
      { path: "stations", label: "🏭 Trạm sạc" },
      { path: "vehicles", label: "🚗 Xe điện" },
      { path: "tickets", label: "🎫 Hỗ trợ" },
      { path: "inventory", label: "🎁 Tồn kho pin" },
      { path: "swaps", label: "🔄 Giao dịch đổi pin" },
    ],
    DRIVER: [
      { path: "bookings", label: "📅 Lịch đặt của tôi" },
      { path: "transactions", label: "💳 Giao dịch" },
    ],
  };

  return (
    <aside className="w-60 bg-gray-800 text-white p-4 min-h-screen">
      <h2 className="text-lg font-bold mb-4 capitalize">{role} Menu</h2>
      <nav className="flex flex-col space-y-2">
        {menu[role]?.map((item) => (
          <Link
            key={item.path}
            to={`/${base}/${item.path}`}
            className="hover:text-yellow-300"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
