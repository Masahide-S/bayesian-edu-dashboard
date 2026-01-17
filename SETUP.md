# セットアップガイド

## 前提条件

以下のソフトウェアがインストールされている必要があります：

- **Go** 1.21以上
- **Node.js** 18以上
- **Python** 3.8以上（データ生成用）
- **Docker & Docker Compose**（オプション）
- **Make**（オプション、便利コマンド用）

## クイックスタート

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd bayesian-edu-dashboard
```

### 2. ダミーデータの生成

```bash
python3 generate_data.py
```

これで`grades.csv`が生成されます（100人×10問のテストデータ）。

### 3. バックエンドのセットアップ

```bash
cd backend
go mod download
go run cmd/server/main.go
```

バックエンドサーバーが`http://localhost:8080`で起動します。

### 4. フロントエンドのセットアップ

**新しいターミナルを開いて：**

```bash
cd frontend
npm install
npm start
```

フロントエンドが`http://localhost:3000`で起動します。

ブラウザで`http://localhost:3000`を開くとダッシュボードが表示されます。

## Makefileを使った簡単セットアップ

Makeがインストールされている場合：

```bash
# すべての依存関係をインストール
make install

# データ生成
make generate-data

# バックエンド起動（ターミナル1）
make run-backend

# フロントエンド起動（ターミナル2）
make run-frontend
```

## Dockerを使った起動

```bash
# イメージをビルド
make docker-build

# コンテナを起動
make docker-up

# アクセス
# Backend: http://localhost:8080
# Frontend: http://localhost:3000

# コンテナを停止
make docker-down
```

## API エンドポイント

バックエンドは以下のエンドポイントを提供します：

- `GET /api/health` - ヘルスチェック
- `GET /api/grades` - 全学生の成績データ
- `GET /api/statistics` - 基本統計量

## プロジェクト構造

```
bayesian-edu-dashboard/
├── backend/                 # Go APIサーバー
│   ├── cmd/
│   │   └── server/
│   │       └── main.go     # エントリーポイント
│   ├── go.mod              # Go依存関係
│   └── Dockerfile          # バックエンドDockerイメージ
│
├── frontend/               # React アプリケーション
│   ├── src/
│   │   ├── App.js         # メインコンポーネント
│   │   ├── App.css        # スタイル
│   │   ├── index.js       # エントリーポイント
│   │   └── index.css      # グローバルスタイル
│   ├── public/
│   │   └── index.html     # HTMLテンプレート
│   ├── package.json       # npm依存関係
│   ├── Dockerfile         # フロントエンドDockerイメージ
│   └── nginx.conf         # Nginx設定
│
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
│       ├── backend.yml    # バックエンドCI/CD
│       └── frontend.yml   # フロントエンドCI/CD
│
├── grades.csv             # 成績データ（生成される）
├── generate_data.py       # ダミーデータ生成スクリプト
├── docker-compose.yml     # Docker Compose設定
├── Makefile              # 便利コマンド
├── .gitignore            # Git除外設定
└── README.md             # プロジェクト概要
```

## 開発ワークフロー

### 1. ブランチ戦略

- `main` - 本番環境
- `develop` - 開発環境
- `feature/*` - 機能開発

### 2. CI/CD

GitHub Actionsが自動的に以下を実行します：

**プルリクエスト時：**
- コードのテスト
- ビルドの確認

**mainブランチへのマージ時：**
- バックエンド：Dockerイメージのビルド & プッシュ
- フロントエンド：Netlifyへのデプロイ

### 3. 必要なGitHub Secrets

CI/CDを有効にするには、GitHubリポジトリに以下のSecretsを設定してください：

- `DOCKER_USERNAME` - Docker Hubのユーザー名
- `DOCKER_PASSWORD` - Docker Hubのパスワード
- `NETLIFY_AUTH_TOKEN` - Netlify認証トークン
- `NETLIFY_SITE_ID` - NetlifyサイトID

## トラブルシューティング

### バックエンドが起動しない

```bash
# grades.csvが存在するか確認
ls grades.csv

# 存在しない場合は生成
python3 generate_data.py
```

### フロントエンドがバックエンドに接続できない

- バックエンドが`http://localhost:8080`で起動しているか確認
- ブラウザのコンソールでCORSエラーがないか確認

### Dockerコンテナが起動しない

```bash
# ログを確認
docker-compose logs backend
docker-compose logs frontend
```

## 次のステップ

基盤ができたので、以下の機能を実装していきます：

1. **MCMC実装** - ベイズ推定による平均点の事後分布
2. **能力パラメータ推定** - IRTモデルで学生の能力θを推定
3. **条件付き確率分析** - 問題間の相関を可視化
4. **予測モデル** - 次回テスト結果の予測

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。
