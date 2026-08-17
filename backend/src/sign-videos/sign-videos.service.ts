import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateSignVideoDto, UpdateSignVideoDto } from './dto/index';
import { PrismaService } from 'src/prisma/prisma.service'
import { GlossData, Handedness, Prisma } from '@prisma/client'
import { GlossDataService } from 'src/gloss-data/gloss-data.service'
import { GLOSS_SEARCH_SYNC_EVENT } from '../typesense/types/gloss-index.type';

function buildVideoDataFields(
  videoData: CreateSignVideoDto['videoData'] | UpdateSignVideoDto['videoData'],
) {
  return {
    handedness: videoData.handedness || Handedness.ONE,
    dominantConfiguration: videoData.dominantConfiguration ?? null,
    nonDominantConfiguration: videoData.nonDominantConfiguration ?? null,
    dominantRelationBetweenArticulators: videoData.dominantRelationBetweenArticulators ?? null,
    nonDominantRelationBetweenArticulators: videoData.nonDominantRelationBetweenArticulators ?? null,
    configurationChanges: videoData.configurationChanges || 'EMPTY',
    location: videoData.location || 'EMPTY',
    movementRelatedOrientation: videoData.movementRelatedOrientation || 'EMPTY',
    orientationRelatedToLocation: videoData.orientationRelatedToLocation || 'EMPTY',
    orientationChange: videoData.orientationChange || 'EMPTY',
    contactType: videoData.contactType || 'EMPTY',
    movementType: videoData.movementType || 'EMPTY',
    movementDirection: videoData.movementDirection || 'EMPTY',
    vocalization: videoData.vocalization || '',
    nonManualComponent: videoData.nonManualComponent || '',
    inicialization: videoData.inicialization || '',
  };
}

@Injectable()
export class SignVideosService {    
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService,
    private eventEmitter: EventEmitter2,
  ) {}

  private notifySearchIndex(glossDataId: string) {
    this.eventEmitter.emit(GLOSS_SEARCH_SYNC_EVENT, { glossDataId });
  }

  async create(createSignVideoDto: CreateSignVideoDto): Promise<GlossData> {

    // Create the video data first
    const videoData = await this.prisma.videoData.create({
      data: {
        id: createSignVideoDto.videoData.id,
        ...buildVideoDataFields(createSignVideoDto.videoData),
      }
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
        id: updateSignVideoDto.videoData.id,
        ...buildVideoDataFields(updateSignVideoDto.videoData),
      }
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
