import React from "react";
import NavBar from "../../components/navbar/navBar";

function SupportPage() {
  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 20px' }}>
        <h2>Hỗ trợ</h2>
        <p>Gửi yêu cầu hỗ trợ hoặc xem câu hỏi thường gặp. Một số tác vụ sẽ yêu cầu đăng nhập.</p>
      </div>
    </div>
  );
}

export default SupportPage;


