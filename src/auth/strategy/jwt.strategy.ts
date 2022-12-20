//AuthGuard('jwt')をJwtStrategyでカスタマイズする。
//(cookieを取り出す場所やシークレットキーの設定)

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { User_WithRelation } from "types";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super({
      //リクエストのcookiesから'access_token'という名前のjwtを取り出す。
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req): string | null => {
          let jwt = null;
          if (req && req.cookies) {
            jwt = req.cookies['access_token'];
          }
          return jwt;
        },
      ]),
      //jwtの有効期限が切れていた場合に無効にする
      ignoreExpiration: false,
      //jwt生成に使ったキーを.envから取得(ConfigServiceのgetメソッド)
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  //PassportStrategyクラスのvalidateメソッド(抽象メソッド)を実装。
  //クライアントから送られてきたjwtに問題がなければ、jwtとシークレットキーを合わせてpayloadを復元しvalidateメソッドに渡す処理が行われる。
  //(auth.service.tsのgenerateJwtメソッド内で、payloadとシークレットキーを使ってjwtを生成した。)
  async validate(payload: { sub: number; email: string }) {
    const user: User_WithRelation = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
      include: {
        questions: true,
        likeQuestions: true,
        books: true,
        followedBy: true,
        following: true,
      },
    });
    delete user.hashedPassword;
    //ログインしているユーザーのオブジェクトを返す。
    //nestJsでは、自動的にRequestの中にuserを含めてくれるので、controller内でRequestからユーザー情報にアクセスできる。
    return user;
  }
}
