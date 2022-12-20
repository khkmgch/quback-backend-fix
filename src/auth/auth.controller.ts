import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Csrf, Msg } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('csrf')
  getCsrfToken(@Req() req: Request): Csrf {
    //csrfTokenを生成するメソッドcsrfToken()が準備されている
    return { csrfToken: req.csrfToken() };
  }

  @Post('signup')
  signUp(@Body() dto: AuthDto): Promise<Msg> {
    return this.authService.signUp(dto);
  }

  //ログイン
  //リクエスト成功時のステータス : 201 Created → 200 Ok に変更
  //@Res({ passthrough: true }) : Json形式への変換とcookieの設定を両方有効化
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Msg> {
    const jwt = await this.authService.login(dto);

    //レスポンスに'access_token'という名前でcookieを設定
    //第２引数: cookieの値。jwtのaccessTokenの値を設定。

    //secure: false >> ローカル開発中はfalse(デプロイ時にtrueに変更)
    //trueにすると、httpsで暗号化された通信でのみcookieが使用可能になる。

    //sameSite: googleのCsrf対策でデフォルトで'lax'になっていて、Cookieがセットできないので、Cookieの送受信が可能になるように'none'に設定。
    res.cookie('access_token', jwt.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return {
      message: 'ok',
    };
  }

  //ログアウト
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Msg {
    //値を''にしてloginで設定したcookieをリセット
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return {
      message: 'ok',
    };
  }
}
