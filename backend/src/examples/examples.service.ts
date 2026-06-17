import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlossDataService } from '../gloss-data/gloss-data.service';
import { VideosService } from '../videos/videos.service';
import { CreateExampleDto, UpdateExampleDto } from './dto/example.dto';

@Injectable()
export class ExamplesService {
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService,
    private videosService: VideosService,
  ) {}

  async createExample(glossDataId: string, data: CreateExampleDto) {
    const glossData = await this.prisma.glossData.findUnique({
      where: { id: glossDataId },
    });

    if (!glossData) {
      throw new NotFoundException('GlossData not found');
    }

    await this.prisma.example.create({
      data: {
        example: data.example,
        exampleVideoURL: data.exampleVideoURL,
        glossDataId,
      },
    });

    return this.glossDataService.getGlossData(glossDataId);
  }

  async updateExample(id: string, data: UpdateExampleDto) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { glossData: true },
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    await this.prisma.example.update({
      where: { id },
      data: {
        example: data.example,
        exampleVideoURL: data.exampleVideoURL,
      },
    });

    return this.glossDataService.getGlossData(example.glossDataId);
  }

  async deleteExample(id: string) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { glossData: true },
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    if (example.exampleVideoURL) {
      try {
        await this.videosService.deleteVideo(example.exampleVideoURL);
      } catch (error) {
        console.error('Failed to delete video file:', error);
      }
    }

    await this.prisma.example.delete({
      where: { id },
    });

    return this.glossDataService.getGlossData(example.glossDataId);
  }

  async deleteExampleVideo(id: string) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { glossData: true },
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    if (example.exampleVideoURL) {
      try {
        await this.videosService.deleteVideo(example.exampleVideoURL);
      } catch {
        throw new NotFoundException('Failed to delete video file');
      }
    }

    await this.prisma.example.update({
      where: { id },
      data: { exampleVideoURL: '' },
    });

    return this.glossDataService.getGlossData(example.glossDataId);
  }
}
