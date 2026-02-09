import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Podcast } from './schema/podcast.schema';
import { CreatePodcastDto } from './dto/createPodcast.dto';
import { UpdatePodcastMetadataDto } from './dto/updatePodcastMetadata.dto';
import { UpdatePodcastFileDto } from './dto/updatePodcastFile.dto';

@Injectable()
export class PodcastService {
  constructor(
    @InjectModel(Podcast.name) private podcastModel: Model<Podcast>,
  ) {}

  async create(dto: CreatePodcastDto) {
    try {
      const podcast = new this.podcastModel({ ...dto });
      return await podcast.save();
    } catch (error: any) {
      console.log(error);
      throw new BadRequestException('Failed to create podcast');
    }
  }

  async list(search?: string, page = 1, limit = 10) {
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (search && search.trim()) {
      filter['$or'] = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const offset = (page - 1) * limit;
    const podcasts = await this.podcastModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await this.podcastModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
      items: podcasts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getOne(id: string) {
    const podcast = await this.podcastModel.findById(id);
    if (!podcast || podcast.isDeleted) {
      throw new NotFoundException('Podcast not found');
    }

    // Ensure hits array exists for analytics
    if (!podcast.hits) {
      podcast.hits = [];
    }

    return podcast;
  }

  async updateMetadata(id: string, dto: UpdatePodcastMetadataDto) {
    const podcast = await this.podcastModel.findById(id);
    if (!podcast || podcast.isDeleted) {
      throw new NotFoundException('Podcast not found');
    }

    // Only update defined fields
    const definedEntries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    const updates: Partial<UpdatePodcastMetadataDto> = {};
    for (const [key, value] of definedEntries) {
      (updates as Record<string, unknown>)[key] = value;
    }

    Object.assign(podcast, updates);
    return podcast.save();
  }

  async updateFile(dto: UpdatePodcastFileDto) {
    const { podcastId, fileUrl, duration } = dto;
    const podcast = await this.podcastModel.findById(podcastId);
    if (!podcast || podcast.isDeleted) {
      throw new NotFoundException('Podcast not found');
    }

    podcast.fileUrl = fileUrl;
    podcast.duration = duration;
    return podcast.save();
  }

  async softDelete(id: string) {
    const podcast = await this.podcastModel.findById(id);
    if (!podcast || podcast.isDeleted) {
      throw new NotFoundException('Podcast not found');
    }

    podcast.isDeleted = true;
    podcast.deletedAt = new Date();
    podcast.published = false; // Unpublish when soft deleting
    await podcast.save();
    return { message: 'Podcast soft-deleted' };
  }

  async restore(id: string) {
    const podcast = await this.podcastModel.findById(id);
    if (!podcast || !podcast.isDeleted) {
      throw new NotFoundException('Podcast not found or not deleted');
    }

    podcast.isDeleted = false;
    podcast.deletedAt = undefined;
    await podcast.save();
    return { message: 'Podcast restored' };
  }

  async updatePublishedState(id: string, published: boolean) {
    const podcast = await this.podcastModel.findById(id);
    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }
    if (podcast.isDeleted) {
      throw new BadRequestException('Cannot publish a deleted podcast');
    }
    podcast.published = published;
    await podcast.save();
    return { message: `Podcast ${published ? 'published' : 'unpublished'}` };
  }

  async addHit(id: string, hit: string) {
    const podcast = await this.podcastModel.findById(id);
    if (!podcast || podcast.isDeleted) {
      throw new NotFoundException('Podcast not found');
    }
    // Initialize hits array if it doesn't exist
    if (!podcast.hits) {
      podcast.hits = [];
    }
    podcast.hits.push(hit);
    await podcast.save();
    return { message: 'Hit recorded' };
  }

  async getHits(id: string) {
    const podcast = await this.podcastModel.findById(id);
    if (!podcast || podcast.isDeleted) {
      throw new NotFoundException('Podcast not found');
    }
    // Return empty array if hits don't exist
    return { hits: podcast.hits || [] };
  }

  async getAnalytics() {
    const podcasts = await this.podcastModel
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 });

    const totalPodcasts = podcasts.length;
    // Safely handle missing hits array
    const totalHits = podcasts.reduce(
      (sum, p) => sum + (p.hits?.length || 0),
      0,
    );
    // Safely handle missing duration
    const totalDuration = podcasts.reduce(
      (sum, p) => sum + (p.duration || 0),
      0,
    );
    const avgHitsPerPodcast =
      totalPodcasts > 0 ? Math.round(totalHits / totalPodcasts) : 0;

    // Sort by hits to find trending and poorly performing
    const sortedByHits = [...podcasts].sort(
      (a, b) => (b.hits?.length || 0) - (a.hits?.length || 0),
    );
    const trending = sortedByHits.slice(0, 5).map((p) => ({
      _id: p._id,
      title: p.title,
      category: p.category,
      hits: p.hits?.length || 0,
    }));
    const poorlyPerforming = sortedByHits
      .slice(-5)
      .reverse()
      .map((p) => ({
        _id: p._id,
        title: p.title,
        category: p.category,
        hits: p.hits?.length || 0,
      }));

    return {
      overview: {
        totalPodcasts,
        totalHits,
        totalDuration: Math.round(totalDuration),
        avgHitsPerPodcast,
      },
      trending,
      poorlyPerforming,
    };
  }

  async getPodcastAnalytics(id: string) {
    const podcast = await this.podcastModel.findById(id);
    if (!podcast || podcast.isDeleted) {
      throw new NotFoundException('Podcast not found');
    }

    // Calculate position relative to other podcasts
    const allPodcasts = await this.podcastModel.find({
      isDeleted: { $ne: true },
    });
    const sortedByHits = allPodcasts.sort(
      (a, b) => (b.hits?.length || 0) - (a.hits?.length || 0),
    );
    const position = sortedByHits.findIndex((p) => p._id.toString() === id) + 1;
    const totalPodcasts = allPodcasts.length;

    // Calculate performance metrics - safely handle missing hits
    const totalHits = podcast.hits?.length || 0;
    const avgHits =
      allPodcasts.reduce((sum, p) => sum + (p.hits?.length || 0), 0) /
      totalPodcasts;
    const performance = totalHits >= avgHits ? 'good' : 'poor';

    // Get category stats
    const categoryPodcasts = allPodcasts.filter(
      (p) => p.category === podcast.category,
    );
    const categoryAvgHits =
      categoryPodcasts.reduce((sum, p) => sum + (p.hits?.length || 0), 0) /
      categoryPodcasts.length;

    return {
      totalHits,
      position,
      totalPodcasts,
      performance,
      avgHits: Math.round(avgHits),
      categoryStats: {
        category: podcast.category,
        totalInCategory: categoryPodcasts.length,
        avgHitsInCategory: Math.round(categoryAvgHits),
      },
    };
  }
}
