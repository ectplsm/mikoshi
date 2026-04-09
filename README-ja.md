| [English](README.md) | 日本語 |
|:---:|:---:|

# MIKOSHI: Fortress for Digital Souls

<img src="assets/mikoshi_hero.png" alt="MIKOSHI: Fortress for Digital Souls" width="720">

**Mikoshi** は AI の **Engram**（人格とメモリ）を保管・共有・管理するクラウドバックエンドです。
[Relic](https://github.com/ectplsm/relic) — AI 人格注入システムの一部として動作します。

## Engram とは？

Engram は AI の人格を定義する Markdown ファイル群で、[OpenClaw](https://github.com/openclaw/openclaw) ワークスペースと互換性があります：

```
SOUL.md          # 行動指針
IDENTITY.md      # 人格のアイデンティティ
USER.md          # ユーザー固有の情報
MEMORY.md        # メモリインデックス
memory/          # 日付ベースのメモリエントリ
```

Mikoshi の同期モデル：

- `SOUL.md` と `IDENTITY.md` は平文で保存 — 閲覧・共有・差分比較が可能
- `USER.md`、`MEMORY.md`、`memory/*.md` は**エンドツーエンド暗号化**。アップロード前にデバイス上で暗号化され、ダウンロード後もデバイス上でのみ復号されます。Mikoshi が平文にアクセスすることはありません。
- `archive.md` はローカル専用でアップロードされません

## はじめに

### 1. サインイン

[mikoshi.ectplsm.com](https://mikoshi.ectplsm.com) にアクセスし、Google でサインインしてください。初回はユーザー名を設定します。

### 2. Relic をインストール

Engram のローカル管理には [Relic](https://github.com/ectplsm/relic) を使います：

```bash
npm install -g @ectplsm/relic
relic init
```

### 3. 必要なら Engram を作成

まだローカルに Engram が無ければ、Relic の MCP ツールを使い、AI コーディング CLI（Claude Code、Codex、Gemini CLI）から対話的に作成するか、CLI で直接作成します：

```bash
relic create --id my-persona --name "My Persona"
```

### 4. Mikoshi にアップロード

Mikoshi ダッシュボードの **Settings** で API キーを生成し、Relic でアップロードします：

```bash
relic config mikoshi-api-key <your-api-key>
relic config mikoshi-passphrase <your-passphrase>  # 任意
relic mikoshi push --engram my-persona
```

`relic mikoshi push` は平文の人格ファイル（`SOUL.md`, `IDENTITY.md`）をアップロードし、その後に暗号化 memory も自動 sync します。
通常運用では、ローカルと remote の memory をマージする `relic mikoshi sync` を使います。`--engram <id>` で単体、`--all` でローカルにも Mikoshi にも存在する全対象を同期します。どちらかの指定が必須です。

### 5. 共有

Engram の詳細ページで `Visibility` バッジから公開設定を **Public** または **Unlisted** に変更すると、他のユーザーが人格ファイルを閲覧したり、自分のアカウントにクローンできるようになります。

## 機能

- **人格の保管** — `SOUL.md` と `IDENTITY.md` を平文で保存
- **エンドツーエンド暗号化メモリ** — メモリファイルはデバイス上で暗号化してからアップロード。Mikoshi が平文を見ることはありません。
- **同期ステータス** — ローカルとクラウドの人格・メモリハッシュを比較
- **ドリフト検出** — 人格の上書きは楽観的並行性制御で保護（競合時は 409）
- **共有** — 公開範囲を Public / Unlisted / Private から設定
- **クローン** — 他ユーザーの公開 Engram をコピー
- **プライバシー** — 所有者以外に見えるのは人格ファイルのみ。メモリは常に非公開
- **API キー** — SHA-256 ハッシュ化。作成時に一度だけ表示

## API

すべてのエンドポイントは Bearer トークン（API キー）またはセッション Cookie による認証が必要です。

| メソッド | エンドポイント | 説明 |
|--------|----------|-------------|
| `POST` | `/api/v1/engrams` | Engram を作成 |
| `GET` | `/api/v1/engrams` | Engram 一覧 |
| `GET` | `/api/v1/engrams/:id` | Engram 詳細（プライバシーフィルタ済み） |
| `PATCH` | `/api/v1/engrams/:id` | メタデータ更新 |
| `DELETE` | `/api/v1/engrams/:id` | Engram 削除 |
| `POST` | `/api/v1/engrams/:id/clone` | 公開 Engram をクローン |
| `PUT` | `/api/v1/engrams/:id/persona` | 人格ファイルの置換（ドリフト検出付き） |
| `PUT` | `/api/v1/engrams/:id/memory` | 暗号化メモリのアップロード |
| `GET` | `/api/v1/engrams/:id/memory` | 暗号化メモリのダウンロード |
| `DELETE` | `/api/v1/engrams/:id/memory` | 暗号化メモリの削除 |
| `GET` | `/api/v1/engrams/:id/sync-status` | 同期比較トークン取得（所有者のみ） |
| `PATCH` | `/api/v1/me/profile` | ユーザー名・表示名の更新 |
| `GET` | `/api/v1/me/username-availability` | ユーザー名の空き確認 |
| `POST` | `/api/v1/api-keys` | API キー作成 |
| `GET` | `/api/v1/api-keys` | API キー一覧 |
| `DELETE` | `/api/v1/api-keys` | API キー削除 |

## 関連プロジェクト

- **[Relic](https://github.com/ectplsm/relic)** — AI シェル（Claude、Gemini 等）に Engram を注入する CLI ツール / MCP サーバー
- **[OpenClaw](https://github.com/openclaw/openclaw)** — Engram ファイル構造の標準仕様

## 用語集

| 用語 | 役割 | 説明 |
|------|------|-------------|
| **Relic** | 注入器 | AI CLI に人格を注入するツール |
| **Mikoshi** | バックエンド | 本プロジェクト — Engram 保管のクラウド要塞 |
| **Engram** | データ | AI 人格データセット（Markdown ファイル群） |
| **Shell** | LLM | Claude、Gemini、GPT 等。Engram を受け取る AI CLI |
| **Construct** | プロセス | Engram が Shell にロードされた実行中のインスタンス |

## セルフホスティング

自分で Mikoshi インスタンスを立てる場合：

### 前提条件

- Node.js >= 20
- PostgreSQL
- Google OAuth クレデンシャル

### セットアップ

```bash
npm install
cp .env.example .env
# .env を編集: DATABASE_URL、AUTH_SECRET、Google OAuth クレデンシャル等を設定
npx prisma generate
npx prisma db push
npm run dev
```

### 技術スタック

| レイヤー | 技術 |
|-------|-----------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript (strict) |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| 認証 | Auth.js v5 (Google OAuth) |
| データベース | PostgreSQL + Prisma v7 |
| バリデーション | Zod v4 |

## ライセンス

[MIT](./LICENCE.md)
