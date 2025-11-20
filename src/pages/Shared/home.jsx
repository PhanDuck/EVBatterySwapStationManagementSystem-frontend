import videohomepage from "../../assets/videos/videohomepage.mp4";
import BackgroundImage from "../../assets/img/backgroundaboutus.png";
import videoridingplansbg from "../../assets/videos/videoridingplans.mp4";
import postervotudi from "../../assets/img/postervotudi.png";
import postergreenbgr from "../../assets/img/postergreenbgr.png";
import minhhoa1 from "../../assets/img/minhhoa1.png";
import minhhoa2 from "../../assets/img/minhhoa2.png";
import minhhoa3 from "../../assets/img/minhhoa3.png";
import minhhoa4 from "../../assets/img/minhhoa4.png";
import minhhoa5 from "../../assets/img/minhhoa5.png"; 
import momoimage from "../../assets/img/momoimage.png";
import { Button, Row, Col, Typography } from "antd";
import {
  ThunderboltOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CloudTwoTone,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

// Dữ liệu cho phần Feature
const featureData = [
  {
    key: "battery",
    eyebrow: "PIN THÔNG MINH",
    title: "Không còn chờ đợi. Nạp đầy trong vài giây.",
    desc: "Cách nhanh nhất, sạch nhất để vận hành xe của bạn. Đổi pin chỉ trong tích tắc. Nhỏ gọn và dễ sử dụng. Năng lượng đủ cho nhiều ngày di chuyển. Luôn được sạc đầy và sẵn sàng cho bạn. Chỉ cần đổi và đi, tiếp tục hành trình mà không lỡ nhịp nào.",
    img: minhhoa1, 
  },
  {
    key: "station",
    eyebrow: "MẠNG LƯỚI TRẠM ĐỔI PIN TIỆN LỢI",
    title: "Đổi pin trên đường, và tiếp tục lăn bánh.",
    desc: "Lái xe thỏa thích. Pin đầy luôn ở gần bạn. Các trạm EVBattery Station luôn có sẵn pin sạc đầy ở bất cứ đâu bạn cần, 24/7, khắp thành phố. Đi làm? Đi chơi đêm? Hay chỉ dạo phố? Không vấn đề. Luôn có một trạm EVBattery trên đường đi của bạn.",
    img: minhhoa2, 
  },
  {
    key: "app",
    eyebrow: "ỨNG DỤNG EVBATTERY",
    title: "Năng lượng trong tầm tay, thanh toán trong tích tắc.",
    desc: "Kết nối với toàn bộ mạng lưới EVBattery theo thời gian thực. Sẵn sàng đổi pin? Tìm pin đầy gần bạn nhất. Lên kế hoạch đi chơi? Bản đồ trạm sẽ dẫn đường cho bạn. Tất cả đều ở đây: Lịch sử chuyến đi, Thanh toán không tiền mặt, Thống kê pin. Xăng dầu chưa bao giờ thông minh thế này.",
    img: momoimage, 
  },
  {
    key: "service",
    eyebrow: "DỊCH VỤ THUÊ PIN (BaaS)",
    title: "Bạn cứ việc lái. Mọi việc còn lại để chúng tôi lo.",
    desc: "Tận hưởng dịch vụ pin không lo âu qua từng lần đổi. Gói thuê bao giúp bạn tiếp cận nguồn pin thông minh, luôn mới, luôn sẵn sàng. Mỗi viên pin đều được kết nối với mạng lưới EVBattery và được giám sát liên tục về an toàn, hiệu suất năng lượng. Công nghệ mới nhất. Cập nhật tự động. Nhiều trạm hơn mỗi năm. Tất cả là dành cho bạn.",
    img: minhhoa4, 
  },
];

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
      {/* ================= Video Introduction Section ================= */}
      <section
        style={{
          padding: "0",
          background: "#000",
          overflow: "hidden",
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        <video
          src={videohomepage}
          poster={postervotudi}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        >
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      </section>

      {/* ================= NEW HERO SECTION ================= */}
      <section style={{ background: "#000" }}>
        <Row>
          <Col
            xs={24}
            md={12}
            style={{ position: "relative", height: "600px" }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${minhhoa3})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.6,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "60px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Title
                style={{
                  color: "#fff",
                  fontSize: "48px",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: "24px",
                }}
              >
                Thông minh <br /> từ thiết kế.
              </Title>
              <Paragraph
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "18px",
                  maxWidth: "450px",
                }}
              >
                Từ công nghệ đột phá đến thiết kế, an toàn và dịch vụ không thỏa
                hiệp. Mọi khía cạnh của mạng lưới EVBattery đều được xây dựng để
                việc đổi pin trở nên tốt hơn.
              </Paragraph>
            </div>
          </Col>

          <Col
            xs={24}
            md={12}
            style={{ position: "relative", height: "600px" }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${BackgroundImage})`,
               backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.6,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: "60px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Title
                style={{
                  color: "#fff",
                  fontSize: "48px",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: "24px",
                }}
              >
                Mở rộng <br /> không giới hạn.
              </Title>
              <Paragraph
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "18px",
                  maxWidth: "450px",
                  marginBottom: "40px",
                }}
              >
                Mạng lưới EVBattery được xây dựng để mở rộng. Chúng tôi nhanh
                chóng phủ sóng các trạm khắp thành phố và xa hơn nữa.
              </Paragraph>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link to="/stations/nearby">
                  <Button
                    type="primary"
                    size="large"
                    icon={<EnvironmentOutlined />}
                    style={{
                      height: "50px",
                      padding: "0 32px",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Trạm gần tôi
                  </Button>
                </Link>

                <Button
                  size="large"
                  onClick={handleBook}
                  icon={<ThunderboltOutlined />}
                  style={{
                    height: "50px",
                    padding: "0 32px",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  Đặt lịch ngay
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </section>
{/* ================= Features Section================= */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <Title
              level={1}
              style={{ fontSize: "48px", fontWeight: 300, margin: 0 }}
            >
              Nhanh chóng, dễ dàng, mọi nơi.
            </Title>
          </div>

          {featureData.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <Row
                key={item.key}
                gutter={[48, 48]} // Giảm khoảng cách cột một chút để liên kết hơn
                align="middle"
                style={{ marginBottom: "80px" }}
              >
                {/* CỘT HÌNH ẢNH */}
                <Col xs={24} md={12} order={isEven ? 1 : 2}>
                  <div
                    style={{
                      width: "100%",
                      height: "450px", // Tăng chiều cao ảnh chút cho đẹp
                      backgroundImage: `url(${item.img})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      borderRadius: "24px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.08)", // Bóng nhẹ hơn
                    }}
                  />
                </Col>

                {/* CỘT NỘI DUNG - ĐƯỢC STYLE LẠI */}
                <Col xs={24} md={12} order={isEven ? 2 : 1}>
                  <div 
                    style={{ 
                      padding: "40px", // Thêm khoảng đệm bên trong
                      background: isEven ? "#F9FAFB" : "#F0F7FF", // Màu nền: Chẵn là xám nhạt, Lẻ là xanh nhạt (hoặc để #F9FAFB hết cũng được)
                      borderRadius: "24px", // Bo góc
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <h5
                      style={{
                        fontSize: "14px",
                        fontWeight: 800, // Đậm hơn chút
                        color: "#1890ff", // Đổi sang màu xanh thương hiệu (hoặc giữ màu xám đậm #666)
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        marginBottom: "16px",
                      }}
                    >
                      {item.eyebrow}
                    </h5>
                    <Title
                      level={2}
                      style={{ 
                        marginBottom: "20px", 
                        fontSize: "32px", 
                        fontWeight: 700, // Tiêu đề đậm hơn
                        lineHeight: 1.3 
                      }}
                    >
                      {item.title}
                    </Title>
                    <Paragraph
                      style={{
                        fontSize: "17px",
                        lineHeight: "1.8", // Tăng khoảng cách dòng cho dễ đọc
                        color: "#4b5563", // Màu xám đậm hơn để tăng độ tương phản (dễ đọc hơn #555)
                        fontWeight: 400,
                        marginBottom: 0
                      }}
                    >
                      {item.desc}
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            );
          })}
        </div>
      </section>

      {/* ================= PLANS SECTION ================= */}
      <section
        style={{
          position: "relative",
          padding: "120px 0",
          overflow: "hidden",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <video
            src={videoridingplansbg}
            poster={postergreenbgr}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.6)",
            }}
          ></div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          <h4
            style={{
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "2px",
              marginBottom: "16px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            THUÊ PIN - KHÔNG CẦN MUA
          </h4>
          <Title
            style={{ color: "#fff", fontSize: "48px", marginBottom: "24px" }}
          >
            Gói cước đơn giản.
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "18px",
              maxWidth: "700px",
              margin: "0 auto 80px auto",
              lineHeight: "1.6",
            }}
          >
            Dù bạn đi làm hàng ngày, đi phượt cuối tuần hay chạy xe chuyên
            nghiệp. Bạn có thể đổi pin thoải mái. Chọn các gói thuê bao linh
            hoạt giúp việc lái xe điện trở nên dễ dàng và tiết kiệm.
          </Paragraph>

          <Row gutter={[48, 48]}>
            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <Title
                  level={3}
                  style={{ color: "#fff", marginBottom: "16px" }}
                >
                  Linh hoạt
                </Title>
                <Paragraph
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
                >
                  Đi ít hay nhiều, chỉ trả tiền cho năng lượng bạn dùng mỗi
                  tháng.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div
                style={{
                  textAlign: "center",
                  borderLeft: "1px solid rgba(255,255,255,0.2)",
                  borderRight: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Title
                  level={3}
                  style={{ color: "#fff", marginBottom: "16px" }}
                >
                  Cố định
                </Title>
                <Paragraph
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
                >
                  Chọn các gói phù hợp với quãng đường đi trung bình hàng tháng
                  để tiết kiệm hơn.
                </Paragraph>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div style={{ textAlign: "center" }}>
                <Title
                  level={3}
                  style={{ color: "#fff", marginBottom: "16px" }}
                >
                  Doanh nghiệp
                </Title>
                <Paragraph
                  style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px" }}
                >
                  Các gói thương mại được thiết kế riêng cho nhu cầu sử dụng tần
                  suất cao.
                </Paragraph>
              </div>
            </Col>
          </Row>

          <div
            style={{
              marginTop: "80px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              paddingTop: "32px",
            }}
          >
            <Paragraph
              style={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}
            >
              * Các gói cước được thiết kế phù hợp với từng khu vực của bạn.
            </Paragraph>
          </div>
        </div>
      </section>

      {/* ================= Youtube Section ================= */}
      <section style={{ padding: "80px 0", background: "#f9f9f9" }}>
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
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
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
                ra nhiều bất tiện. Dịch vụ đổi pin của EVBattery mang đến một
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
