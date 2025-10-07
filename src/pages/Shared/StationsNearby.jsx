import React, { useMemo, useState } from "react";
import NavBar from "../../components/navbar/navBar";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = { width: '100%', height: '70vh', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' };
// FPT University HCMC (Saigon) coordinates
const FPT_SAIGON = { lat: 10.841127, lng: 106.809866 };
const HCMC_BOUNDS = {
  north: 11.3,
  south: 10.3,
  west: 106.3,
  east: 107.1,
};

const HCMC_DISTRICTS = [
  "Quận 1","Quận 3","Quận 4","Quận 5","Quận 6","Quận 7","Quận 8","Quận 10","Quận 11","Quận 12",
  "Bình Thạnh","Gò Vấp","Phú Nhuận","Tân Bình","Tân Phú","Bình Tân",
  "TP. Thủ Đức","Bình Chánh","Cần Giờ","Củ Chi","Hóc Môn","Nhà Bè"
];

function StationsNearbyPage() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey || "" });
  const center = useMemo(() => FPT_SAIGON, []);
  const [district, setDistrict] = useState("");

  return (
    <div>
      <NavBar />
      <main style={{ maxWidth: 1200, margin: '24px auto', padding: '0 20px' }}>
        <header style={{ textAlign: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Mạng lưới đổi Pin</h1>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#1e3a8a' }}>118</div>
          <p style={{ color: '#64748b' }}>và đang phát triển nhanh.</p>
        </header>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <select style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, flex: 1, background: '#fff' }} value="TPHCM" disabled>
            <option value="TPHCM">Thành phố Hồ Chí Minh</option>
          </select>
          <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, flex: 1, background: '#fff' }}>
            <option value="">Quận/Huyện</option>
            {HCMC_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          {isLoaded ? (
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} options={{ streetViewControl: false, mapTypeControl: false, restriction: { latLngBounds: HCMC_BOUNDS, strictBounds: false }, fullscreenControl: true }}>
              <Marker position={center} />
            </GoogleMap>
          ) : (
            <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: 12 }}>
              Đang tải bản đồ...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StationsNearbyPage;


