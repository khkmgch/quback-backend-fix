import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { editFileName } from './utils/upload-file.util';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: 'public/images',
        filename: editFileName,
      }),
      limits: {
        fileSize: 50000000,
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
