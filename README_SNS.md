# SNS機能開発ガイド

## セットアップ完了項目

### 1. インストール済みパッケージ
- **@tanstack/react-query**: データフェッチングとキャッシュ管理
- **@tanstack/react-query-devtools**: 開発用デバッグツール
- **socket.io**: リアルタイム通信サーバー
- **socket.io-client**: リアルタイム通信クライアント
- **react-hook-form**: フォーム管理
- **@hookform/resolvers**: フォームバリデーション
- **zod**: スキーマバリデーション
- **react-infinite-scroll-component**: 無限スクロール

### 2. 作成済み設定ファイル

#### React Query設定
- `components/ClientLayout.tsx`: QueryClientProviderを統合済み
- 設定内容:
  - staleTime: 1分
  - gcTime: 5分
  - retry: 1回
  - refetchOnWindowFocus: 無効

#### Socket.io設定
- `lib/socket.ts`: Socket.io接続管理
- `hooks/useSocket.ts`: Socket.ioカスタムフック
- `app/api/socket/route.ts`: Socket.ioサーバーエンドポイント

### 3. フォルダ構造

```
app/sns/
├── feed/           # フィード画面
├── profile/        # プロフィール画面
├── messages/       # メッセージ機能
└── notifications/  # 通知機能

lib/sns/
├── api/           # API クライアント
│   └── client.ts
├── types/         # TypeScript型定義
│   └── index.ts
├── utils/         # ユーティリティ関数
└── validations/   # バリデーションスキーマ
    └── index.ts

components/sns/
├── posts/         # 投稿関連コンポーネント
├── comments/      # コメント関連
├── likes/         # いいね機能
├── follows/       # フォロー機能
├── messages/      # メッセージ関連
├── notifications/ # 通知関連
└── common/        # 共通コンポーネント

hooks/sns/
└── usePosts.ts    # 投稿関連のカスタムフック
```

### 4. 環境変数設定
`.env.local`に以下を追加済み:
```env
# SNS機能設定
MAX_POST_LENGTH=500
POSTS_PER_PAGE=20
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/gif,image/webp"
ENABLE_REALTIME=false
ENABLE_MODERATION=true
MODERATION_KEYWORDS=""
ENABLE_NOTIFICATIONS=true
NOTIFICATION_EMAIL_INTERVAL=3600000  # 1時間
```

## 次のステップ

### データベース設計
1. Prismaスキーマの更新（SNSモデル追加）
2. マイグレーション実行

### API実装
1. `/api/sns/posts` - 投稿CRUD
2. `/api/sns/comments` - コメント機能
3. `/api/sns/likes` - いいね機能
4. `/api/sns/follows` - フォロー機能
5. `/api/sns/messages` - メッセージ機能
6. `/api/sns/notifications` - 通知機能

### UI実装
1. フィード画面
2. 投稿作成フォーム
3. プロフィール画面
4. メッセージ画面
5. 通知画面

### Socket.io実装
1. リアルタイム通知
2. リアルタイムメッセージ
3. オンラインステータス

## 使用方法

### 投稿の取得（フィード）
```typescript
import { useFeed } from '@/hooks/sns/usePosts';

const FeedComponent = () => {
  const { data, fetchNextPage, hasNextPage } = useFeed();
  // ...
};
```

### 投稿の作成
```typescript
import { useCreatePost } from '@/hooks/sns/usePosts';

const CreatePostComponent = () => {
  const { mutate: createPost } = useCreatePost();
  
  const handleSubmit = (data) => {
    createPost(data);
  };
  // ...
};
```

### Socket.io使用例
```typescript
import { useSocket } from '@/hooks/useSocket';

const Component = () => {
  const { emit, on, off } = useSocket();
  
  useEffect(() => {
    const handleNewPost = (data) => {
      console.log('New post:', data);
    };
    
    return on('post:new', handleNewPost);
  }, [on]);
  // ...
};
```