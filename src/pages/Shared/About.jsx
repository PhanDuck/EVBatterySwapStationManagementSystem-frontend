import React from "react";
import NavBar from "../../components/navbar/navBar";

function AboutPage() {
  return (
    <div>
      <NavBar />
      <main style={{ maxWidth: 1100, margin: '24px auto', padding: '0 20px' }}>
        <section style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, color: '#0f172a' }}>Về chúng tôi</h1>
          <p style={{ color: '#475569' }}>
            Lấy cảm hứng từ hệ sinh thái xe điện của Selex, chúng tôi xây dựng giải pháp quản lý trạm đổi pin, dịch vụ pin và hệ thống quản trị vận hành đơn giản – bền vững – hiệu quả.
          </p>
          <div style={{ width: 80, height: 4, background: '#1e3a8a', margin: '16px auto', borderRadius: 999 }} />
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Tầm nhìn</h2>
            <p style={{ color: '#334155', lineHeight: 1.7 }}>Trở thành nền tảng hạ tầng năng lượng cho xe máy điện hướng tới phát triển bền vững.</p>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Sứ mệnh</h2>
            <p style={{ color: '#334155', lineHeight: 1.7 }}>Giải quyết bài toán nạp năng lượng nhanh, giảm chi phí và nâng cao trải nghiệm cho người dùng xe điện.</p>
          </div>
        </section>

        <section style={{ marginBottom: 24, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Giá trị cốt lõi</h2>
          <ul style={{ listStyle: 'disc', paddingLeft: 20, color: '#334155', lineHeight: 1.8 }}>
            <li>Bền vững: môi trường, chất lượng và giá trị mang lại cho cộng đồng.</li>
            <li>Khả năng: liên tục đổi mới công nghệ và mở rộng năng lực hệ sinh thái.</li>
            <li>Dịch vụ: trải nghiệm tốt nhất, thân thiện với người dùng.</li>
            <li>Hân hoan: tạo ra niềm vui cho người dùng qua sản phẩm – dịch vụ chỉn chu.</li>
          </ul>
        </section>

        <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Năng lực</h2>
          <p style={{ color: '#334155', lineHeight: 1.7 }}>
            Đội ngũ R&D làm chủ công nghệ hệ thống: quản trị trạm, theo dõi pin, định vị phương tiện, quản lý gói dịch vụ và thanh toán.
          </p>
          <p style={{ color: '#334155', lineHeight: 1.7 }}>
            Chúng tôi tham khảo mô hình thành công từ VINFAST để tối ưu vận hành và mở rộng mạng lưới trạm đổi pin.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;


