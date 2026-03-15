import { useUserLocationStore } from "@/store/useUserLocation.store";
import { useCesiumInstance } from "@/map/common/initViewer";
import { locateUser } from "@/map/evacuation";

export default function Menu() {
    // ContextからviewerのRefを取得
    const viewerRef = useCesiumInstance();

    // Zustandのグローバルストアから現在地を取得
    const { longitude, latitude } = useUserLocationStore();

    const flyToUser = () => {
        // 💡 ポイント：クリックされた瞬間に最新の .current を取得する
        const viewer = viewerRef.current;

        if (!viewer) {
            console.warn("Cesium Viewerが初期化されていません。");
            return;
        }

        // 初期値（0, 0）のまま飛ばないようにチェック
        if (longitude === 0 || latitude === 0) {
            console.warn("有効な位置情報がありません。");
            alert("位置情報を取得中です。しばらくお待ちください。");
            return;
        }

        // カメラ移動の実行
        locateUser(viewer, longitude, latitude);
    };

    return (
        <button
            onClick={flyToUser}
            style={{
                position: "absolute",
                bottom: "30px",
                right: "30px",
                zIndex: 99,
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid #ccc",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
            title="現在地に移動"
        >
            🎯
        </button>
    );
}