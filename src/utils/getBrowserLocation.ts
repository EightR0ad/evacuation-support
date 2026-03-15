import * as Cesium from "cesium"
import type { GeoPoint } from "@/utils"

export async function getBrowserLocation(): Promise<GeoPoint> {

    const defaultCartesian = new Cesium.Cartesian3(
        -3961789.692748305,
        3350168.830876805,
        3697264.3097956073
    )

    const cartographic = Cesium.Cartographic.fromCartesian(defaultCartesian)

    const defaultCoords = {
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude)
    }

    if (!navigator.geolocation) {
        return defaultCoords
    }

    return new Promise((resolve) => {

        navigator.geolocation.getCurrentPosition(

            (pos) => {
                resolve({
                    longitude: pos.coords.longitude,
                    latitude: pos.coords.latitude
                })
            },

            () => {
                resolve(defaultCoords)
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        )

    })
}