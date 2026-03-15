// @/services/EvacuationService.ts
import { EvacuationAPI } from "@/api";
import { GeoJsonLoader, EVACUATION_FIELD_MAP } from "@/utils";

export class EvacuationService {
    /**
     * データの取得からパースまでを一括で行う
     */
    static async getProcessedPlaces() {
        const rawGeoJson = await EvacuationAPI.fetchRawGeoJson();

        // パースロジックをここに隠蔽する
        return GeoJsonLoader.parsePointFeatures(
            rawGeoJson,
            EVACUATION_FIELD_MAP
        );
    }
}