import React from "react";
import NavBar from "../components/navbar/navBar";

function AboutPage() {
  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 20px' }}>
        <h2>Về chúng tôi</h2>
        <p>Hệ thống quản lý trạm đổi pin xe điện hướng đến sự đơn giản, hiệu quả và thân thiện với người dùng.</p>
      </div>
    </div>
  );
}

export default AboutPage;


