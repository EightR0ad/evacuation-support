import { useUserLocationStore } from "@/store";
import * as Cesium from "cesium";

/**
 * ユーザー位置のIDを定数として定義
 * 他の場所からこのIDを使ってEntityを検索・操作することも可能になる
 */
export const USER_LOCATION_ENTITY_ID = "current-user-location";

/**
 * ユーザーの位置情報を地図上に更新する
 */
export async function updateUserLocation(
    viewer: Cesium.Viewer,
    longitude: number,
    latitude: number
) {
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);

    // JSの変数ではなく、Viewerの中から直接Entityを探す
    let userEntity = viewer.entities.getById(USER_LOCATION_ENTITY_ID);
    useUserLocationStore.getState().setLocation(longitude, latitude);

    if (!userEntity) {
        // --- 初回生成 ---
        userEntity = viewer.entities.add({
            id: USER_LOCATION_ENTITY_ID,
            position,
            point: {
                pixelSize: 14,
                color: Cesium.Color.DODGERBLUE,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 3,
                // 地形や建物の裏に隠れないように設定
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });

        // 初回のみカメラを移動
        locateUser(viewer, longitude, latitude);

    } else {
        // --- 更新 ---
        // 既存のEntityの座標プロパティを更新するだけ
        userEntity.position = new Cesium.ConstantPositionProperty(position);
    }
}

export function locateUser(viewer: Cesium.Viewer, longitude: number, latitude: number) {
    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1500),
        duration: 2 // 2秒かけて移動
    });
}