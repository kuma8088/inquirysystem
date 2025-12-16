# 問い合わせシステム フロントエンド

AI自動応答機能を備えた問い合わせ管理システムのフロントエンドSPAです。ユーザーが送信した問い合わせに対し、AWS Bedrock Claude APIがリアルタイムで回答を生成します。

## 主要機能

- **問い合わせ送信**: バリデーション付きフォームから問い合わせを送信
- **AI自動応答**: Amazon Bedrock (Claude) による自動回答生成
- **リアルタイムポーリング**: 回答生成状況を自動的に取得（5秒→10秒間隔、最大3分）
- **履歴検索**: メールアドレスによる過去の問い合わせ検索
- **ローカル保存**: ブラウザに問い合わせIDを保存し、再訪時にアクセス可能

## デモ

- **本番環境**: http://inquiry-frontend-dev.s3-website-ap-northeast-1.amazonaws.com

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | React 19 + TypeScript |
| ビルドツール | Vite |
| スタイリング | Tailwind CSS v4 |
| 状態管理 | TanStack Query (React Query) |
| ルーティング | React Router DOM v7 |
| フォーム | react-hook-form + zod |
| テスト | Vitest + Testing Library |
| デプロイ | AWS S3 静的ホスティング |

## クイックスタート

### 前提条件

- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd frontend

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
```

### 環境変数

`.env`ファイルを作成し、以下の変数を設定してください：

```env
VITE_API_BASE_URL=https://hhzmeeanrb.execute-api.ap-northeast-1.amazonaws.com
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセスしてください。

## 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 (HMR有効) |
| `npm run build` | プロダクションビルドを作成 |
| `npm run preview` | ビルド結果をローカルでプレビュー |
| `npm run lint` | ESLintによるコード検証 |
| `npm run test` | テストをウォッチモードで実行 |
| `npm run test:run` | テストを1回実行 |
| `npm run test:coverage` | カバレッジレポート付きでテスト実行 |

## プロジェクト構成

```
src/
├── api/              # APIクライアント
│   ├── client.ts     # 共通HTTPクライアント
│   └── inquiry.ts    # 問い合わせAPI関数
├── components/       # Reactコンポーネント
│   ├── common/       # 再利用可能な共通コンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Loading.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── Card.tsx
│   ├── inquiry/      # 問い合わせ機能コンポーネント
│   │   ├── InquiryForm.tsx
│   │   ├── InquiryDetail.tsx
│   │   └── InquiryList.tsx
│   └── layout/       # レイアウトコンポーネント
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── hooks/            # カスタムフック
│   ├── useInquirySubmit.ts    # 問い合わせ送信
│   ├── useInquiryDetail.ts    # 詳細取得＆ポーリング
│   ├── useInquiryList.ts      # 履歴検索
│   └── useLocalStorage.ts     # localStorage管理
├── pages/            # ページコンポーネント
│   ├── HomePage.tsx           # トップページ
│   ├── InquiryDetailPage.tsx  # 詳細ページ
│   ├── HistoryPage.tsx        # 履歴検索ページ
│   └── NotFoundPage.tsx       # 404ページ
├── providers/        # Context/Provider
│   └── QueryProvider.tsx      # TanStack Query設定
├── types/            # TypeScript型定義
│   ├── inquiry.ts    # 問い合わせ関連型
│   └── common.ts     # 共通型
├── utils/            # ユーティリティ関数
│   ├── validation.ts # バリデーションスキーマ (zod)
│   ├── formatDate.ts # 日付フォーマット
│   ├── maskEmail.ts  # メールアドレスマスク
│   └── constants.ts  # 定数定義
├── App.tsx           # ルーティング設定
├── main.tsx          # エントリポイント
└── index.css         # グローバルスタイル (Tailwind)
```

## ルーティング

| パス | ページ | 説明 |
|------|-------|------|
| `/` | HomePage | 問い合わせフォーム |
| `/inquiry/:id` | InquiryDetailPage | 問い合わせ詳細とAI回答 |
| `/history` | HistoryPage | 履歴検索（メールアドレス） |
| `*` | NotFoundPage | 404エラーページ |

## 主要な実装パターン

### 1. フォームバリデーション

react-hook-form + zodを使用した型安全なバリデーション：

```typescript
const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  name: z.string().min(1, '名前を入力してください'),
  content: z.string().min(10, '10文字以上入力してください'),
});
```

### 2. リアルタイムポーリング

TanStack Queryの`refetchInterval`を使用した段階的ポーリング：

- 最初の1分: 5秒間隔
- 1分以降: 10秒間隔
- 3分でタイムアウト

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['inquiry', id],
  queryFn: () => fetchInquiryDetail(id),
  refetchInterval: (query) => {
    const data = query.state.data;
    if (data?.answer) return false; // 回答取得済み
    const elapsed = Date.now() - startTime;
    if (elapsed > TIMEOUT) return false;
    return elapsed < 60000 ? 5000 : 10000;
  },
});
```

### 3. ローカルストレージ管理

カスタムフック`useLocalStorage`で問い合わせIDを永続化：

```typescript
const [inquiryIds, setInquiryIds] = useLocalStorage<string[]>('inquiryIds', []);
```

## API仕様

### エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/inquiries` | 問い合わせ作成 |
| GET | `/inquiries/{id}` | 問い合わせ詳細取得 |
| GET | `/inquiries?email={email}` | メール検索 |

### リクエスト例

```typescript
// 問い合わせ作成
POST /inquiries
{
  "name": "山田太郎",
  "email": "yamada@example.com",
  "content": "サービスについて質問があります"
}

// レスポンス
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "山田太郎",
  "email": "yamada@example.com",
  "content": "サービスについて質問があります",
  "status": "pending",
  "createdAt": "2025-12-16T10:00:00Z",
  "answer": null
}
```

## テスト

Vitest + Testing Libraryによるユニット/インテグレーションテスト：

```bash
# ウォッチモードで実行
npm run test

# 1回だけ実行
npm run test:run

# カバレッジレポート生成
npm run test:coverage
```

テスト対象：
- コンポーネントのレンダリング
- フォームバリデーション
- カスタムフックのロジック
- ユーティリティ関数

## デプロイ

### S3静的ホスティング

1. プロダクションビルド作成：
```bash
npm run build
```

2. `dist/`ディレクトリをS3バケットにアップロード

3. S3バケットの静的ウェブサイトホスティングを有効化

### 環境別設定

本番環境では`.env.production`を使用：

```env
VITE_API_BASE_URL=https://production-api.example.com
```

## トラブルシューティング

### ポーリングが停止しない

- ブラウザのコンソールでタイムアウト時間を確認
- `constants.ts`の`POLLING_TIMEOUT`を調整

### CORS エラー

- バックエンドAPIのCORS設定を確認
- API Gatewayで適切なヘッダーが設定されているか確認

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## ライセンス

MIT

## 関連リンク

- [React公式ドキュメント](https://react.dev/)
- [Vite公式ドキュメント](https://vitejs.dev/)
- [TanStack Query公式ドキュメント](https://tanstack.com/query/latest)
- [Tailwind CSS v4公式ドキュメント](https://tailwindcss.com/)
