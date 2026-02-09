import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryMetadataDto } from './dto/updateCategoryMetadata.dto';
import { SetCategoryContentDto } from './dto/setCategoryContent.dto';

@Controller(`${API_VERSION_SCHEME}/categories`)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  list(@Query('search') search?: string) {
    // Explicitly return Promise<any> to avoid leaking internal generic type publicly
    return this.categoryService.list(search) as Promise<any>;
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.categoryService.getOne(id);
  }

  @Get(':id/articles')
  getCategoryArticles(@Param('id') id: string) {
    return this.categoryService.getCategoryArticles(id);
  }

  @Put(':id')
  updateMetadata(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryMetadataDto,
  ) {
    return this.categoryService.updateMetadata(id, dto);
  }

  @Put('content/set')
  setContent(@Body() dto: SetCategoryContentDto) {
    return this.categoryService.setContent(dto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string, @Query('cascade') cascade?: string) {
    return this.categoryService.softDelete(id, cascade === 'true');
  }

  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.categoryService.restore(id);
  }
}
