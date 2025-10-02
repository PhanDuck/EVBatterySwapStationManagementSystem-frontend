import React from "react";
import NavBar from "../components/navbar/navBar";

function PackagesPage() {
  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 20px' }}>
        <h2>Gói dịch vụ</h2>
        <p>Tham khảo các gói dịch vụ pin phù hợp với nhu cầu sử dụng của bạn.</p>
      </div>
    </div>
  );
}

export default PackagesPage;


