import React from 'react';
import { Card, Row, Col, Typography, Timeline, Statistic } from 'antd';
import {
  ThunderboltOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import backgroundAboutUs from '../../assets/img/backgroundaboutus.png';

const { Title, Paragraph, Text } = Typography;

function AboutPage() {
  return (
    <div style={{ background: '#f0f2f5' }}>
      {/* Hero Section với Background Image */}
      <section
        style={{
          backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.85), rgba(30, 58, 138, 0.85)), url(${backgroundAboutUs})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '120px 20px',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', fontSize: '3rem', marginBottom: 24 }}>
            Hệ Thống Đặt Lịch Đổi Pin Xe Máy Điện
          </Title>
          <Paragraph style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.95)', maxWidth: 800, margin: '0 auto' }}>
            Giải pháp năng lượng xanh, nhanh chóng và tiện lợi - Góp phần xây dựng tương lai giao thông bền vững tại Việt Nam
          </Paragraph>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ padding: '60px 20px', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <Statistic
                  title="Trạm Đổi Pin"
                  value={15}
                  suffix="+"
                  valueStyle={{ color: '#1e3a8a', fontSize: '2.5rem' }}
                  prefix={<EnvironmentOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <Statistic
                  title="Thời Gian Đổi Pin"
                  value={3}
                  suffix="phút"
                  valueStyle={{ color: '#1e3a8a', fontSize: '2.5rem' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <Statistic
                  title="Người Dùng"
                  value={1000}
                  suffix="+"
                  valueStyle={{ color: '#1e3a8a', fontSize: '2.5rem' }}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} style={{ textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <Statistic
                  title="Tỉnh Thành"
                  value={34}
                  valueStyle={{ color: '#1e3a8a', fontSize: '2.5rem' }}
                  prefix={<RocketOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* About Content */}
      <section style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Giới thiệu */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Title level={2} style={{ color: '#1e3a8a', marginBottom: 16 }}>
            Về Chúng Tôi
          </Title>
          <div style={{ width: 80, height: 4, background: '#1e3a8a', margin: '0 auto 24px', borderRadius: 999 }} />
          <Paragraph style={{ fontSize: '1.1rem', color: '#475569', maxWidth: 800, margin: '0 auto', lineHeight: 1.8 }}>
            Chúng tôi là nền tảng đặt lịch đổi pin xe máy điện hàng đầu, mang đến giải pháp năng lượng xanh, 
            nhanh chóng và tiện lợi cho người dùng xe điện tại Việt Nam. Với mạng lưới trạm đổi pin phủ khắp 
            cả nước, chúng tôi cam kết đồng hành cùng xu hướng giao thông bền vững.
          </Paragraph>
        </div>

        {/* Tầm nhìn & Sứ mệnh */}
        <Row gutter={[32, 32]} style={{ marginBottom: 60 }}>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                height: '100%',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <RocketOutlined style={{ fontSize: '3rem', marginBottom: 16 }} />
              <Title level={3} style={{ color: 'white', marginBottom: 16 }}>
                Tầm Nhìn
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                Trở thành nền tảng hạ tầng năng lượng hàng đầu cho xe máy điện, góp phần xây dựng 
                hệ sinh thái giao thông xanh và phát triển bền vững tại Việt Nam và khu vực.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                height: '100%',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <ThunderboltOutlined style={{ fontSize: '3rem', marginBottom: 16 }} />
              <Title level={3} style={{ color: 'white', marginBottom: 16 }}>
                Sứ Mệnh
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.05rem', lineHeight: 1.8 }}>
                Cung cấp giải pháp đổi pin nhanh chóng, tiện lợi và an toàn, giúp người dùng xe điện 
                tiết kiệm thời gian, giảm chi phí và nâng cao trải nghiệm di chuyển hàng ngày.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* Ưu điểm */}
        <div style={{ marginBottom: 60 }}>
          <Title level={2} style={{ textAlign: 'center', color: '#1e3a8a', marginBottom: 40 }}>
            Ưu Điểm Vượt Trội
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                hoverable
                style={{ height: '100%', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              >
                <ClockCircleOutlined style={{ fontSize: '3rem', color: '#1e3a8a', marginBottom: 16 }} />
                <Title level={4}>Tiết Kiệm Thời Gian</Title>
                <Paragraph style={{ color: '#475569' }}>
                  Đổi pin chỉ trong 3-5 phút, nhanh hơn gấp nhiều lần so với sạc pin truyền thống (2-4 giờ)
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                hoverable
                style={{ height: '100%', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              >
                <SafetyOutlined style={{ fontSize: '3rem', color: '#1e3a8a', marginBottom: 16 }} />
                <Title level={4}>Pin Luôn Tốt</Title>
                <Paragraph style={{ color: '#475569' }}>
                  Pin được kiểm tra và bảo dưỡng tập trung, đảm bảo chất lượng và tuổi thọ cao nhất
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card
                bordered={false}
                hoverable
                style={{ height: '100%', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              >
                <EnvironmentOutlined style={{ fontSize: '3rem', color: '#1e3a8a', marginBottom: 16 }} />
                <Title level={4}>Mạng Lưới Rộng</Title>
                <Paragraph style={{ color: '#475569' }}>
                  Hơn 15 trạm đổi pin phủ khắp Sài Gòn, luôn sẵn sàng phục vụ mọi lúc mọi nơi
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Quy trình đổi pin */}
        <div style={{ marginBottom: 60 }}>
          <Title level={2} style={{ textAlign: 'center', color: '#1e3a8a', marginBottom: 40 }}>
            Quy Trình Đổi Pin Đơn Giản
          </Title>
          <Card bordered={false} style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderRadius: 12 }}>
            <Timeline
              mode="alternate"
              items={[
                {
                  children: (
                    <div>
                      <Title level={4}>Bước 1: Đặt Lịch Online</Title>
                      <Paragraph>Đặt lịch nhanh chóng qua website hoặc app, chọn trạm và thời gian phù hợp</Paragraph>
                    </div>
                  ),
                  color: 'blue',
                },
                {
                  children: (
                    <div>
                      <Title level={4}>Bước 2: Đến Trạm</Title>
                      <Paragraph>Di chuyển đến trạm đã chọn theo lịch hẹn, nhân viên sẵn sàng hỗ trợ</Paragraph>
                    </div>
                  ),
                  color: 'green',
                },
                {
                  children: (
                    <div>
                      <Title level={4}>Bước 3: Đổi Pin</Title>
                      <Paragraph>Thao tác đổi pin nhanh chóng, chỉ mất 3-5 phút</Paragraph>
                    </div>
                  ),
                  color: 'orange',
                },
                {
                  children: (
                    <div>
                      <Title level={4}>Bước 4: Tiếp Tục Hành Trình</Title>
                      <Paragraph>Nhận pin đầy năng lượng và tiếp tục di chuyển ngay lập tức</Paragraph>
                    </div>
                  ),
                  color: 'purple',
                },
              ]}
            />
          </Card>
        </div>

        {/* Cam kết */}
        <Card
          bordered={false}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            padding: '40px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderRadius: 12,
          }}
        >
          <Title level={2} style={{ color: 'white', marginBottom: 24 }}>
            Cam Kết Của Chúng Tôi
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <div>
                <Title level={4} style={{ color: 'white' }}>
                  🌱 Bền Vững
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Góp phần bảo vệ môi trường và phát triển giao thông xanh
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Title level={4} style={{ color: 'white' }}>
                  ⚡ Nhanh Chóng
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Tiết kiệm thời gian quý báu của bạn với dịch vụ đổi pin siêu tốc
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div>
                <Title level={4} style={{ color: 'white' }}>
                  🛡️ An Toàn
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Pin được kiểm tra kỹ lưỡng, đảm bảo an toàn tuyệt đối
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </section>
    </div>
  );
}

export default AboutPage;