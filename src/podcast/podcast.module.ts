import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PodcastController } from './podcast.controller';
import { PodcastService } from './podcast.service';
import { Podcast, PodcastSchema } from './schema/podcast.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Podcast.name, schema: PodcastSchema }]),
  ],
  controllers: [PodcastController],
  providers: [PodcastService],
})
export class PodcastModule {}
