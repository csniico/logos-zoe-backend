import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleMetadataDto } from './dto/updateArticleMetadata.dto';
import { SetArticleContentDto } from './dto/setArticleContent.dto';
import { UpdatePublishedStateDto } from 'src/common/dto/updatePublishedState.dto';
import { AddHitDto } from 'src/common/dto/addHit.dto';

@Controller(`${API_VERSION_SCHEME}/articles`)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  create(@Body() dto: CreateArticleDto) {
    return this.articleService.create(dto);
  }

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = page ? Math.max(parseInt(page, 10), 1) : 1;
    const limitNum = limit ? Math.max(parseInt(limit, 10), 1) : 10;
    return this.articleService.list(pageNum, limitNum, search, category);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.articleService.getOne(id);
  }

  @Put(':id')
  updateMetadata(
    @Param('id') id: string,
    @Body() dto: UpdateArticleMetadataDto,
  ) {
    return this.articleService.updateMetadata(id, dto);
  }

  @Put('content/set')
  setContent(@Body() dto: SetArticleContentDto) {
    return this.articleService.setContent(dto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.articleService.softDelete(id);
  }

  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.articleService.restore(id);
  }

  @Put(':id/published')
  updatePublishedState(
    @Param('id') id: string,
    @Body() dto: UpdatePublishedStateDto,
  ) {
    return this.articleService.updatePublishedState(id, dto.published);
  }

  @Post(':id/hits')
  addHit(@Param('id') id: string, @Body() dto: AddHitDto) {
    return this.articleService.addHit(id, dto.hit);
  }

  @Get(':id/hits')
  getHits(@Param('id') id: string) {
    return this.articleService.getHits(id);
  }
}
