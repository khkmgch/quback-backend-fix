import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Jwt, Msg } from './interfaces/auth.interface';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  //各ServiceをDI(Dependancy Injection)する
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  //ユーザー新規作成
  //戻り値はinterfaceで定義したMsg
  async signUp(dto: AuthDto): Promise<Msg> {
    //dtoで受け取ったパスワードをハッシュ化
    //第2引数: roundsを指定(2の12乗) >> ハッシュ計算に必要な回数
    const hashed = await bcrypt.hash(dto.password, 12);
    //PrismaServiceのcreateメソッドで、データベースにデータを作成する
    try {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          userName: dto.email.substring(0, dto.email.indexOf('@')),
          hashedPassword: hashed,
        },
      });
      return {
        message: 'ok',
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        //P2002 : ユニークキーのエラー(email String @unique に設定したため)
        if (err.code === 'P2002') {
          throw new ForbiddenException('This email is already taken');
        }
      }
      throw err;
    }
  }

  //ログイン
  async login(dto: AuthDto): Promise<Jwt> {
    //データベースからユーザーを探す
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        questions: true,
        likeQuestions: true,
        books: true,
        followedBy: true,
        following: true,
      },
    });
    //ユーザーが見つからない場合
    if (!user) throw new ForbiddenException('Email or Password incorrect');

    //dtoで渡されたパスワードと、データベースのハッシュ化されたパスワードを比較
    const isValid = await bcrypt.compare(dto.password, user.hashedPassword);

    if (!isValid) throw new ForbiddenException('Email or Password incorrect');
    //emailとパスワードに問題がなければ、Jwtを生成する
    return this.generateJwt(user.id, user.email);
  }

  //Jwt生成
  async generateJwt(userId: number, email: string): Promise<Jwt> {
    //payloadを定義
    const payload = {
      sub: userId,
      email,
    };
    //.envファイルからシークレットキーを取得(ConfigServiceのgetメソッド)
    const secret = this.config.get('JWT_SECRET');
    //payloadとsecretを使ってトークンを生成(JwtServiceのsignAsyncメソッド)
    const token = await this.jwt.signAsync(payload, {
      //トークンの有効期限
      expiresIn: '30m',
      //シークレットキー
      secret: secret,
    });
    return {
      accessToken: token,
    };
  }
}
