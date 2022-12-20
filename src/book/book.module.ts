import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookController } from './book.controller';
import { BookService } from './book.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
