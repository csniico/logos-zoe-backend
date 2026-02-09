import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { MulterModule } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/storage.service';

@Module({
  imports: [MulterModule.register()],
  controllers: [DocumentController],
  providers: [DocumentService, StorageService],
})
export class DocumentModule {}
