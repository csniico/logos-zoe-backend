import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from './schema/article.schema';
import { Category } from '../category/schema/category.schema';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleMetadataDto } from './dto/updateArticleMetadata.dto';
import { SetArticleContentDto } from './dto/setArticleContent.dto';

interface ArticlePaginationResult {
  items: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  private async _ensureCategoryExists(categoryId: string) {
    const category = await this.categoryModel.findById(categoryId);
    if (!category || category.isDeleted) {
      throw new BadRequestException('Invalid category');
    }
    return category;
  }

  async create(dto: CreateArticleDto) {
    await this._ensureCategoryExists(dto.category);
    try {
      const article = new this.articleModel({ ...dto });
      const saved = await article.save();
      await this.categoryModel.updateOne(
        { _id: dto.category },
        { $addToSet: { related_ArticlesIds: saved._id } },
      );
      return saved;
    } catch {
      throw new InternalServerErrorException('Failed to create article');
    }
  }

  async list(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
  ): Promise<ArticlePaginationResult> {
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (search) {
      filter['article_title'] = { $regex: search, $options: 'i' };
    }
    if (categoryId) {
      filter['category'] = categoryId;
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.articleModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit) || 1;
    return { items, total, page, limit, totalPages };
  }

  async getOne(id: string) {
    const article = await this.articleModel.findById(id);
    if (!article || article.isDeleted) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async updateMetadata(id: string, dto: UpdateArticleMetadataDto) {
    const article = await this.articleModel.findById(id);
    if (!article || article.isDeleted) {
      throw new NotFoundException('Article not found');
    }
    const originalCategory = String(article.category);
    if (dto.category && dto.category !== originalCategory) {
      await this._ensureCategoryExists(dto.category);
    }
    // Only apply defined values to avoid overwriting existing required fields with undefined
    const definedEntries = Object.entries(dto).filter(
      ([, v]) => v !== undefined,
    );
    const updates: Partial<UpdateArticleMetadataDto> = {};
    for (const [key, value] of definedEntries) {
      (updates as Record<string, unknown>)[key] = value;
    }
    Object.assign(article, updates);
    const saved = await article.save();
    if (dto.category && dto.category !== originalCategory) {
      await this.categoryModel.updateOne(
        { _id: originalCategory },
        { $pull: { related_ArticlesIds: article._id } },
      );
      await this.categoryModel.updateOne(
        { _id: dto.category },
        { $addToSet: { related_ArticlesIds: article._id } },
      );
    }
    return saved;
  }

  async setContent(dto: SetArticleContentDto) {
    const { articleId, article_fullText } = dto;
    const article = await this.articleModel.findById(articleId);
    if (!article || article.isDeleted) {
      throw new NotFoundException('Article not found');
    }
    article.article_fullText = article_fullText;
    return article.save();
  }

  softDelete(id: string) {
    console.log({ deleteArticleId: id });
    throw new ForbiddenException(
      'You are not alowed to deleted category data. Contact the developer!',
    );
    // const article = await this.articleModel.findById(id);
    // if (!article || article.isDeleted) {
    //   throw new NotFoundException('Article not found');
    // }
    // article.isDeleted = true;
    // article.deletedAt = new Date();
    // article.published = false; // Unpublish when soft deleting
    // await article.save();
    // return { message: 'Article soft-deleted' };
  }

  async restore(id: string) {
    const article = await this.articleModel.findById(id);
    if (!article || !article.isDeleted) {
      throw new NotFoundException('Article not found or not deleted');
    }
    article.isDeleted = false;
    article.deletedAt = undefined;
    await article.save();
    return { message: 'Article restored' };
  }

  async updatePublishedState(id: string, published: boolean) {
    const article = await this.articleModel.findById(id);
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (article.isDeleted) {
      throw new BadRequestException('Cannot publish a deleted article');
    }
    article.published = published;
    await article.save();
    return { message: `Article ${published ? 'published' : 'unpublished'}` };
  }

  async addHit(id: string, hit: string) {
    const article = await this.articleModel.findById(id);
    if (!article || article.isDeleted) {
      throw new NotFoundException('Article not found');
    }
    article.hits.push(hit);
    await article.save();
    return { message: 'Hit recorded' };
  }

  async getHits(id: string) {
    const article = await this.articleModel.findById(id);
    if (!article || article.isDeleted) {
      throw new NotFoundException('Article not found');
    }
    return { hits: article.hits };
  }
}
