import { useRef } from 'react';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useCesium } from '@/hooks/useCesium';

/**
 * 地図を表示するためのメインコンポーネント
 */
export default function CesiumMap() {
    // 地図を描画するDOMへの参照
    const containerRef = useRef<HTMLDivElement>(null);

    // 初期化フックを実行
    useCesium(containerRef);

    return (
        <div
            ref={containerRef}
            // vw=Viewport Width, vh=Viewport Height
            style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
        />
    );
}