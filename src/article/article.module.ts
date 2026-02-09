import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './schema/article.schema';
import { Category, CategorySchema } from '../category/schema/category.schema';
import { CategoryService } from '../category/category.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService, CategoryService],
  exports: [ArticleService],
})
export class ArticleModule {}
