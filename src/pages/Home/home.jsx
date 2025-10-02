import React from "react";
import videohomepage from "../../assets/img/videohomepage.mp4";
import NavBar from "../../components/navbar/navBar";
import { Button, Card, Row, Col, Typography } from 'antd';
import { ThunderboltOutlined, ClockCircleOutlined, SafetyOutlined, EnvironmentOutlined,UserOutlined, CloudTwoTone } from '@ant-design/icons';
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
    
           <section style={{ 
          padding: '0', 
          background: '#0f172a', 
          overflow: 'hidden'     
      }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <video 

    src={videohomepage} 
    autoPlay
    loop
    muted
    playsInline
    style={{ 
        width: '100%', 
        height: 'auto', 
        display: 'block' 
    }} 
>
    Trình duyệt của bạn không hỗ trợ thẻ video.
</video>
          </div>
</section>

      {/* Hero */}
      
      <section style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1B4B6B 100%)', color: 'white', padding: '72px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Title style={{ color: 'white', marginBottom: 12 }}>Đổi pin xe điện nhanh, tiện, an toàn</Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 24 }}>
                Lấy cảm hứng từ hệ sinh thái của Selex, chúng tôi tập trung vào trải nghiệm đơn giản, rõ ràng cho mọi tài xế.
              </Paragraph>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button type="primary" onClick={handleBook}>Đặt lịch đổi pin</Button>
                <Link to="/stations/nearby"><Button>Trạm gần tôi</Button></Link>
              </div>
            </Col>
            <img alt="EV illustration" src="https://gogoro-about-uploads.s3.ap-northeast-1.amazonaws.com/storage/202304/vhb2sgb07rmwh5oncf8yu73v4rw5" style={{ maxWidth: '350px' }} />
          </Row>
        </div>

      </section>

      {/* Features */}
      <section style={{ padding: '56px 0', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={2} style={{ marginBottom: 12 }}>Vì sao chọn chúng tôi?</Title>
            <Paragraph style={{ color: '#64748b', margin: 0 }}>Nhanh – Tiện – An toàn, theo đúng tinh thần hệ sinh thái Selex.</Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={{ height: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }} styles={{ body: { padding: '24px' } }} hoverable>
                <div style={{ width: '70px', height: '70px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: 'rgba(30, 58, 138, 0.08)' }}>
                  <ThunderboltOutlined style={{ fontSize: '32px', color: '#1e3a8a' }} />
                </div>
                <Title level={4} style={{ marginBottom: '16px' }}>Nhanh chóng</Title>
                <Paragraph style={{ color: '#64748b', marginBottom: 0 }}>
                  Chỉ mất khoảng 5 phút để đổi pin và tiếp tục hành trình.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card style={{ height: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }} styles={{ body: { padding: '24px' } }} hoverable>
                <div style={{ width: '70px', height: '70px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: 'rgba(255, 193, 7, 0.15)' }}>
                  <ClockCircleOutlined style={{ fontSize: '32px', color: '#FFC107' }} />
                </div>
                <Title level={4} style={{ marginBottom: '16px' }}>Tiện lợi</Title>
                <Paragraph style={{ color: '#64748b', marginBottom: 0 }}>
                  Mạng lưới trạm rộng khắp, dễ dàng tìm thấy gần bạn.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card style={{ height: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }} bodyStyle={{ padding: '24px' }} hoverable>
                <div style={{ width: '70px', height: '70px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: 'rgba(76, 175, 80, 0.15)' }}>
                  <SafetyOutlined style={{ fontSize: '32px', color: '#4CAF50' }} />
                </div>
                <Title level={4} style={{ marginBottom: '16px' }}>An toàn</Title>
                <Paragraph style={{ color: '#64748b', marginBottom: 0 }}>
                  Kiểm tra pin kỹ lưỡng, đạt tiêu chuẩn an toàn.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Stats strip */}
      {/* Stats strip - ĐÃ CẢI THIỆN UI/UX */}
      <section style={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', 
          color: 'white', 
          padding: '60px 0' // Tăng padding lên 60px
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <Row gutter={[24, 40]} justify="center">
            
            {/* ITEM 1: TRẠM */}
            <Col xs={12} md={6} style={{ textAlign: 'center' }}>
                <EnvironmentOutlined style={{ fontSize: '32px', color: '#FFC107', marginBottom: '8px' }} />
                <Title level={2} style={{ color: 'white', margin: 0 }}>150+</Title>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Trạm đổi pin</div>
            </Col>

            {/* ITEM 2: NGƯỜI DÙNG (Đã thêm Icon) */}
            <Col xs={12} md={6} style={{ textAlign: 'center' }}>
                <UserOutlined style={{ fontSize: '32px', color: '#FFC107', marginBottom: '8px' }} />
                <Title level={2} style={{ color: 'white', margin: 0 }}>50.000+</Title>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Người dùng</div>
            </Col>

            {/* ITEM 3: LƯỢT ĐỔI */}
            <Col xs={12} md={6} style={{ textAlign: 'center' }}>
                <ThunderboltOutlined style={{ fontSize: '32px', color: '#FFC107', marginBottom: '8px' }} />
                <Title level={2} style={{ color: 'white', margin: 0 }}>100.000+</Title>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Lượt đổi thành công</div>
            </Col>

            {/* ITEM 4: CO2 (Đã thêm Icon - Sử dụng CloudTwoTone cho thân thiện môi trường) */}
            <Col xs={12} md={6} style={{ textAlign: 'center' }}>
                <CloudTwoTone twoToneColor="#4CAF50" style={{ fontSize: '32px', marginBottom: '8px' }} />
                <Title level={2} style={{ color: 'white', margin: 0 }}>250 tấn</Title>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>CO2 tiết kiệm</div>
            </Col>
            
          </Row>
        </div>
      </section>

      {/* Call to action */}
      <section style={{ padding: '56px 0', background: '#f8f9fa' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={16}>
              <Title level={2} style={{ marginBottom: 8 }}>Sẵn sàng đổi pin?</Title>
              <Paragraph style={{ margin: 0, color: '#64748b' }}>Đăng ký tài khoản để trải nghiệm đầy đủ dịch vụ.</Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <Link to="/register"><Button type="primary" size="large">Đăng ký ngay</Button></Link>
            </Col>
          </Row>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0f172a', color: 'white', padding: '40px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#FFC107', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontWeight: 'bold', color: '#1e3a8a' }}>EV</div>
                <div style={{ fontWeight: 'bold', fontSize: '20px' }}>Battery Swap</div>
              </div>
              <Paragraph style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                Hệ thống quản lý trạm đổi pin xe điện. Trải nghiệm đơn giản, thân thiện.
              </Paragraph>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Title level={5} style={{ color: 'white', marginBottom: '20px' }}>Dịch Vụ</Title>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Đổi Pin</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Sạc Pin</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Bảo Dưỡng</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Tư Vấn</a></li>
              </ul>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Title level={5} style={{ color: 'white', marginBottom: '20px' }}>Công Ty</Title>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Về Chúng Tôi</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Tuyển Dụng</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Đối Tác</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Tin Tức</a></li>
              </ul>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Title level={5} style={{ color: 'white', marginBottom: '20px' }}>Liên Hệ</Title>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px', color: 'rgba(255,255,255,0.6)' }}>Email: contact@evbatteryswap.com</li>
                <li style={{ marginBottom: '12px', color: 'rgba(255,255,255,0.6)' }}>Phone: +84 123 456 789</li>
                <li style={{ marginBottom: '12px', color: 'rgba(255,255,255,0.6)' }}>Địa chỉ: 123 Nguyễn Văn Linh, Q.7, TP.HCM</li>
              </ul>
            </Col>
          </Row>
        </div>
      </footer>
    </div>
  );
}

export default Home;


