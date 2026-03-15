import { createContext, useContext } from "react";
import * as Cesium from "cesium";

/**
 * 💡 シングルトン（グローバル変数）は廃止します。
 * 代わりに、呼び出し元がインスタンスを管理するようにします。
 */

/**
 * Viewerを初期化する純粋な関数
 */
export function initViewer(
    container: string | HTMLElement,
    options?: Cesium.Viewer.ConstructorOptions
): Cesium.Viewer {
    // 常に新しいインスタンスを作成して返す
    const viewer = new Cesium.Viewer(container, options);
    viewer.scene.globe.depthTestAgainstTerrain = true;
    return viewer;
}

/**
 * --- Context 設定 ---
 */
interface CesiumContextType {
    viewerRef: React.MutableRefObject<Cesium.Viewer | null>;
}

export const CesiumContext = createContext<CesiumContextType | null>(null);

/**
 * 他のコンポーネントからViewerを参照するためのHook
 */
export const useCesiumInstance = () => {
    const context = useContext(CesiumContext);
    if (!context) {
        throw new Error("useCesiumInstance must be used within CesiumProvider");
    }
    return context.viewerRef;
};