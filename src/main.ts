import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//cookieParser: Jwtトークンのやり取りをcookieベースで行うので、クライアントのリクエストからcookieを取り出すのに必要
import * as cookieParser from 'cookie-parser';
//csurf: csrf対策でcsrfトークンを使えるようにする
import * as csurf from 'csurf';
import * as bodyParser from 'body-parser';
import { Request } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //DTOとクラスバリデーションを使う
  //whitelist: true で、dtoに含まれないものが送られてきた際に省く
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  //Corsの設定
  app.enableCors({
    //credentials: フロントエンドとバックエンドでJWTトークンをcookieベースで通信する。
    credentials: true,
    //バックエンドのサービスへのアクセスを許可したい、フロントエンド(React側)のドメインを指定
    origin: ['http://localhost:3000'],
  });

  //グローバルのミドルウェアでcookieParserを実行し、
  //フロントエンドから受け取ったcookieを解析できるようにする。
  app.use(cookieParser());

  //Csurfのプロテクション設定
  //authの@Get('/csrf')のエンドポイントでの処理でcsftTokenを生成する時に
  //使ったSecret(シークレットキー)をcookieの_csrfに格納する。
  //Secretをjavascriptの方から読み取られたくないので、httpOnly: trueに設定。
  //secure: postmanで確認する際はfalse
  //value: クライアントのリクエストヘッダーに付与されたcsftTokenを、
  //サーバーサイド側で読み込んでvalueに設定(req.header('csrf-token'))
  //(ログイン時にヘッダーからcsftTokenを読み込んで認証するようになる)
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
      value: (req: Request): string => {
        return req.header('csrf-token');
      },
    }),
  );

  //リクエストボディの最大値はデフォルトで100kbになっているため、画像ファイルを扱うために最大値を変更する
  // jsonをパースする際のlimitを設定
  app.use(bodyParser.json({ limit: '50mb' }));
  // urlencodeされたボディをパースする際のlimitを設定
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  //本番環境にデプロイした際には環境変数で設定したポート番号を使用。
  //それがない場合にはローカルの3005番を使用。
  await app.listen(process.env.PORT || 3005);
}
bootstrap();
