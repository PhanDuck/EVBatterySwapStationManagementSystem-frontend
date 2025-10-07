import React, { useEffect, useState } from "react";
import api from "../../config/axios";

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Placeholder API path - adjust when backend ready
        const res = await api.get("/staff/inventory");
        setItems(res.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Quản lý tồn kho pin</h2>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">BatteryID</th>
                <th className="text-left p-2">Model</th>
                <th className="text-left p-2">Capacity</th>
                <th className="text-left p-2">SOH</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.batteryId || row.BatteryID} className="border-b">
                  <td className="p-2">{row.batteryId || row.BatteryID}</td>
                  <td className="p-2">{row.model || row.Model}</td>
                  <td className="p-2">{row.capacity || row.Capacity}</td>
                  <td className="p-2">{row.stateOfHealth || row.StateOfHealth}</td>
                  <td className="p-2">{row.status || row.Status}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={5}>Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;


