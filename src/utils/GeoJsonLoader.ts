import type { EvacuationPlace } from "@/utils/evacuation"

export class GeoJsonLoader {

  static async load(url: string) {
    const res = await fetch(url)
    return res.json()
  }

  static mapProperties(
    props: Record<string, any>,
    map: Record<string, string>
  ) {
    const obj: Record<string, any> = {}

    for (const key in map) {
      const sourceKey = map[key]
      const value = props[sourceKey]

      obj[key] = value === "1" ? true : value === "" ? false : value
    }

    return obj
  }

  static parsePointFeatures(
    geojson: any,
    map: Record<string, string>
  ): EvacuationPlace[] {

    return geojson.features.map((f: any) => {

      const [longitude, latitude] = f.geometry.coordinates

      const props = this.mapProperties(f.properties, map)

      return {
        longitude,
        latitude,
        ...props
      }

    })
  }
}