import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DevotionalsService } from './devotionals.service';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { getManyDevotionalsDto } from './dto/getManyDevotionals.dto';
import { createDevotionalDto } from './dto/createDevotional.dto';
import { setDevotionalImageDto } from './dto/setDevotionalImage.dto';
import { setDevotionalDocumentDto } from './dto/setDevotionalDocument.dto';
import { getTotalPagesDto } from './dto/getTotalPages.dto';
import { updateDevotionalMetadataDto } from './dto/updateDevotionalMetadata.dto';
import { UpdatePublishedStateDto } from 'src/common/dto/updatePublishedState.dto';
import { AddHitDto } from 'src/common/dto/addHit.dto';
import type { ObjectId } from 'mongoose';

@Controller(`${API_VERSION_SCHEME}/devotionals`)
export class DevotionalsController {
  constructor(private readonly devotionalsService: DevotionalsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createDevotional(@Body() body: createDevotionalDto) {
    return this.devotionalsService.createDevotionalMetadata(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stats')
  getDevotionalsStats() {
    return this.devotionalsService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Put('/images')
  setDevotionalImage(@Body() body: setDevotionalImageDto) {
    return this.devotionalsService.setDevotionalImageUriAndKey(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/content')
  setDevotionalContent(@Body() body: setDevotionalDocumentDto) {
    return this.devotionalsService.setDevotionalContentAndContentMetdata(body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  deleteOneById(@Param('id') id: ObjectId) {
    return this.devotionalsService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id/restore')
  restore(@Param('id') id: ObjectId) {
    return this.devotionalsService.restore(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pages')
  getPages(@Query() query: getTotalPagesDto) {
    return this.devotionalsService.getPages(query.limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMany(@Query() query: getManyDevotionalsDto) {
    return this.devotionalsService.getMany(
      query.offset,
      query.limit,
      query.search,
      query.month,
      query.year,
      query.author,
      query.type,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  getOne(@Param('id') id: ObjectId) {
    return this.devotionalsService.getOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  updateMetadata(
    @Param('id') id: ObjectId,
    @Body() body: updateDevotionalMetadataDto,
  ) {
    return this.devotionalsService.updateDevotionalMetadata(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id/published')
  updatePublishedState(
    @Param('id') id: ObjectId,
    @Body() dto: UpdatePublishedStateDto,
  ) {
    return this.devotionalsService.updatePublishedState(id, dto.published);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/hits')
  addHit(@Param('id') id: ObjectId, @Body() dto: AddHitDto) {
    return this.devotionalsService.addHit(id, dto.hit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/hits')
  getHits(@Param('id') id: ObjectId) {
    return this.devotionalsService.getHits(id);
  }
}
