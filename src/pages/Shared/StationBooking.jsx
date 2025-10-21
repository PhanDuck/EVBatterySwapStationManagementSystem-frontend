import React from "react";
import NavBar from "../../components/navbar/navBar";

function StationBookingPage() {
  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 20px' }}>
        <h2>Đặt lịch đổi pin</h2>
        <p>Biểu mẫu đặt lịch sẽ được bổ sung sau. Trang này yêu cầu đăng nhập.</p>
      </div>
    </div>
  );
}

export default StationBookingPage;