# Bayesian Education Dashboard - プロジェクト概要

## 🎯 プロジェクトの目的

このプロジェクトは、確率論・統計学の課題で習得した知識を統合し、実践的な教育データ分析システムを構築することを目的としています。

## 📊 活用する統計手法

### 1. 条件付き確率・同時確率
- 問題間の正答相関分析
- 「問題Aができた学生が問題Bもできる確率」の計算

### 2. ベイズの定理
- 事前分布と事後分布の更新
- 学生の能力パラメータの推定

### 3. MCMC法（マルコフ連鎖モンテカルロ）
- 平均点の事後分布の推定
- 複雑なパラメータ空間の探索

### 4. 連続型確率変数
- 成績分布の期待値・分散計算
- 確率密度関数の可視化

## 🏗️ アーキテクチャ

```
┌─────────────────┐
│   React         │
│   Frontend      │  ← ユーザーインターフェース
│   (Port 3000)   │     - グラフ可視化
└────────┬────────┘     - インタラクティブな分析
         │
         │ REST API
         │
┌────────▼────────┐
│   Go Backend    │  ← APIサーバー
│   (Port 8080)   │     - データ処理
└────────┬────────┘     - 統計計算
         │
         │ CSV読込
         │
┌────────▼────────┐
│   grades.csv    │  ← 成績データ
│   (100×10問)    │     - Python生成
└─────────────────┘
```

## 🛠️ 技術スタック

| レイヤー | 技術 | 理由 |
|---------|------|------|
| **Backend** | Go 1.21 | 高速・並行処理・型安全 |
| **Frontend** | React 18 | モダンUI・コンポーネント指向 |
| **可視化** | Recharts | React統合・レスポンシブ |
| **CI/CD** | GitHub Actions | 自動テスト・デプロイ |
| **コンテナ** | Docker | 環境統一・デプロイ簡素化 |
| **データ生成** | Python | 科学計算・統計処理 |

## 📁 プロジェクト構造

```
bayesian-edu-dashboard/
│
├── backend/                      # Go APIサーバー
│   ├── cmd/server/main.go       # メインサーバー
│   ├── go.mod                   # 依存関係
│   └── Dockerfile               # コンテナイメージ
│
├── frontend/                     # React UI
│   ├── src/
│   │   ├── App.js              # メインコンポーネント
│   │   ├── App.css             # スタイル
│   │   └── index.js            # エントリーポイント
│   ├── package.json            # npm依存関係
│   └── Dockerfile              # コンテナイメージ
│
├── .github/workflows/           # CI/CD設定
│   ├── backend.yml             # バックエンドCI
│   └── frontend.yml            # フロントエンドCI
│
├── grades.csv                   # 成績データ（生成）
├── generate_data.py            # データ生成スクリプト
├── docker-compose.yml          # オーケストレーション
├── Makefile                    # 開発タスク自動化
├── README.md                   # プロジェクト説明
└── SETUP.md                    # セットアップガイド
```

## 🚀 主要機能

### ✅ 実装済み

1. **基本統計量の計算**
   - 平均点、中央値、標準偏差
   - 最小値、最大値

2. **成績分布の可視化**
   - ヒストグラム（棒グラフ）
   - レスポンシブデザイン

3. **問題別正答率分析**
   - 各問題の難易度評価
   - 棒グラフによる可視化

4. **学生成績一覧**
   - ソート機能（得点順）
   - 色分け表示（正答/不正答）

### 🔜 今後実装予定

1. **MCMC推定機能**
   - Metropolis-Hastingsアルゴリズム
   - 平均点の事後分布可視化
   - トレースプロットの表示

2. **学生能力パラメータ推定**
   - IRT（Item Response Theory）モデル
   - 能力θの事後分布

3. **条件付き確率分析**
   - 問題間の相関マトリックス
   - ヒートマップ可視化

4. **予測モデル**
   - ベイズ的予測分布
   - 次回テスト結果の予測区間

## 📊 データ構造

### grades.csv
```csv
Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Total
0,1,1,1,1,1,1,1,1,1,9
1,1,1,1,0,1,1,1,1,1,8
...
```

- **100人の学生** × **10問**
- 各問題は0（不正答）または1（正答）
- Total列は合計得点（0-10点）

### データ生成アルゴリズム

```python
# 学生の能力分布 N(7.0, 1.5²)
student_abilities ~ Normal(7.0, 1.5)

# 問題の難易度 U(0.3, 0.9)
question_difficulties ~ Uniform(0.3, 0.9)

# IRT風の正答確率
P(正答|能力,難易度) = 1 / (1 + exp(-5 * (ability/10 - (1-difficulty))))
```

## 🔄 CI/CD パイプライン

### Backend Pipeline
```
Push to main → Test → Build → Docker Build → Push to Registry
```

### Frontend Pipeline
```
Push to main → Test → Build → Deploy to Netlify
```

### 必要なSecrets
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

## 🧪 テスト戦略

### Backend
- Unit tests: Go標準テストパッケージ
- Integration tests: APIエンドポイントテスト

### Frontend
- Component tests: React Testing Library
- E2E tests: (今後) Cypress

## 📈 性能目標

- **API応答時間**: < 100ms
- **フロントエンド初回読込**: < 2秒
- **グラフ描画**: リアルタイム（< 50ms）

## 🎓 学習効果

このプロジェクトを通じて習得できるスキル：

1. **統計学**
   - ベイズ推定の実践
   - MCMC法の実装
   - データ可視化

2. **フルスタック開発**
   - Go APIサーバー構築
   - React UIコンポーネント開発
   - REST API設計

3. **DevOps**
   - Docker/Docker Compose
   - CI/CD構築
   - GitHub Actions

4. **データサイエンス**
   - Python データ生成
   - 統計モデリング
   - 可視化技術

## 📚 参考資料

- Go公式ドキュメント: https://go.dev/doc/
- React公式ドキュメント: https://react.dev/
- Recharts: https://recharts.org/
- MCMC入門: [参考書籍]
- ベイズ統計学: [参考書籍]

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

MIT License - 教育目的での自由な利用を許可

## 👥 作成者

統計学・確率論課題プロジェクト

---

**最終更新**: 2025年1月17日
**バージョン**: 1.0.0
