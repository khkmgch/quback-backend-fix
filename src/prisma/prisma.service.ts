import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

//PrismaClientを継承。createやdeleteメソッドが使用可能になる。
//super()で接続するデータベースURLを渡す。
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly config: ConfigService) {
    super({
      datasources: {
        db: {
          //ConfigServiceのgetメソッドで、.envファイルから環境変数を取得
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}
