import './App.css'
import { CesiumProvider } from "@/components/map/CesiumProvider"; // Providerをインポート
import CesiumMap from "@/components/map/CesiumMap";           // 地図コンポーネント
import Menu from './components/Menu';

export default function App() {
  return (
    <CesiumProvider>
      <CesiumMap />
      <Menu />
    </CesiumProvider>
  );
}
