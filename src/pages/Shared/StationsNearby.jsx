// import React, { useEffect, useMemo, useState } from "react";
// import NavBar from "../../components/navbar/navBar";
// import Map, { Marker, Popup, Source, Layer } from "react-map-gl/maplibre";
// import "maplibre-gl/dist/maplibre-gl.css";
// import api from "../../config/axios";
// import NearestStation from "../../components/Shared/NearestStation";

// const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets/style.json?key=CLD54Ny17919txndKdiP`;
// const containerStyle = {
//   width: "100%",
//   height: "70vh",
//   borderRadius: 12,
//   overflow: "hidden",
//   boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
// };
// // Tọa độ gốc (Home/Base - FPT)
// const FPT_SAIGON = { lat: 10.841127, lng: 106.809866 };
// const ORS_API_KEY =
//   "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImY1MTNiMzM0OTdhZDQ0Mjk5OGI2MWZjMzU1MzJmYmRhIiwiaCI6Im11cm11cjY0In0=";

// // Định nghĩa Style cho Polyline (Đường đi)
// const polylineLayerStyle = {
//   id: "route-line",
//   type: "line",
//   paint: {
//     "line-color": "#2563eb",
//     "line-width": 5,
//     "line-opacity": 0.85,
//   },
// };

// const PinMarker = ({ color, capacity = null, isOrigin = false }) => {
//   const size = isOrigin ? 20 : 28;

//   return (
//     <div
//       style={{
//         position: "relative",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         cursor: "pointer",
//       }}
//     >
//       {/* Thân Marker (Hình tròn/elip) */}
//       <div
//         style={{
//           width: size,
//           height: size,
//           borderRadius: "50% 50% 50% 0", // Tạo hình dạng giọt nước đơn giản
//           backgroundColor: color,
//           boxShadow: "0 0 5px rgba(0,0,0,0.3)",
//           transform: "rotate(-45deg)", // Xoay để tạo hình mũi nhọn hướng xuống
//           border: "1px solid #fff",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           marginBottom: -3, // Kéo lên để phần mũi nhọn chạm đúng tọa độ
//         }}
//       >
//         {/* Text hoặc icon bên trong */}
//         {capacity && (
//           <span
//             style={{
//               transform: "rotate(45deg)", // Xoay ngược lại để text thẳng
//               color: "white",
//               fontWeight: 700,
//               fontSize: isOrigin ? 12 : 10,
//             }}
//           >
//             {capacity}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };

// // =========================================================================
// // HÀM FORMAT VÀ XỬ LÝ TỌA ĐỘ
// // =========================================================================
// const formatDuration = (seconds) => {
//   const h = Math.floor(seconds / 3600);
//   const m = Math.floor((seconds % 3600) / 60);
//   return `${h > 0 ? h + " giờ " : ""}${m} phút`;
// };

// const formatDistance = (meters) => {
//   if (meters < 1000) return `${Math.round(meters)} m`;
//   return `${(meters / 1000).toFixed(1)} km`;
// };

// const parseCoordinate = (text) => {
//   const parts = text.split(",").map((p) => parseFloat(p.trim()));
//   if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
//     // Giả định người dùng nhập (lat, lng)
//     return { lat: parts[0], lng: parts[1] };
//   }
//   return null;
// };

// // COMPONENT CHÍNH

// function StationsNearbyPage() {
//   // using FPT_SAIGON directly as default center

//   // 1. STATE DỮ LIỆU
//   const [stations, setStations] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // 2. STATE ROUTING
//   const [selectedStationName, setSelectedStationName] = useState("");
//   const [currentOrigin, setCurrentOrigin] = useState(); // Thêm state Origin
//   const [originText] = useState(""); // read-only origin text for now

//   const [routeGeoJSON, setRouteGeoJSON] = useState(null);
//   const [routeLoading, setRouteLoading] = useState(false);
//   const [routeInfo, setRouteInfo] = useState(null);
//   const [routeError, setRouteError] = useState(null);

//   // 3. STATE VIEWPORT/MAP
//   const [viewState, setViewState] = useState({
//     longitude: FPT_SAIGON.lng,
//     latitude: FPT_SAIGON.lat,
//     zoom: 12,
//   });

//   // 4. STATE POPUP
//   const [popupInfo, setPopupInfo] = useState(null);

//   const currentStation = useMemo(
//     () => stations.find((s) => s.name === selectedStationName) || null,
//     [selectedStationName, stations]
//   );

//   // =========================================================================
//   // HÀM LẤY VỊ TRÍ NGƯỜI DÙNG (NẾU CẦN)
//   // =========================================================================
//   const [userLocation, setUserLocation] = useState(null); // { latitude, longitude }
//   const getUserLocation = () => {
//     // if geolocation is supported by the users browser
//     if (navigator.geolocation) {
//       // get the current users location
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           // save the geolocation coordinates in two variables
//           const { latitude, longitude } = position.coords;
//           // update the value of userlocation variable — store both shapes to be safe
//           setUserLocation({
//             latitude,
//             longitude,
//             lat: latitude,
//             lng: longitude,
//           });
//           setCurrentOrigin({ lat: latitude, lng: longitude });
//         },
//         // if there was an error getting the users location
//         (error) => {
//           console.error("Error getting user location:", error);
//         }
//       );
//     }
//     // if geolocation is not supported by the users browser
//     else {
//       console.error("Geolocation is not supported by this browser.");
//     }
//   };

//   // =========================================================================
//   // HÀM GỌI API TRẠM (Logic xử lý tọa độ được giữ nguyên từ code cũ của bạn)
//   // =========================================================================
//   useEffect(() => {
//     const fetchAllStations = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);

//         const response = await api.get("/station");

//         const mappedStations = (response.data || [])
//           .map((s) => {
//             // 🛑 TỌA ĐỘ: Giữ nguyên logic lat/lng của bạn
//             let lat = parseFloat(s.latitude);
//             let lng = parseFloat(s.longitude);

//             if (
//               isNaN(lat) ||
//               isNaN(lng) ||
//               lat < 8 ||
//               lat > 24 ||
//               lng < 102 ||
//               lng > 110
//             ) {
//               console.warn(
//                 `Trạm "${s.name}" bị bỏ qua: Tọa độ ngoài phạm vi VN hoặc không hợp lệ.`
//               );
//               return null;
//             }

//             lat = parseFloat(lat.toFixed(6));
//             lng = parseFloat(lng.toFixed(6));

//             return {
//               ...s,
//               lat,
//               lng,
//               id: s.id || s.name,
//               name: s.name.replace(/Station \d+ - /, "").trim(),
//               status: s.status || "Active",
//               capacity: s.capacity || 80,
//               location: s.address || `Lat: ${lat}, Lng: ${lng}`,
//             };
//           })
//           .filter((s) => s !== null);

//         setStations(mappedStations);
//       } catch (err) {
//         console.error("Lỗi khi tải dữ liệu các trạm:", err);
//         setError(err.message || "Không thể kết nối đến API.");
//         setStations([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchAllStations();
//     getUserLocation();
//   }, []);

//   // =========================================================================
//   // HÀM GỌI API ORS
//   // =========================================================================
//   const fetchRouteORS = async ({ start, end }) => {
//     const startLngLat = `${start.lng},${start.lat}`;
//     const endLngLat = `${end.lng},${end.lat}`;

//     const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${startLngLat}&end=${endLngLat}`;

//     try {
//       const res = await fetch(url, {
//         method: "GET",
//         headers: {
//           Accept: "application/json, application/geo+json",
//           Authorization: ORS_API_KEY,
//           "Content-Type": "application/json",
//           // Thêm headers này để khắc phục lỗi CORS nếu cần thiết
//           Origin: "http://localhost:5173",
//           Referer: "http://localhost:5173/",
//         },
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         throw new Error(
//           `Routing failed with status ${res.status}: ${errorText.substring(
//             0,
//             100
//           )}`
//         );
//       }

//       const data = await res.json();
//       const feature = data.features?.[0];
//       const geometry = feature?.geometry;
//       const summary = feature?.properties?.summary;

//       if (!geometry || !summary) {
//         throw new Error("Không tìm thấy dữ liệu đường đi.");
//       }

//       return {
//         routeGeo: data, // GIỮ NGUYÊN GeoJSON gốc [lng, lat]
//         distance: summary.distance,
//         duration: summary.duration,
//       };
//     } catch (error) {
//       throw new Error(`Lỗi gọi API ORS: ${error.message}`);
//     }
//   };

//   // Hàm gọi routing chính
//   const buildRoute = async (startPoint, endStation) => {
//     // helper: ensure object has {lat,lng}
//     const normalize = (p) => {
//       if (!p) return null;
//       if (p.lat != null && p.lng != null) return { lat: p.lat, lng: p.lng };
//       if (p.latitude != null && p.longitude != null)
//         return { lat: p.latitude, lng: p.longitude };
//       return null;
//     };

//     const start = normalize(startPoint);
//     if (!start) {
//       throw new Error("Invalid start point for routing");
//     }

//     setRouteInfo(null);
//     setRouteGeoJSON(null);
//     setRouteError(null);

//     if (!endStation) return;
//     if (ORS_API_KEY === "YOUR_ORS_KEY_HERE" || !ORS_API_KEY) {
//       setRouteError(
//         "Vui lòng thay thế ORS_API_KEY bằng Key OpenRouteService của bạn."
//       );
//       return;
//     }

//     setRouteLoading(true);
//     try {
//       const result = await fetchRouteORS({
//         start: start,
//         end: { lat: endStation.lat, lng: endStation.lng },
//       });

//       if (result && result.routeGeo) {
//         setRouteGeoJSON(result.routeGeo);
//         setRouteInfo({
//           distance: formatDistance(result.distance),
//           duration: formatDuration(result.duration),
//         });

//         // Cập nhật view để bao quát tuyến đường
//         const routeCoords = result.routeGeo.features[0].geometry.coordinates;
//         if (routeCoords.length > 0) {
//           const middleIndex = Math.floor(routeCoords.length / 2);
//           const [lng, lat] = routeCoords[middleIndex];
//           setViewState((prev) => ({
//             ...prev,
//             longitude: lng,
//             latitude: lat,
//             zoom: 12,
//             transitionDuration: 1000,
//           }));
//         }
//       } else {
//         setRouteError(`Không tìm thấy tuyến đường khả dụng từ ORS.`);
//       }
//     } catch (error) {
//       console.error("Lỗi khi tìm đường:", error.message);
//       setRouteError(`Lỗi API tìm đường: ${error.message}`);
//     } finally {
//       setRouteLoading(false);
//     }
//   };

//   // Xử lý khi nhấn nút Tìm đường (Hoặc khi chọn trạm)
//   const handleFindRoute = () => {
//     const parsedOrigin = parseCoordinate(originText);
//     let startPoint = userLocation;

//     if (originText.trim() === "") {
//       startPoint = userLocation;
//     } else if (parsedOrigin) {
//       startPoint = parsedOrigin;
//     } else {
//       setRouteError("Vui lòng nhập Tọa độ hợp lệ (lat, lng).");
//       setRouteGeoJSON(null);
//       setRouteInfo(null);
//       return;
//     }
//     // Normalize startPoint to { lat, lng } shape so downstream code (Marker, ORS) won't get undefined
//     let normalizedStart = null;
//     if (!startPoint) {
//       normalizedStart = null;
//     } else if (startPoint.lat != null && startPoint.lng != null) {
//       normalizedStart = { lat: startPoint.lat, lng: startPoint.lng };
//     } else if (startPoint.latitude != null && startPoint.longitude != null) {
//       normalizedStart = { lat: startPoint.latitude, lng: startPoint.longitude };
//     } else {
//       // fallback: try to parse if it's a string
//       try {
//         const parsed = parseCoordinate(String(startPoint));
//         normalizedStart = parsed;
//       } catch {
//         normalizedStart = null;
//       }
//     }

//     setCurrentOrigin(normalizedStart);
//     if (currentStation && normalizedStart) {
//       buildRoute(normalizedStart, currentStation);
//     }
//   };

//   // 🎯 useEffect TỰ ĐỘNG GỌI TÌM ĐƯỜNG
//   useEffect(() => {
//     if (selectedStationName && currentStation) {
//       handleFindRoute();
//     } else {
//       setRouteGeoJSON(null);
//       setRouteInfo(null);
//       setRouteError(null);
//       setPopupInfo(null);
//       // Reset center về FPT
//       console.log(userLocation);
//       // prefer normalized lat/lng (lat,lng) but fallback to latitude/longitude
//       setViewState((prev) => ({
//         ...prev,
//         longitude:
//           userLocation?.lng ?? userLocation?.longitude ?? prev.longitude,
//         latitude: userLocation?.lat ?? userLocation?.latitude ?? prev.latitude,
//         zoom: 12,
//         transitionDuration: 500,
//       }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedStationName, stations]); // Chỉ chạy khi chọn trạm hoặc khi stations được load

//   // =========================================================================
//   // UI RENDER
//   // =========================================================================
//   if (isLoading) {
//     return (
//       <div style={{ padding: "20px", textAlign: "center" }}>
//         <p>Đang tải dữ liệu trạm...</p>
//       </div>
//     );
//   }
//   if (error) {
//     return (
//       <div
//         style={{
//           padding: "20px",
//           textAlign: "center",
//           color: "#dc2626",
//           border: "1px solid #fee2e2",
//           borderRadius: "8px",
//           background: "#fef2f2",
//         }}
//       >
//         <p>Lỗi tải dữ liệu trạm: {error}</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <NavBar />
//       <main style={{ maxWidth: 1200, margin: "24px auto", padding: "0 20px" }}>
//         <header style={{ textAlign: "center", marginBottom: 16 }}>
//           <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
//             Mạng lưới đổi Pin
//           </h1>
//           <div style={{ fontSize: 36, fontWeight: 800, color: "#1e3a8a" }}>
//             {stations.length}
//           </div>
//           <p style={{ color: "#64748b" }}>và đang phát triển nhanh.</p>
//         </header>

//         {/* NEAREST STATION */}
//         <div style={{ marginBottom: 12 }}>
//           <NearestStation
//             stations={stations}
//             origin={
//               currentOrigin ||
//               (userLocation
//                 ? {
//                     lat: userLocation.lat ?? userLocation.latitude,
//                     lng: userLocation.lng ?? userLocation.longitude,
//                   }
//                 : null)
//             }
//             onFocus={(station) => {
//               if (!station) return;
//               setSelectedStationName(station.name);
//               setPopupInfo(station);
//               setViewState((prev) => ({
//                 ...prev,
//                 latitude: station.lat,
//                 longitude: station.lng,
//                 zoom: 14,
//                 transitionDuration: 800,
//               }));
//             }}
//           />
//         </div>

//         {/* KHU VỰC TÌM ĐƯỜNG */}
//         <div
//           style={{
//             marginBottom: 12,
//             border: "1px solid #e2e8f0",
//             borderRadius: 8,
//             padding: 16,
//             background: "#f8fafc",
//           }}
//         >
//           <h3
//             style={{
//               marginBottom: 10,
//               fontSize: 18,
//               fontWeight: 600,
//               color: "#1e3a8a",
//             }}
//           >
//             Tìm đường đến Trạm
//           </h3>

//           <div style={{ display: "flex", gap: 12 }}>
//             <select
//               style={{
//                 padding: "10px 12px",
//                 border: "1px solid #e2e8f0",
//                 borderRadius: 8,
//                 flex: 1,
//                 background: "#fff",
//               }}
//               value={selectedStationName}
//               onChange={(e) => setSelectedStationName(e.target.value)}
//               disabled={isLoading || error}
//             >
//               <option value="">
//                 {isLoading ? "Đang tải trạm..." : "Chọn Trạm Đích"}
//               </option>
//               {stations.map((s) => (
//                 <option key={s.id} value={s.name}>
//                   {s.name} - ({s.capacity} pin)
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* HIỂN THỊ THÔNG TIN ĐƯỜNG ĐI */}
//         {routeLoading && selectedStationName && (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "10px",
//               color: "#4f46e5",
//               fontWeight: 500,
//             }}
//           >
//             Đang tìm đường đi từ{" "}
//             {originText && parseCoordinate(originText) ? originText : "FPT"} đến{" "}
//             {selectedStationName}...
//           </div>
//         )}
//         {routeInfo && !routeLoading && (
//           <div
//             style={{
//               padding: "10px",
//               marginBottom: "12px",
//               background: "#eef2ff",
//               border: "1px solid #c7d2fe",
//               borderRadius: "8px",
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <p style={{ fontSize: "14px", fontWeight: 500, color: "#4f46e5" }}>
//               Đường đi đến {selectedStationName}
//             </p>
//             <p style={{ fontSize: "18px", fontWeight: 700, color: "#3730a3" }}>
//               {routeInfo.distance} ({routeInfo.duration})
//             </p>
//           </div>
//         )}
//         {routeError && selectedStationName && !routeLoading && (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "10px",
//               color: "#dc2626",
//               fontWeight: 500,
//               background: "#fee2e2",
//               borderRadius: "8px",
//               marginBottom: "12px",
//             }}
//           >
//             {routeError}
//           </div>
//         )}

//         <div>
//           <Map
//             {...viewState}
//             onMove={(evt) => setViewState(evt.viewState)}
//             style={containerStyle}
//             mapStyle={MAPTILER_STYLE_URL}
//           >
//             {/* 1. Marker cho điểm xuất phát (Start Point) */}
//             {currentOrigin &&
//               typeof currentOrigin.lng === "number" &&
//               typeof currentOrigin.lat === "number" && (
//                 <Marker
//                   longitude={currentOrigin.lng}
//                   latitude={currentOrigin.lat}
//                   anchor="bottom"
//                 >
//                   {/* User location marker - red like Google Maps */}
//                   <PinMarker color="#ef4444" isOrigin={true} />
//                 </Marker>
//               )}

//             {/* 2. Marker cho các Trạm Pin */}
//             {stations.map((s) => (
//               <Marker
//                 key={s.id}
//                 longitude={s.lng}
//                 latitude={s.lat}
//                 anchor="bottom"
//                 onClick={(e) => {
//                   e.originalEvent.stopPropagation();
//                   setPopupInfo(s);
//                 }}
//               >
//                 <PinMarker
//                   color={selectedStationName === s.name ? "#ef4444" : "#10b981"} // Đỏ khi được chọn
//                   capacity={s.capacity}
//                   isOrigin={false}
//                 />
//               </Marker>
//             ))}

//             {/* 🛑 POPUP HIỂN THỊ THÔNG TIN TRẠM SẠC */}
//             {popupInfo && (
//               <Popup
//                 longitude={popupInfo.lng}
//                 latitude={popupInfo.lat}
//                 closeButton={true}
//                 closeOnClick={false}
//                 onClose={() => setPopupInfo(null)}
//                 anchor="bottom"
//               >
//                 <div style={{ minWidth: 180, padding: 5 }}>
//                   <h4
//                     style={{
//                       fontSize: 16,
//                       fontWeight: 700,
//                       margin: "0 0 5px 0",
//                       color: "#1e3a8a",
//                     }}
//                   >
//                     {popupInfo.name}
//                   </h4>
//                   <p
//                     style={{ margin: "0 0 2px 0", fontSize: 13, color: "#444" }}
//                   >
//                     Vị trí: **{popupInfo.location}**
//                   </p>
//                   <p
//                     style={{
//                       margin: "0 0 5px 0",
//                       fontSize: 13,
//                       fontWeight: 600,
//                       color: "#10b981",
//                     }}
//                   >
//                     Dung lượng: **{popupInfo.capacity}** pin
//                   </p>
//                   <button
//                     onClick={() => {
//                       setSelectedStationName(popupInfo.name);
//                       setPopupInfo(null);
//                       // Chức năng tìm đường sẽ tự động chạy trong useEffect khi selectedStationName thay đổi
//                     }}
//                     style={{
//                       padding: "5px 10px",
//                       background: "#2563eb",
//                       color: "white",
//                       border: "none",
//                       borderRadius: 4,
//                       fontSize: 12,
//                       cursor: "pointer",
//                     }}
//                   >
//                     Chọn làm Trạm Đích
//                   </button>
//                 </div>
//               </Popup>
//             )}

//             {/* 3. Lớp hiển thị Đường đi (Route) */}
//             {routeGeoJSON && (
//               <Source id="route-data" type="geojson" data={routeGeoJSON}>
//                 <Layer {...polylineLayerStyle} />
//               </Source>
//             )}
//           </Map>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default StationsNearbyPage;
// src/components/RouteFinderVN.jsx
// src/components/RouteFinderORS.jsx
import React, { Fragment, useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Select, Card, Spin } from "antd";
import api from "../../config/axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../../components/navbar/navBar";

const { Option } = Select;

// Custom Marker icon (Leaflet không load mặc định)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854866.png",
  iconSize: [32, 32],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Component để focus map tới vị trí mới
function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 13, { duration: 1.5 });
  }, [position]);
  return null;
}

const StationsNearby = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const markerRefs = useRef({});

  // Gọi API lấy dữ liệu trạm
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

  // Gom nhóm theo thành phố → quận
  const cities = [...new Set(stations.map((s) => s.city))];
  const districts = selectedCity
    ? [
        ...new Set(
          stations.filter((s) => s.city === selectedCity).map((s) => s.district)
        ),
      ]
    : [];

  // Lọc các trạm hiển thị
  const filteredStations = stations.filter(
    (s) =>
      (!selectedCity || s.city === selectedCity) &&
      (!selectedDistrict || s.district === selectedDistrict)
  );

  if (loading) return <Spin tip="Đang tải dữ liệu trạm..." />;
  const handleStationClick = (station) => {
    setSelectedStation(station);

    // Đợi một chút cho map flyTo xong, sau đó mở popup
    setTimeout(() => {
      const ref = markerRefs.current[station.id];
      if (ref) ref.openPopup();
    }, 800);
  };

  return (
    <Fragment>
      <Navbar />
      <div style={{ display: "flex", height: "90vh", gap: "1rem" }}>
        {/* Sidebar bộ lọc */}
        <Card title={<div style={{ fontSize: '24px', fontWeight: "bold", color: '#1890ff', textAlign: 'center', marginTop: '16px' }}> <h1>Hệ thống trạm</h1>

        </div>} style={{ width: 300 }}>
          <p>
            <strong>Thành phố:</strong>
          </p>
          <Select
            style={{ width: "100%", marginBottom: 10 }}
            placeholder="Chọn thành phố"
            allowClear
            onChange={(v) => {
              setSelectedCity(v);
              setSelectedDistrict(null);
            }}
          >
            {cities.map((city) => (
              <Option key={city} value={city}>
                {city}
              </Option>
            ))}
          </Select>

          <p>
            <strong>Quận / Huyện:</strong>
          </p>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn quận / huyện"
            allowClear
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            disabled={!selectedCity}
          >
            {districts.map((d) => (
              <Option key={d} value={d}>
                {d}
              </Option>
            ))}
          </Select>

          <p style={{ marginTop: 16 }}>
            <strong>Trạm hiện có:</strong>
          </p>
          <ul style={{ maxHeight: 300, overflowY: "auto", paddingLeft: 16 }}>
            {filteredStations.map((s) => (
              <li
                key={s.id}
                onClick={() => handleStationClick(s)}
                style={{
                  cursor: "pointer",
                  marginBottom: 8,
                  color: "#1890ff",
                }}
              >
                📍 {s.name} ({s.district})
              </li>
            ))}
          </ul>
        </Card>

        {/* Map */}
        <MapContainer
          center={[10.762622, 106.660172]}
          zoom={12}
          style={{ flex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selectedStation && (
            <FlyToLocation
              position={[selectedStation.latitude, selectedStation.longitude]}
            />
          )}

          {filteredStations.map((s) => (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              ref={(ref) => (markerRefs.current[s.id] = ref)} // ✅ Lưu ref cho từng marker
            >
              <Popup>
                <strong>{s.name}</strong> <br />
                📍 {s.location} <br />
                ☎️ {s.contactInfo} <br />⚡ Pin hiện có: {s.currentBatteryCount}{" "}
                / {s.capacity}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Fragment>
  );
};

export default StationsNearby;
