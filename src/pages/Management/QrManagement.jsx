import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Typography,
  Button,
  Row,
  Col,
  Spin,
  Empty,
  Tag,
  Space,
} from "antd";
import {
  QrcodeOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import api from "../../config/axios";
import { showToast } from "../../Utils/toastHandler";

const { Title, Text } = Typography;

// --- SUB-COMPONENT: QR PREVIEW SECTION ---
const QrPreviewSection = ({
  station,
  loading,
  qrUrl,
  onGenerate,
  onDownload,
}) => {
  if (!station) {
    return (
      <Card style={{ height: "100%", borderRadius: 12 }}>
        <Empty description="Chọn trạm để bắt đầu" style={{ marginTop: 100 }} />
      </Card>
    );
  }

  return (
    <Card title="Xem trước mã QR" style={{ height: "100%", borderRadius: 12 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 30 }}>
          <Title level={3}>{station.name}</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            {station.address}
          </Text>
        </div>

        <div
          style={{
            width: 350,
            height: 350,
            margin: "0 auto 30px",
            border: "2px dashed #d9d9d9",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
          }}
        >
          {loading ? (
            <Spin size="large" tip="Đang tạo..." />
          ) : qrUrl ? (
            <img
              src={qrUrl}
              alt="QR"
              style={{ width: "90%", height: "90%", objectFit: "contain" }}
            />
          ) : (
            <Text type="secondary">Nhấn nút bên dưới để tạo</Text>
          )}
        </div>

        <Space>
          <Button
            type="primary"
            size="large"
            icon={<QrcodeOutlined />}
            onClick={onGenerate}
            loading={loading}
            style={{ minWidth: 150, height: 45 }}
          >
            {qrUrl ? "Tạo lại" : "Tạo mã QR"}
          </Button>
          {qrUrl && (
            <Button
              size="large"
              icon={<DownloadOutlined />}
              onClick={onDownload}
              style={{
                minWidth: 150,
                height: 45,
                borderColor: "#1890ff",
                color: "#1890ff",
              }}
            >
              Tải xuống
            </Button>
          )}
        </Space>
      </div>
    </Card>
  );
};

// --- MAIN COMPONENT ---
export default function QrManagement() {
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    const loadStations = async () => {
      setLoadingList(true);
      try {
        const res = await api.get("/station");
        setStations(Array.isArray(res.data) ? res.data : []);
      } catch {
        showToast("error", "Lỗi tải danh sách trạm");
      } finally {
        setLoadingList(false);
      }
    };
    loadStations();
  }, []);

  const handleSelect = (station) => {
    if (currentStation?.id !== station.id) {
      setCurrentStation(station);
      setQrUrl(null);
    }
  };

  const fetchQRCode = async () => {
    if (!currentStation) return;
    setGenerating(true);
    try {
      const res = await api.get(`/qr-code/station/${currentStation.id}`, {
        responseType: "blob",
        params: { width: 300, height: 300 },
        headers: { Accept: "image/png" },
      });

      if (res.data.size < 100) {
        const text = await res.data.text();
        try {
          showToast("error", JSON.parse(text).message);
        } catch {
          showToast("error", "Lỗi server tạo ảnh");
        }
        return;
      }
      setQrUrl(URL.createObjectURL(res.data));
      showToast("success", "Tạo thành công!");
    } catch (err) {
      showToast("error", err.response?.data || "Lỗi kết nối server");
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `QR_${currentStation.id}.png`;
    a.click();
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Card
        style={{
          marginBottom: 24,
          borderRadius: 12,
          textAlign: "center",
          border: "none",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          <QrcodeOutlined style={{ color: "#ff4d4f", marginRight: 10 }} /> Quản
          lý mã QR Trạm
        </Title>
      </Card>

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card
            title="Chọn trạm"
            extra={<Tag color="blue">{stations.length}</Tag>}
            style={{ height: "100%", borderRadius: 12 }}
            bodyStyle={{ padding: 12, maxHeight: 600, overflowY: "auto" }}
          >
            {loadingList ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <Spin />
              </div>
            ) : (
              <List
                dataSource={stations}
                renderItem={(s) => {
                  const active = currentStation?.id === s.id;
                  return (
                    <Card
                      hoverable
                      onClick={() => handleSelect(s)}
                      style={{
                        marginBottom: 12,
                        borderRadius: 8,
                        border: active
                          ? "2px solid #1890ff"
                          : "1px solid #f0f0f0",
                        background: active ? "#e6f7ff" : "#fff",
                      }}
                      bodyStyle={{ padding: 12 }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col flex="auto">
                          <Text strong style={{ fontSize: 16 }}>
                            {s.name}
                          </Text>
                          <div style={{ fontSize: 12, color: "#888" }}>
                            <EnvironmentOutlined /> {s.location}
                          </div>
                          <Tag color="green" style={{ marginTop: 5 }}>
                            ACTIVE
                          </Tag>
                        </Col>
                        {active && (
                          <Col>
                            <CheckCircleFilled
                              style={{ fontSize: 24, color: "#1890ff" }}
                            />
                          </Col>
                        )}
                      </Row>
                    </Card>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <QrPreviewSection
            station={currentStation}
            loading={generating}
            qrUrl={qrUrl}
            onGenerate={fetchQRCode}
            onDownload={downloadQR}
          />
        </Col>
      </Row>
    </div>
  );
}
