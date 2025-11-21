import React, { Fragment, useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,// lớp h.ảnh bản đồ lấy từ OSM
  Marker,
  Popup,
  useMap,
  Polyline, // đường đi màu xanh
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import {
  Select,
  Spin,
  Button,
  Space,
  Tag,
  Typography,
  List,
  Avatar,
  Divider,
  Tooltip,
  Progress,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  CarOutlined,
  ThunderboltFilled,
  EnvironmentOutlined,
  PhoneOutlined,
  WarningOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import L from "leaflet"; // import thư viện lõi của Leaflet vào L 
import "leaflet/dist/leaflet.css";

const { Option } = Select;
const { Title, Text } = Typography;

// --- CẤU HÌNH LEAFLET & CONSTANTS ---
const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1";
const ROUTING_PROFILE = "driving";

// Ma đạo nếu build react mà Leaflet lỗi thì trỏ icon marker về CDN
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// --- STYLE OBJECT (Tách biệt để dễ quản lý!!) ---
const styles = {
  container: {
    display: "flex",
    height: "calc(100vh - 80px)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f0f2f5",
  },
  // Sidebar
  sidebar: {
    width: 400,
    height: "100%",
    backgroundColor: "#ffffff",
    boxShadow: "4px 0 12px rgba(0,0,0,0.05)",
    zIndex: 900,
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s ease-in-out",
    borderRight: "1px solid #e8e8e8",
  },
  sidebarCollapsed: {
    width: 0,
    overflow: "hidden",
    opacity: 0,
    padding: 0,
  },
  sidebarHeader: {
    padding: "24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f0f0f0",
    zIndex: 2,
  },
  sidebarContent: {
    flex: 1,
    overflowY: "auto",
    padding: "0",
  },
  sidebarInnerPadding: {
    padding: "24px 24px 0 24px",
  },
  // Các nút và thẻ
  toggleButton: {
    position: "absolute",
    top: 24,
    zIndex: 901,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    transition: "left 0.3s ease-in-out",
  },
  vehicleCard: {
    background: "linear-gradient(135deg, #003a8c 0%, #1890ff 100%)",
    borderRadius: "12px",
    padding: "20px",
    color: "white",
    boxShadow: "0 8px 20px rgba(24, 144, 255, 0.2)",
    marginBottom: "24px",
    position: "relative",
    overflow: "hidden",
  },
  vehicleCardPending: {
    background: "linear-gradient(135deg, #d48806 0%, #faad14 100%)",
  },
  guestCard: {
    background: "linear-gradient(135deg, #8c8c8c 0%, #595959 100%)",
    borderRadius: "12px",
    padding: "20px",
    color: "white",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
    marginBottom: "24px",
    position: "relative",
    overflow: "hidden",
  },
  // List Item styles
  stationListItem: {
    padding: "16px 24px",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  stationListItemActive: {
    backgroundColor: "#e6f7ff",
    borderRight: "4px solid #1890ff",
  },
  // Map & Routing Info
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  routeInfoBox: {
    background: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(4px)",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "30px",
    position: "absolute",
    bottom: "30px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 900,
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: 500,
    fontSize: "14px",
  },
  popupContent: {
    minWidth: "260px",
  },
  userMarkerPulse: {
    backgroundColor: "#1890ff", 
    width: "18px", 
    height: "18px", 
    borderRadius: "50%", 
    border: "3px solid white", 
    boxShadow: "0 4px 10px rgba(24, 144, 255, 0.4)"
  },
  loadingContainer: {
    height: "calc(100vh - 80px)", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    background: "#f0f2f5"
  }
};

// Component style cho Popup Leaflet (Global override) Popup của Leaflet là dynamic ngoài luồng React nên phải dùng cách này để style
const GlobalPopupStyles = () => (
  <style>{`
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      padding: 0;
      overflow: hidden;
      border: none;
    }
    .leaflet-popup-content {
      margin: 0 !important;
      width: auto !important;
    }
    .leaflet-container {
        z-index: 0; 
    }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #999; }
  `}</style>
);

// --- HELPER FUNCTIONS ---

/**
 * Component phụ để di chuyển camera map đến vị trí mới
 * @param {Array} position - [lat, lng]
 */
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1.5 });
  }, [position, map]);
  return null;
}

/**
 * Chuyển đổi mét sang km/m hiển thị
 */
const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Chuyển đổi giây sang giờ/phút hiển thị
 */
const formatTime = (seconds) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours} giờ ${remMin}p`;
};

// --- MAIN COMPONENT ---
const StationsNearby = () => {
  // -- State Management --
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  
  // Selection States
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Map & Routing States
  const [userGeoPosition, setUserGeoPosition] = useState(null);// lưu tọa độ user
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]);
  const [routeCoordinates, setRouteCoordinates] = useState(null);//lưu tọa độ đường đi
  const [routeInfo, setRouteInfo] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const markerRefs = useRef({});
  const navigate = useNavigate();

  /**
   * 1. Fetch Data: Lấy danh sách trạm và xe của user ( chạy laafn đầu khì vừa mount)
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load Stations
      try {
        const stationsRes = await api.get("/station");
        setStations(stationsRes.data || []);
      } catch (err) {
        console.error("Lỗi tải trạm:", err);
      }

      // Load Vehicles
      try {
        const vehiclesRes = await api.get("/vehicle/my-vehicles");
        const vData = vehiclesRes.data || [];
        setVehicles(vData);
        
        if (vData.length > 0) {
          setSelectedVehicle(vData[0].id);
        }
      } catch { 
        // Nếu lỗi (401,..), coi như là Guest
        console.log("User chưa đăng nhập hoặc chưa có xe (Guest mode)");
        setVehicles([]); 
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * 2. Geolocation: Lấy vị trí hiện tại của trình duyệt
   */
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = [position.coords.latitude, position.coords.longitude];
          setUserGeoPosition(pos);
          setMapCenter(pos);
        },
        (err) => console.warn("Geolocation error:", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  /**
   * 3. Hàm gọi OSRM API để lấy đường đi
   */
  const getRoute = async (origin, destination) => {
    setRouteCoordinates(null);
    setRouteInfo(null);
    const start = `${origin[1]},${origin[0]}`;
    const end = `${destination[1]},${destination[0]}`;
    const url = `${OSRM_BASE_URL}/${ROUTING_PROFILE}/${start};${end}?overview=full&geometries=geojson`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("OSRM error");
      const data = await res.json();
      if (data.routes?.length > 0) {
        const route = data.routes[0];
        setRouteCoordinates(route.geometry.coordinates.map((c) => [c[1], c[0]])); // Đảo ngược lat/lng cho Leaflet tại kinh độ vĩ độ nó bị ngược
        setRouteInfo({ distance: route.distance, duration: route.duration });
      } else {
        alert("Không tìm thấy đường đi.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Xử lý khi bấm nút "Chỉ đường"
   */
  const handleDirectionsClick = (station) => {
    if (!userGeoPosition) {
      alert("Cần quyền truy cập vị trí để chỉ đường.");
      return;
    }
    setSelectedStation(station);
    getRoute(userGeoPosition, [station.latitude, station.longitude]);
    markerRefs.current[station.id]?.closePopup(); //đóng popup khi bấm chỉ đường nếu marker đang mang id của trạm đó
  };

  /**
   * Xóa dữ liệu đường đi
   */
  const clearRoute = () => {
    setRouteCoordinates(null);
    setRouteInfo(null);
    setSelectedStation(null);
  };

  /**
   * Xử lý chuyển trang đặt lịch
   */
  const handleBookingClick = (station) => {
    if (!selectedVehicle) {
      alert("Vui lòng đăng nhập và chọn xe để đặt lịch!");
      return;
    }
    if (selectedVehicleData?.status === "PENDING") return;
    navigate(`/stations/booking?vehicleId=${selectedVehicle}&stationId=${station.id}`);
  };

  // --- COMPUTED DATA (Dữ liệu tính toán) ---
  //useMemo vì khi di chuyệt với gõ phím thì ko tính lại danh sách
  const selectedVehicleData = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicle),
    [vehicles, selectedVehicle]
  );

  // Logic lọc trạm: Guest xem all, User xem trạm khớp loại pin xe
  const compatibleStations = useMemo(() => {
    if (!selectedVehicleData) return stations; 
    return stations.filter((s) => s.batteryTypeId === selectedVehicleData.batteryTypeId);
  }, [stations, selectedVehicleData]);

  const cities = useMemo(() => [...new Set(compatibleStations.map((s) => s.city))], [compatibleStations]);
  
  const districts = useMemo(() => 
    selectedCity ? [...new Set(compatibleStations.filter((s) => s.city === selectedCity).map((s) => s.district))] : [], 
  [compatibleStations, selectedCity]);
  
  const filteredStations = useMemo(() => 
    compatibleStations.filter((s) => 
      (!selectedCity || s.city === selectedCity) && 
      (!selectedDistrict || s.district === selectedDistrict)
    ), 
  [compatibleStations, selectedCity, selectedDistrict]);

  // --- RENDER ---
  if (loading)
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" tip="Đang tải hệ thống..." />
      </div>
    );

  return (
    <Fragment>
      <GlobalPopupStyles />
      <div style={styles.container}>
        
        {/* Toggle Button Sidebar */}
        <Button
          type="default"
          shape="circle"
          icon={isSidebarVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          size="large"
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          style={{ 
             ...styles.toggleButton, 
             left: isSidebarVisible ? 420 : 24 
          }}
        />

        {/* === SIDEBAR AREA === */}
        <div style={{ 
            ...styles.sidebar, 
            ...(isSidebarVisible ? {} : styles.sidebarCollapsed) 
        }}>
          <div style={styles.sidebarHeader}>
            <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: "-0.5px", color: "#001529" }}>
              Trạm đổi pin
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>Hệ thống trạm sạc thông minh</Text>
          </div>

          <div style={styles.sidebarContent}>
            <div style={styles.sidebarInnerPadding}>
              
              {/* --- KHU VỰC 1: XE HOẶC KHÁCH --- */}
              {vehicles.length > 0 ? (
                <>
                  {/* Selector Xe */}
                  <Select
                    style={{ width: "100%", marginBottom: 16 }}
                    value={selectedVehicle}
                    onChange={(v) => { setSelectedVehicle(v); clearRoute(); }}//(v)Là giá trị(value)của mục vừa được chọn (ở đây là vehicle.id).
                    size="large"
                    variant="filled"
                  >
                    {vehicles.map((vehicle) => (
                      <Option key={vehicle.id} value={vehicle.id} label={vehicle.model}> 
                        <Space>
                          {vehicle.model}
                          <span style={{ color: "#999", fontSize: "12px" }}>({vehicle.plateNumber})</span>
                          {vehicle.status === "PENDING" && <Tag color="orange" bordered={false}>Chờ duyệt</Tag>}
                        </Space>
                      </Option>
                    ))}
                  </Select>

                  {/* Card Thông tin xe */}
                  {selectedVehicleData && (
                    <div style={{
                        ...styles.vehicleCard,
                        ...(selectedVehicleData.status === "PENDING" ? styles.vehicleCardPending : {})
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <Text strong style={{ color: "rgba(255,255,255,0.85)", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>
                          Thông tin xe
                        </Text>
                        <CarOutlined style={{ fontSize: "20px", color: "white", opacity: 0.9 }} />
                      </div>
                      <Title level={3} style={{ color: "white", margin: 0, fontWeight: 700 }}>
                        {selectedVehicleData.model}
                      </Title>
                      <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", fontFamily: "monospace", marginTop: 4 }}>
                        {selectedVehicleData.plateNumber}
                      </div>
                      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                          <Tag color={selectedVehicleData.status === "PENDING" ? "warning" : "success"} style={{ border: "none", fontWeight: 600 }}>
                            {selectedVehicleData.status === "PENDING" ? "CHỜ DUYỆT" : "ACTIVE"}
                          </Tag>
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>• {selectedVehicleData.batteryTypeName}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // --- CARD CHẾ ĐỘ KHÁCH ---
                <div style={styles.guestCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <Text strong style={{ color: "rgba(255,255,255,0.85)", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>Chế độ khách</Text>
                        <UserOutlined style={{ fontSize: "20px", color: "white", opacity: 0.9 }} />
                      </div>
                      <Title level={3} style={{ color: "white", margin: "0 0 8px 0", fontWeight: 700 }}>Tất Cả Trạm</Title>
                      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px" }}>
                          Bạn đang xem toàn bộ trạm trên hệ thống.
                      </Text>
                      <div style={{ marginTop: 16 }}>
                          <Button type="default" size="small" ghost onClick={() => navigate("/login")}>Đăng nhập để đặt lịch</Button>
                      </div>
                </div>
              )}

              {/* --- KHU VỰC 2: BỘ LỌC --- */}
              <div style={{ marginBottom: 20 }}>
                 <Text strong style={{ display: "block", marginBottom: 8, fontSize: "13px", color: "#555" }}>KHU VỰC TÌM KIẾM</Text>
                 <Space.Compact block size="large">
                  <Select 
                    style={{ width: "50%" }} 
                    placeholder="Tỉnh/TP" 
                    allowClear 
                    onChange={(v) => { setSelectedCity(v); setSelectedDistrict(null); clearRoute(); }} 
                    variant="filled"
                  >
                    {cities.map((c) => <Option key={c} value={c}>{c}</Option>)}
                  </Select>
                  <Select 
                    style={{ width: "50%" }} 
                    placeholder="Quận/Huyện" 
                    allowClear 
                    value={selectedDistrict} 
                    onChange={(v) => { setSelectedDistrict(v); clearRoute(); }} 
                    disabled={!selectedCity} 
                    variant="filled"
                  >
                    {districts.map((d) => <Option key={d} value={d}>{d}</Option>)}
                  </Select>
                </Space.Compact>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 24 }}>
                <Text type="secondary" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
                  Kết quả ({filteredStations.length})
                </Text>
                {routeCoordinates && (
                  <Button type="link" danger onClick={clearRoute} size="small" style={{ padding: 0 }}>
                    Xóa chỉ đường
                  </Button>
                )}
              </div>
            </div>

            {/* --- KHU VỰC 3: LIST TRẠM --- */}
            <List
              dataSource={filteredStations}
              renderItem={(item) => (
                <div
                  style={{
                    ...styles.stationListItem,
                    ...(selectedStation?.id === item.id ? styles.stationListItemActive : {}),
                  }}
                  onMouseEnter={(e) => { if(selectedStation?.id !== item.id) e.currentTarget.style.backgroundColor = "#fafafa"; }}
                  onMouseLeave={(e) => { if(selectedStation?.id !== item.id) e.currentTarget.style.backgroundColor = "white"; }}
                  onClick={() => {
                    setSelectedStation(item);
                    setMapCenter([item.latitude, item.longitude]);
                    setTimeout(() => markerRefs.current[item.id]?.openPopup(), 100); //deplay 0,1s để map center xong mới mở popup, ko thì glitch ảnh
                  }}
                >
                  <Avatar
                    shape="square"
                    size={48}
                    icon={<ThunderboltFilled style={{ fontSize: 24 }} />}
                    style={{
                      backgroundColor: item.currentBatteryCount > 0 ? "#f6ffed" : "#fff1f0",
                      color: item.currentBatteryCount > 0 ? "#52c41a" : "#f5222d",
                      border: "1px solid #f0f0f0",
                      flexShrink: 0,
                    }}
                  />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: "15px", color: "#262626", marginBottom: 2, display: "block" }} ellipsis={{ tooltip: item.name }}>
                      {item.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "13px", display: "block", marginBottom: 6, lineHeight: "1.4" }}>
                      {item.location}
                    </Text>
                    <Space size={0} split={<Divider type="vertical" />}>
                        <span style={{ fontSize: "12px", color: item.currentBatteryCount > 0 ? "#389e0d" : "#cf1322", fontWeight: 500 }}>
                           {item.currentBatteryCount} pin
                        </span>
                        <span style={{ fontSize: "12px", color: "#8c8c8c" }}>{item.district}</span>
                     </Space>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* === MAP AREA === */}
        <div style={styles.mapContainer}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Vẽ đường đi */}
            {routeCoordinates && (
              <Polyline positions={routeCoordinates} color="#1890ff" weight={6} opacity={0.8}>
                {routeInfo && <LeafletTooltip sticky>{formatDistance(routeInfo.distance)} - {formatTime(routeInfo.duration)}</LeafletTooltip>}
              </Polyline> //sticky để tooltip luôn hiển thị khi rê chuột trên đường
            )}

            {/* Marker vị trí User */}
            {userGeoPosition && (
              <Marker position={userGeoPosition} icon={L.divIcon({
                  className: "user-pulse",
                  html: `<div style="background-color: #1890ff; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(24, 144, 255, 0.4);"></div>`,
                  iconSize: [20, 20],
                })}>
              </Marker>
            )}

            {/* Marker các trạm */}
            {filteredStations.map((s) => (
              <Marker key={s.id} position={[s.latitude, s.longitude]} ref={(ref) => (markerRefs.current[s.id] = ref)}>
                <Popup maxWidth={300} closeButton={true}>
                  <div style={styles.popupContent}>
                    {/* Header Popup */}
                    <div style={{ padding: "16px 16px 12px 16px", borderBottom: "1px solid #f0f0f0" }}>
                      <Title level={5} style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 700 }}>{s.name}</Title>
                      <div style={{ display: "flex", gap: "6px", alignItems: "start", marginTop: "6px" }}>
                        <EnvironmentOutlined style={{ marginTop: "3px", color: "#1890ff" }} />
                        <Text style={{ fontSize: "13px", color: "#555", lineHeight: 1.3 }}>{s.location}</Text>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "6px" }}>
                        <PhoneOutlined style={{ color: "#52c41a" }} />
                        <Text style={{ fontSize: "13px", color: "#555", fontWeight: 500 }}>{s.contactInfo}</Text>
                      </div>
                    </div>

                    {/* Body Popup (Progress bar) */}
                    <div style={{ padding: "16px", backgroundColor: "#fafafa" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "12px" }}>
                           <span style={{ color: "#888", textTransform: "uppercase", fontWeight: 600 }}>Trạng thái Pin</span>
                           <span style={{ fontWeight: 700, color: s.currentBatteryCount > 0 ? "#52c41a" : "#ff4d4f" }}>
                              {s.currentBatteryCount}/{s.capacity}
                           </span>
                        </div>
                        <Progress 
                          percent={(s.currentBatteryCount / s.capacity) * 100} 
                          showInfo={false} 
                          strokeColor={s.currentBatteryCount > 0 ? "#52c41a" : "#ff4d4f"} 
                          trailColor="#e8e8e8"
                          size="small"
                          style={{ marginBottom: 0 }}
                        />
                    </div>

                    {/* Footer Popup (Actions) */}
                    <div style={{ padding: "12px 16px", display: "flex", gap: "12px" }}>
                        <Button 
                          block 
                          onClick={() => handleDirectionsClick(s)}
                          disabled={!userGeoPosition}
                          style={{ borderColor: "#1890ff", color: "#1890ff" }}
                        >
                           <SendOutlined /> Chỉ đường
                        </Button>
                        
                        <Tooltip title={!selectedVehicle ? "Vui lòng chọn xe để đặt lịch" : selectedVehicleData?.status === "PENDING" ? "Xe chờ duyệt" : ""}>
                          <Button 
                            type="primary" 
                            block 
                            onClick={() => handleBookingClick(s)}
                            disabled={!selectedVehicle || selectedVehicleData?.status === "PENDING"}
                            style={{ background: "#1890ff", boxShadow: "0 2px 4px rgba(24,144,255,0.3)" }}
                          >
                             <CalendarOutlined /> Đặt lịch
                          </Button>
                        </Tooltip>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {selectedStation && <FlyToLocation position={[selectedStation.latitude, selectedStation.longitude]} />}
          </MapContainer>

          {/* Thông tin đường đi (Overlay) */}
          {routeInfo && (
            <div style={styles.routeInfoBox}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                 <span style={{ fontSize: "11px", opacity: 0.7, textTransform: "uppercase" }}>Thời gian</span>
                 <span style={{ fontSize: "16px", fontWeight: "bold", color: "#40a9ff" }}>{formatTime(routeInfo.duration)}</span>
              </div>
              <Divider type="vertical" style={{ height: "24px", borderColor: "rgba(255,255,255,0.2)" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                 <span style={{ fontSize: "11px", opacity: 0.7, textTransform: "uppercase" }}>Khoảng cách</span>
                 <span style={{ fontSize: "16px" }}>{formatDistance(routeInfo.distance)}</span>
              </div>
              <Button 
                type="text" 
                shape="circle" 
                icon={<WarningOutlined />} 
                onClick={clearRoute} 
                size="small" 
                style={{ marginLeft: "8px", color: "#ff7875" }}
              />
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default StationsNearby;
