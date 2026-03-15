export interface GeoPoint {
    longitude: number
    latitude: number
}

export type EvacuationPlace = GeoPoint & {
    name: string
    address: string
    flood: boolean
    landslide: boolean
    stormSurge: boolean
    earthquake: boolean
    tsunami: boolean
    fire: boolean
    inlandFlood: boolean
    volcano: boolean
}