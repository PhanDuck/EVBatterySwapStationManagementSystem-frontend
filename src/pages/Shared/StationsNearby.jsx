import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import { Select, Spin, Button, Space, Tag, Typography, List, Avatar, Tooltip, Progress, Card } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, CalendarOutlined, CarOutlined, ThunderboltFilled, EnvironmentOutlined, SendOutlined, UserOutlined, WarningOutlined } from "@ant-design/icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../config/axios"; 

const { Option } = Select;
const { Title, Text } = Typography;

// --- 1. CONFIG & CONSTANTS ---
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

// Fix icon Leaflet không hiện
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// --- 2. SUB-COMPONENTS ---

const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 15, { duration: 1.5 }); }, [position, map]);
  return null;
};

const StationSidebar = ({ 
  visible, onClose, vehicles, selectedVehicleId, onSelectVehicle, 
  cities, districts, selectedCity, onSelectCity, selectedDistrict, onSelectDistrict,
  stations, selectedStationId, onSelectStation, routeInfo, onClearRoute 
}) => {
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicleId);
  if (!visible) return null;

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Title level={4} style={{ margin: 0 }}>Trạm Đổi Pin</Title>
          <Button type="text" icon={<MenuFoldOutlined />} onClick={onClose} />
        </div>
      </div>

      <div style={styles.sidebarContent}>
        {/* Chọn xe */}
        <div style={{ padding: 24, paddingBottom: 0 }}>
          {vehicles.length > 0 ? (
             <>
               <Select style={{ width: "100%", marginBottom: 16 }} value={selectedVehicleId} onChange={onSelectVehicle} placeholder="Chọn xe của bạn">
                 {vehicles.map(v => <Option key={v.id} value={v.id}>{v.model} - {v.plateNumber}</Option>)}
               </Select>
               {selectedVehicleData && (
                 <Card size="small" style={{ background: "#1890ff", color: "white", borderRadius: 12, marginBottom: 24 }} bordered={false}>
                    <Space align="center" style={{width: '100%', justifyContent: 'space-between'}}>
                        <Space><CarOutlined /> <Text strong style={{color: 'white'}}>{selectedVehicleData.model}</Text></Space>
                        <Tag color={selectedVehicleData.status === "PENDING" ? "warning" : "success"}>{selectedVehicleData.status === "PENDING" ? "CHỜ DUYỆT" : "ACTIVE"}</Tag>
                    </Space>
                 </Card>
               )}
             </>
          ) : (
            <Card size="small" style={{ background: "#8c8c8c", color: "white", marginBottom: 24 }}>
               <Space><UserOutlined /> Chế độ tự do (Xem tất cả các trạm)</Space>
            </Card>
          )}

          {/* Bộ lọc */}
          <Text strong style={{ fontSize: 12, color: "#888" }}>KHU VỰC</Text>
          <Space.Compact block style={{ marginTop: 8, marginBottom: 24 }}>
             <Select style={{ width: "50%" }} placeholder="Tỉnh/TP" allowClear onChange={onSelectCity} value={selectedCity}>
               {cities.map(c => <Option key={c} value={c}>{c}</Option>)}
             </Select>
             <Select style={{ width: "50%" }} placeholder="Quận/Huyện" allowClear onChange={onSelectDistrict} value={selectedDistrict} disabled={!selectedCity}>
               {districts.map(d => <Option key={d} value={d}>{d}</Option>)}
             </Select>
          </Space.Compact>

           {routeInfo && (
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
                 <Text strong>Kết quả: {stations.length}</Text>
                 <Button type="link" danger size="small" onClick={onClearRoute}>Xóa chỉ đường</Button>
              </div>
           )}
        </div>

        {/* Danh sách trạm */}
        <List
          dataSource={stations}
          renderItem={item => (
            <List.Item 
              style={{ ...styles.listItem, backgroundColor: selectedStationId === item.id ? "#e6f7ff" : "white" }}
              onClick={() => onSelectStation(item)}
            >
              <List.Item.Meta
                avatar={<Avatar shape="square" size={40} icon={<ThunderboltFilled />} style={{ backgroundColor: item.currentBatteryCount > 0 ? "#f6ffed" : "#fff1f0", color: item.currentBatteryCount > 0 ? "#52c41a" : "#f5222d" }} />}
                title={<Text strong>{item.name}</Text>}
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.location}</Text> <br/>
                    <Text type="success" style={{ fontSize: 12 }}>{item.currentBatteryCount} pin khả dụng</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

// --- 3. MAIN COMPONENT ---
const StationsNearby = () => {
  const navigate = useNavigate();
  const markerRefs = useRef({});

  // States
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [filterCity, setFilterCity] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [userPos, setUserPos] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]); // Mặc định HCM
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);


  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      
      // 1. Lấy vị trí User trước 
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLoc = [pos.coords.latitude, pos.coords.longitude];
            setUserPos(userLoc);
            setMapCenter(userLoc);
          },
          (err) => console.warn("Không lấy được vị trí", err)
        );
      }

      try {
        // 2. Load Station (QUAN TRỌNG: Phải chạy được cái này)
        console.log("Đang load trạm...");
        const resStation = await api.get("/station");
        setStations(resStation.data || []);

        // 3. Load Vehicles (Nếu lỗi 401/403 thì kệ nó, vẫn hiện map)
        try {
            console.log("Đang load xe...");
            const resVehicle = await api.get("/vehicle/my-vehicles");
            const vData = resVehicle.data || [];
            setVehicles(vData);
            if (vData.length > 0) setSelectedVehicle(vData[0].id);
        } catch (vErr) {
            console.warn("User chưa login hoặc lỗi lấy xe:", vErr);
            setVehicles([]); // Coi như khách vãng lai
        }

      } catch (err) {
        console.error("Lỗi Fatal khi load dữ liệu:", err);
        // Có thể show toast lỗi ở đây
      } finally {
        setLoading(false); // Luôn tắt loading dù thành công hay thất bại
      }
    };

    initData();
  }, []);

  // Logic Filter & Memo
  const currentVehicleData = useMemo(() => vehicles.find(v => v.id === selectedVehicle), [vehicles, selectedVehicle]);
  const compatibleStations = useMemo(() => {
    if (!currentVehicleData) return stations;
    return stations.filter(s => s.batteryTypeId === currentVehicleData.batteryTypeId);
  }, [stations, currentVehicleData]);

  const displayStations = useMemo(() => {
    return compatibleStations.filter(s => 
      (!filterCity || s.city === filterCity) && 
      (!filterDistrict || s.district === filterDistrict)
    );
  }, [compatibleStations, filterCity, filterDistrict]);

  const cities = useMemo(() => [...new Set(compatibleStations.map(s => s.city))], [compatibleStations]);
  const districts = useMemo(() => filterCity ? [...new Set(compatibleStations.filter(s => s.city === filterCity).map(s => s.district))] : [], [compatibleStations, filterCity]);

  // Actions
  const handleSelectStation = (station) => {
    setSelectedStation(station);
    setMapCenter([station.latitude, station.longitude]);
    setTimeout(() => markerRefs.current[station.id]?.openPopup(), 100);
  };

  const handleGetDirection = async (station) => {
    if (!userPos) return alert("Cần bật định vị!");
    setSelectedStation(station);
    markerRefs.current[station.id]?.closePopup();
    
    const url = `${OSRM_URL}/${userPos[1]},${userPos[0]};${station.longitude},${station.latitude}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url).then(r => r.json());
      if (res.routes?.[0]) {
        const route = res.routes[0];
        setRouteCoords(route.geometry.coordinates.map(c => [c[1], c[0]]));
        setRouteInfo({ dist: route.distance, dur: route.duration });
      }
    } catch (e) { console.error(e); }
  };

  const handleBooking = (station) => {
    navigate(`/stations/booking?vehicleId=${selectedVehicle}&stationId=${station.id}`);
  };

  const clearRoute = () => {
    setRouteCoords(null);
    setRouteInfo(null);
    setMapCenter(userPos || mapCenter);
  };

  if (loading) return <div style={styles.center}><Spin size="large" tip="Đang tải bản đồ..." /></div>;

  return (
    <div style={styles.container}>
      {/* Nút mở Sidebar khi bị đóng */}
      {!isSidebarOpen && (
        <Button 
          icon={<MenuUnfoldOutlined />} 
          size="large"
          onClick={() => setIsSidebarOpen(true)}
          style={styles.floatingButton}
        />
      )}

      {/* Sidebar */}
      <StationSidebar 
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        
        vehicles={vehicles}
        selectedVehicleId={selectedVehicle}
        onSelectVehicle={(id) => { setSelectedVehicle(id); clearRoute(); }}
        
        cities={cities}
        districts={districts}
        selectedCity={filterCity}
        onSelectCity={(c) => { setFilterCity(c); setFilterDistrict(null); }}
        selectedDistrict={filterDistrict}
        onSelectDistrict={setFilterDistrict}
        
        stations={displayStations}
        selectedStationId={selectedStation?.id}
        onSelectStation={handleSelectStation}
        
        routeInfo={routeInfo}
        onClearRoute={clearRoute}
      />

      {/* Map */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
          <FlyToLocation position={mapCenter} />

          {routeCoords && <Polyline positions={routeCoords} color="#1890ff" weight={6} />}

          {userPos && (
             <Marker position={userPos} icon={L.divIcon({ className: "user-pulse", html: '<div style="background:#1890ff;width:16px;height:16px;border-radius:50%;border:2px solid white"></div>' })} />
          )}

          {displayStations.map(s => (
            <Marker key={s.id} position={[s.latitude, s.longitude]} ref={r => markerRefs.current[s.id] = r}>
              <Popup maxWidth={280}>
                <div style={{ padding: 8 }}>
                   <Title level={5}>{s.name}</Title>
                   <Text type="secondary"><EnvironmentOutlined /> {s.location}</Text>
                   <div style={{ margin: "12px 0" }}>
                      <Progress percent={(s.currentBatteryCount/s.capacity)*100} showInfo={false} strokeColor={s.currentBatteryCount > 0 ? "#52c41a" : "#f5222d"} />
                      <div style={{display:'flex', justifyContent:'space-between', fontSize: 12}}>
                         <span>Pin sẵn có: <b>{s.currentBatteryCount}</b></span>
                      </div>
                   </div>
                   <Space style={{ width: "100%" }}>
                      <Button block icon={<SendOutlined />} onClick={() => handleGetDirection(s)} disabled={!userPos}>Chỉ đường</Button>
                      <Tooltip title={!selectedVehicle ? "Chọn xe trước" : currentVehicleData?.status === "PENDING" ? "Xe chưa duyệt" : ""}>
                         <Button type="primary" block icon={<CalendarOutlined />} 
                           onClick={() => handleBooking(s)} 
                           disabled={!selectedVehicle || currentVehicleData?.status === "PENDING"}
                         >Đặt lịch</Button>
                      </Tooltip>
                   </Space>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {routeInfo && (
           <div style={styles.routeOverlay}>
              <Text strong style={{color:'white', fontSize: 16}}>
                 {(routeInfo.dist / 1000).toFixed(1)} km - {Math.round(routeInfo.dur / 60)} phút
              </Text>
              <Button type="text" icon={<WarningOutlined style={{color: '#ff4d4f'}} />} onClick={clearRoute} />
           </div>
        )}
      </div>
      <GlobalStyle />
    </div>
  );
};

// --- 4. STYLES ---
const styles = {
  container: { 
    display: "flex", 
    height: "100vh",
    overflow: "hidden",
    position: "relative" 
  },
  center: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  sidebar: { 
    width: 400, 
    background: "white", 
    borderRight: "1px solid #ddd", 
    display: "flex", 
    flexDirection: "column", 
    zIndex: 100, 
    boxShadow: "2px 0 8px rgba(0,0,0,0.1)"
  },
  sidebarHeader: { padding: 16, borderBottom: "1px solid #f0f0f0" },
  sidebarContent: { flex: 1, overflowY: "auto" },
  listItem: { padding: "12px 24px", cursor: "pointer", transition: "0.2s" },
  routeOverlay: {
    position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.8)', padding: '8px 20px', borderRadius: 30,
    zIndex: 900, display: 'flex', alignItems: 'center', gap: 10
  },
  floatingButton: {
    position: "absolute",
    top: 24,
    left: 24,
    zIndex: 1001,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
  }
};

const GlobalStyle = () => (
  <style>{`
    .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; }
    .leaflet-popup-content { margin: 0 !important; width: 100% !important; }
  `}</style>
);

export default StationsNearby;