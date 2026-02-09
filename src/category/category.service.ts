import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schema/category.schema';
import { Article } from '../article/schema/article.schema';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryMetadataDto } from './dto/updateCategoryMetadata.dto';
import { SetCategoryContentDto } from './dto/setCategoryContent.dto';

interface PaginationResult<T> {
  items: T[];
  total: number;
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Article.name) private articleModel: Model<Article>,
  ) {}

  async create(dto: CreateCategoryDto) {
    try {
      const existing = await this.categoryModel.findOne({
        category_name: dto.category_name,
        isDeleted: { $ne: true },
      });
      if (existing) {
        throw new BadRequestException('Category name already exists');
      }
      const category = new this.categoryModel({ ...dto });
      return await category.save();
    } catch (e) {
      console.log(e);
      throw e instanceof BadRequestException
        ? e
        : new InternalServerErrorException('Failed to create category');
    }
  }

  async list(search?: string): Promise<PaginationResult<Category>> {
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    if (search) {
      filter['category_name'] = { $regex: search, $options: 'i' };
    }
    const items = await this.categoryModel.find(filter).sort({ createdAt: -1 });
    const total = await this.categoryModel.countDocuments(filter);
    return { items, total };
  }

  async getOne(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category || category.isDeleted) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async getCategoryArticles(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category || category.isDeleted) {
      throw new NotFoundException('Category not found');
    }

    // Get articles from the related_ArticlesIds array
    const articleIds = category.related_ArticlesIds || [];

    if (articleIds.length === 0) {
      return {
        articles: [],
        count: 0,
      };
    }

    const articles = await this.articleModel.find({
      _id: { $in: articleIds },
      isDeleted: { $ne: true },
    });

    return {
      articles: articles.map((article) => ({
        _id: article._id,
        article_title: article.article_title,
      })),
      count: articles.length,
    };
  }

  async updateMetadata(id: string, dto: UpdateCategoryMetadataDto) {
    const category = await this.categoryModel.findById(id);
    if (!category || category.isDeleted) {
      throw new NotFoundException('Category not found');
    }
    if (dto.category_name && dto.category_name !== category.category_name) {
      const exists = await this.categoryModel.findOne({
        category_name: dto.category_name,
        isDeleted: { $ne: true },
      });
      if (exists) {
        throw new BadRequestException('Category name already exists');
      }
    }
    // Only assign properties that are explicitly defined to avoid
    // overwriting required fields with undefined during partial updates.
    const definedEntries = Object.entries(dto).filter(
      ([, value]) => value !== undefined,
    );
    const updates: Partial<UpdateCategoryMetadataDto> = {};
    for (const [key, value] of definedEntries) {
      (updates as Record<string, unknown>)[key] = value;
    }
    Object.assign(category, updates);
    return category.save();
  }

  async setContent(dto: SetCategoryContentDto) {
    const { categoryId, category_introText, category_fullText } = dto;
    const category = await this.categoryModel.findById(categoryId);
    if (!category || category.isDeleted) {
      throw new NotFoundException('Category not found');
    }
    category.category_introText = category_introText;
    category.category_fullText = category_fullText;
    return category.save();
  }

  softDelete(id: string, cascade = false) {
    console.log({ cascade });
    throw new ForbiddenException(
      'You are not alowed to deleted category data. Contact the developer!',
    );
    // // const category = await this.categoryModel.findById(id);
    // // if (!category || category.isDeleted) {
    // //   throw new NotFoundException('Category not found');
    // // }

    // // // Get article IDs from the category's related_ArticlesIds array
    // // const articleIds = category.related_ArticlesIds || [];

    // // // If cascade is true, delete category and all associated articles
    // // if (cascade && articleIds.length > 0) {
    // //   const deletionDate = new Date();

    // //   // Soft delete all associated articles using the IDs from related_ArticlesIds
    // //   await this.articleModel.updateMany(
    // //     { _id: { $in: articleIds }, isDeleted: false },
    // //     { $set: { isDeleted: true, deletedAt: deletionDate } },
    // //   );

    // //   // Soft delete the category
    // //   category.isDeleted = true;
    // //   category.deletedAt = deletionDate;
    // //   await category.save();

    // //   return {
    // //     message: 'Category and associated articles soft-deleted',
    // //     deletedArticlesCount: articleIds.length,
    // //   };
    // }

    // // If not cascade and articles exist, block deletion and return article list
    // if (articleIds.length > 0) {
    //   // Fetch the actual articles to return their details
    //   const articles = await this.articleModel.find({
    //     _id: { $in: articleIds },
    //     isDeleted: false,
    //   });

    //   throw new BadRequestException({
    //     message: 'Cannot delete category with associated articles',
    //     articles: articles.map((article) => ({
    //       _id: article._id,
    //       article_title: article.article_title,
    //     })),
    //   });
    // }

    // // No articles, proceed with category deletion
    // category.isDeleted = true;
    // category.deletedAt = new Date();
    // await category.save();
    // return { message: 'Category soft-deleted' };
  }

  async restore(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category || !category.isDeleted) {
      throw new NotFoundException('Category not found or not deleted');
    }
    category.isDeleted = false;
    category.deletedAt = undefined;
    await category.save();
    await this.articleModel.updateMany(
      { category: category._id, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: undefined } },
    );
    return { message: 'Category restored' };
  }
}
