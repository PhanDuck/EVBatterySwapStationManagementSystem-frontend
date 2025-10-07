import React from "react";

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

export default StationDashboard;


