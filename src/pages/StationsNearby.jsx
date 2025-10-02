import React from "react";
import NavBar from "../components/navbar/navBar";

function StationsNearbyPage() {
  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 20px' }}>
        <h2>Trạm đổi pin gần nhất</h2>
        <p>Trang này sẽ hiển thị bản đồ và danh sách trạm trong các bước tiếp theo.</p>
      </div>
    </div>
  );
}

export default StationsNearbyPage;


