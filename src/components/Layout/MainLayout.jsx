import React, { useState, useEffect } from "react";
import { Layout, theme, Button } from "antd";
import { IoMenu } from "react-icons/io5";
import "./Dashboard.css";
import BottomSideBar from "../BottomSideBar/BottomSideBar";

const { Header, Content, Footer, Sider } = Layout;

export default function MainLayout({ children, sidebar, title }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem("sidebarCollapsed");
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    try {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    } catch {
      // noop
    }
  }, [collapsed]);

  // static sidebar/header colors (revert customization)
  const roleColor = "#001529";
  const headerColor = "#06263d";
  const headerBorder = "rgba(255,255,255,0.06)";

  return (
    <Layout className="ev-dashboard" style={{ height: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth={80}
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
        style={{
          height: "100%", // ✅ fix: không dùng 100vh ở đây
          position: "relative",
          background: roleColor,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: `linear-gradient(180deg, ${headerColor}, ${roleColor})`,
            padding: "18px 24px",
            borderBottom: `1px solid ${headerBorder}`,
            flexShrink: 0,
          }}
        >
          <Button
            type="text"
            icon={<IoMenu size={28} color="#fff" />}
            onClick={() => setCollapsed((c) => !c)}
          />
          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontWeight: "bolder",
              fontSize: "20px",
              textTransform: "uppercase",
              display: collapsed ? "none" : "block",
            }}
          >
            EV Battery
          </h1>
        </div>

        {/* Nội dung menu */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingBottom: "70px", // tránh đè footer
          }}
        >
          {React.isValidElement(sidebar)
            ? React.cloneElement(sidebar, { collapsed })
            : sidebar}
        </div>

        {/* Bottom Sidebar - dính đáy */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            borderTop: `1px solid ${headerBorder}`,
            background: roleColor,
            padding: collapsed ? "10px 8px" : "10px 16px",
          }}
        >
          <BottomSideBar collapse={collapsed}/>
        </div>
      </Sider>

      {/* Main layout */}
      <Layout
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Content
          style={{
            flex: 1,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
          }}
        >
          {title && <h1 className="text-2xl font-bold mb-4">{title}</h1>}
          {children}
        </Content>

        <Footer
          style={{
            flexShrink: 0,
            height: "48px",
            textAlign: "center",
            fontSize: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderTop: "1px solid #e8e8e8",
            background: "#f5f5f5",
          }}
        >
          ©{new Date().getFullYear()} Created by{" "}
          <span style={{ fontWeight: "bold", marginLeft: "4px" }}>TEAM 4</span>
        </Footer>
      </Layout>
    </Layout>
  );
}
