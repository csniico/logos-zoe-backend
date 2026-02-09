import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Article, ArticleSchema } from 'src/article/schema/article.schema';
import { Podcast, PodcastSchema } from 'src/podcast/schema/podcast.schema';
import {
  Devotional,
  DevotionalSchema,
} from 'src/devotionals/schema/devotionals.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      { name: Podcast.name, schema: PodcastSchema },
      { name: Devotional.name, schema: DevotionalSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
