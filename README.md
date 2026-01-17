# Bayesian Education Dashboard

ベイズ推定・MCMC法を用いた教育データ分析ダッシュボード

## 概要

このプロジェクトは、確率論・統計学の知識を活用した実践的な教育データ分析システムです。

### 主な機能

- **成績データの可視化**: 学生の得点分布、問題別正答率
- **ベイズ推定**: MCMCを用いた平均点の事後分布推定
- **条件付き確率分析**: 問題間の相関分析
- **予測モデル**: 学生の能力パラメータ推定

### 技術スタック

- **Backend**: Go 1.21+
- **Frontend**: React 18 + TypeScript
- **CI/CD**: GitHub Actions
- **統計計算**: Python (データ生成・MCMC)

## プロジェクト構造

```
bayesian-edu-dashboard/
├── backend/          # Go APIサーバー
│   ├── cmd/         # エントリーポイント
│   ├── internal/    # 内部パッケージ
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

### Backend

```bash
cd backend
go mod download
go run cmd/server/main.go
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## データ生成

```bash
python3 generate_data.py
```

100人の学生×10問のテストデータを生成します。

## API エンドポイント

- `GET /api/grades` - 全成績データ取得
- `GET /api/statistics` - 基本統計量
- `POST /api/mcmc` - MCMC推定実行
- `GET /api/correlation` - 問題間相関分析

## ライセンス

MIT License
