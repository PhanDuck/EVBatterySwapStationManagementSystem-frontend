import { Col, Row } from "antd";
import Paragraph from "antd/es/skeleton/Paragraph";
import Title from "antd/es/skeleton/Title";
import React from "react";

const Footer = () => {
  return (
    <div>
      <footer
        style={{ background: "#0f172a", color: "white", padding: "40px 0" }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8} style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#FFC107",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    fontWeight: "bold",
                    color: "#1e3a8a",
                  }}
                >
                  EV
                </div>
                <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                  Battery Swap
                </div>
              </div>
              <Paragraph
                style={{ color: "rgba(255,255,255,0.6)", marginBottom: "12px" }}
              >
                Hệ thống quản lý trạm đổi pin xe điện. Trải nghiệm đơn giản,
                thân thiện.
              </Paragraph>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Title level={5} style={{ color: "white", marginBottom: "20px" }}>
                Dịch Vụ
              </Title>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                    }}
                  >
                    Đổi Pin
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                    }}
                  >
                    Sạc Pin
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                    }}
                  >
                    Bảo Dưỡng
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                    }}
                  >
                    Tư Vấn
                  </a>
                </li>
              </ul>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Title level={5} style={{ color: "white", marginBottom: "20px" }}>
                Công Ty
              </Title>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                    }}
                  >
                    Về Chúng Tôi
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                    }}
                  >
                    Tuyển Dụng
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                    }}
                  >
                    Đối Tác
                  </a>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                    }}
                  >
                    Tin Tức
                  </a>
                </li>
              </ul>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Title level={5} style={{ color: "white", marginBottom: "20px" }}>
                Liên Hệ
              </Title>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li
                  style={{
                    marginBottom: "12px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Email: contact@evbatteryswap.com
                </li>
                <li
                  style={{
                    marginBottom: "12px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Phone: +84 123 456 789
                </li>
                <li
                  style={{
                    marginBottom: "12px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Địa chỉ: 123 Nguyễn Văn Linh, Q.7, TP.HCM
                </li>
              </ul>
            </Col>
          </Row>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
