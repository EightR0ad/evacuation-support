# 📍 災害時避難支援Webアプリ

## 概要
災害発生時に、現在地から最適な避難場所とルートを提示するWebアプリ。  
外国人観光客や土地勘のないユーザーでも直感的に利用可能。

## 主な機能
- 現在地取得（手動選択可）
- 災害タイプ選択（地震 / 洪水 / 津波 / 土砂）
- 最寄り避難所検索（Top3）
- ルート表示（徒歩 / 自転車 / 車）
- 多言語対応（日本語 / 英語 / 中国語）

## 技術スタック
- React + TypeScript
- Vite
- OpenStreetMap
- OSRM（ルート検索）
- GeoJSON

## データ
- PLATEAU（3D都市モデル）
- 国土地理院 避難所データ

## 起動方法
npm install
npm run dev

## デモ
- GitHub: https://eightr0ad.github.io/evacuation-support/