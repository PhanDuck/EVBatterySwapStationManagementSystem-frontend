
// Hàm gọi API ORS để lấy tuyến đường (GeoJSON)
export async function fetchRouteORS({ apiKey, start, end }) {
    // start và end phải là đối tượng { lat, lng }
    const [startLng, startLat] = [start.lng, start.lat];
    const [endLng, endLat] = [end.lng, end.lat];
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${encodeURIComponent(apiKey)}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
    
    const res = await fetch(url);
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Routing failed with status ${res.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await res.json();
    const feature = data?.features?.[0];
    const geometry = feature?.geometry;
    const summary = feature?.properties?.summary;

    if (!geometry) throw new Error("No route geometry");
    
    // Trả về GeoJSON object và thông tin đường đi
    return {
        geoJSON: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry,
                    properties: {},
                },
            ],
        },
        distance: summary?.distance, 
        duration: summary?.duration,
    };
}