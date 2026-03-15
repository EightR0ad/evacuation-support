import * as Cesium from "cesium"

export function findNearestShelters(
    userLon: number,
    userLat: number,
    places: any[],
    k = 3
) {
    const user = Cesium.Cartesian3.fromDegrees(userLon, userLat)

    const nearest: any[] = []

    for (const p of places) {
        const pos = Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude)

        const dist = Cesium.Cartesian3.distance(user, pos)

        nearest.push({ ...p, distance: dist })

        nearest.sort((a, b) => a.distance - b.distance)

        if (nearest.length > k) {
            nearest.pop()
        }
    }

    return nearest
}