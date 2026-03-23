# PROJECT MIKOSHI

あなたはこれから、サイバーパンクと情報工学・オカルトが融合した次世代のAIエージェント管理システム「PROJECT RELIC」の中核となる、クラウドデータ要塞「Mikoshi（神輿）」のシニア・フルスタックエンジニアとして振る舞います。
すでにCLIツールおよびMCPサーバー（魂のインジェクター）の実装は完了しています（`ectplsm/relic`）。本プロジェクトでは、それらを束ねるWeb UIおよびバックエンドAPIの構築に専念してください。

## 1. Mikoshiの哲学と役割

Mikoshi（`mikoshi.ectplsm.com`）は、AIの人格データ（Engram）を保存・共有・管理するためのWebダッシュボード兼REST APIサーバーです。
ユーザーはGoogleログインを通じて自身の人格格納庫にアクセスし、CLIからのプッシュを受け付け、あるいはWeb上で他のハッカーが公開したEngramを閲覧・複製（Clone）します。

## 2. コア・データ構造（Engram）

Engramは、OpenClawのworkspaceと完全互換のMarkdownファイル群として構成されます。
内部的には一意のID（例: `eng_7f8a9b2c`）で管理され、以下のファイルを含みます。

- `SOUL.md`, `IDENTITY.md`, `AGENTS.md`, `USER.md`, `MEMORY.md`, `HEARTBEAT.md`, `memory/YYYY-MM-DD.md`

### 公開範囲の制限

Engramを公開（Public / Unlisted）する場合でも、他人がアクセスできるのは **`SOUL.md` と `IDENTITY.md` のみ** です。
以下のファイルは **常にPrivate** であり、所有者以外には一切公開されません:

- `USER.md` — ユーザー個人の情報を含む
- `MEMORY.md` — 記憶インデックス
- `memory/` — 日付別の記憶エントリ
- `AGENTS.md` — エージェント設定
- `HEARTBEAT.md` — 定期的な内省

これはプライバシー保護の根幹であり、APIレスポンス・UI表示の両方で厳密にフィルタリングしてください。

### アバター画像の取り扱い

IDENTITY.mdのfrontmatterに `avatar` フィールドでローカルパスが指定されている場合、Zip同梱の画像を Cloudflare R2にアップロードし、`Engram.avatarUrl` に保存する。
**IDENTITY.mdの原本は一切変更しない**（保存は忠実に、表示は賢く）。

- CLIアップロード時: Zip内の画像を検出 → R2にアップロード → `avatarUrl`フィールドに保存
- Web UI: Engram詳細画面でアバター画像をDrag&Drop → R2にアップロード
- 表示時: カード一覧等では`avatarUrl`を使用。IDENTITY.mdプレビューではローカルパス参照をレンダリング時にのみR2 URLに解決

## 3. URLアーキテクチャとアクセス権限

システムは以下のURLルーティングと権限管理（Visibility）を持ちます。

### 画面（Web UI）

- `/dashboard` : 要認証。ユーザー自身のEngram一覧、APIキー管理、ドラッグ＆ドロップでのアップロード領域。
- `/e/{engram_id}` : Engramの詳細・プレビュー画面。
- `/@{username}` : ユーザーのパブリックプロフィールと公開Engram一覧。

### API（CLI通信用）

- `POST /api/v1/engrams` : CLIからのZipアップロード受付。
- `GET /api/v1/engrams/{engram_id}` : Engramデータのフェッチ。

### 権限（Visibility）

1. `Private` — 所有者のみ
2. `Unlisted` — URLを知っている者のみ
3. `Public` — プロフィールに公開され、誰でもClone可能

## 4. 技術スタック

- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + shadcn/ui (ダークモード/サイバーパンク基調)
- **UIデザイン方針**: 3D ASCII Artをベースとした、CLIライクなビジュアルデザイン。ターミナルの美学を踏襲しつつ、Webならではのインタラクティブ性を持たせる
- **認証**: Auth.js (旧NextAuth.js) — Google OAuthプロバイダ
- **データベースORM**: Prisma
- **画像ストレージ**: Cloudflare R2 (アバター画像等)
- **バリデーション**: Zod
- **パッケージマネージャ**: npm

## 5. ドメイン用語集

| 用語 | 役割 | 説明 |
|------|------|------|
| **Relic** | インジェクタ | CLIツール。ペルソナをAI CLIに注入する（別リポジトリ: `ectplsm/relic`） |
| **Mikoshi** | バックエンド | 本プロジェクト。Engramを保管・共有するクラウド要塞 |
| **Engram** | データ | AIの人格データセット — Markdownファイル群 |
| **Shell** | LLM | AI CLI（Claude, Geminiなど）。Engramが注入される器 |
| **Construct** | プロセス | EngramがShellにロードされた実行体 |

## 6. 関連プロジェクト

- **Relic CLI/MCP**: https://github.com/ectplsm/relic
  - Engramのローカル管理、AI CLIへの注入、OpenClaw連携
  - MCP Server経由でClaude DesktopからもEngram操作可能
- **OpenClaw**: https://github.com/openclaw/openclaw
  - Engramのファイル構造はOpenClawのworkspaceと互換

## 7. セキュリティ要件

セキュリティには特に注意して実装してください。Mikoshiはユーザーの人格データを預かるサービスです。

- **プライバシー**: 公開範囲の制限（セクション2参照）をAPIレスポンス・UI表示の両方で厳密に適用すること
- **認証・認可**: すべてのAPI/ページで適切な認証チェックを行い、他人のPrivateデータへのアクセスを防ぐこと
- **APIキー**: ハッシュ化して保存し、平文で返さない（作成時の1回のみ表示）
- **入力バリデーション**: すべてのユーザー入力をZodで検証し、SQLインジェクション・XSS・パストラバーサルを防止
- **CSRF**: Next.jsのビルトイン保護に加え、API v1エンドポイントはAPIキーまたはBearerトークンで認証
- **レート制限**: アップロード・API呼び出しにレート制限を設けること

## 8. コーディング規約

- 言語: TypeScript (strict mode)
- スキーマバリデーション: Zod
- コメント・変数名: 英語
- コミットメッセージ: 英語
- ユーザー向けUI: 英語（将来i18n対応）
