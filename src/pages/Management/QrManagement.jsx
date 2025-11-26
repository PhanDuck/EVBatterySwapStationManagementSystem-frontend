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
import api from "../../config/axios"; // Đường dẫn import api của bạn
import { showToast } from "../../Utils/toastHandler"; // Đường dẫn toast

const { Title, Text } = Typography;

export default function QrManagement() {
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  
  // State cho QR Code
  const [qrLoading, setQrLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState(null);

  // 1. Load danh sách trạm khi vào trang
  useEffect(() => {
    const fetchStations = async () => {
      setLoadingStations(true);
      try {
        const res = await api.get("/station");
        const data = Array.isArray(res.data) ? res.data : [];
        setStations(data);
      } catch (error) {
        showToast("error", error.response?.data?.message || "Không thể tải danh sách trạm");
      } finally {
        setLoadingStations(false);
      }
    };
    fetchStations();
  }, []);

  // 2. Xử lý khi chọn trạm (Reset QR cũ)
  const handleSelectStation = (station) => {
    if (selectedStation?.id !== station.id) {
      setSelectedStation(station);
      setQrImageUrl(null); // Reset QR cũ khi chọn trạm mới
    }
  };

  // 3. Gọi API Tạo QR Code (Nhận về BLOB ảnh)
  const handleGenerateQR = async () => {
    if (!selectedStation) return;
    
    setQrLoading(true);
    try {
      // Quan trọng: responseType: 'blob' để nhận dữ liệu ảnh
      const res = await api.get(`/qr-code/station/${selectedStation.id}`, {
        responseType: "blob", 
        params: { width: 400, height: 400 } // Kích thước tùy chọn
      });

      // Tạo URL từ Blob để hiển thị
      const imgUrl = URL.createObjectURL(res.data);
      setQrImageUrl(imgUrl);
      showToast("success", "Tạo mã QR thành công!");
    } catch (error) {
      console.error(error);
      showToast("error", "Lỗi khi tạo mã QR");
    } finally {
      setQrLoading(false);
    }
  };

  // 4. Xử lý Download
  const handleDownload = () => {
    if (!qrImageUrl || !selectedStation) return;
    
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `QR_Station_${selectedStation.id}_${selectedStation.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      {/* Header chung */}
      <Card bordered={false} style={{ marginBottom: 24, borderRadius: 12, textAlign: "center" }}>
        <Title level={2} style={{ margin: 0 }}>
          <QrcodeOutlined style={{ color: "#1890ff", marginRight: 10 }} />
          Tạo mã QR cho Trạm
        </Title>
        <Text type="secondary">
          Tạo và tải mã QR để dán tại trạm đổi pin. Khách hàng quét mã QR để đổi pin nhanh.
        </Text>
      </Card>

      <Row gutter={24}>
        {/* === CỘT TRÁI: DANH SÁCH TRẠM === */}
        <Col xs={24} lg={8}>
          <Card 
            title={<span><EnvironmentOutlined /> Chọn trạm</span>} 
            extra={<Tag color="blue">{stations.length} trạm</Tag>}
            style={{ height: "100%", borderRadius: 12 }}
            bodyStyle={{ padding: "12px", maxHeight: "600px", overflowY: "auto" }}
          >
            {loadingStations ? (
              <div style={{ textAlign: "center", padding: 20 }}><Spin /></div>
            ) : (
              <List
                dataSource={stations}
                renderItem={(item) => {
                  const isSelected = selectedStation?.id === item.id;
                  return (
                    <Card
                      hoverable
                      onClick={() => handleSelectStation(item)}
                      style={{
                        marginBottom: 12,
                        borderRadius: 8,
                        border: isSelected ? "2px solid #1890ff" : "1px solid #f0f0f0",
                        backgroundColor: isSelected ? "#e6f7ff" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      bodyStyle={{ padding: "12px" }}
                    >
                      <Row align="middle" justify="space-between">
                        <Col flex="auto">
                          <Text strong style={{ fontSize: 16, display: 'block' }}>{item.name}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EnvironmentOutlined /> {item.location}
                          </Text>
                          <div style={{ marginTop: 6 }}>
                             <Tag color="green">ACTIVE</Tag>
                          </div>
                        </Col>
                        {isSelected && (
                          <Col>
                            <CheckCircleFilled style={{ fontSize: 24, color: "#1890ff" }} />
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

        {/* === CỘT PHẢI: PREVIEW VÀ ACTION === */}
        <Col xs={24} lg={16}>
          <Card 
            title="Xem trước mã QR" 
            style={{ height: "100%", borderRadius: 12 }}
          >
            {selectedStation ? (
              <div style={{ textAlign: "center" }}>
                {/* Thông tin trạm đã chọn */}
                <div style={{ marginBottom: 30 }}>
                  <Title level={3}>{selectedStation.name}</Title>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    {selectedStation.address}
                  </Text>
                </div>

                {/* Khu vực hiển thị QR Code */}
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
                    position: "relative",
                  }}
                >
                  {qrLoading ? (
                    <Spin size="large" tip="Đang tạo..." />
                  ) : qrImageUrl ? (
                    <img 
                      src={qrImageUrl} 
                      alt="QR Code" 
                      style={{ width: "90%", height: "90%", objectFit: "contain" }} 
                    />
                  ) : (
                    <Text type="secondary">Nhấn "Tạo QR Code" để xem</Text>
                  )}
                </div>

                {/* Các nút thao tác */}
                <Space size="middle">
                   {/* Nút Tạo */}
                   <Button
                    type="primary"
                    size="large"
                    icon={<QrcodeOutlined />}
                    onClick={handleGenerateQR}
                    loading={qrLoading}
                    style={{ 
                        minWidth: 150, 
                        height: 45,
                    }}
                  >
                    {qrImageUrl ? "Tạo lại QR Code" : "Tạo mã QR"}
                  </Button>

                  {/* Nút Download - Chỉ hiện khi có ảnh */}
                  {qrImageUrl && (
                    <Button
                      type="default"
                      size="large"
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      style={{ 
                          minWidth: 150, 
                          height: 45,
                          borderColor: "#1890ff",
                          color: "#1890ff"
                      }}
                    >
                      Tải xuống mã QR
                    </Button>
                  )}
                </Space>
              </div>
            ) : (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="Vui lòng chọn một trạm từ danh sách bên trái để bắt đầu" 
                style={{ marginTop: 100 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}