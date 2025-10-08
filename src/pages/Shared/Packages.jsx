import React from "react";
import NavBar from "../../components/navbar/navBar";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 12px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              {r.map((c, i) => (
                <td key={i} style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PackagesPage() {
  return (
    <div>
      <NavBar />
      <main style={{ maxWidth: 1100, margin: '24px auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Chính sách giá gói năng lượng và Hệ thống quản lý 2025</h1>
          <p style={{ color: '#64748b' }}>Tháng 1 13, 2025</p>
          <p style={{ color: '#334155', marginTop: 8, lineHeight: 1.7 }}>
            Tất cả Khách hàng mua xe, thuê xe và sử dụng xe máy điện để dùng các ứng dụng điện khác ngoài di chuyển,
            Khách hàng cần mua gói năng lượng theo bảng giá bên dưới.
          </p>
        </header>

        <Section title="1. Bảng giá gói năng lượng dành cho khách hàng mua xe">
          <h3 style={{ fontWeight: 700, margin: '8px 0 12px' }}>1.1. Bảng giá gói năng lượng thuê pin tự sạc</h3>
          <Table
            headers={["Mã gói", "TNL1", "TNL2", "TNL3"]}
            rows={[
              ["Số lượng PIN", "1", "2", "3"],
              ["Năng lượng tiêu thụ cơ sở (kwh/tháng)", "7,5", "15", "22,5"],
              ["Giá cơ sở (VNĐ/tháng)", "125.000", "250.000", "375.000"],
              ["Giá cơ sở (VNĐ/tháng) – có VAT", "135.000", "270.000", "405.000"],
            ]}
          />

          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 600 }}>Phí vượt năng lượng tiêu thụ cơ sở:</p>
            <Table
              headers={["Km đi được theo tháng", "Từ kwh cơ sở đến kwh 50", "Từ kwh 51 đến kwh 100", "Từ kwh 101 trở lên"]}
              rows={[["Đơn giá vượt (VNĐ/kwh)", "8.000", "7.200", "6.400"], ["Đơn giá vượt (VNĐ/kwh) – có VAT", "8.640", "7.776", "6.912"]]}
            />
          </div>

          <div style={{ marginTop: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
            <p style={{ fontWeight: 600 }}>Quy định chung:</p>
            <ul style={{ listStyle: 'disc', paddingLeft: 20, lineHeight: 1.7 }}>
              <li>Phí đặt cọc pin: 400.000 VNĐ/pin</li>
              <li>Phí đổi pin tại trạm – có VAT: 8.000 VNĐ/pin/lần</li>
              <li>
                Quy định thanh toán: – Phí đặt cọc và giá cơ sở của gói dịch vụ thanh toán khi ký hợp đồng, ngay khi nhận bàn giao pin và vận hành gói dịch vụ. – Phí vượt quãng đường cơ sở và phí đổi pin lẻ của gói dịch vụ kỳ trước thanh toán cùng với giá cơ sở của gói dịch vụ tiếp theo.
              </li>
              <li>Khách hàng huỷ gói trước khi hết hạn hợp đồng thì không được hoàn trả khoản tiền của gói dịch vụ đã thanh toán.</li>
            </ul>
          </div>

          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 600 }}>Ví dụ tính phí:</p>
            <p>Tại ngày 01/01/2025: 1.070.000 VNĐ (Cọc 800.000 + Cơ sở 270.000)</p>
            <p>Tại ngày 31/01/2025: 399.600 VNĐ (Cơ sở tháng sau 270.000 + Vượt 129.600)</p>
          </div>

          <h3 style={{ fontWeight: 700, margin: '20px 0 12px' }}>1.2. Bảng giá gói năng lượng đổi pin</h3>
          <Table
            headers={["Mã gói", "GNL1", "GNL2", "GNL3"]}
            rows={[
              ["Số lượng PIN", "1", "2", "3"],
              ["Năng lượng tiêu thụ cơ sở (kwh/tháng)", "5", "10", "15"],
              ["Giá cơ sở (VNĐ/tháng)", "125.000", "250.000", "375.000"],
              ["Giá cơ sở (VNĐ/tháng) – có VAT", "135.000", "270.000", "405.000"],
            ]}
          />

          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 600 }}>Phí vượt năng lượng tiêu thụ cơ sở:</p>
            <Table
              headers={["Năng lượng điện tiêu thụ", "Từ kwh cơ sở đến kwh 50", "Từ kwh 51 đến kwh 100", "Từ kwh 101 đến kwh 150", "Từ kwh 151 trở lên"]}
              rows={[["Đơn giá vượt (VNĐ/kwh)", "13.200", "12.800", "12.400", "11.600"], ["Đơn giá vượt (VNĐ/kwh) – có VAT", "14.256", "13.824", "13.392", "12.528"]]}
            />
          </div>
        </Section>

        <Section title="2. Bảng giá gói năng lượng dành cho khách hàng thuê xe">
          <h3 style={{ fontWeight: 700, margin: '8px 0 12px' }}>2.1. Thuê xe thuê pin tự sạc</h3>
          <Table
            headers={["Loại xe", "Xe mới đăng ký", "Xe đã cho thuê"]}
            rows={[
              ["Đối tượng áp dụng", "Chỉ áp dụng cho Khách hàng doanh nghiệp, thời hạn hợp đồng từ 12 tháng trở lên và tùy tình hình thực tế tồn kho xe của Công ty", "Áp dụng cho tất cả Khách hàng"],
              ["Số lượng PIN", "3", "3"],
              ["Năng lượng tiêu thụ cơ sở (kwh/tháng)", "0", "0"],
              ["Giá cơ sở (VNĐ/tháng)", "1.188.000", "990.000"],
              ["Giá cơ sở (VNĐ/tháng) – có VAT", "1.283.040", "1.069.200"],
            ]}
          />

          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 600 }}>Phí vượt năng lượng tiêu thụ cơ sở:</p>
            <Table
              headers={["Km đi được theo tháng", "Từ kwh 1 đến kwh 50", "Từ kwh 51 đến kwh 100", "Từ kwh 101 đến kwh 150", "Từ kwh 151 trở lên"]}
              rows={[["Đơn giá vượt (VNĐ/kwh) – có VAT", "16.200", "14.040", "12.960", "11.880"]]}
            />
          </div>

          <h3 style={{ fontWeight: 700, margin: '20px 0 12px' }}>2.2. Thuê xe và pin gói năng lượng đổi pin</h3>
          <Table
            headers={["Loại xe", "Xe mới đăng ký", "Xe đã cho thuê"]}
            rows={[
              ["Đối tượng áp dụng", "Chỉ áp dụng cho Khách hàng doanh nghiệp, thời hạn hợp đồng từ 12 tháng trở lên và tùy tình hình thực tế tồn kho xe của Công ty", "Áp dụng cho tất cả Khách hàng"],
              ["Số lượng PIN", "3", "3"],
              ["Năng lượng tiêu thụ cơ sở (kwh/tháng)", "0", "0"],
              ["Giá cơ sở (VNĐ/tháng)", "1.188.000", "990.000"],
              ["Giá cơ sở (VNĐ/tháng) – có VAT", "1.283.040", "1.069.200"],
            ]}
          />

          <div style={{ marginTop: 16 }}>
            <p style={{ fontWeight: 600 }}>Phí vượt năng lượng tiêu thụ cơ sở:</p>
            <Table
              headers={["Km đi được theo tháng", "Từ kwh 1 đến kwh 50", "Từ kwh 51 đến kwh 100", "Từ kwh 101 đến kwh 150", "Từ kwh 151 trở lên"]}
              rows={[["Đơn giá vượt (VNĐ/kwh) – có VAT", "21.600", "19.440", "18.360", "16.200"]]}
            />
          </div>
        </Section>

        <Section title="3. Bảng giá Hệ thống quản lý xe">
          <p style={{ marginBottom: 8 }}><strong>Phí khởi tạo:</strong> 3.000.000 VND/lần bao gồm: Cài đặt hệ thống, khởi tạo thông tin đội xe, đào tạo vận hành.</p>
          <Table
            headers={["Số Lượng Xe", "Chi phí/Tháng (chưa VAT)"]}
            rows={[["1 – 300 xe", "60.000/Xe"], ["300 – 600 xe", "55.000/Xe"], ["601 xe trở lên", "52.000/Xe"]]}
          />
          <p style={{ marginTop: 8 }}>Điều khoản thanh toán: Thanh toán phí khởi tạo khi ký hợp đồng; phí định kỳ cùng với gói dịch vụ pin vào ngày 1–5 tháng sau; kỳ hạn tối thiểu 1 năm.</p>
        </Section>

        <p style={{ color: '#64748b', fontSize: 12 }}>Nguồn tham khảo chính sách: https://selex.vn/chinh-sach-gia-goi-nang-luong-2025/</p>
      </main>
    </div>
  );
}

export default PackagesPage;


