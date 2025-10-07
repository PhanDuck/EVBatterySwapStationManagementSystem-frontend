import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../components/navbar/navBar";

// 🚀 Imports MapLibre GL (react-map-gl/maplibre)
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css'; 

// Import api (axios)
import api from "../config/axios"; 

// =========================================================================
// CẤU HÌNH MAPLIBRE VÀ API KEYS
// =========================================================================
// Style URL của MapTiler, đã thay đổi để tương thích MapLibre GL
const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets/style.json?key=dLerqVLBxqMwQhX8dbac`; 

const containerStyle = { width: '100%', height: '70vh', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' };
// Tọa độ gốc (Home/Base - FPT)
const FPT_SAIGON = { lat: 10.841127, lng: 106.809866 };

// 🔑 API Key của OpenRouteService
const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImY1MTNiMzM0OTdhZDQ0Mjk5OGI2MWZjMzU1MzJmYmRhIiwiaCI6Im11cm11cjY0In0=";

// Định nghĩa Style cho Polyline (Đường đi)
const polylineLayerStyle = {
    id: 'route-line',
    type: 'line',
    paint: {
        'line-color': '#2563eb',
        'line-width': 5,
        'line-opacity': 0.85,
    },
};

// =========================================================================
// 🎨 COMPONENT PIN MARKER (Lấy từ code phiên bản 1, có thêm logic)
// =========================================================================
const PinMarker = ({ color, capacity = null, isOrigin = false }) => {
    // Kích thước của phần hình tròn trên pin
    const size = isOrigin ? 20 : 28; 
    
    return (
        <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
        }}>
            {/* Thân Marker (Hình tròn/elip) */}
            <div style={{
                width: size,
                height: size,
                borderRadius: '50% 50% 50% 0', // Tạo hình dạng giọt nước đơn giản
                backgroundColor: color,
                boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                transform: 'rotate(-45deg)', // Xoay để tạo hình mũi nhọn hướng xuống
                border: '1px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: -3, // Kéo lên để phần mũi nhọn chạm đúng tọa độ
            }}>
                {/* Text hoặc icon bên trong */}
                {capacity && (
                    <span style={{ 
                        transform: 'rotate(45deg)', // Xoay ngược lại để text thẳng
                        color: 'white',
                        fontWeight: 700,
                        fontSize: isOrigin ? 12 : 10
                    }}>
                        {capacity}
                    </span>
                )}
            </div>
        </div>
    );
};

// =========================================================================
// HÀM FORMAT VÀ XỬ LÝ TỌA ĐỘ
// =========================================================================
const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? h + ' giờ ' : ''}${m} phút`;
};

const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
};

const parseCoordinate = (text) => {
    const parts = text.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // Giả định người dùng nhập (lat, lng)
        return { lat: parts[0], lng: parts[1] };
    }
    return null;
};


// =========================================================================
// COMPONENT CHÍNH
// =========================================================================
function StationsNearbyPage() {
    const center = useMemo(() => FPT_SAIGON, []);

    // 1. STATE DỮ LIỆU
    const [stations, setStations] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. STATE ROUTING
    const [selectedStationName, setSelectedStationName] = useState("");
    const [currentOrigin, setCurrentOrigin] = useState(FPT_SAIGON); // Thêm state Origin
    const [originText, setOriginText] = useState(""); // Thêm state Origin Input Text
    
    const [routeGeoJSON, setRouteGeoJSON] = useState(null); 
    const [routeLoading, setRouteLoading] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null); 
    const [routeError, setRouteError] = useState(null);
    
    // 3. STATE VIEWPORT/MAP
    const [viewState, setViewState] = useState({
        longitude: FPT_SAIGON.lng,
        latitude: FPT_SAIGON.lat,
        zoom: 12
    });
    
    // 4. STATE POPUP
    const [popupInfo, setPopupInfo] = useState(null); 
    
    const currentStation = useMemo(() => stations.find(s => s.name === selectedStationName) || null, [selectedStationName, stations]);


    // =========================================================================
    // HÀM GỌI API TRẠM (Logic xử lý tọa độ được giữ nguyên từ code cũ của bạn)
    // =========================================================================
    useEffect(() => {
        const fetchAllStations = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await api.get('/station'); 
                
                const mappedStations = (response.data || [])
                    .map(s => {
                        // 🛑 TỌA ĐỘ: Giữ nguyên logic lat/lng của bạn
                        let lat = parseFloat(s.latitude); 
                        let lng = parseFloat(s.longitude); 
                        
                        if (isNaN(lat) || isNaN(lng) || lat < 8 || lat > 24 || lng < 102 || lng > 110) {
                            console.warn(`Trạm "${s.name}" bị bỏ qua: Tọa độ ngoài phạm vi VN hoặc không hợp lệ.`);
                            return null;
                        }

                        lat = parseFloat(lat.toFixed(6));
                        lng = parseFloat(lng.toFixed(6));
                        
                        return {
                            ...s,
                            lat, 
                            lng,
                            id: s.id || s.name, 
                            name: s.name.replace(/Station \d+ - /, '').trim(), 
                            status: s.status || 'Active', 
                            capacity: s.capacity || 80, 
                            location: s.address || `Lat: ${lat}, Lng: ${lng}`
                        };
                    })
                    .filter(s => s !== null);

                setStations(mappedStations); 
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu các trạm:", err);
                setError(err.message || "Không thể kết nối đến API.");
                setStations([]); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllStations();
    }, []); 

    // =========================================================================
    // HÀM GỌI API ORS
    // =========================================================================
    const fetchRouteORS_Internal = async ({ start, end }) => {
        const startLngLat = `${start.lng},${start.lat}`; 
        const endLngLat = `${end.lng},${end.lat}`;
        
        const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${startLngLat}&end=${endLngLat}`; 
        
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, application/geo+json', 
                    'Authorization': ORS_API_KEY, 
                    'Content-Type': 'application/json',
                    // Thêm headers này để khắc phục lỗi CORS nếu cần thiết
                    'Origin': 'http://localhost:5173', 
                    'Referer': 'http://localhost:5173/', 
                },
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Routing failed with status ${res.status}: ${errorText.substring(0, 100)}`);
            }

            const data = await res.json();
            const feature = data.features?.[0];
            const geometry = feature?.geometry;
            const summary = feature?.properties?.summary;
            
            if (!geometry || !summary) {
                throw new Error("Không tìm thấy dữ liệu đường đi.");
            }
            
            return {
                routeGeo: data, // GIỮ NGUYÊN GeoJSON gốc [lng, lat]
                distance: summary.distance,
                duration: summary.duration,
            };
        } catch (error) {
            throw new Error(`Lỗi gọi API ORS: ${error.message}`);
        }
    };
    
    // Hàm gọi routing chính
    const buildRoute = async (startPoint, endStation) => {
        setRouteInfo(null);
        setRouteGeoJSON(null);
        setRouteError(null);
        
        if (!endStation) return; 
        if (ORS_API_KEY === "YOUR_ORS_KEY_HERE" || !ORS_API_KEY) {
            setRouteError("Vui lòng thay thế ORS_API_KEY bằng Key OpenRouteService của bạn.");
            return;
        }

        setRouteLoading(true);
        try {
            const result = await fetchRouteORS_Internal({ 
                start: startPoint, 
                end: { lat: endStation.lat, lng: endStation.lng } 
            });

            if (result && result.routeGeo) {
                setRouteGeoJSON(result.routeGeo);
                setRouteInfo({
                    distance: formatDistance(result.distance),
                    duration: formatDuration(result.duration)
                });
                
                // Cập nhật view để bao quát tuyến đường
                const routeCoords = result.routeGeo.features[0].geometry.coordinates;
                if (routeCoords.length > 0) {
                    const middleIndex = Math.floor(routeCoords.length / 2);
                    const [lng, lat] = routeCoords[middleIndex];
                    setViewState(prev => ({ ...prev, longitude: lng, latitude: lat, zoom: 12, transitionDuration: 1000 }));
                }

            } else {
                setRouteError(`Không tìm thấy tuyến đường khả dụng từ ORS.`);
            }
        } catch(error) {
            console.error("Lỗi khi tìm đường:", error.message);
            setRouteError(`Lỗi API tìm đường: ${error.message}`);
        } finally {
            setRouteLoading(false);
        }
    };
    
    // Xử lý khi nhấn nút Tìm đường (Hoặc khi chọn trạm)
    const handleFindRoute = () => {
        const parsedOrigin = parseCoordinate(originText);
        let startPoint = FPT_SAIGON;

        if (originText.trim() === "") {
            startPoint = FPT_SAIGON;
        } else if (parsedOrigin) {
            startPoint = parsedOrigin;
        } else {
            setRouteError("Vui lòng nhập Tọa độ hợp lệ (lat, lng).");
            setRouteGeoJSON(null);
            setRouteInfo(null);
            return;
        }
        
        setCurrentOrigin(startPoint);
        if (currentStation) {
            buildRoute(startPoint, currentStation);
        }
    };
    
    // 🎯 useEffect TỰ ĐỘNG GỌI TÌM ĐƯỜNG
    useEffect(() => { 
        if (selectedStationName && currentStation) {
            handleFindRoute();
        } else {
            setRouteGeoJSON(null);
            setRouteInfo(null);
            setRouteError(null);
            setPopupInfo(null);
            // Reset center về FPT
            setViewState(prev => ({ ...prev, longitude: FPT_SAIGON.lng, latitude: FPT_SAIGON.lat, zoom: 12, transitionDuration: 500 })); 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStationName, stations]); // Chỉ chạy khi chọn trạm hoặc khi stations được load


    // =========================================================================
    // UI RENDER
    // =========================================================================
    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}><p>Đang tải dữ liệu trạm...</p></div>;
    }
    if (error) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: '8px', background: '#fef2f2' }}><p>Lỗi tải dữ liệu trạm: {error}</p></div>;
    }
    
    return (
        <div>
            <NavBar />
            <main style={{ maxWidth: 1200, margin: '24px auto', padding: '0 20px' }}>
                
                <header style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Mạng lưới đổi Pin</h1>
                    <div style={{ fontSize: 36, fontWeight: 800, color: '#1e3a8a' }}>{stations.length}</div>
                    <p style={{ color: '#64748b' }}>và đang phát triển nhanh.</p>
                </header>

                {/* KHU VỰC TÌM ĐƯỜNG */}
                <div style={{ marginBottom: 12, border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: '#f8fafc' }}>
                    <h3 style={{ marginBottom: 10, fontSize: 18, fontWeight: 600, color: '#1e3a8a' }}>Tìm đường đến Trạm</h3>


                    <div style={{ display: 'flex', gap: 12 }}>
                        <select style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, flex: 1, background: '#fff' }} 
           
                            value={selectedStationName} onChange={(e) => setSelectedStationName(e.target.value)} 
                            disabled={isLoading || error}
                        >
                            <option value="">
                                {isLoading ? 'Đang tải trạm...' : 'Chọn Trạm Đích'}
                            </option>
                            {stations.map((s) => (
                                <option key={s.id} value={s.name}>{s.name} - ({s.capacity} pin)</option> 
                            ))}
                        </select>
                    </div>
                </div>

                {/* HIỂN THỊ THÔNG TIN ĐƯỜNG ĐI */}
                {routeLoading && selectedStationName && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#4f46e5', fontWeight: 500 }}>
                        Đang tìm đường đi từ {(originText && parseCoordinate(originText)) ? originText : "FPT"} đến {selectedStationName}...
                    </div>
                )}
                {routeInfo && !routeLoading && (
                    <div style={{ padding: '10px', marginBottom: '12px', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#4f46e5' }}>
                            Đường đi đến {selectedStationName}
                        </p>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#3730a3' }}>
                            {routeInfo.distance} ({routeInfo.duration})
                        </p>
                    </div>
                )}
                {routeError && selectedStationName && !routeLoading && (
                    <div style={{ textAlign: 'center', padding: '10px', color: '#dc2626', fontWeight: 500, background: '#fee2e2', borderRadius: '8px', marginBottom: '12px' }}>
                        {routeError}
                    </div>
                )}


                <div>
                    <Map
                        {...viewState}
                        onMove={evt => setViewState(evt.viewState)}
                        style={containerStyle}
                        mapStyle={MAPTILER_STYLE_URL}
                    >
                        {/* 1. Marker cho điểm xuất phát (Start Point) */}
                        <Marker 
                            longitude={currentOrigin.lng} 
                            latitude={currentOrigin.lat} 
                            anchor="bottom" 
                        >
                            <PinMarker color="#1e3a8a" capacity="S" isOrigin={true} />
                        </Marker>

                        {/* 2. Marker cho các Trạm Pin */}
                        {stations.map((s) => (
                            <Marker 
                                key={s.id} 
                                longitude={s.lng} 
                                latitude={s.lat} 
                                anchor="bottom" 
                                onClick={e => {
                                    e.originalEvent.stopPropagation(); 
                                    setPopupInfo(s);
                                }}
                            >
                                <PinMarker 
                                    color={selectedStationName === s.name ? "#ef4444" : "#10b981"} // Đỏ khi được chọn
                                    capacity={s.capacity}
                                    isOrigin={false}
                                />
                            </Marker>
                        ))}
                        
                        {/* 🛑 POPUP HIỂN THỊ THÔNG TIN TRẠM SẠC */}
                        {popupInfo && (
                            <Popup
                                longitude={popupInfo.lng}
                                latitude={popupInfo.lat}
                                closeButton={true}
                                closeOnClick={false}
                                onClose={() => setPopupInfo(null)} 
                                anchor="bottom" 
                            >
                                <div style={{ minWidth: 180, padding: 5 }}>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 5px 0', color: '#1e3a8a' }}>
                                        {popupInfo.name}
                                    </h4>
                                    <p style={{ margin: '0 0 2px 0', fontSize: 13, color: '#444' }}>
                                        Vị trí: **{popupInfo.location}**
                                    </p>
                                    <p style={{ margin: '0 0 5px 0', fontSize: 13, fontWeight: 600, color: '#10b981' }}>
                                        Dung lượng: **{popupInfo.capacity}** pin
                                    </p>
                                    <button 
                                        onClick={() => {
                                            setSelectedStationName(popupInfo.name);
                                            setPopupInfo(null); 
                                            // Chức năng tìm đường sẽ tự động chạy trong useEffect khi selectedStationName thay đổi
                                        }}
                                        style={{ 
                                            padding: '5px 10px', 
                                            background: '#2563eb', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: 4, 
                                            fontSize: 12,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Chọn làm Trạm Đích
                                    </button>
                                </div>
                            </Popup>
                        )}


                        {/* 3. Lớp hiển thị Đường đi (Route) */}
                        {routeGeoJSON && (
                            <Source id="route-data" type="geojson" data={routeGeoJSON}>
                                <Layer {...polylineLayerStyle} />
                            </Source>
                        )}
                        
                    </Map>
                </div>
            </main>
        </div>
    );
}

export default StationsNearbyPage;
