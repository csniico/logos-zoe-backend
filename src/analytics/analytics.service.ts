import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from 'src/article/schema/article.schema';
import { Podcast } from 'src/podcast/schema/podcast.schema';
import { Devotional } from 'src/devotionals/schema/devotionals.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Podcast.name) private podcastModel: Model<Podcast>,
    @InjectModel(Devotional.name) private devotionalModel: Model<Devotional>,
  ) {}

  async getDashboardMetrics() {
    const [articleStats, podcastStats, devotionalStats, contentHours] =
      await Promise.all([
        this.getArticleStats(),
        this.getPodcastStats(),
        this.getDevotionalStats(),
        this.calculateContentHours(),
      ]);

    const totalHits =
      articleStats.hits + podcastStats.hits + devotionalStats.hits;

    // Storage estimation based on DB records
    // This is an approximation. For exact S3 stats, we'd need to query S3 directly (which is slower/costlier)
    const storageStats = {
      audioFilesCount: podcastStats.count, // Assuming 1 audio per podcast
      imageFilesCount:
        articleStats.withImageCount + devotionalStats.withImageCount,
    };

    return {
      overview: {
        totalArticles: articleStats.count,
        totalPodcasts: podcastStats.count,
        totalDevotionals: devotionalStats.count,
        totalContentHours: contentHours,
        totalHits: totalHits,
      },
      engagement: {
        articleHits: articleStats.hits,
        podcastHits: podcastStats.hits,
        devotionalHits: devotionalStats.hits,
      },
      storage: storageStats,
    };
  }

  private async getArticleStats() {
    const articles = await this.articleModel.find({ isDeleted: false });
    const count = articles.length;
    const hits = articles.reduce(
      (sum, item) => sum + (item.hits?.length || 0),
      0,
    );
    const withImageCount = articles.filter((a) => a.article_image).length;
    return { count, hits, withImageCount };
  }

  private async getPodcastStats() {
    const podcasts = await this.podcastModel.find({ isDeleted: false });
    const count = podcasts.length;
    const hits = podcasts.reduce(
      (sum, item) => sum + (item.hits?.length || 0),
      0,
    );
    return { count, hits };
  }

  private async getDevotionalStats() {
    const devotionals = await this.devotionalModel.find({ isDeleted: false });
    const count = devotionals.length;
    const hits = devotionals.reduce(
      (sum, item) => sum + (item.hits?.length || 0),
      0,
    );
    const withImageCount = devotionals.filter(
      (d) =>
        d.fileKey || (d.listOfImageAssets && d.listOfImageAssets.length > 0),
    ).length;
    return { count, hits, withImageCount };
  }

  private async calculateContentHours() {
    const podcasts = await this.podcastModel.find({ isDeleted: false });
    const totalSeconds = podcasts.reduce(
      (sum, item) => sum + (item.duration || 0),
      0,
    );
    return parseFloat((totalSeconds / 3600).toFixed(2));
  }
}
