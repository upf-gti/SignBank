import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateSignVideoDto, UpdateSignVideoDto } from './dto/index';
import { PrismaService } from 'src/prisma/prisma.service'
import { GlossData, Prisma } from '@prisma/client'
import { GlossDataService } from 'src/gloss-data/gloss-data.service'
import { GLOSS_SEARCH_SYNC_EVENT } from '../typesense/types/gloss-index.type';
import { PhonologyValuesService } from '../phonology-values/phonology-values.service';
import {
  videoDataFromCodes,
  videoDataUpdateFromCodes,
} from '../phonology-values/phonology-video-data';

@Injectable()
export class SignVideosService {    
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService,
    private eventEmitter: EventEmitter2,
    private phonologyValuesService: PhonologyValuesService,
  ) {}

  private notifySearchIndex(glossDataId: string) {
    this.eventEmitter.emit(GLOSS_SEARCH_SYNC_EVENT, { glossDataId });
  }

  async create(createSignVideoDto: CreateSignVideoDto): Promise<GlossData> {
    await this.phonologyValuesService.assertVideoDataCodes(createSignVideoDto.videoData);

    // Create the video data first
    const videoData = await this.prisma.videoData.create({
      data: videoDataFromCodes(createSignVideoDto.videoData),
    });

    // Create the sign video with the video data
    const signVideoData: Prisma.SignVideoCreateInput = {
      title: createSignVideoDto.title,
      priority: createSignVideoDto.priority,
      glossData: {
        connect: {
          id: createSignVideoDto.glossDataId
        }
      },
      videoData: {
        connect: {
          id: videoData.id
        }
      },
      videos: {
        create: createSignVideoDto.videos.map(video => ({
          angle: video.angle,
          url: video.url,
          priority: video.priority
        }))
      }
    };

    await this.prisma.signVideo.create({
      data: signVideoData
    });

    this.notifySearchIndex(createSignVideoDto.glossDataId);
    return this.glossDataService.getGlossData(createSignVideoDto.glossDataId);
  }

  async update(id: string, updateSignVideoDto: UpdateSignVideoDto): Promise<GlossData> {
    await this.phonologyValuesService.assertVideoDataCodes(updateSignVideoDto.videoData);

    const signVideo = await this.prisma.signVideo.findUnique({
      where: { id },
      include: {
        glossData: true,
        videoData: true,
        videos: true
      }
    });

    if (!signVideo) {
      throw new NotFoundException(`Sign video with ID "${id}" not found`);
    }

    // Update video data
    await this.prisma.videoData.update({
      where: { id: signVideo.videoDataId },
      data: {
        ...(updateSignVideoDto.videoData.id
          ? { id: updateSignVideoDto.videoData.id }
          : {}),
        ...videoDataUpdateFromCodes(updateSignVideoDto.videoData),
      },
    });

    // Delete existing videos and create new ones
    await this.prisma.video.deleteMany({
      where: { signVideoId: id }
    });

    // Update the sign video and create new videos
    const signVideoData: Prisma.SignVideoUpdateInput = {
      title: updateSignVideoDto.title,
      priority: updateSignVideoDto.priority,
      videos: {
        create: updateSignVideoDto.videos.map(video => ({
          angle: video.angle,
          url: video.url,
          priority: video.priority
        }))
      }
    };

    await this.prisma.signVideo.update({
      where: { id },
      data: signVideoData
    });

    this.notifySearchIndex(signVideo.glossDataId);
    return this.glossDataService.getGlossData(signVideo.glossDataId);
  }

  async remove(id: string): Promise<GlossData> {
    try {
      const signVideo = await this.prisma.signVideo.findUniqueOrThrow({
        where: { id },
        include: {
          glossData: true,
          videoData: true
        }
      });

      const glossDataId = signVideo.glossDataId;

      // Delete the sign video
      await this.prisma.signVideo.delete({
        where: { id }
      });

      if (glossDataId) {
        this.notifySearchIndex(glossDataId);
        return this.glossDataService.getGlossData(glossDataId);
      }

      const compoundPart = await this.prisma.compoundPart.findFirst({
        where: { inlineSignVideoId: id },
      });
      if (compoundPart) {
        this.notifySearchIndex(compoundPart.glossDataId);
        return this.glossDataService.getGlossData(compoundPart.glossDataId);
      }

      throw new NotFoundException(`Sign video with ID "${id}" not found`);
    } catch (error) {
      throw new NotFoundException(`SignVideo with ID ${id} not found or could not be deleted`);
    }
  }
}
