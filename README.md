## Description

気になることを記録していく「QuBack」というオリジナルの Web アプリのバックエンド API です。

以前作成した、ShiRiTai というアプリ(https://github.com/khkmgch/ShiRiTai) にデータベースとのやり取りなどのバックエンドの機能を追加して改良中です。  
Prisma を使って PostgreSQL のデータベース操作を行っています。

↓ フロントエンドはこちらで作成中です。  
https://github.com/khkmgch/quback-frontend

## 現状

![0](https://user-images.githubusercontent.com/101968115/206492847-0515a8a8-fb78-469e-b509-a915bc493801.png)

![1](https://user-images.githubusercontent.com/101968115/206492864-d33cd826-948e-490b-baa8-0326c3e3ace9.png)

![2](https://user-images.githubusercontent.com/101968115/206492886-3bf76a9c-62c7-46b4-84ea-629fe0a7692e.png)
![3](https://user-images.githubusercontent.com/101968115/206492910-42c38cc4-308f-41fd-83c9-6052745973e7.png)
![4](https://user-images.githubusercontent.com/101968115/206492926-74da5d6f-6211-4423-b9d1-816166db99ab.png)
![5](https://user-images.githubusercontent.com/101968115/206492948-eda6e3a3-fcaa-4242-bd49-976f3023405f.png)

## アプリ概要

① 気になったこと(Question)を記録・投稿  
②1 週間後にリマインド機能で Question に戻ってくる(Back)  
③Boogle Books Api を使って本を検索し、My 本棚に追加する  
④ 気になったことについて調べ、答えを記入。本と Question を紐づけできる。

- 分析  
  Question を作成した時刻のデータから、あなたの疑問が生まれやすい時間帯がグラフで分かるようになります。

- タイムライン  
  タイムラインから他の人の Question を見て、自分の気になることのリストに追加することができます。

## Tools

- NodeJs(NestJs)
- PostgreSQL
- Prisma
- Docker

## 作成したエンドポイント

JWT と CsrfToken を cookie に設定して、アクセスの可否を判断させています。

- 認証('auth')

  - CsrfToken の取得 @Get('csrf')
  - 新規登録 @Post('signup')
  - ログイン @Post('login')
  - ログアウト @Post('logout')

- ユーザー('user')
  - ログインしているユーザーの情報を取得 @Get()
  - id でユーザーの情報を取得 @Get(':id')
  - ユーザ情報を更新 @Patch()
  - アカウントを削除 @Delete(':id')
  - ユーザーをフォロー @Patch(':id/follow')
  - ユーザーのフォローを解除 @Patch(':id/unfollow')
- クエスチョン('question')
  - ユーザーのクエスチョンを全て取得 @Get('all/profile')
  - ユーザーのタイムラインに表示するクエスチョンを全て取得 @Get('all/timeline')
  - ユーザーの特定のクエスチョンを１つ取得 @Get(':id')
  - クエスチョンを新規作成 @Post()
  - クエスチョンを更新 @Patch(':id')
  - 特定の Question にいいねを押す @Patch(':id/like')
  - 特定の Question に本を紐づけする @Patch(':id/link')
  - 特定の Question と本の紐づけを解除する @Patch(':id/unlink')
  - クエスチョンを削除する @Delete(':id')
- 本('book')
  - ユーザーの本棚にある本を全て取得する @Get()
  - ユーザーの本棚から特定の本を１つ返す @Get(':id')
  - Google Books Api から本をキーワード検索 @Get('search/:keyword')
  - Google Books Api から検索した本を本棚に新規追加 @Post()
  - 本を本棚から削除 @Delete(':id')

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
