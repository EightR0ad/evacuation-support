import { EvacuationService } from "@/services/EvacuationService";
import * as Cesium from "cesium"

/**
 * 3Dタイルセットをロードし、カメラの初期位置を設定する
 */
export async function loadTileset(viewer: Cesium.Viewer, url: string) {
    // タイルセットの読み込み（画面空間エラーの許容値を設定してパフォーマンスを調整）
    const tileset = await Cesium.Cesium3DTileset.fromUrl(url, { maximumScreenSpaceError: 16 })

    // シーンのプリミティブに追加
    viewer.scene.primitives.add(tileset)

    // カメラを指定した座標と角度に移動
    viewer.camera.setView({
        destination: new Cesium.Cartesian3(-3963399.7743251673, 3351332.996033841, 3696569.363182882),
        orientation: {
            heading: 6.0, // 方位角
            pitch: -0.5,  // 仰角
            roll: 0.0     // ロール
        }
    })

    return tileset
}

/**
 * 避難所データをロードし、クラスタリング（集約表示）機能付きのピンを表示する
 */
export async function loadEvacuationData(viewer: Cesium.Viewer) {
    // 避難所データを取得
    const places = await EvacuationService.getProcessedPlaces()

    // 1. データソースの初期化
    const pinsDataSource = new Cesium.CustomDataSource('pins');
    viewer.dataSources.add(pinsDataSource);

    // 2. クラスタリング（集約・LOD）の設定
    pinsDataSource.clustering.enabled = true;
    pinsDataSource.clustering.pixelRange = 60;       // 集約判定を行うピクセル範囲
    pinsDataSource.clustering.minimumClusterSize = 2; // 2つ以上のポイントがあれば集約して表示

    const pinBuilder = new Cesium.PinBuilder();

    // パフォーマンス最適化：ループ外でBase64画像を一度だけ生成し、メモリ消費を抑制
    const CONST_ICONS = {
        SINGLE: pinBuilder.fromColor(Cesium.Color.BLUE, 48).toDataURL(), // 単体ピン（青）
        CLUSTER: pinBuilder.fromText('+', Cesium.Color.RED, 48).toDataURL() // 集約アイコン（赤、＋マーク）
    };

    // 3. クラスタリング（集約）時の外観設定
    pinsDataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
        // ラベルの設定：集約された件数を表示
        cluster.label.show = true;
        cluster.label.text = clusteredEntities.length.toString();
        cluster.label.font = 'bold 14px sans-serif';
        cluster.label.verticalOrigin = Cesium.VerticalOrigin.CENTER;

        cluster.label.fillColor = Cesium.Color.WHITE;
        cluster.label.outlineColor = Cesium.Color.BLACK;
        cluster.label.outlineWidth = 3;
        cluster.label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;

        // ビルボード（アイコン）の設定
        cluster.billboard.show = true;
        cluster.billboard.image = CONST_ICONS.CLUSTER;
        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

        // 重要：集約アイコンも3Dタイルや地形に密着（クランプ）させる
        cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_3D_TILE;
    });

    // 4. エンティティ（各避難所）の一括追加
    // places: [{latitude, longitude, name}, ...] 形式のデータ
    for (const place of places) {
        pinsDataSource.entities.add({
            // 緯度経度からCartesian3座標に変換
            position: Cesium.Cartesian3.fromDegrees(place.longitude, place.latitude),

            // 個別ピン（ビルボード）の設定
            billboard: {
                image: CONST_ICONS.SINGLE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 地面に密着させる
                disableDepthTestDistance: 1000.0, // 近くでは地形に埋まらないように深度テストを無効化
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 50000.0), // 表示距離範囲
                scaleByDistance: new Cesium.NearFarScalar(1000.0, 1.0, 50000.0, 0.2) // 距離に応じてサイズを縮小
            },

            // 名称ラベルの設定
            label: {
                text: place.name,
                font: '14px sans-serif',

                // ポイント：ラベルの基準を下に設定し、アイコンの上に「立っている」ように配置
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,

                // 視認性の向上（背景とアウトライン）
                showBackground: true,
                backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                pixelOffset: new Cesium.Cartesian2(0, -10), // アイコンと重ならないよう少し上にずらす

                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,

                // 距離に応じたスケーリング
                scaleByDistance: new Cesium.NearFarScalar(1000.0, 1.0, 50000.0, 0.5),

                // 地形による遮蔽（埋まり込み）を防止
                disableDepthTestDistance: 1000.0
            }
        });
    }
}