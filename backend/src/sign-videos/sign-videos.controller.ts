import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { SignVideosService } from './sign-videos.service';
import { CreateSignVideoDto, UpdateSignVideoDto } from './dto';

@Controller('sign-videos')
export class SignVideosController {
  constructor(private readonly signVideosService: SignVideosService) {}

  @Post()
  async create(@Body() createSignVideoDto: CreateSignVideoDto) {
    return this.signVideosService.create(createSignVideoDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSignVideoDto: UpdateSignVideoDto) {
    return this.signVideosService.update(id, updateSignVideoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.signVideosService.remove(id);
  }
} 