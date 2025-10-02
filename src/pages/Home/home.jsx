// import React from "react";
// import NavBar from "../../components/navbar/navBar";

// function Home() {
//   return (
//     <div>
//       <NavBar />
//     </div>
//   );
// }

// export default Home;
import React, { useState, useEffect, useRef } from "react";
import NavBar from "../../components/navbar/navBar";
import { Button, Card, Statistic, Row, Col, Typography, Divider } from "antd";
import {
  ThunderboltOutlined,
  RocketOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CrownOutlined,
  StarOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./luxury.css";

const { Title, Paragraph } = Typography;

// Define keyframe animations as a style to be injected - Tesla inspired
const injectGlobalStyles = () => {
  if (document.getElementById("home-animations")) return;

  const styleElement = document.createElement("style");
  styleElement.id = "home-animations";
  styleElement.innerHTML = document.head.appendChild(styleElement);

  // Add 3D perspective to the entire document
  document.body.style.perspective = "1000px";
  document.body.style.transformStyle = "preserve-3d";
};

function Home() {
  // References for scroll animations and luxury effects
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const sparklesContainerRef = useRef(null);

  // State to track animation states
  const [animatedElements, setAnimatedElements] = useState({
    hero: false,
    features: false,
    testimonials: false,
    stats: false,
    cta: false,
  });

  // State for parallax effect
  // Removed unused mousePosition state

  // Inject global styles and setup luxury animations
  useEffect(() => {
    injectGlobalStyles();

    // Create gold sparkle elements
    const createGoldSparkles = () => {
      if (sparklesContainerRef.current) {
        const container = sparklesContainerRef.current;
        container.innerHTML = "";

        for (let i = 0; i < 50; i++) {
          const sparkle = document.createElement("div");
          sparkle.className = "gold-sparkle";

          // Random position
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          sparkle.style.left = `${x}%`;
          sparkle.style.top = `${y}%`;

          // Random size
          const size = Math.random() * 4 + 2;
          sparkle.style.width = `${size}px`;
          sparkle.style.height = `${size}px`;

          // Random animation delay
          sparkle.style.animationDelay = `${Math.random() * 3}s`;

          container.appendChild(sparkle);
        }
      }
    };

    // Setup scroll indicator (VIP style with gold gradient)
    const updateScrollProgress = () => {
      if (scrollIndicatorRef.current) {
        const scrollPercent =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100;
        scrollIndicatorRef.current.style.width = `${scrollPercent}%`;
      }
    };

    // Handle mouse movement for luxury parallax effect
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });

      // Apply parallax effect to luxury elements
      document.querySelectorAll(".luxury-parallax").forEach((el) => {
        const speed = el.getAttribute("data-speed") || 0.2;
        const x = e.clientX * speed;
        const y = e.clientY * speed;
        el.style.transform = `translate(${x * 0.01}px, ${y * 0.01}px)`;
      });
    };

    // Setup scroll reveal animations (luxury style)
    const handleScroll = () => {
      updateScrollProgress();

      // Check each section and apply luxury animations when in viewport
      const sections = document.querySelectorAll(".luxury-reveal");
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight * 0.85;

        if (isInView) {
          section.classList.add("visible");
        }
      });

      // Parallax effect for luxury background elements
      document.querySelectorAll(".luxury-parallax").forEach((el) => {
        const speed = el.getAttribute("data-speed") || 0.2;
        const yPos = -(window.scrollY * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    };

    // Create luxury sparkles
    createGoldSparkles();

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    // Initial check
    handleScroll();

    // Trigger VIP animations with elegant timing
    setTimeout(() => {
      setAnimatedElements((prev) => ({ ...prev, hero: true }));
    }, 300);

    // Trigger other animations as user scrolls with luxury timing
    const animationTimers = [
      setTimeout(
        () => setAnimatedElements((prev) => ({ ...prev, features: true })),
        800
      ),
      setTimeout(
        () => setAnimatedElements((prev) => ({ ...prev, testimonials: true })),
        1300
      ),
      setTimeout(
        () => setAnimatedElements((prev) => ({ ...prev, stats: true })),
        1800
      ),
      setTimeout(
        () => setAnimatedElements((prev) => ({ ...prev, cta: true })),
        2300
      ),
    ];

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      animationTimers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Handle smooth scroll when clicking the scroll indicator
  const scrollToFeatures = () => {
    if (featuresRef.current) {
      window.scrollTo({
        top: featuresRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Trigger animations after component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedElements({
        hero: true,
        features: false,
        testimonials: false,
        stats: false,
        cta: false,
      });
    }, 300);

    const timer2 = setTimeout(() => {
      setAnimatedElements((prev) => ({ ...prev, features: true }));
    }, 800);

    const timer3 = setTimeout(() => {
      setAnimatedElements((prev) => ({ ...prev, testimonials: true }));
    }, 1300);

    const timer4 = setTimeout(() => {
      setAnimatedElements((prev) => ({ ...prev, stats: true }));
    }, 1800);

    const timer5 = setTimeout(() => {
      setAnimatedElements((prev) => ({ ...prev, cta: true }));
    }, 2300);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <NavBar />

      {/* Luxury VIP scroll indicator with gold gradient */}
      <div ref={scrollIndicatorRef} className="luxury-scroll-indicator"></div>

      {/* Gold sparkles container for premium effect */}
      <div
        ref={sparklesContainerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 100,
          overflow: "hidden",
        }}
      ></div>

      {/* Ultra Luxury VIP Hero Section */}
      <section
        ref={heroRef}
        className="luxury-section luxury-hero luxury-reveal visible"
        style={{
          background: "linear-gradient(135deg, #0A0A0A 0%, #00264D 100%)",
          padding: "120px 0 140px",
          position: "relative",
          overflow: "hidden",
          perspective: "2000px",
          transformStyle: "preserve-3d",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Luxury VIP background elements */}
        <div className="luxury-bg-grid" data-speed="0.05"></div>
        <div className="luxury-bg-gradient"></div>

        {/* Luxury orbs with gold gradient */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`luxury-orb-${i}`}
            className="luxury-orb"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}
          />
        ))}

        <div
          className="luxury-parallax"
          data-speed="0.15"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "120%",
            background:
              "linear-gradient(135deg, rgba(10,10,10,0.8) 0%, rgba(0,38,77,0.9) 100%)",
            opacity: 1,
            zIndex: 1,
          }}
        />

        {/* Tesla-style dot pattern overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20a2 2 0 110-4 2 2 0 010 4zm0 20a2 2 0 110-4 2 2 0 010 4zm20-20a2 2 0 110-4 2 2 0 010 4z' fill='%23FFFFFF' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
            transform: "translateZ(-180px) scale(1.4)",
            opacity: 0.4,
            zIndex: 1,
          }}
        />

        {/* Tesla-inspired animated light elements */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`tesla-orb-${i}`}
            style={{
              position: "absolute",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 80 + 60}px`,
              height: `${Math.random() * 80 + 60}px`,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(0,127,255,${
                Math.random() * 0.2 + 0.05
              }) 0%, rgba(0,0,0,0) 80%)`,
              filter: "blur(30px)",
              zIndex: 1,
              animation: `float3d ${
                Math.random() * 10 + 10
              }s infinite cubic-bezier(0.2, 0.8, 0.2, 1) ${Math.random() * 5}s`,
              transformStyle: "preserve-3d",
              opacity: 0.7,
            }}
          />
        ))}

        {/* Tesla-style futuristic grid lines */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundSize: "50px 50px",
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            transform: "translateZ(-150px) rotateX(60deg) scale(3)",
            transformOrigin: "center center",
            zIndex: 1,
            opacity: 0.4,
          }}
        />

        {/* Tesla-style glowing accents */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "150px",
            height: "150px",
            borderRadius: "10%",
            background:
              "radial-gradient(circle, rgba(0,127,255,0.15) 0%, rgba(0,0,0,0) 70%)",
            transform: "rotateX(45deg) rotateZ(45deg) translateZ(-100px)",
            animation: "tesla-glow 8s infinite ease-in-out",
            boxShadow: "0 0 50px rgba(0,127,255,0.2)",
            filter: "blur(30px)",
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,127,255,0.1) 0%, rgba(0,0,0,0) 70%)",
            transform: "translateZ(80px)",
            filter: "blur(50px)",
            animation: "pulse3d 15s infinite ease-in-out",
            zIndex: 1,
            opacity: 0.8,
          }}
        />

        <div
          className="container-3d tesla-reveal-section"
          style={{
            maxWidth: "1300px",
            margin: "0 auto",
            padding: "0 32px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Row gutter={[60, 36]} align="middle">
            <Col
              xs={24}
              md={14}
              style={{
                opacity: animatedElements.hero ? 1 : 0,
                transform: animatedElements.hero
                  ? "translateZ(60px) translateY(0)"
                  : "translateZ(0) translateY(40px)",
                transition: "all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                transformStyle: "preserve-3d",
                animation: animatedElements.hero
                  ? "tesla-reveal 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)"
                  : "none",
              }}
            >
              <div style={{ marginBottom: "32px" }}>
                <div
                  className="tesla-glass"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "10px 20px",
                    borderRadius: "30px",
                    marginBottom: "24px",
                    animation: "pulse3d 4s infinite ease-in-out",
                    transform: "translateZ(30px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <ThunderboltOutlined
                    style={{
                      color: "rgba(0,127,255,0.9)",
                      marginRight: "10px",
                      fontSize: "18px",
                      filter: "drop-shadow(0 0 10px rgba(0,127,255,0.8))",
                      animation: "glowPulse 3s infinite ease-in-out",
                    }}
                  />
                  <span
                    style={{
                      color: "white",
                      fontWeight: 400,
                      fontSize: "16px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Nạp đầy pin chỉ trong 5 phút
                  </span>
                </div>
              </div>

              <div className="luxury-badge">
                <CrownOutlined style={{ marginRight: "8px" }} />
                Độc Quyền VIP
              </div>

              <Title
                level={1}
                className="luxury-heading"
                style={{
                  fontSize: "62px",
                  fontWeight: 600,
                  lineHeight: 1.1,
                  marginBottom: "32px",
                  transform: "translateZ(40px)",
                  transformStyle: "preserve-3d",
                  animation: "luxuryTextGlow 3s infinite ease-in-out",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  HỆ THỐNG ĐỔI PIN <br />
                  <div
                    className="luxury-divider"
                    style={{ margin: "8px 0 16px" }}
                  ></div>
                  <span
                    style={{
                      fontWeight: 700,
                      letterSpacing: "1px",
                      position: "relative",
                      animation: "luxuryGlitter 3s infinite linear",
                    }}
                  >
                    XE ĐIỆN CAO CẤP
                  </span>
                </span>
              </Title>

              <Paragraph
                className="luxury-subheading luxury-reveal delay-1 visible"
                style={{
                  fontSize: "20px",
                  maxWidth: "600px",
                  lineHeight: 1.6,
                  position: "relative",
                }}
              >
                <span className="signature-line"></span> Trải nghiệm đẳng cấp
                thượng lưu <span className="signature-line"></span>
                <br />
                Giải pháp đổi pin siêu tốc, sang trọng và đẳng cấp dành riêng
                cho khách hàng VIP. Mạng lưới trạm cao cấp trên toàn quốc với
                công nghệ vượt trội.
              </Paragraph>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap",
                  transform: "translateZ(30px)",
                  transformStyle: "preserve-3d",
                  marginTop: "40px",
                }}
              >
                <Link to="/login">
                  <Button
                    type="primary"
                    size="large"
                    className="luxury-button luxury-reveal delay-2 visible"
                    style={{
                      height: "54px",
                      minWidth: "180px",
                      fontSize: "18px",
                      fontWeight: "600",
                      letterSpacing: "1px",
                      position: "relative",
                      overflow: "hidden",
                      transform: "translateZ(10px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateZ(30px) scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateZ(10px)";
                    }}
                  >
                    <CrownOutlined style={{ marginRight: "10px" }} /> ĐĂNG NHẬP
                    VIP
                  </Button>
                </Link>
                <Button
                  size="large"
                  className="luxury-button luxury-reveal delay-3 visible"
                  style={{
                    height: "54px",
                    minWidth: "180px",
                    fontSize: "18px",
                    fontWeight: "500",
                    letterSpacing: "1px",
                    position: "relative",
                    overflow: "hidden",
                    transform: "translateZ(5px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateZ(20px) scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateZ(5px)";
                  }}
                >
                  <StarOutlined style={{ marginRight: "10px" }} /> TRẠM VIP GẦN
                  NHẤT
                </Button>
              </div>

              <div
                className="luxury-border luxury-reveal delay-4 visible"
                style={{
                  marginTop: "60px",
                  padding: "20px 30px",
                  maxWidth: "600px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "40px",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      className="luxury-icon"
                      style={{
                        background: "rgba(212, 175, 55, 0.1)",
                        padding: "10px",
                        borderRadius: "50%",
                      }}
                    >
                      <StarOutlined
                        style={{
                          color: "var(--luxury-gold)",
                          fontSize: "22px",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: "white",
                        fontWeight: "500",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Siêu Cao Cấp
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      className="luxury-icon"
                      style={{
                        background: "rgba(212, 175, 55, 0.1)",
                        padding: "10px",
                        borderRadius: "50%",
                      }}
                    >
                      <SafetyCertificateOutlined
                        style={{
                          color: "var(--luxury-gold)",
                          fontSize: "22px",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: "white",
                        fontWeight: "500",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Độc Quyền VIP
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      className="luxury-icon"
                      style={{
                        background: "rgba(212, 175, 55, 0.1)",
                        padding: "10px",
                        borderRadius: "50%",
                      }}
                    >
                      <CrownOutlined
                        style={{
                          color: "var(--luxury-gold)",
                          fontSize: "22px",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        color: "white",
                        fontWeight: "500",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Đẳng Cấp
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            <Col
              xs={24}
              md={10}
              style={{
                opacity: animatedElements.hero ? 1 : 0,
                transform: animatedElements.hero
                  ? "translateZ(60px) rotateY(-5deg) translateY(0)"
                  : "translateZ(0) translateY(20px)",
                transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay: "0.3s",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="luxury-glass-card luxury-3d luxury-depth luxury-reveal delay-2 visible"
                style={{
                  position: "relative",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow:
                    "0 30px 60px rgba(0,0,0,0.4), 0 15px 30px rgba(0,0,0,0.3)",
                  height: "450px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  transformStyle: "preserve-3d",
                  transform: "translateZ(50px)",
                  perspective: "1000px",
                  animation: "luxuryFloat 10s ease-in-out infinite",
                }}
              >
                {/* 3D lighting effect */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(66, 153, 225, 0.15) 0%, rgba(0,0,0,0) 60%)",
                    zIndex: 1,
                  }}
                ></div>

                {/* Circuit board pattern */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    transform: "translateZ(-20px)",
                    zIndex: 1,
                  }}
                ></div>

                {/* 3D Battery Illustration */}
                <div
                  style={{
                    width: "200px",
                    height: "320px",
                    border: "12px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    overflow: "hidden",
                    transformStyle: "preserve-3d",
                    transform: "translateZ(30px) rotateY(10deg)",
                    boxShadow:
                      "0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,255,0,0.05)",
                    transition: "transform 0.5s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateZ(60px) rotateY(-5deg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      "translateZ(30px) rotateY(10deg)";
                  }}
                >
                  {/* Battery Charge - VIP enhanced */}
                  <div
                    style={{
                      background: "var(--luxury-gold-gradient)",
                      height: "90%",
                      width: "100%",
                      borderRadius: "4px 4px 0 0",
                      animation: "luxuryGlitter 4s infinite linear",
                      boxShadow:
                        "inset 0 10px 20px rgba(255,255,255,0.3), 0 0 30px rgba(212, 175, 55, 0.5)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Energy glow effect */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        background:
                          "radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(76,175,80,0) 80%)",
                        animation: "pulse 3s infinite alternate",
                      }}
                    ></div>
                  </div>

                  {/* Battery Connector - 3D enhanced */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-30px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60px",
                      height: "20px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "5px 5px 0 0",
                    }}
                  />

                  {/* Battery VIP Charge Indicator */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "48px",
                      fontWeight: "bold",
                      color: "var(--luxury-black)",
                      animation: "luxuryPulse 3s infinite ease-in-out",
                      textShadow: "0 0 10px rgba(212, 175, 55, 0.8)",
                    }}
                  >
                    <CrownOutlined style={{ color: "var(--luxury-black)" }} />
                  </div>
                </div>

                {/* Lightning effects */}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: Math.random() * 60 + 20 + "px",
                      height: "2px",
                      backgroundColor: "#FFC107",
                      opacity: Math.random() * 0.4 + 0.2,
                      top: Math.random() * 100 + "%",
                      left: Math.random() * 100 + "%",
                      transform: `rotate(${Math.random() * 360}deg)`,
                      filter: "blur(1px)",
                      boxShadow: "0 0 10px 2px rgba(255, 193, 7, 0.7)",
                    }}
                  />
                ))}
              </div>
            </Col>
          </Row>
        </div>

        {/* VIP Luxury scroll indicator */}
        <div
          className="luxury-scroll-cta"
          onClick={scrollToFeatures}
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <span
            style={{
              color: "var(--luxury-gold)",
              fontSize: "14px",
              marginBottom: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: "500",
            }}
          >
            Khám Phá
          </span>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderLeft: "2px solid var(--luxury-gold)",
              borderBottom: "2px solid var(--luxury-gold)",
              transform: "rotate(-45deg)",
              margin: "0 auto",
              animation: "luxuryFloat 1.5s infinite ease-in-out",
            }}
          ></div>
        </div>
      </section>

      {/* Features Section - 3D Enhanced */}
      <section
        ref={featuresRef}
        className="luxury-section luxury-reveal"
        style={{
          padding: "120px 0",
          background:
            "linear-gradient(135deg, var(--luxury-dark) 0%, var(--luxury-blue) 100%)",
          position: "relative",
          overflow: "hidden",
          perspective: "1200px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "64px",
              opacity: animatedElements.features ? 1 : 0,
              transform: animatedElements.features
                ? "translateZ(40px) translateY(0)"
                : "translateZ(0) translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="luxury-badge"
              style={{ margin: "0 auto", textAlign: "center" }}
            >
              <CrownOutlined style={{ marginRight: "8px" }} />
              Dịch Vụ VIP
            </div>

            <Title
              level={2}
              className="luxury-heading"
              style={{
                fontSize: "42px",
                fontWeight: 600,
                marginBottom: "20px",
                position: "relative",
                display: "inline-block",
                transform: "translateZ(20px)",
                transformStyle: "preserve-3d",
                padding: "0 0 10px 0",
              }}
            >
              <span
                style={{
                  position: "relative",
                  zIndex: 2,
                }}
              >
                ĐẶC QUYỀN THƯỢNG LƯU
              </span>
            </Title>

            <div
              className="luxury-divider"
              style={{ margin: "0 auto 32px", width: "120px" }}
            ></div>

            <Paragraph
              style={{
                fontSize: "20px",
                maxWidth: "700px",
                margin: "0 auto 40px",
                color: "rgba(255, 255, 255, 0.9)",
                letterSpacing: "0.5px",
                lineHeight: 1.6,
              }}
            >
              Chúng tôi cung cấp dịch vụ đổi pin cao cấp, được thiết kế riêng
              cho khách hàng tinh hoa, mang lại trải nghiệm xa hoa và đẳng cấp
              khác biệt.
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            <Col
              xs={24}
              md={8}
              style={{
                opacity: animatedElements.features ? 1 : 0,
                transform: animatedElements.features
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: "all 0.8s ease",
                transitionDelay: "0.1s",
              }}
            >
              <Card
                className="card-3d tesla-card fade-up fade-in-delay-1"
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                  transformStyle: "preserve-3d",
                }}
                styles={{ body: { padding: "30px" } }}
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
                    marginBottom: "24px",
                    background: "rgba(30, 58, 138, 0.08)",
                    transform: "translateZ(20px)",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <RocketOutlined
                    style={{
                      fontSize: "32px",
                      color: "#1e3a8a",
                      filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
                      animation: "glowPulse 3s infinite ease-in-out",
                    }}
                  />
                </div>
                <Title level={4} style={{ marginBottom: "16px" }}>
                  Nhanh Chóng
                </Title>
                <Paragraph style={{ color: "#64748b", marginBottom: 0 }}>
                  Chỉ mất 5 phút để thực hiện việc thay đổi pin, giúp bạn tiếp
                  tục hành trình mà không cần chờ đợi lâu.
                </Paragraph>
              </Card>
            </Col>

            <Col
              xs={24}
              md={8}
              style={{
                opacity: animatedElements.features ? 1 : 0,
                transform: animatedElements.features
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: "all 0.8s ease",
                transitionDelay: "0.3s",
              }}
            >
              <Card
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                }}
                styles={{ body: { padding: "30px" } }}
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
                    marginBottom: "24px",
                    background: "rgba(255, 193, 7, 0.15)",
                  }}
                >
                  <ClockCircleOutlined
                    style={{ fontSize: "32px", color: "#FFC107" }}
                  />
                </div>
                <Title level={4} style={{ marginBottom: "16px" }}>
                  Tiện Lợi
                </Title>
                <Paragraph style={{ color: "#64748b", marginBottom: 0 }}>
                  Mạng lưới trạm đổi pin rộng khắp, dễ dàng tìm thấy ở nhiều vị
                  trí trung tâm và tiện lợi.
                </Paragraph>
              </Card>
            </Col>

            <Col
              xs={24}
              md={8}
              style={{
                opacity: animatedElements.features ? 1 : 0,
                transform: animatedElements.features
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: "all 0.8s ease",
                transitionDelay: "0.5s",
              }}
            >
              <Card
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                }}
                bodyStyle={{ padding: "30px" }}
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
                    marginBottom: "24px",
                    background: "rgba(76, 175, 80, 0.15)",
                  }}
                >
                  <SafetyOutlined
                    style={{ fontSize: "32px", color: "#4CAF50" }}
                  />
                </div>
                <Title level={4} style={{ marginBottom: "16px" }}>
                  An Toàn
                </Title>
                <Paragraph style={{ color: "#64748b", marginBottom: 0 }}>
                  Hệ thống kiểm tra pin kỹ lưỡng, đảm bảo an toàn tuyệt đối khi
                  sử dụng với công nghệ tiên tiến.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="tesla-stats tesla-section fade-up"
        style={{
          padding: "80px 0",
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Row gutter={[48, 32]}>
            <Col
              xs={24}
              sm={12}
              md={6}
              style={{
                opacity: animatedElements.stats ? 1 : 0,
                transform: animatedElements.stats
                  ? "translateZ(30px) translateY(0)"
                  : "translateY(20px) translateZ(0)",
                transition: "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                transformStyle: "preserve-3d",
                transitionDelay: "0.1s",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  transform: "translateZ(20px)",
                  transformStyle: "preserve-3d",
                  transition: "all 0.3s ease",
                  padding: "20px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateZ(40px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateZ(20px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px rgba(0, 0, 0, 0.1)";
                }}
              >
                <Statistic
                  title={
                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "16px",
                        marginBottom: "8px",
                        textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      Trạm Đổi Pin
                    </div>
                  }
                  value={150}
                  valueStyle={{
                    color: "white",
                    fontSize: "36px",
                    fontWeight: "bold",
                    textShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
                    transform: "translateZ(10px)",
                  }}
                  prefix={
                    <EnvironmentOutlined
                      style={{
                        filter: "drop-shadow(0 5px 10px rgba(0, 0, 0, 0.3))",
                        animation: "glowPulse 4s infinite ease-in-out",
                      }}
                    />
                  }
                />
              </div>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}
              style={{
                opacity: animatedElements.stats ? 1 : 0,
                transform: animatedElements.stats
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: "all 0.8s ease",
                transitionDelay: "0.2s",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Statistic
                  title={
                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "16px",
                        marginBottom: "8px",
                      }}
                    >
                      Người Dùng
                    </div>
                  }
                  value={50000}
                  valueStyle={{
                    color: "white",
                    fontSize: "36px",
                    fontWeight: "bold",
                  }}
                  prefix={<TeamOutlined />}
                />
              </div>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}
              style={{
                opacity: animatedElements.stats ? 1 : 0,
                transform: animatedElements.stats
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: "all 0.8s ease",
                transitionDelay: "0.3s",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Statistic
                  title={
                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "16px",
                        marginBottom: "8px",
                      }}
                    >
                      Lượt Đổi Pin
                    </div>
                  }
                  value={100000}
                  valueStyle={{
                    color: "white",
                    fontSize: "36px",
                    fontWeight: "bold",
                  }}
                  prefix={<ThunderboltOutlined />}
                />
              </div>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}
              style={{
                opacity: animatedElements.stats ? 1 : 0,
                transform: animatedElements.stats
                  ? "translateY(0)"
                  : "translateY(20px)",
                transition: "all 0.8s ease",
                transitionDelay: "0.4s",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Statistic
                  title={
                    <div
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "16px",
                        marginBottom: "8px",
                      }}
                    >
                      Tiết Kiệm CO2
                    </div>
                  }
                  value={250}
                  suffix="tấn"
                  valueStyle={{
                    color: "white",
                    fontSize: "36px",
                    fontWeight: "bold",
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Call to Action */}
      <section
        ref={ctaRef}
        className="tesla-cta tesla-section fade-up"
        style={{
          padding: "100px 0",
          background: "#f8f9fa",
          position: "relative",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
              borderRadius: "24px",
              padding: "64px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              opacity: animatedElements.cta ? 1 : 0,
              transform: animatedElements.cta
                ? "translateY(0)"
                : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Decorative elements */}
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "10%",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(20px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10%",
                right: "5%",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)",
                filter: "blur(20px)",
              }}
            />

            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={16}>
                <Title
                  level={2}
                  style={{
                    color: "white",
                    fontSize: "36px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    transform: "translateZ(30px)",
                    textShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                    transformStyle: "preserve-3d",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "relative",
                      display: "inline-block",
                      animation: "textFloat 6s ease-in-out infinite",
                    }}
                  >
                    Sẵn sàng trải nghiệm dịch vụ đổi pin?
                    <span
                      style={{
                        position: "absolute",
                        height: "4px",
                        width: "50%",
                        background:
                          "linear-gradient(90deg, rgba(255,193,7,1) 0%, rgba(255,193,7,0) 100%)",
                        bottom: "-8px",
                        left: "0",
                        transformStyle: "preserve-3d",
                        transform: "translateZ(-5px)",
                      }}
                    ></span>
                  </span>
                </Title>
                <Paragraph
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "18px",
                    marginBottom: "0",
                    transform: "translateZ(20px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  Đăng ký ngay hôm nay để được hưởng nhiều ưu đãi đặc biệt dành
                  cho thành viên mới. Đổi pin xe điện chưa bao giờ dễ dàng đến
                  thế!
                </Paragraph>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: "center" }}>
                <Link to="/register">
                  <Button
                    type="primary"
                    size="large"
                    className="btn-3d"
                    style={{
                      height: "54px",
                      fontSize: "18px",
                      fontWeight: "600",
                      padding: "0 32px",
                      backgroundColor: "#FFC107",
                      borderColor: "#FFC107",
                      color: "#212529",
                      boxShadow: "0 15px 30px rgba(255, 193, 7, 0.4)",
                      transform: "translateZ(40px) scale(1.05)",
                      transition:
                        "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateZ(60px) scale(1.1)";
                      e.currentTarget.style.boxShadow =
                        "0 25px 40px rgba(255, 193, 7, 0.5), 0 0 30px rgba(255, 193, 7, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateZ(40px) scale(1.05)";
                      e.currentTarget.style.boxShadow =
                        "0 15px 30px rgba(255, 193, 7, 0.4)";
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-100%",
                        left: "-100%",
                        width: "300%",
                        height: "300%",
                        background:
                          "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
                        transform: "rotate(30deg)",
                        animation: "shimmer3d 3s infinite linear",
                      }}
                    ></div>
                    Đăng Ký Ngay
                  </Button>
                </Link>
              </Col>
            </Row>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#0f172a",
          color: "white",
          padding: "80px 0 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          <Row gutter={[48, 32]}>
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
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  Battery Swap
                </div>
              </div>
              <Paragraph
                style={{ color: "rgba(255,255,255,0.6)", marginBottom: "24px" }}
              >
                Hệ thống quản lý trạm đổi pin xe điện hàng đầu Việt Nam. Chúng
                tôi cam kết mang đến trải nghiệm tốt nhất cho người dùng.
              </Paragraph>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                }}
              >
                {/* Social Media Icons would go here */}
              </div>
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

          <Divider
            style={{ borderColor: "rgba(255,255,255,0.1)", margin: "40px 0" }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ color: "rgba(255,255,255,0.6)" }}>
              © 2025 EV Battery Swap. All rights reserved.
            </div>
            <div
              style={{
                display: "flex",
                gap: "24px",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Điều Khoản
              </a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Chính Sách
              </a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
                Cookie
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
