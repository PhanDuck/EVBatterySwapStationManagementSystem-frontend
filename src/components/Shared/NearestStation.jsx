import React, { useMemo } from 'react';

// Haversine formula to compute distance (in meters) between two lat/lng points
function haversineDistanceMeters(a, b) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aa = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

export default function NearestStation({ stations = [], origin, onFocus }) {
  // origin: { lat, lng } or { latitude, longitude }
  const normalizedOrigin = useMemo(() => {
    if (!origin) return null;
    if (origin.lat != null && origin.lng != null) return { lat: origin.lat, lng: origin.lng };
    if (origin.latitude != null && origin.longitude != null) return { lat: origin.latitude, lng: origin.longitude };
    return null;
  }, [origin]);

  const nearest = useMemo(() => {
    if (!normalizedOrigin || !stations || stations.length === 0) return null;
    let best = null;
    for (const s of stations) {
      if (s.lat == null || s.lng == null) continue;
      const dist = haversineDistanceMeters(normalizedOrigin, { lat: s.lat, lng: s.lng });
      if (!best || dist < best.dist) {
        best = { station: s, dist };
      }
    }
    return best;
  }, [normalizedOrigin, stations]);

  if (!normalizedOrigin) return null;
  if (!nearest) return null;

  const meters = Math.round(nearest.dist);
  const km = meters >= 1000 ? (meters / 1000).toFixed(2) + ' km' : meters + ' m';

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, background: '#ffffff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>Gần nhất</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{nearest.station.name}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{nearest.station.location || ''} • {km}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onFocus && onFocus(nearest.station)}
          style={{ padding: '8px 12px', borderRadius: 8, background: '#f59e0b', color: '#111827', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Focus
        </button>
      </div>
    </div>
  );
}
