import React from "react";
import { Row, Col, Card, Button, Affix } from "antd";

const Policy = () => {
  // 1. Mảng Mục Lục (tableOfContents)
  const tableOfContents = [
    { id: "section-1", title: "Định Nghĩa & Phạm Vi Áp Dụng" },
    { id: "section-2", title: "Người Sử Dụng Dịch Vụ" },
    { id: "section-3", title: "Thời Hạn Dịch Vụ" },
    { id: "section-4", title: "Phạm Vi Dịch Vụ Pin" },
    { id: "section-5", title: "Phí Dịch Vụ" },
    { id: "section-6", title: "Quyền Sở Hữu Pin" },
    { id: "section-7", title: "Nghĩa Vụ Người Dùng" },
    { id: "section-8", title: "Tạm Ngưng & Gián Đoạn Dịch Vụ" },
    { id: "section-9", title: "Chấm Dứt Hợp Đồng" },
    { id: "section-10", title: "Miễn Trừ Trách Nhiệm" },
    { id: "section-11", title: "Bồi Thường" },
    { id: "section-12", title: "Điều Khoản Khác" },
    { id: "phuluc-a", title: "PHỤ LỤC A: Miễn Trừ Bồi Thường Pin" },
    { id: "phuluc-b", title: "PHỤ LỤC B: Quy Tắc Bảo Quản Pin" },
    { id: "phuluc-c", title: "PHỤ LỤC C: Tiêu Chuẩn Bồi Thường Pin" },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sectionStyle = {
    marginTop: "40px",
    marginBottom: "20px",
    color: "#1e3a8a",
    fontSize: "24px",
    fontWeight: "bold",
    borderBottom: "2px solid #FFC107",
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
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    borderLeft: "4px solid #ffc107",
  };

  const listItemStyle = {
    marginBottom: "10px",
    lineHeight: "1.8",
    color: "#333",
  };

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        paddingTop: "20px",
        paddingBottom: "40px",
      }}
    >
      <Row
        gutter={[24, 24]}
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}
      >
        {/* Sidebar - Mục Lục */}
        <Col xs={24} md={6}>
          <div
            style={{
              position: "sticky",
              top: "80px",
              maxHeight: "calc(100vh - 100px)",
              overflowY: "auto",
            }}
          >
            <Card title=" MỤC LỤC">
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
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
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e3f2fd";
                      e.currentTarget.style.color = "#0d47a1";
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
              <h1
                style={{
                  fontSize: "32px",
                  color: "#1e3a8a",
                  marginBottom: "10px",
                }}
              >
                HỢP ĐỒNG DỊCH VỤ PIN THÔNG MINH
              </h1>
              <h2
                style={{
                  fontSize: "24px",
                  color: "#FFC107",
                  marginBottom: "20px",
                }}
              >
                EV BATTERY SWAP
              </h2>
              <p style={{ color: "#666", fontSize: "14px" }}>
                <strong>Phiên bản:</strong> Tháng 11 năm 2025
              </p>
            </div>

            {/* Section 1 */}
            <h2 id="section-1" style={sectionStyle}>
              1. ĐỊNH NGHĨA & PHẠM VI ÁP DỤNG
            </h2>
            <h3 style={subsectionStyle}>1.1. Định Nghĩa</h3>
            <p style={textStyle}>
              Hợp đồng Dịch Vụ Pin Thông Minh EV Battery Swap (sau đây gọi là "<strong>Hợp Đồng</strong>") được ký kết giữa:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                <strong>Người Sử Dụng</strong>: Là cá nhân hoặc tổ chức đăng ký sử dụng dịch vụ qua hệ thống
              </li>
              <li style={listItemStyle}>
                <strong>Nhà Cung Cấp Dịch Vụ</strong>: Công ty cung cấp dịch vụ lắp đặt, thay thế và sạc pin thông minh cho xe điện
              </li>
            </ul>

            <h3 style={subsectionStyle}>1.2. Phạm Vi Áp Dụng</h3>
            <p style={textStyle}>
              Hợp đồng này <strong>CHỈ ÁP DỤNG</strong> cho xe điện mà người dùng đăng ký sử dụng dịch vụ qua hệ thống, với các loại pin tương thích đã được công bố công khai.
            </p>

            <h3 style={subsectionStyle}>1.3. Điều Kiện Bắt Buộc</h3>
            <div style={highlightStyle}>
              <strong style={{ color: "#856404" }}> QUAN TRỌNG:</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "10px",
                  marginBottom: "0",
                }}
              >
                <li style={listItemStyle}>
                  Khi tài xế/người dùng muốn sử dụng dịch vụ hệ thống của chúng tôi, <strong>BẮT BUỘC PHẢI SỬ DỤNG</strong> dịch vụ thuê pin do chúng tôi cung cấp.
                </li>
                <li style={listItemStyle}>
                  <strong>KHÔNG ĐƯỢC SỬ DỤNG</strong> pin chính chủ của xe (pin gốc đi kèm xe) để tham gia dịch vụ đổi pin tại các trạm.
                </li>
                <li style={listItemStyle}>
                  Mọi pin được sử dụng trong hệ thống đều thuộc quyền sở hữu của nhà cung cấp dịch vụ.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <h2 id="section-2" style={sectionStyle}>
              2. NGƯỜI SỬ DỤNG DỊCH VỤ
            </h2>
            <h3 style={subsectionStyle}>2.1. Định Nghĩa Người Sử Dụng</h3>
            <p style={textStyle}>Người sử dụng là cá nhân hoặc tổ chức:</p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Đã đăng ký tài khoản trên hệ thống và hoàn tất xác thực thông tin.
              </li>
              <li style={listItemStyle}>
                Đã đăng ký xe điện với hệ thống và được Admin/Staff phê duyệt.
              </li>
              <li style={listItemStyle}>
                Đã mua gói dịch vụ pin và đang trong thời hạn sử dụng hợp lệ.
              </li>
            </ul>

            <h3 style={subsectionStyle}>2.2. Thay Đổi Thông Tin</h3>
            <p style={textStyle}>
              Khi có thay đổi về họ tên, số điện thoại, email hoặc quyền sở hữu xe, người sử dụng <strong>PHẢI THÔNG BÁO</strong> ngay cho nhà cung cấp dịch vụ và hoàn tất các thủ tục cần thiết.
            </p>

            {/* Section 3 */}
            <h2 id="section-3" style={sectionStyle}>
              3. THỜI HẠN DỊCH VỤ
            </h2>
            <h3 style={subsectionStyle}>3.1. Thời Hạn Gói Dịch Vụ</h3>
            <p style={textStyle}>
              Thời hạn dịch vụ được tính từ <strong>ngày kích hoạt gói</strong> đến <strong>ngày hết hạn</strong> theo gói dịch vụ đã mua (thường là 30 ngày).
            </p>

            <h3 style={subsectionStyle}>3.2. Tự Động Gia Hạn</h3>
            <p style={textStyle}>
              Nếu người dùng <strong>KHÔNG</strong> trả pin về kho hoặc <strong>KHÔNG</strong> thông báo ngưng sử dụng dịch vụ khi hết hạn, hệ thống sẽ <strong>TỰ ĐỘNG DỪNG DỊCH VỤ</strong>.
            </p>

            {/* Section 4 */}
            <h2 id="section-4" style={sectionStyle}>
              4. PHẠM VI DỊCH VỤ PIN
            </h2>
            <h3 style={subsectionStyle}>4.1. Cung Cấp Pin Ban Đầu</h3>
            <p style={textStyle}>
              Khi bắt đầu dịch vụ, nhà cung cấp hoặc đại diện sẽ:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Lắp đặt số lượng pin cần thiết để xe hoạt động bình thường.
              </li>
              <li style={listItemStyle}>
                Pin được cung cấp có trạng thái: <strong>đầy điện (SOC ≥ 95%), sức khỏe tốt (SOH ≥ 70%)</strong>.
              </li>
            </ul>

            <h3 style={subsectionStyle}>4.2. Dịch Vụ Đổi Pin Tại Trạm</h3>
            <p style={textStyle}>Người dùng hoặc người được ủy quyền có thể:</p>
            <ol style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Đặt lịch đổi pin qua hệ thống (tự động đặt trước 3 giờ).
              </li>
              <li style={listItemStyle}>Đến trạm vào đúng thời gian đã đặt.</li>
              <li style={listItemStyle}>
                Nhập mã xác nhận để thực hiện đổi pin tự động.
              </li>
            </ol>

            {/* Section 5 */}
            <h2 id="section-5" style={sectionStyle}>
              5. PHÍ DỊCH VỤ
            </h2>
            <h3 style={subsectionStyle}>5.1. Cấu Trúc Phí</h3>
            <p style={textStyle}>
              <strong>Phí Cơ Bản (Basic Fee)</strong>: Theo gói dịch vụ đã chọn, bao gồm:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>Số lượt đổi pin/tháng</li>
              <li style={listItemStyle}>
                Ví dụ: Gói Basic (20 lượt/tháng, 400.000đ), Gói Standard (50 lượt/tháng, 800.000đ)
              </li>
            </ul>

            {/* Section 6 */}
            <h2 id="section-6" style={sectionStyle}>
              6. QUYỀN SỞ HỮU PIN
            </h2>
            <h3 style={subsectionStyle}>6.1. Pin Chỉ Thuộc Về Nhà Cung Cấp</h3>
            <p style={textStyle}>
              Người dùng <strong>THỪA NHẬN</strong> và <strong>ĐỒNG Ý</strong>:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Tất cả pin trong hệ thống thuộc <strong>QUYỀN SỞ HỮU DUY NHẤT</strong> của nhà cung cấp dịch vụ.
              </li>
              <li style={listItemStyle}>
                Người dùng <strong>KHÔNG CÓ</strong> quyền sở hữu, quyền vật quyền, quyền sở hữu trí tuệ hoặc bất kỳ quyền nào khác đối với pin.
              </li>
              <li style={listItemStyle}>
                Người dùng chỉ có quyền <strong>SỬ DỤNG</strong> pin theo hợp đồng này.
              </li>
              <li style={listItemStyle}>
                <strong>KHÔNG ĐƯỢC</strong> chuyển nhượng, cho thuê, bán hoặc thế chấp pin cho bất kỳ bên thứ ba nào.
              </li>
            </ul>

            {/* Section 7 */}
            <h2 id="section-7" style={sectionStyle}>
              7. NGHĨA VỤ NGƯỜI DÙNG
            </h2>
            <h3 style={subsectionStyle}>7.1. Bảo Quản Pin</h3>
            <p style={textStyle}>Người dùng phải:</p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Bảo quản pin theo nguyên tắc <strong>quản lý tốt nhất</strong> (như chính tài sản của mình).
              </li>
              <li style={listItemStyle}>
                Tuân thủ <strong>Quy Tắc Bảo Quản Pin</strong> tại <strong>Phụ LỤC B</strong>.
              </li>
            </ul>

            <h3 style={subsectionStyle}>7.2. Nghiêm Cấm</h3>
            <div style={highlightStyle}>
              <strong style={{ color: "#856404" }}>
                TUYỆT ĐỐI KHÔNG ĐƯỢC:
              </strong>
              <ol
                style={{
                  marginLeft: "20px",
                  marginTop: "10px",
                  marginBottom: "0",
                }}
              >
                <li style={listItemStyle}>
                  Tự ý tháo rời, sửa chữa pin hoặc bất kỳ bộ phận nào của pin.
                </li>
                <li style={listItemStyle}>
                  Mang pin ra ngoài lãnh thổ Việt Nam (trừ khi được phê duyệt bằng văn bản).
                </li>
                <li style={listItemStyle}>
                  Vi phạm quyền sở hữu trí tuệ hoặc bí mật kinh doanh liên quan đến pin.
                </li>
                <li style={listItemStyle}>
                  Cho bên thứ ba sử dụng pin ngoài mục đích của hợp đồng.
                </li>
              </ol>
            </div>

            {/* Section 8 - Đã sửa ID */}
            <h2 id="section-8" style={sectionStyle}>
              8. TẠM NGƯNG & GIÁN ĐOẠN DỊCH VỤ
            </h2>
            <h3 style={subsectionStyle}>8.1. Tạm Ngưng Dịch Vụ</h3>
            <p style={textStyle}>
              Nhà cung cấp dịch vụ có quyền tạm ngưng dịch vụ trong các trường hợp:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Người dùng vi phạm nghiêm trọng các điều khoản trong hợp đồng.
              </li>
              <li style={listItemStyle}>
                Người dùng không thanh toán phí dịch vụ đúng hạn.
              </li>
              <li style={listItemStyle}>
                Có dấu hiệu sử dụng pin không đúng mục đích hoặc gây hư hại.
              </li>
              <li style={listItemStyle}>
                Bảo trì hệ thống hoặc nâng cấp công nghệ.
              </li>
            </ul>

            <h3 style={subsectionStyle}>8.2. Thông Báo Tạm Ngưng</h3>
            <p style={textStyle}>
              Nhà cung cấp dịch vụ sẽ thông báo trước <strong>ít nhất 24 giờ</strong> cho người dùng về việc tạm ngưng dịch vụ (trừ trường hợp khẩn cấp).
            </p>

            {/* Section 9 - Đã sửa ID */}
            <h2 id="section-9" style={sectionStyle}>
              9. CHẤM DỨT HỢP ĐỒNG
            </h2>
            <h3 style={subsectionStyle}>9.1. Chấm Dứt Theo Yêu Cầu</h3>
            <p style={textStyle}>
              Người dùng có thể chấm dứt hợp đồng bằng cách:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Thông báo bằng văn bản trước <strong>7 ngày</strong>.
              </li>
              <li style={listItemStyle}>
                Trả lại toàn bộ pin đang sử dụng về kho của nhà cung cấp.
              </li>
              <li style={listItemStyle}>
                Thanh toán đầy đủ các khoản phí còn nợ (nếu có).
              </li>
            </ul>

            <h3 style={subsectionStyle}>9.2. Chấm Dứt Do Vi Phạm</h3>
            <p style={textStyle}>
              Nhà cung cấp dịch vụ có quyền chấm dứt hợp đồng ngay lập tức nếu người dùng vi phạm nghiêm trọng các điều khoản.
            </p>

            {/* Section 10 - Đã sửa ID */}
            <h2 id="section-10" style={sectionStyle}>
              10. MIỄN TRỪ TRÁCH NHIỆM
            </h2>
            <h3 style={subsectionStyle}>10.1. Trường Hợp Bất Khả Kháng</h3>
            <p style={textStyle}>
              Nhà cung cấp dịch vụ không chịu trách nhiệm trong các trường hợp:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Thiên tai, hỏa hoạn, lũ lụt, động đất.
              </li>
              <li style={listItemStyle}>Chiến tranh, bạo loạn, khủng bố.</li>
              <li style={listItemStyle}>Sự cố lưới điện quốc gia.</li>
              <li style={listItemStyle}>
                Các quy định pháp luật mới có hiệu lực.
              </li>
            </ul>

            <h3 style={subsectionStyle}>10.2. Giới Hạn Trách Nhiệm</h3>
            <p style={textStyle}>
              Trách nhiệm tối đa của nhà cung cấp dịch vụ không vượt quá <strong>tổng giá trị phí dịch vụ</strong> mà người dùng đã thanh toán trong 12 tháng gần nhất.
            </p>

            {/* Section 11 - Đã sửa ID */}
            <h2 id="section-11" style={sectionStyle}>
              11. BỒI THƯỜNG
            </h2>
            <h3 style={subsectionStyle}>11.1. Nguyên Tắc Bồi Thường</h3>
            <p style={textStyle}>Người dùng phải bồi thường thiệt hại khi:</p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Vi phạm quy tắc bảo quản pin gây hư hại.
              </li>
              <li style={listItemStyle}>Sử dụng pin sai mục đích.</li>
              <li style={listItemStyle}>
                Làm mất hoặc hư hỏng pin do lỗi chủ quan.
              </li>
            </ul>

            <h3 style={subsectionStyle}>11.2. Cách Thức Bồi Thường</h3>
            <p style={textStyle}>
              Bồi thường bằng tiền mặt theo <strong>Tiêu Chuẩn Bồi Thường Pin</strong> tại <strong>PHỤ LỤC C</strong>.
            </p>

            {/* Section 12 - Đã sửa ID */}
            <h2 id="section-12" style={sectionStyle}>
              12. ĐIỀU KHOẢN KHÁC
            </h2>
            <h3 style={subsectionStyle}>12.1. Sửa Đổi Hợp Đồng</h3>
            <p style={textStyle}>
              Mọi sửa đổi, bổ sung hợp đồng phải được thực hiện bằng <strong>văn bản</strong> và có sự đồng ý của cả hai bên.
            </p>

            <h3 style={subsectionStyle}>12.2. Giải Quyết Tranh Chấp</h3>
            <p style={textStyle}>
              Các tranh chấp phát sinh sẽ được giải quyết thông qua <strong>thương lượng</strong>. Nếu không thành, sẽ đưa ra <strong>Tòa án có thẩm quyền</strong> tại Việt Nam.
            </p>

            <h3 style={subsectionStyle}>12.3. Hiệu Lực</h3>
            <p style={textStyle}>
              Hợp đồng có hiệu lực từ ngày ký và áp dụng cho đến khi chấm dứt theo quy định.
            </p>

            {/* Phụ Lục A - ID đã được chuẩn hóa */}
            <h2 id="phuluc-a" style={sectionStyle}>
              PHỤ LỤC A: MIỄN TRỪ BỒI THƯỜNG PIN
            </h2>
            <h3 style={subsectionStyle}>A.1. Các Trường Hợp Miễn Trừ</h3>
            <p style={textStyle}>
              Người dùng <strong>KHÔNG PHẢI BỒI THƯỜNG</strong> trong các trường hợp sau:
            </p>

            <div
              style={{
                backgroundColor: "#e8f5e8",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                borderLeft: "4px solid #4caf50",
              }}
            >
              <strong style={{ color: "#2e7d32" }}>1. Hao Mòn Tự Nhiên</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <li style={listItemStyle}>
                  Pin giảm dung lượng theo thời gian sử dụng bình thường (SOH giảm dưới 70% sau 2 năm).
                </li>
                <li style={listItemStyle}>
                  Hao mòn do chu kỳ sạc/xả bình thường.
                </li>
              </ul>

              <strong style={{ color: "#2e7d32" }}>
                2. Lỗi Kỹ Thuật Từ Nhà Sản Xuất
              </strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <li style={listItemStyle}>
                  Pin bị lỗi do thiết kế hoặc chế tạo.
                </li>
                <li style={listItemStyle}>
                  Hư hỏng do linh kiện bên trong pin.
                </li>
              </ul>

              <strong style={{ color: "#2e7d32" }}>3. Sự Cố Hệ Thống</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <li style={listItemStyle}>
                  Hư hỏng do lỗi phần mềm quản lý pin.
                </li>
                <li style={listItemStyle}>
                  Sự cố tại trạm đổi pin gây hư hại.
                </li>
              </ul>

              <strong style={{ color: "#2e7d32" }}>4. Bất Khả Kháng</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "0",
                }}
              >
                <li style={listItemStyle}>Thiên tai, hỏa hoạn, lũ lụt.</li>
                <li style={listItemStyle}>
                  Tai nạn giao thông không do lỗi người dùng.
                </li>
              </ul>
            </div>

            <h3 style={subsectionStyle}>A.2. Quy Trình Xác Định</h3>
            <p style={textStyle}>Khi có sự cố, nhà cung cấp dịch vụ sẽ:</p>
            <ol style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Kiểm tra kỹ thuật pin trong vòng <strong>48 giờ</strong>.
              </li>
              <li style={listItemStyle}>Xác định nguyên nhân hư hỏng.</li>
              <li style={listItemStyle}>
                Thông báo kết quả cho người dùng trong vòng <strong>7 ngày</strong>.
              </li>
              <li style={listItemStyle}>
                Nếu thuộc trường hợp miễn trừ, người dùng không phải bồi thường.
              </li>
            </ol>

            {/* Phụ Lục B - ID đã được chuẩn hóa */}
            <h2 id="phuluc-b" style={sectionStyle}>
              PHỤ LỤC B: QUY TẮC BẢO QUẢN PIN
            </h2>
            <h3 style={subsectionStyle}>B.1. Các Yêu Cầu Bảo Quản</h3>
            <p style={textStyle}>
              Người dùng <strong>PHẢI</strong> tuân thủ các quy tắc sau:
            </p>

            <div
              style={{
                backgroundColor: "#f0f0f0",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <strong>1. Nhiệt Độ & Môi Trường</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <li style={listItemStyle}>
                  <strong>NGHIÊM CẤM</strong> để pin ở nơi nhiệt độ cao hoặc phơi trực tiếp dưới nắng <strong>TRÊN 30 PHÚT</strong>.
                </li>
                <li style={listItemStyle}>Để pin ở nơi thoáng mát, khô ráo.</li>
              </ul>

              <strong>2. Sử Dụng Đúng Mục Đích</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <li style={listItemStyle}>
                  <strong>NGHIÊM CẤM</strong> sử dụng pin cho mục đích không được phê duyệt.
                </li>
                <li style={listItemStyle}>
                  Giữ cổng kết nối pin sạch sẽ, không có dị vật.
                </li>
              </ul>

              <strong>3. Bảo Vệ Vật Lý</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <li style={listItemStyle}>
                  <strong>NGHIÊM CẤM</strong> ném pin vào lửa, hơ nóng, làm lạnh, ngâm nước, đập, thả rơi.
                </li>
                <li style={listItemStyle}>
                  <strong>NGHIÊM CẤM</strong> cố gắng tháo rời hoặc phá hủy pin.
                </li>
              </ul>

              <strong>4. Cấu Trúc & Hình Dáng</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <li style={listItemStyle}>
                  <strong>NGHIÊM CẤM</strong> tự ý tháo rời hoặc thay đổi hình dáng, cấu trúc pin.
                </li>
                <li style={listItemStyle}>
                  <strong>NGHIÊM CẤM</strong> dán, sơn, khắc laser, hoặc thay đổi ngoại hình pin.
                </li>
              </ul>

              <strong>5. Sạc/Xả Điện</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "15px",
                }}
              >
                <li style={listItemStyle}>
                  <strong>NGHIÊM CẤM</strong> tự ý sạc hoặc xả điện pin bằng thiết bị không được phê duyệt.
                </li>
                <li style={listItemStyle}>
                  Chỉ sạc pin tại trạm hoặc thiết bị được cấp phép chính thức.
                </li>
              </ul>

              <strong>6. Cất Giữ & Bảo Quản</strong>
              <ul
                style={{
                  marginLeft: "20px",
                  marginTop: "8px",
                  marginBottom: "0",
                }}
              >
                <li style={listItemStyle}>
                  Bảo quản pin ở <strong>TƯ THẾ ĐỨNG THẲNG</strong>.
                </li>
                <li style={listItemStyle}>
                  <strong>KHÔNG</strong> để đồ đạc, vật dụng lên nắp pin.
                </li>
              </ul>
            </div>

            {/* Phụ Lục C - ID đã được chuẩn hóa */}
            <h2 id="phuluc-c" style={sectionStyle}>
              PHỤ LỤC C: TIÊU CHUẨN BỒI THƯỜNG PIN
            </h2>
            <h3 style={subsectionStyle}>C.1. Về Pin</h3>
            <p style={textStyle}>
              Pin là sản phẩm công nghệ cao với thiết kế bảo vệ tinh vi. Nếu tuân thủ <strong>Quy Tắc Bảo Quản Pin</strong> (Phụ LỤC B), pin sẽ <strong>KHÔNG BỊ HƯ HỎNG</strong> (ngoài hao mòn tự nhiên).
            </p>

            <h3 style={subsectionStyle}>C.2. Mức Bồi Thường</h3>
            <p style={textStyle}>
              Khi <strong>XÁC ĐỊNH</strong> người dùng chịu trách nhiệm:
            </p>
            <ul style={{ marginLeft: "20px", marginBottom: "15px" }}>
              <li style={listItemStyle}>
                Người dùng phải trả <strong>GIÁ TRỊ THAY THẾ PIN</strong> tại thời điểm xảy ra sự cố.
              </li>
              <li style={listItemStyle}>
                <strong>Giá trị hiện tại</strong>: <strong>25.000.000 VNĐ/viên pin</strong> (có thể thay đổi).
              </li>
            </ul>

            {/* Footer */}
            <div
              style={{
                marginTop: "60px",
                paddingTop: "20px",
                borderTop: "1px solid #ddd",
                textAlign: "center",
                color: "#666",
              }}
            >
              <p>
                <strong>Hotline Hỗ Trợ:</strong> 098104xxxx
                <br />
                <strong>Email:</strong> support@evbatteryswap.com
                <br />
                <strong>Website:</strong> https://evbatteryswapsystem.com/
              </p>
              <p style={{ fontSize: "12px", marginTop: "20px" }}>
                Phiên bản: 1.0 | Ngày phát hành: 14/9/2025
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Policy;
