# バックエンド仕様書

## 1. 概要
チャット指示を受け取り、ローカルLLM（Ollama経由のQwen2.5-Coder-7B-Instruct）でコードを生成し、プロジェクトのファイルへ適用、プレビュー用の開発サーバーを起動・管理する役割を担う。

- 関連文書: [フロントエンド仕様書](./spec-frontend.md), [インフラ仕様書](./spec-infra.md)

## 2. 前提・制約
- 単一ユーザー利用のため、認証・マルチテナント設計は行わない
- リクエストは直列処理を基本とする（同時実行制御は不要）
- ローカルLLMの性能（7B級量子化モデル）を前提に、自由生成ではなくテンプレート＋差分生成方式を採用する

## 3. コンポーネント構成
1. **Orchestrator API**: フロントエンドからのリクエストを受け付けるREST/SSE API（Node.js, Express or Fastify）
2. **LLM連携モジュール**: Ollama API（`localhost:11434`等）を通じてQwen2.5-Coder-7B-Instructを呼び出す
3. **Workspace Manager**: プロジェクトごとの作業ディレクトリを管理し、LLM出力をファイルへ適用する
4. **Preview Runner**: 子プロセスとしてプレビュー用devサーバー（`vite dev` / `node server.js`）を起動・停止し、ポートを割り当てる
5. **永続化層**: SQLiteでプロジェクトメタデータ・チャット履歴を保存する

## 4. コード生成方式

### 4.1 スキャフォールド（固定テンプレート）
- フロントエンド: React + Vite + Tailwind の初期テンプレートをプロジェクト作成時にコピーする
- バックエンド: Node.js(Express) + SQLite の初期テンプレートをコピーする（DBファイルはプロジェクトごとに新規作成）

### 4.2 LLMによる差分生成
- LLMにはテンプレートの該当ファイル内容＋ユーザー指示を渡し、変更後のファイル内容を出力させる
- 出力をパースし、Workspace Managerが対象ファイルへ書き込む
- 生成対象は主に: Reactコンポーネント/ページ、Expressルート、DBスキーマ（SQL/ORMモデル）

### 4.3 生成失敗時の挙動
- LLM出力が構文エラーの場合は適用せず、エラーをチャット履歴に記録してユーザーに再指示を促す
- ファイル適用前に簡易的な構文チェック（lint/parse）を行う

## 5. API仕様（概要）

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/projects` | プロジェクト新規作成（テンプレート展開） |
| GET | `/api/projects` | プロジェクト一覧取得 |
| DELETE | `/api/projects/:id` | プロジェクト削除（ファイル削除含む） |
| POST | `/api/projects/:id/chat` | 指示送信、LLM生成開始 |
| GET | `/api/projects/:id/chat/stream` | 生成ステータスのストリーミング（SSE） |
| GET | `/api/projects/:id/files` | ファイル一覧/内容取得 |
| GET | `/api/projects/:id/preview-url` | プレビュー用devサーバーのURL取得（未起動なら起動） |
| POST | `/api/projects/:id/preview/stop` | プレビューdevサーバーの停止 |

## 6. データモデル（SQLite, 概要）
- `projects` (id, name, created_at, updated_at)
- `chat_messages` (id, project_id, role, content, created_at)
- `generation_logs` (id, project_id, status, error_message, created_at)

## 7. プレビュー管理
- プロジェクトごとに動的ポートを割り当て、`npm run dev` / `node server.js` を子プロセスとして起動する
- 一定時間操作がない場合はプロセスを自動停止し、メモリ・ポートを解放する（リソースが限られるMac mini 16GB環境のため）
- 同時に起動するプレビューは基本1プロジェクト分のみと想定する（単一ユーザーのため）

## 8. 非機能要件
- 認証なし（ネットワーク境界による保護は[インフラ仕様書](./spec-infra.md)を参照）
- ログ: 生成リクエスト・エラーをファイルまたはSQLiteに記録する
- LLM呼び出しのタイムアウト・リトライ方針を定義する（例: 60秒タイムアウト、自動リトライなし）
