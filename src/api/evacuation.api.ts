/**
 * 避難所データの通信を担当
 */
export const EvacuationAPI = {
    /**
     * ローカルまたはリモートから生のGeoJSONデータを取得する
     */
    fetchRawGeoJson: async (): Promise<any> => {
        const response = await fetch("/evacuation1.geojson");
        if (!response.ok) {
            throw new Error(`Failed to fetch evacuation geojson: ${response.status}`);
        }
        return await response.json();
    }
};