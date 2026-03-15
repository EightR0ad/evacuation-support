export async function getBrowserLocation() {
    if (!navigator.geolocation) {
        throw new Error("Browser does not support geolocation");
    }

    return new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            reject,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000
            }
        );
    });
}