import * as Cesium from "cesium";
import { useEffect } from "react";
import { initViewer, useCesiumInstance } from "@/map/common";

import {
    loadEvacuationData,
    loadNabiRoutes,
    loadTileset,
    updateUserLocation
} from "@/map/evacuation";

import { getBrowserLocation } from "@/utils";

export function useCesium(containerRef: React.RefObject<HTMLDivElement | null>) {
    const globalViewerRef = useCesiumInstance();

    useEffect(() => {
        // DOM要素が存在しない場合は何もしない
        if (!containerRef.current) return;

        // --- 初期化フェーズ ---
        const viewer = initViewer(containerRef.current, {
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            vrButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: true,
            projectionPicker: false,
            requestRenderMode: false,
            creditContainer: document.createElement("div"),
            targetFrameRate: 60,
            skyBox: false,
            shouldAnimate: true,
            terrainShadows: Cesium.ShadowMode.DISABLED,
            terrain: Cesium.Terrain.fromWorldTerrain(),
            timeline: false,
            automaticallyTrackDataSourceClocks: false,
        });

        const targetTime = Cesium.JulianDate.fromDate(new Date("2025-01-01T01:00:00Z"));
        viewer.clock.startTime = targetTime.clone();
        viewer.clock.currentTime = targetTime.clone();
        viewer.clock.stopTime = targetTime.clone();

        globalViewerRef.current = viewer;

        // 非同期処理の管理（マウント解除後の実行防止）
        let isActive = true;

        async function init() {
            try {
                // 1. 3Dタイル（地図モデル）を読み込む
                await loadTileset(viewer, './tileset.json');

                // 2. 避難所データを読み込み、地図に表示
                await loadEvacuationData(viewer);

                // 4. ブラウザから現在位置を取得
                const coords = await getBrowserLocation();

                // 【重要】非同期処理の合間に、コンポーネントがまだ有効かチェックする
                // 厳密モードでの2回目の実行や、ユーザーがページを離れた場合に備える
                if (!isActive || viewer.isDestroyed()) return;

                // 5. ユーザー位置（青い点）を地図上に更新
                updateUserLocation(viewer, coords.longitude, coords.latitude);

                loadNabiRoutes(viewer);

            } catch (error) {
                // 既にViewerが破棄されている場合のエラーは無視するか、適切にハンドリング
                if (isActive) {
                    console.error("Cesium initialization failed:", error);
                }
            }
        }

        init();

        // クリーンアップ関数（厳密モードでの2回目の実行前に必ず呼ばれる）
        return () => {
            isActive = false;
            if (globalViewerRef.current) {
                if (!globalViewerRef.current.isDestroyed()) {
                    globalViewerRef.current.destroy();
                }
                globalViewerRef.current = null;
                console.log("Cleanup: Cesium Viewerを破棄しました。");
            }
        };
    }, [containerRef, globalViewerRef]);
}