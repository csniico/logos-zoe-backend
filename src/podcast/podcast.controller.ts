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
import { PodcastService } from './podcast.service';
import { API_VERSION_SCHEME } from 'src/utils/constants/global.constants';
import { CreatePodcastDto } from './dto/createPodcast.dto';
import { UpdatePodcastMetadataDto } from './dto/updatePodcastMetadata.dto';
import { UpdatePodcastFileDto } from './dto/updatePodcastFile.dto';
import { UpdatePublishedStateDto } from 'src/common/dto/updatePublishedState.dto';
import { AddHitDto } from 'src/common/dto/addHit.dto';
import { GetManyPodcastsDto } from './dto/getManyPodcasts.dto';

@Controller(`${API_VERSION_SCHEME}/podcasts`)
export class PodcastController {
  constructor(private readonly podcastService: PodcastService) {}

  @Post()
  create(@Body() dto: CreatePodcastDto) {
    return this.podcastService.create(dto);
  }

  @Get()
  list(@Query() query: GetManyPodcastsDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    return this.podcastService.list(query.search, page, limit);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.podcastService.getOne(id);
  }

  @Put(':id')
  updateMetadata(
    @Param('id') id: string,
    @Body() dto: UpdatePodcastMetadataDto,
  ) {
    return this.podcastService.updateMetadata(id, dto);
  }

  @Put('file/update')
  updateFile(@Body() dto: UpdatePodcastFileDto) {
    return this.podcastService.updateFile(dto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.podcastService.softDelete(id);
  }

  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.podcastService.restore(id);
  }

  @Put(':id/published')
  updatePublishedState(
    @Param('id') id: string,
    @Body() dto: UpdatePublishedStateDto,
  ) {
    return this.podcastService.updatePublishedState(id, dto.published);
  }

  @Post(':id/hits')
  addHit(@Param('id') id: string, @Body() dto: AddHitDto) {
    return this.podcastService.addHit(id, dto.hit);
  }

  @Get(':id/hits')
  getHits(@Param('id') id: string) {
    return this.podcastService.getHits(id);
  }

  @Get('analytics/overview')
  getAnalytics() {
    return this.podcastService.getAnalytics();
  }

  @Get(':id/analytics')
  getPodcastAnalytics(@Param('id') id: string) {
    return this.podcastService.getPodcastAnalytics(id);
  }
}
