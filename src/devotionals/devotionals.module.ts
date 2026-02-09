import { Module } from '@nestjs/common';
import { DevotionalsService } from './devotionals.service';
import { DevotionalsController } from './devotionals.controller';
import { StorageService } from 'src/storage/storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Devotional, DevotionalSchema } from './schema/devotionals.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Devotional.name,
        schema: DevotionalSchema,
      },
    ]),
  ],
  controllers: [DevotionalsController],
  providers: [DevotionalsService, StorageService],
})
export class DevotionalsModule {}
