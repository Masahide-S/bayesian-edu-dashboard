# Bayesian Education Dashboard

ベイズ推定・MCMC法を用いた教育データ分析ダッシュボード

## 概要

このプロジェクトは、確率論・統計学の知識を活用した実践的な教育データ分析システムです。

### 主な機能

- **成績データの可視化**: 学生の得点分布、問題別正答率
- **基本統計量の計算**: 平均点、中央値、標準偏差など
- **データ分析**: 問題難易度の評価、成績分布の可視化
- **条件付き確率計算** ✅: P(Q_j=1 | Q_i=1) を計算
- **問題間相関マトリックス** ✅: ピアソン相関係数をヒートマップで可視化
- **ベイズの定理による確率更新** ✅: P(Total≥threshold | Q=value) を計算

### 技術スタック

- **Backend**: Go 1.21+
- **Frontend**: React 18 + TypeScript
- **CI/CD**: GitHub Actions
- **可視化**: Recharts
- **統計計算**: Python (データ生成)

## プロジェクト構造

```
bayesian-edu-dashboard/
├── backend/          # Go APIサーバー
│   ├── cmd/         # エントリーポイント
│   └── api/         # APIハンドラー
├── frontend/         # React アプリケーション
│   ├── src/
│   └── public/
├── .github/
│   └── workflows/   # CI/CD設定
├── grades.csv       # 成績データ
└── README.md
```

## セットアップ

### 前提条件

- Go 1.21以上
- Node.js 18以上
- pnpm（パッケージマネージャー）
- Python 3.8以上（データ生成用）

### データ生成

```bash
python3 generate_data.py
```

100人の学生×10問のテストデータを生成します。

### Backend

```bash
cd backend
go mod tidy
go mod download
go run cmd/server/main.go
```

### Frontend

```bash
cd frontend
pnpm install
pnpm start
```

## API エンドポイント

- `GET /api/health` - ヘルスチェック
- `GET /api/grades` - 全成績データ取得
- `GET /api/statistics` - 基本統計量
- `GET /api/conditional-probability?given=1&target=2` - 条件付き確率計算 ✅
- `GET /api/correlation-matrix` - 問題間相関マトリックス ✅
- `GET /api/bayes?condition=q1&value=1&threshold=8` - ベイズの定理計算 ✅

## テスト実行

### Backend
```bash
cd backend
go test -v ./...
go test -cover ./...  # カバレッジ表示
```

### Frontend
```bash
cd frontend
pnpm test
pnpm test -- --coverage  # カバレッジ表示
```

## ビルド

### Backend
```bash
cd backend
go build -o bin/server ./cmd/server/main.go
```

### Frontend
```bash
cd frontend
pnpm build
```

## 機能説明

### データ可視化
- 得点分布のヒストグラム
- 問題別正答率の棒グラフ
- 学生成績一覧テーブル

### 統計分析
- 平均点、中央値、標準偏差の計算
- 最小値、最大値の表示
- 問題ごとの難易度評価（正答率）

### ベイズ統計機能（新規実装） ✅

#### 1. 条件付き確率計算
- **目的**: 問題間の関連性を分析
- **計算式**: P(Q_target=1 | Q_given=1)
- **使用例**: 「Q1を正解した学生がQ2も正解する確率」
- **テストカバレッジ**: 100%（6テストケース）

#### 2. 問題間相関マトリックス
- **目的**: 全問題ペアの相関関係を可視化
- **計算方法**: ピアソン相関係数
- **可視化**: 10×10ヒートマップ（正の相関:青、負の相関:赤）
- **特徴**: 対称行列、値の範囲は-1〜1
- **テストカバレッジ**: 100%（4テストケース）

#### 3. ベイズの定理による確率更新
- **目的**: 条件に基づく事後確率の推定
- **計算式**: P(Total≥threshold | Q_condition=value)
- **使用例**: 「Q1を正解した学生が合計8点以上を取る確率」
- **提供情報**:
  - 事後確率
  - 事前確率
  - 尤度
  - 条件を満たす学生数
- **テストカバレッジ**: 100%（7テストケース）

### テスト結果

- **総テスト数**: 22個
- **合格率**: 100%
- **コードカバレッジ**: 78.5%
- **開発手法**: テスト駆動開発（TDD）

## トラブルシューティング

### pnpmがインストールされていない場合

```bash
npm install -g pnpm
```

### Goの依存関係エラー

```bash
cd backend
go mod tidy
go mod download
```

### フロントエンドのビルドエラー

```bash
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## ライセンス

MIT License

