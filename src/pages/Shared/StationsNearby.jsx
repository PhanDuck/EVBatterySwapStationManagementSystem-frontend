import React, { Fragment, useEffect, useState, useRef, useMemo } from "react";
// 🆕 Thêm Tooltip
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip } from "react-leaflet"; 
import { Select, Card, Spin, Button } from "antd";
import api from "../../config/axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const { Option } = Select;

// 🔴 Cấu hình OSRM
const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1"; 
const ROUTING_PROFILE = "driving"; 

// Custom Marker icon (Không đổi)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({

   iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",

});

// Component để focus map tới vị trí mới (Không đổi)
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14, { duration: 1.5 }); 
  }, [position]);
  return null;
}

// 🆕 Hàm tiện ích để định dạng
const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

const formatTime = (seconds) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} giờ ${remainingMinutes} phút`;
};


const StationsNearby = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  
  const [userGeoPosition, setUserGeoPosition] = useState(null); 
  const [mapCenter, setMapCenter] = useState([10.762622, 106.660172]); 
  
  const [routeCoordinates, setRouteCoordinates] = useState(null); 
  // 🆕 State mới để lưu thông tin đường đi
  const [routeInfo, setRouteInfo] = useState(null); 
  
  const markerRefs = useRef({});

  // ... (fetchStations useEffect giữ nguyên)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get("/station");
        setStations(res.data);
      } catch (err) {
        console.error("Lỗi khi tải trạm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // ... (Geolocation useEffect giữ nguyên)
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = [position.coords.latitude, position.coords.longitude];
          setUserGeoPosition(newPosition);
          setMapCenter(newPosition); 
        },
        (error) => {
          console.warn(`Lỗi Geolocation (${error.code}): ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.log("Trình duyệt không hỗ trợ Geolocation.");
    }
  }, []); 

  // 🆕 Cập nhật hàm tính toán đường đi
  const getRoute = async (origin, destination) => {
    setRouteCoordinates(null);
    setRouteInfo(null); // 🆕 Reset thông tin đường đi
    
    const start = `${origin[1]},${origin[0]}`; 
    const end = `${destination[1]},${destination[0]}`;
    
    const coordinates = `${start};${end}`;
    const url = `${OSRM_BASE_URL}/${ROUTING_PROFILE}/${coordinates}?overview=full&geometries=geojson`;

    try {
        const res = await fetch(url);
        
        if (!res.ok) {
            throw new Error(`OSRM API thất bại với status ${res.status}`);
        }

        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            
            // Lấy tọa độ
            const coordinatesList = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRouteCoordinates(coordinatesList);
            
            // 🆕 Lấy thông tin khoảng cách và thời gian
            setRouteInfo({
                distance: route.distance, // meters
                duration: route.duration, // seconds
            });

        } else {
            alert("Không tìm thấy tuyến đường.");
        }
        
    } catch (error) {
        console.error("Lỗi khi tính toán đường đi OSRM:", error);
        alert("Có lỗi khi tính toán đường đi. Vui lòng thử lại sau.");
    }
  };
  
  // Hàm xử lý khi bấm nút Chỉ Đường (Không đổi)
  const handleDirectionsClick = (station) => {
    if (!userGeoPosition) {
        alert("Vui lòng cho phép truy cập vị trí (Geolocation) để tính toán đường đi.");
        return;
    }
    
    setSelectedStation(station);
    getRoute(userGeoPosition, [station.latitude, station.longitude]);
    
    const ref = markerRefs.current[station.id];
    if (ref) ref.closePopup();
  }

  // Hàm xóa đường đi
  const clearRoute = () => {
    setRouteCoordinates(null);
    setRouteInfo(null); // 🆕 Xóa thông tin đường đi
    setSelectedStation(null);
  }

  // ... (useMemo cho cities, districts, filteredStations giữ nguyên)
  const cities = useMemo(() => {
    return [...new Set(stations.map((s) => s.city))];
  }, [stations]);

  const districts = useMemo(() => {
    return selectedCity
      ? [
          ...new Set(
            stations.filter((s) => s.city === selectedCity).map((s) => s.district)
          ),
        ]
      : [];
  }, [stations, selectedCity]);

  const filteredStations = useMemo(() => {
    return stations.filter(
      (s) =>
        (!selectedCity || s.city === selectedCity) &&
        (!selectedDistrict || s.district === selectedDistrict)
    );
  }, [stations, selectedCity, selectedDistrict]);


  if (loading) return <Spin tip="Đang tải dữ liệu trạm..." />;
  

  return (
    <Fragment>
      
      <div style={{ display: "flex", height: "90vh", gap: "1rem" }}>
        {/* Sidebar bộ lọc (Giữ nguyên) */}
        <Card title={<div style={{ fontSize: '24px', fontWeight: "bold", color: '#1890ff', textAlign: 'center', marginTop: '16px' }}> <h1>Hệ thống trạm</h1>
        </div>} style={{ width: 300 }}>
          
          {/* Select Thành phố (Giữ nguyên) */}
          <p><strong>Thành phố:</strong></p>
          <Select
            style={{ width: "100%", marginBottom: 10 }}
            placeholder="Chọn thành phố"
            allowClear
            onChange={(v) => {
              setSelectedCity(v);
              setSelectedDistrict(null);
              clearRoute();
            }}
          >
            {cities.map((city) => (
              <Option key={city} value={city}>
                {city}
              </Option>
            ))}
          </Select>
          
          {/* Select Quận / Huyện (Giữ nguyên) */}
          <p><strong>Quận / Huyện:</strong></p>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn quận / huyện"
            allowClear
            value={selectedDistrict}
            onChange={(v) => {
                setSelectedDistrict(v);
                clearRoute();
            }}
            disabled={!selectedCity}
          >
            {districts.map((d) => (
              <Option key={d} value={d}>
                {d}
              </Option>
            ))}
          </Select>

          {/* List trạm (Giữ nguyên) */}
          <p style={{ marginTop: 16 }}>
            <strong>Trạm hiện có:</strong> ({filteredStations.length})
          </p>
          <ul style={{ maxHeight: 300, overflowY: "auto", paddingLeft: 16 }}>
            {filteredStations.map((s) => (
              <li
                key={s.id}
                onClick={() => {
                    setSelectedStation(s);
                    setMapCenter([s.latitude, s.longitude]);
                    setTimeout(() => {
                        const ref = markerRefs.current[s.id];
                        if (ref) ref.openPopup();
                    }, 100);
                }}
                style={{
                  cursor: "pointer",
                  marginBottom: 8,
                  color: selectedStation?.id === s.id ? '#fa541c' : "#1890ff",
                  fontWeight: selectedStation?.id === s.id ? 'bold' : 'normal'
                }}
              >
                📍 {s.name} ({s.district})
              </li>
            ))}
          </ul>
          
          {/* Nút xóa đường đi */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
             <Button type="default" danger onClick={clearRoute} disabled={!routeCoordinates}>
                Xóa Chỉ Đường
            </Button>
            {/* 🆕 Hiển thị thông tin tổng quan dưới nút Xóa */}
            {routeInfo && (
                <p style={{ fontSize: '14px', marginTop: '10px', fontWeight: 'bold' }}>
                    Tổng: {formatDistance(routeInfo.distance)} ({formatTime(routeInfo.duration)})
                </p>
            )}
          </div>
          
        </Card>

        {/* Map */}
        <MapContainer
          center={mapCenter} 
          zoom={12}
          style={{ flex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 🔴 VẼ ĐƯỜNG ĐI (Polyline) */}
          {routeCoordinates && (
            <Polyline 
                positions={routeCoordinates} 
                color="#007bff" 
                weight={5} 
                opacity={0.8}
            >
                {/* 🆕 TOOLTIP HIỂN THỊ THÔNG TIN ĐƯỜNG ĐI */}
                {routeInfo && (
                    <Tooltip 
                        direction="center" // Đặt Tooltip ở giữa đường
                        permanent={true}   // Luôn hiển thị
                        className="route-tooltip"
                    >
                        {formatDistance(routeInfo.distance)} | {formatTime(routeInfo.duration)}
                    </Tooltip>
                )}
            </Polyline>
          )}

          {/* Marker cho vị trí người dùng (Geolocation) */}
          {userGeoPosition && (
            <Marker
              position={userGeoPosition}
              icon={L.divIcon({
                className: 'user-geo-icon',
                html: '<div style="background-color: #007bff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>', 
                iconSize: [20, 20],
              })}
            >
              <Popup>
                <strong>📍 Vị trí của bạn</strong> <br/> (Điểm bắt đầu chỉ đường)
              </Popup>
            </Marker>
          )}

          {selectedStation && (
            <FlyToLocation
              position={[selectedStation.latitude, selectedStation.longitude]}
            />
          )}

          {/* Markers Trạm */}
          {filteredStations.map((s) => (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              ref={(ref) => (markerRefs.current[s.id] = ref)}
            >
              <Popup>
                <strong>{s.name}</strong> <br />
                📍 {s.location} <br />
                ☎️ {s.contactInfo} <br />⚡ Pin hiện có: {s.currentBatteryCount}{" "}
                / {s.capacity}
                
                {/* NÚT CHỈ ĐƯỜNG TRONG POPUP */}
                <div style={{ marginTop: '8px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                    <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleDirectionsClick(s)}
                        disabled={!userGeoPosition}
                    >
                        {userGeoPosition ? "Chỉ Đường Đến Đây" : "Đang chờ vị trí..."}
                    </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Fragment>
  );
};

export default StationsNearby;