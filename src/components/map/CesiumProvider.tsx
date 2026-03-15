import React, { useRef } from "react";
import { CesiumContext } from "@/map/common";
import * as Cesium from "cesium";

export const CesiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Viewerの実体（Refなので更新されてもReactは再描画しない）
    const viewerRef = useRef<Cesium.Viewer | null>(null);

    return (
        <CesiumContext.Provider value={{ viewerRef }}>
            {children}
        </CesiumContext.Provider>
    );
};