import { Col, Row } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

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
              <p
                style={{ color: "rgba(255,255,255,0.6)", marginBottom: "12px" }}
              >
                Hệ thống quản lý trạm đổi pin xe điện. Trải nghiệm đơn giản,
                thân thiện.
              </p>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <h5 style={{ color: "white", marginBottom: "20px" }}>
                  Liên Kết Nhanh
                </h5>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: "12px" }}>
                    <a
                      onClick={() => handleNavigation("/about")}
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "rgba(255,255,255,1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "rgba(255,255,255,0.6)")
                      }
                    >
                      Về Chúng Tôi
                    </a>
                  </li>
                  <li style={{ marginBottom: "12px" }}>
                    <a
                      onClick={() => handleNavigation("/stations/booking")}
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "rgba(255,255,255,1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "rgba(255,255,255,0.6)")
                      }
                    >
                      Đổi Pin
                    </a>
                  </li>
                  <li style={{ marginBottom: "12px" }}>
                    <a
                      onClick={() => handleNavigation("/policy")}
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "rgba(255,255,255,1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "rgba(255,255,255,0.6)")
                      }
                    >
                      Chính Sách
                    </a>
                  </li>
                  <li style={{ marginBottom: "12px" }}>
                    <a
                      onClick={() => handleNavigation("/privacy-policy")}
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "rgba(255,255,255,1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "rgba(255,255,255,0.6)")
                      }
                    >
                      Quyền Riêng Tư
                    </a>
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <h5 style={{ color: "white", marginBottom: "20px" }}>
                  Liên Hệ
                </h5>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: "12px" }}>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>
                      <strong>Hotline:</strong> 098104xxxx
                    </span>
                  </li>
                  <li style={{ marginBottom: "12px" }}>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>
                      <strong>Email:</strong> support@evbatteryswap.com
                    </span>
                  </li>
                  <li style={{ marginBottom: "12px" }}>
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>
                      <strong>Website:</strong> https://evbatteryswapsystem.com/
                    </span>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              marginTop: "40px",
              paddingTop: "20px",
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
            }}
          >
            <p>© 2025 EV Battery Swap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
