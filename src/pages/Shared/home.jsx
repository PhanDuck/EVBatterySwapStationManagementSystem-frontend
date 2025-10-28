import videohomepage from "../../assets/videos/videohomepage.mp4";
import BackgroundImage from "../../assets/img/backgroundaboutus.png";

import { Button, Card, Row, Col, Typography } from "antd";
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CloudTwoTone,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

function Home() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("authToken");
  const handleBook = () => {
    if (!isAuthenticated) return navigate("/login");
    navigate("/stations/booking");
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <section
        style={{
          padding: "0",
          background: "#0f172a",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <video
            src={videohomepage}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        </div>
      </section>

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0A2540 0%, #1B4B6B 100%)",
          color: "white",
          padding: "72px 0",
        }}
      >
        <div
          style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Title style={{ color: "white", marginBottom: 12 }}>
                Đổi pin xe điện nhanh, tiện, an toàn
              </Title>
              <Paragraph
                style={{ color: "rgba(255,255,255,0.85)", marginBottom: 24 }}
              >
                Lấy cảm hứng từ hệ sinh thái của Selex, chúng tôi tập trung vào
                trải nghiệm đơn giản, rõ ràng cho mọi tài xế.
              </Paragraph>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to="/stations/nearby">
                  <Button>Trạm gần tôi</Button>
                </Link>
              </div>
            </Col>
            <img
              alt="EV illustration"
              src="https://gogoro-about-uploads.s3.ap-northeast-1.amazonaws.com/storage/202304/vhb2sgb07rmwh5oncf8yu73v4rw5"
              style={{ maxWidth: "350px" }}
            />
          </Row>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "56px 0", background: "#fff" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 12 }}>
              Vì sao chọn chúng tôi?
            </Title>
            <Paragraph style={{ color: "#64748b", margin: 0 }}>
              Nhanh – Tiện – An toàn, theo đúng tinh thần hệ sinh thái Selex.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                }}
                styles={{ body: { padding: "24px" } }}
                hoverable
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    background: "rgba(30, 58, 138, 0.08)",
                  }}
                >
                  <ThunderboltOutlined
                    style={{ fontSize: "32px", color: "#1e3a8a" }}
                  />
                </div>
                <Title level={4} style={{ marginBottom: "16px" }}>
                  Nhanh chóng
                </Title>
                <Paragraph style={{ color: "#64748b", marginBottom: 0 }}>
                  Chỉ mất khoảng 5 phút để đổi pin và tiếp tục hành trình.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                }}
                styles={{ body: { padding: "24px" } }}
                hoverable
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    background: "rgba(255, 193, 7, 0.15)",
                  }}
                >
                  <ClockCircleOutlined
                    style={{ fontSize: "32px", color: "#FFC107" }}
                  />
                </div>
                <Title level={4} style={{ marginBottom: "16px" }}>
                  Tiện lợi
                </Title>
                <Paragraph style={{ color: "#64748b", marginBottom: 0 }}>
                  Mạng lưới trạm rộng khắp, dễ dàng tìm thấy gần bạn.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                }}
                styles={{ body: { padding: "24px" } }}
                hoverable
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    background: "rgba(76, 175, 80, 0.15)",
                  }}
                >
                  <SafetyOutlined
                    style={{ fontSize: "32px", color: "#4CAF50" }}
                  />
                </div>
                <Title level={4} style={{ marginBottom: "16px" }}>
                  An toàn
                </Title>
                <Paragraph style={{ color: "#64748b", marginBottom: 0 }}>
                  Kiểm tra pin kỹ lưỡng, đạt tiêu chuẩn an toàn.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Stats strip */}
      <section
        style={{
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          padding: "60px 0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 1,
          }}
        ></div>

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 20px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Row gutter={[24, 40]} justify="center">
            {/* ITEM 1: TRẠM */}
            <Col xs={12} md={6} style={{ textAlign: "center" }}>
              <EnvironmentOutlined
                style={{
                  fontSize: "32px",
                  color: "#fff",
                  marginBottom: "8px",
                }}
              />
              <Title level={2} style={{ color: "white", margin: 0 }}>
                10+
              </Title>
              <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)" }}>
                Trạm đổi pin
              </div>
            </Col>

            {/* ITEM 2: NGƯỜI DÙNG */}
            <Col xs={12} md={6} style={{ textAlign: "center" }}>
              <UserOutlined
                style={{
                  fontSize: "32px",
                  color: "#fff",
                  marginBottom: "8px",
                }}
              />
              <Title level={2} style={{ color: "white", margin: 0 }}>
                50+
              </Title>
              <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)" }}>
                Người dùng
              </div>
            </Col>

            {/* ITEM 3: LƯỢT ĐỔI */}
            <Col xs={12} md={6} style={{ textAlign: "center" }}>
              <ThunderboltOutlined
                style={{
                  fontSize: "32px",
                  color: "#fff",
                  marginBottom: "8px",
                }}
              />
              <Title level={2} style={{ color: "white", margin: 0 }}>
                1000+
              </Title>
              <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)" }}>
                Lượt đổi thành công
              </div>
            </Col>

            {/* ITEM 4: CO2 */}
            <Col xs={12} md={6} style={{ textAlign: "center" }}>
              <CloudTwoTone
                twoToneColor="#fff"
                style={{ fontSize: "32px", marginBottom: "8px" }}
              />
              <Title level={2} style={{ color: "white", margin: 0 }}>
                1 tấn
              </Title>
              <div style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)" }}>
                CO2 tiết kiệm
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Call to action - Replaced with YouTube Video */}
      <section style={{ padding: "56px 0", background: "#fff" }}>
        <div
          style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}
        >
          <Row gutter={[48, 24]} align="middle">
            <Col xs={24} md={12}>
              <div
                style={{
                  position: "relative",
                  paddingBottom: "56.25%",
                  height: 0,
                  overflow: "hidden",
                  borderRadius: "8px",
                }}
              >
                <iframe
                  src="https://www.youtube.com/embed/4iAhpCPaHlc"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                ></iframe>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Title level={2} style={{ marginBottom: 16 }}>
                Sạc pin không phải là giải pháp duy nhất!
              </Title>
              <Paragraph
                style={{
                  color: "#64748b",
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              >
                Đối với người dùng xe máy điện, việc chờ đợi sạc pin có thể gây
                ra nhiều bất tiện. Dịch vụ đổi pin của chúng tôi mang đến một
                giải pháp nhanh chóng, tiện lợi và an toàn, giúp bạn tiếp tục
                hành trình chỉ trong vài phút.
              </Paragraph>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
}

export default Home;
