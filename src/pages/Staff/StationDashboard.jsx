import React, { useEffect, useState } from "react";
import axios from "axios";

const StationDashboard = () => {
  const [availableCount, setAvailableCount] = useState("--");
  const [chargingCount, setChargingCount] = useState("--");

  const API_BASE = "https://68d29b4bcc7017eec54491b4.mockapi.io";

  const refreshCounts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/battery`, { params: { page: 1, limit: 1000 } });
      const rows = res.data || [];
      const avail = rows.filter(r => String(r.status || r.Status).toLowerCase() === "available").length;
      const charge = rows.filter(r => String(r.status || r.Status).toLowerCase() === "charging").length;
      setAvailableCount(avail);
      setChargingCount(charge);
    } catch {
      setAvailableCount("--");
      setChargingCount("--");
    }
  };

  useEffect(() => {
    refreshCounts();
    const onInventoryUpdated = () => refreshCounts();
    window.addEventListener("inventory:updated", onInventoryUpdated);
    return () => window.removeEventListener("inventory:updated", onInventoryUpdated);
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Tổng quan trạm</h2>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Pin sẵn sàng: {availableCount}</li>
        <li>Pin đang sạc: {chargingCount}</li>
        <li>Giao dịch hôm nay: --</li>
      </ul>
    </div>
  );
};

export default StationDashboard;



/*import React from "react";

const StationDashboard = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Tổng quan trạm</h2>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Pin sẵn sàng: --</li>
        <li>Pin đang sạc: --</li>
        <li>Giao dịch hôm nay: --</li>
      </ul>
    </div>
  );
};

export default StationDashboard;*/


