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
    private videosService: VideosService
  ) {}

  async createExample(senseId: string, data: CreateExampleDto) {
    const sense = await this.prisma.sense.findUnique({
      where: { id: senseId }
    });

    if (!sense) {
      throw new NotFoundException('Sense not found');
    }

    await this.prisma.example.create({
      data: {
        example: data.example,
        exampleVideoURL: data.exampleVideoURL,
        senseId: senseId
      }
    });

    return this.glossDataService.getGlossData(sense.glossDataId);
  }

  async updateExample(id: string, data: UpdateExampleDto) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { sense: true }
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    await this.prisma.example.update({
      where: { id },
      data: {
        example: data.example,
        exampleVideoURL: data.exampleVideoURL
      }
    });

    return this.glossDataService.getGlossData(example.sense.glossDataId);
  }

  async deleteExample(id: string) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { sense: true }
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    // Delete the associated video file if it exists
    if (example.exampleVideoURL) {
      try {
        await this.videosService.deleteVideo(example.exampleVideoURL);
      } catch (error) {
        // Log the error but don't fail the deletion if video deletion fails
        console.error('Failed to delete video file:', error);
      }
    }

    await this.prisma.example.delete({
      where: { id }
    });

    return this.glossDataService.getGlossData(example.sense.glossDataId);
  }

  async deleteExampleVideo(id: string) {
    const example = await this.prisma.example.findUnique({
      where: { id },
      include: { sense: true }
    });

    if (!example) {
      throw new NotFoundException('Example not found');
    }

    // Delete the video file if it exists
    if (example.exampleVideoURL) {
      try {
        await this.videosService.deleteVideo(example.exampleVideoURL);
      } catch (error) {
        throw new NotFoundException('Failed to delete video file');
      }
    }

    // Update the example to remove the video URL
    await this.prisma.example.update({
      where: { id },
      data: {
        exampleVideoURL: ''
      }
    });

    return this.glossDataService.getGlossData(example.sense.glossDataId);
  }
} 