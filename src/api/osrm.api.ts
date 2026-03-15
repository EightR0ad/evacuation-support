import type { GeoPoint } from "@/utils";

export interface OSRMRouteResponse {
    code: string;
    routes: Array<{
        geometry: { coordinates: [number, number][] };
        distance: number;
        duration: number;
    }>;
}

/**
 * OSRMから生の経路データを取得する
 */
export const fetchRouteData = async (start: GeoPoint, end: GeoPoint): Promise<OSRMRouteResponse> => {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OSRM API Error: ${response.status}`);
    return response.json();
};