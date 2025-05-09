import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Video } from '../../types/database';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post()
  create(@Body() createVideoDto: CreateVideoDto): Promise<Video> {
    return this.videosService.create(createVideoDto);
  }

  @Get()
  findAll(): Promise<Video[]> {
    return this.videosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Video> {
    return this.videosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVideoDto: Partial<CreateVideoDto>,
  ): Promise<Video> {
    return this.videosService.update(id, updateVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Video> {
    return this.videosService.remove(id);
  }
} 