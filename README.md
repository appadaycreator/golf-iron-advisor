# Golf Iron Advisor - ゴルフアイアン適性診断システム

## 概要

Golf Iron Advisorは、ユーザーの体格、スイング特性、技術レベルを分析し、最適なゴルフアイアンクラブを推奨するWebアプリケーションです。

🔗 **デモサイト**: https://appadaycreator.github.io/golf-iron-advisor/

## 主な機能

### ✅ 実装済み機能

- **7つの診断質問**
  - 基本情報（身長、体重、年齢）
  - ゴルフ経験レベル
  - スイングスピード
  - ミス傾向
  - 弾道の高さ
  - 重視するポイント
  - 予算

- **診断結果表示**
  - おすすめクラブ上位3つを表示
  - 適合度スコア（100点満点）
  - 推奨理由の詳細説明
  - レーダーチャートでの視覚化
  - 各クラブの特性表示（やさしさ、操作性、飛距離）

- **データ保存・履歴管理**
  - ローカルストレージでの診断結果保存
  - 診断履歴の一覧表示（最大10件）
  - 履歴から過去の結果を再表示
  - サイドバーでの最近の診断表示

- **共有機能**
  - Twitter、Facebook、LINEでのSNSシェア
  - URLコピー機能

- **UI/UX機能**
  - レスポンシブデザイン（PC、タブレット、スマホ対応）
  - 多言語対応（日本語、英語）
  - 文字サイズ変更機能
  - プログレスバー表示
  - スムーズなアニメーション

## 技術スタック

- **フロントエンド**
  - HTML5
  - CSS3（レスポンシブデザイン）
  - JavaScript (ES6+)
  - TailwindCSS
  - Chart.js（レーダーチャート）

- **データ管理**
  - LocalStorage（診断結果・履歴保存）

- **ホスティング**
  - GitHub Pages

## セットアップ

```bash
# リポジトリのクローン
git clone https://github.com/appadaycreator/golf-iron-advisor.git

# ディレクトリ移動
cd golf-iron-advisor

# ローカルで開く
open index.html
```

## プロジェクト構造

```
golf-iron-advisor/
├── index.html          # メイン診断アプリケーション
├── lp.html            # ランディングページ
├── function.html      # 機能仕様書
├── how-to-use.html    # 使い方ガイド
├── terms.html         # 利用規約
├── privacy.html       # プライバシーポリシー
├── contact.html       # お問い合わせ
├── assets/
│   ├── css/
│   │   ├── style.css      # メインスタイル
│   │   └── responsive.css # レスポンシブスタイル
│   └── js/
│       ├── app.js         # メインアプリケーション
│       └── diagnosis.js   # 診断エンジン
├── manifest.json      # PWA設定
└── README.md         # このファイル
```

## 今後の開発予定

- Supabaseとの連携（クラウド保存）
- PDFエクスポート機能
- Service Workerによるオフライン対応
- より詳細なクラブデータベース
- AI/機械学習による診断精度向上

## ライセンス

© 2024 appadaycreator. All rights reserved.

## 開発者

- GitHub: [@appadaycreator](https://github.com/appadaycreator)

## 更新履歴

- 2025年1月: クイズオプション選択バグ修正
- 2024年12月: 初回リリース