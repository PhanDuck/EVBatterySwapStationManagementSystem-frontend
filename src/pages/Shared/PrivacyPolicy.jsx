import React from "react";
import { Row, Col, Card, Button } from "antd";

const PrivacyPolicy = () => {
  // Mảng Mục Lục cho Chính sách quyền riêng tư
  const tableOfContents = [
    { id: "privacy-1", title: "1. Cam Kết Bảo Mật" },
    { id: "privacy-2", title: "2. Dữ Liệu Chúng Tôi Thu Thập" },
    { id: "privacy-3", title: "3. Dữ Liệu Vị Trí & Bản Đồ" },
    { id: "privacy-4", title: "4. Mục Đích Sử Dụng Dữ Liệu" },
    { id: "privacy-5", title: "5. Chia Sẻ Thông Tin" },
    { id: "privacy-6", title: "6. Bảo Mật & Lưu Trữ" },
    { id: "privacy-7", title: "7. Quyền Của Người Dùng" },
    { id: "privacy-8", title: "8. Cookie & Tracking" },
    { id: "privacy-9", title: "9. Thay Đổi Chính Sách" },
    { id: "privacy-10", title: "10. Liên Hệ" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --- STYLE OBJECTS ---
  const sectionStyle = {
    marginTop: "40px",
    marginBottom: "20px",
    color: "#1e3a8a",
    fontSize: "24px",
    fontWeight: "bold",
    borderBottom: "2px solid #4CAF50",
    paddingBottom: "10px",
  };

  const subsectionStyle = {
    marginTop: "20px",
    marginBottom: "15px",
    color: "#1e3a8a",
    fontSize: "18px",
    fontWeight: "600",
  };

  const textStyle = {
    marginBottom: "15px",
    lineHeight: "1.8",
    color: "#333",
    fontSize: "15px",
  };

  const highlightStyle = {
    backgroundColor: "#e8f5e9", // Nền xanh nhẹ
    border: "1px solid #4caf50",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    borderLeft: "4px solid #4caf50",
  };

  const listItemStyle = {
    marginBottom: "10px",
    lineHeight: "1.8",
    color: "#333",
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingTop: "20px", paddingBottom: "40px" }}>
      <Row gutter={[24, 24]} style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Sidebar - Mục Lục */}
        <Col xs={24} md={6}>
          <div style={{ position: "sticky", top: "80px", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
            <Card title="DANH MỤC CHÍNH SÁCH">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {tableOfContents.map((item) => (
                  <Button
                    key={item.id}
                    type="text"
                    onClick={() => scrollToSection(item.id)}
                    style={{
                      textAlign: "left",
                      color: "#1e3a8a",
                      fontSize: "13px",
                      height: "auto",
                      padding: "8px 12px",
                      borderRadius: "4px",
                      width: "100%",
                      whiteSpace: "normal" // Cho phép xuống dòng nếu tên mục dài
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e8f5e9"; // Hover xanh lá nhạt
                      e.currentTarget.style.color = "#2e7d32";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#1e3a8a";
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </Col>

        {/* Main Content */}
        <Col xs={24} md={18}>
          <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h1 style={{ fontSize: "32px", color: "#1e3a8a", marginBottom: "10px" }}>
                CHÍNH SÁCH QUYỀN RIÊNG TƯ
              </h1>
              <h2 style={{ fontSize: "24px", color: "#4CAF50", marginBottom: "20px" }}>
                BẢO MẬT DỮ LIỆU NGƯỜI DÙNG
              </h2>
              <p style={{ color: "#666", fontSize: "14px" }}>
                <strong>Hiệu lực từ:</strong> 14/09/2025
              </p>
            </div>

            {/* Section 1 */}
            <h2 id="privacy-1" style={sectionStyle}>1. CAM KẾT BẢO MẬT</h2>
            <p style={textStyle}>
              Hệ thống <strong>EV Battery Swap</strong> (sau đây gọi là "Chúng tôi") cam kết bảo vệ quyền riêng tư của người dùng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng dịch vụ đổi pin, ứng dụng di động và website.
            </p>
            <p style={textStyle}>
              Bằng việc đăng ký tài khoản và sử dụng dịch vụ, bạn đồng ý với các điều khoản được nêu trong Chính sách này.
            </p>

            {/* Section 2 */}
            <h2 id="privacy-2" style={sectionStyle}>2. DỮ LIỆU CHÚNG TÔI THU THẬP</h2>
            <h3 style={subsectionStyle}>2.1. Thông Tin Cá Nhân</h3>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}><strong>Thông tin định danh:</strong> Họ tên, Số điện thoại, Địa chỉ Email, CCCD/CMND (để xác minh hợp đồng thuê pin).</li>
              <li style={listItemStyle}><strong>Thông tin tài khoản:</strong> Tên đăng nhập, mật khẩu (được mã hóa), ảnh đại diện.</li>
            </ul>

            <h3 style={subsectionStyle}>2.2. Thông Tin Phương Tiện & Pin</h3>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>Biển số xe, loại xe, số khung (VIN).</li>
              <li style={listItemStyle}><strong>Dữ liệu pin (Telemetry):</strong> Lịch sử sạc/xả, trạng thái sức khỏe pin (SOH), nhiệt độ pin, quãng đường di chuyển. Đây là dữ liệu kỹ thuật cần thiết để đảm bảo an toàn vận hành.</li>
            </ul>

            <h3 style={subsectionStyle}>2.3. Thông Tin Thanh Toán</h3>
            <p style={textStyle}>
              Chúng tôi liên kết với các cổng thanh toán bên thứ ba (Momo). Chúng tôi <strong>KHÔNG</strong> lưu trữ trực tiếp số thẻ tín dụng hay thông tin tài khoản ngân hàng chi tiết của bạn trên hệ thống.
            </p>

            {/* Section 3 - Quan trọng cho App Location */}
            <h2 id="privacy-3" style={sectionStyle}>3. DỮ LIỆU VỊ TRÍ & BẢN ĐỒ (QUAN TRỌNG)</h2>
            <div style={highlightStyle}>
              <strong style={{ color: "#2e7d32" }}>THÔNG BÁO VỀ QUYỀN TRUY CẬP VỊ TRÍ:</strong>
              <p style={{...textStyle, marginTop: "10px", marginBottom: "0"}}>
                Để cung cấp tính năng cốt lõi là <strong>"Tìm Trạm Đổi Pin Gần Nhất"</strong> và dẫn đường, ứng dụng cần thu thập dữ liệu vị trí chính xác (GPS) của bạn.
              </p>
            </div>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}><strong>Khi đặt lịch đổi pin:</strong> Hệ thống sử dụng vị trí để ước tính thời gian đến trạm và giữ chỗ.</li>
              <li style={listItemStyle}>Chúng tôi cam kết <strong>KHÔNG</strong> theo dõi lịch trình di chuyển cá nhân của bạn cho mục đích quảng cáo hoặc bán cho bên thứ ba.</li>
            </ul>

            {/* Section 4 */}
            <h2 id="privacy-4" style={sectionStyle}>4. MỤC ĐÍCH SỬ DỤNG DỮ LIỆU</h2>
            <p style={textStyle}>Chúng tôi sử dụng thông tin thu thập được để:</p>
            <ol style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>Cung cấp dịch vụ đổi pin, xử lý giao dịch và quản lý gói thuê bao.</li>
              <li style={listItemStyle}>Gửi thông báo về tình trạng pin, nhắc nhở sạc pin hoặc bảo dưỡng xe.</li>
              <li style={listItemStyle}>Hỗ trợ khách hàng, giải quyết khiếu nại và sự cố kỹ thuật.</li>
              <li style={listItemStyle}>Phát hiện và ngăn chặn gian lận, trộm cắp pin hoặc phá hoại tài sản.</li>
              <li style={listItemStyle}>Gửi thông tin khuyến mãi, cập nhật tính năng mới (nếu bạn đồng ý nhận tin).</li>
            </ol>

            {/* Section 5 */}
            <h2 id="privacy-5" style={sectionStyle}>5. CHIA SẺ THÔNG TIN</h2>
            <p style={textStyle}>
              Chúng tôi <strong>KHÔNG</strong> bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp giới hạn:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}><strong>Đối tác vận hành trạm:</strong> Chỉ chia sẻ thông tin đặt lịch (Biển số xe, giờ đến) để nhân viên trạm chuẩn bị pin.</li>
              <li style={listItemStyle}><strong>Cổng thanh toán:</strong> Để xử lý các giao dịch nạp tiền hoặc thanh toán gói cước.</li>
              <li style={listItemStyle}><strong>Cơ quan pháp luật:</strong> Khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền (ví dụ: điều tra tai nạn, trộm cắp xe).</li>
            </ul>

            {/* Section 6 */}
            <h2 id="privacy-6" style={sectionStyle}>6. BẢO MẬT & LƯU TRỮ</h2>
            <h3 style={subsectionStyle}>6.1. Biện Pháp Bảo Mật</h3>
            <p style={textStyle}>
              Dữ liệu được lưu trữ trên máy chủ bảo mật (Cloud Server) đặt tại Việt Nam hoặc khu vực tuân thủ tiêu chuẩn an ninh mạng. Chúng tôi sử dụng mã hóa SSL/TLS cho mọi luồng truyền tải dữ liệu.
            </p>
            
            <h3 style={subsectionStyle}>6.2. Thời Gian Lưu Trữ</h3>
            <p style={textStyle}>
              Dữ liệu cá nhân được lưu trữ trong suốt thời gian bạn sử dụng dịch vụ. Nếu bạn yêu cầu xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa dữ liệu trong vòng 30 ngày, trừ khi pháp luật yêu cầu lưu trữ lâu hơn (ví dụ: dữ liệu hóa đơn kế toán).
            </p>

            {/* Section 7 */}
            <h2 id="privacy-7" style={sectionStyle}>7. QUYỀN CỦA NGƯỜI DÙNG</h2>
            <p style={textStyle}>Bạn có các quyền sau đối với dữ liệu của mình:</p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}><strong>Quyền truy cập:</strong> Xem lại thông tin cá nhân và lịch sử giao dịch trong ứng dụng.</li>
              <li style={listItemStyle}><strong>Quyền chỉnh sửa:</strong> Cập nhật thông tin cá nhân khi có thay đổi.</li>
              <li style={listItemStyle}><strong>Quyền xóa bỏ:</strong> Yêu cầu xóa tài khoản và dữ liệu cá nhân vĩnh viễn (qua email hỗ trợ hoặc chức năng trong App).</li>
              <li style={listItemStyle}><strong>Quyền từ chối:</strong> Tắt quyền truy cập vị trí (GPS) hoặc từ chối nhận email quảng cáo bất cứ lúc nào.</li>
            </ul>

            {/* Section 8 - Đã sửa lại theo Local Storage */}
            <h2 id="privacy-8" style={sectionStyle}>8. CÔNG NGHỆ LƯU TRỮ (LOCAL STORAGE)</h2>
            <p style={textStyle}>
              Website và ứng dụng của chúng tôi <strong>KHÔNG sử dụng Cookie</strong> để theo dõi hành vi người dùng.
            </p>
            <p style={textStyle}>
              Thay vào đó, chúng tôi sử dụng công nghệ <strong>Local Storage (Lưu trữ cục bộ)</strong> trên trình duyệt của bạn. Mục đích duy nhất là để lưu trữ <strong>phiên đăng nhập (Token xác thực)</strong> và các cài đặt cá nhân (như ngôn ngữ, giao diện). Điều này giúp bạn duy trì trạng thái "Đã đăng nhập" khi tải lại trang mà không cần nhập lại mật khẩu liên tục.
            </p>


            {/* Section 9 */}
            <h2 id="privacy-9" style={sectionStyle}>9. THAY ĐỔI CHÍNH SÁCH</h2>
            <p style={textStyle}>
              Chúng tôi có thể cập nhật Chính sách quyền riêng tư này theo thời gian để phù hợp với các quy định pháp luật mới hoặc thay đổi về dịch vụ. Mọi thay đổi quan trọng sẽ được thông báo qua Email hoặc thông báo nổi (Popup) trên ứng dụng.
            </p>

            {/* Section 10 */}
            <h2 id="privacy-10" style={sectionStyle}>10. LIÊN HỆ</h2>
            <div style={{ backgroundColor: "#f9f9f9", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
              <p style={textStyle}>Nếu bạn có bất kỳ câu hỏi nào về bảo mật thông tin, vui lòng liên hệ Bộ phận Bảo mật dữ liệu:</p>
              <p style={{...textStyle, marginBottom: "5px"}}><strong>EV Battery Swap System</strong></p>
              <p style={{...textStyle, marginBottom: "5px"}}>Email: privacy@evbatteryswap.com</p>
              <p style={{...textStyle, marginBottom: "5px"}}>Hotline: 1900 xxxx</p>
              <p style={{...textStyle, marginBottom: "0"}}>Địa chỉ: Khu Công Nghệ Cao, TP. Thủ Đức, TP.HCM</p>
            </div>

          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PrivacyPolicy;