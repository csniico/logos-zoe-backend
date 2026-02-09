import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schema/category.schema';
import { Article, ArticleSchema } from '../article/schema/article.schema';
import { ArticleService } from '../article/article.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Article.name, schema: ArticleSchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, ArticleService],
  exports: [CategoryService],
})
export class CategoryModule {}
