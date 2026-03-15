import { useUserLocationStore } from "@/store";
import * as Cesium from "cesium";
import { EvacuationService } from "@/services/EvacuationService";
import { getBrowserLocation, type GeoPoint } from "@/utils";
import { findNearestShelters } from "@/map/common";
import { fetchRouteData } from "@/api";

/**
 * ナビゲーションルートをロードし、描画する
 */
export async function loadNabiRoutes(viewer: Cesium.Viewer) {
    // 最寄りの避難所を特定
    const nearest = await locateNearestShelters()
    // 現在のユーザー位置を取得（ストアから）
    const { longitude, latitude } = useUserLocationStore.getState();

    // ルート管理クラスを初期化し、ルートを更新
    const routeManager = new RouteManager(viewer);
    routeManager.updateRoutes(
        { longitude: longitude, latitude: latitude },
        nearest.map(shelter => ({ longitude: shelter.longitude, latitude: shelter.latitude }))
    );
}

/**
 * 現在地から最も近い避難所を検索する
 */
export async function locateNearestShelters() {
    // 全避難所データを取得
    const places = await EvacuationService.getProcessedPlaces()
    // ブラウザのGPS等から現在地の座標を取得
    const coords = await getBrowserLocation()

    // 現在地と避難所リストを照合し、近い順にフィルタリング
    const nearest = findNearestShelters(
        coords.longitude,
        coords.latitude,
        places
    )

    return nearest
}

/**
 * カスタム流動マテリアル属性クラス
 * ラインが流れるようなアニメーションを制御するためのプロパティ
 */
class PolylineFlowMaterialProperty {
    private _definitionChanged = new Cesium.Event();
    public color: Cesium.Property;
    public speed: Cesium.Property;

    constructor(options: { color: Cesium.Color; speed: number }) {
        this.color = new Cesium.ConstantProperty(options.color);
        this.speed = new Cesium.ConstantProperty(options.speed);
    }

    get isConstant() { return false; }
    get definitionChanged() { return this._definitionChanged; }

    getType() { return 'PolylineFlow'; }

    getValue(time: Cesium.JulianDate, result?: any) {
        if (!result) result = {};
        result.color = (this.color as any).getValue(time);
        result.speed = (this.speed as any).getValue(time);
        return result;
    }

    equals(other: any) {
        return this === other || (other instanceof PolylineFlowMaterialProperty && this.color === other.color);
    }
}

/**
 * ルート描画・管理クラス
 */
export class RouteManager {
    private viewer: Cesium.Viewer;
    private readonly ROUTE_ID_PREFIX = "route-line-";
    private static isMaterialRegistered = false;

    constructor(viewer: Cesium.Viewer) {
        this.viewer = viewer;
        this.initCustomMaterial();
    }

    /**
     * カスタムシェーダー（GLSL）を用いたマテリアルの登録
     */
    private initCustomMaterial() {
        if (RouteManager.isMaterialRegistered) return;

        (Cesium.Material as any)._materialCache.addMaterial('PolylineFlow', {
            fabric: {
                type: 'PolylineFlow',
                uniforms: {
                    u_flowColor: Cesium.Color.RED, // 変数名の衝突を避けるため u_ を付与
                    u_flowSpeed: 10.0
                },
                source: `
                    czm_material czm_getMaterial(czm_materialInput materialInput) {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        
                        // 1. Uniform変数の取得
                        vec4 baseColor = u_flowColor; 
                        
                        // 2. アニメーションのオフセット計算
                        // czm_frameNumber（フレーム数）を利用して時間経過による移動を実現
                        float time = czm_frameNumber * u_flowSpeed / 1000.0;
                        float repeat = 20.0; // パターンの繰り返し回数
                        float dash = fract(materialInput.st.s * repeat - time);
                        
                        // 3. 質感の設定（material.diffuse は vec3, material.alpha は float）
                        if (dash > 0.5) {
                            material.diffuse = baseColor.rgb;
                            material.alpha = baseColor.a;
                        } else {
                            // 点線の隙間部分を透明度 10% に設定
                            material.diffuse = baseColor.rgb;
                            material.alpha = baseColor.a * 0.1;
                        }
                        
                        return material;
                    }
                `
            }
        });
        RouteManager.isMaterialRegistered = true;
    }

    /**
     * ルート情報を更新し、地図上に再描画する
     */
    async updateRoutes(start: GeoPoint, destinations: GeoPoint[]) {
        // 既存のルートを削除
        this.removeExistingRoutes();

        // 各目的地へのルートデータを並列で取得
        const results = await Promise.all(
            destinations.map(dest => fetchRouteData(start, dest).catch(() => null))
        );

        results.forEach((data, index) => {
            if (!data || data.code !== 'Ok' || !data.routes.length) return;

            const route = data.routes[0];
            const coords = route.geometry.coordinates.flat(); // 座標配列をフラット化
            const isMainRoute = index === 0; // 最初のルートをメインルートとして扱う

            // 自作の Property クラスを使用して流動マテリアルを生成
            const flowingMaterial = new PolylineFlowMaterialProperty({
                color: isMainRoute
                    ? Cesium.Color.fromCssColorString('#4285F4')        // メイン：Googleブルー
                    : Cesium.Color.fromCssColorString('#9AA0A6').withAlpha(0.6), // サブ：グレー
                speed: isMainRoute ? 12.0 : 0.0 // メインルートのみアニメーションさせる
            });

            // Cesium Entity としてルートを追加
            this.viewer.entities.add({
                id: `${this.ROUTE_ID_PREFIX}${index}`,
                polyline: {
                    positions: Cesium.Cartesian3.fromDegreesArray(coords),
                    width: isMainRoute ? 8 : 5,
                    material: flowingMaterial as any,
                    clampToGround: true, // 地面に沿わせる
                    zIndex: isMainRoute ? 10 : 1 // メインルートを最前面に表示
                }
            });
        });
    }

    /**
     * 地図上の古いルートエンティティを一括削除
     */
    removeExistingRoutes() {
        const entities = this.viewer.entities.values;
        for (let i = entities.length - 1; i >= 0; i--) {
            const entity = entities[i];
            if (entity?.id?.startsWith(this.ROUTE_ID_PREFIX)) {
                this.viewer.entities.remove(entity);
            }
        }
    }
}