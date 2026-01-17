# Bayesian Education Dashboard

ベイズ推定・MCMC法を用いた教育データ分析ダッシュボード

## 概要

このプロジェクトは、確率論・統計学の知識を活用した実践的な教育データ分析システムです。

### 主な機能

- **成績データの可視化**: 学生の得点分布、問題別正答率
- **基本統計量の計算**: 平均点、中央値、標準偏差など
- **データ分析**: 問題難易度の評価、成績分布の可視化

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

