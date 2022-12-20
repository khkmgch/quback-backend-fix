import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';
import { BookModule } from './book/book.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    //ConfigModuleをグローバルにインストール
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    QuestionModule,
    BookModule,
    PrismaModule,
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../public'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
