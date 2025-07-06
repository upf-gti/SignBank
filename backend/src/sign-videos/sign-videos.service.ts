import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSignVideoDto, UpdateSignVideoDto } from './dto/index';
import { PrismaService } from 'src/prisma/prisma.service'
import { GlossData, Hand, Prisma } from '@prisma/client'
import { GlossDataService } from 'src/gloss-data/gloss-data.service'

@Injectable()
export class SignVideosService {    
  constructor(
    private prisma: PrismaService,
    private glossDataService: GlossDataService
  ) {}

  async create(createSignVideoDto: CreateSignVideoDto): Promise<GlossData> {

    // Create the video data first
    const videoData = await this.prisma.videoData.create({
      data: {
        id: createSignVideoDto.videoData.id,
        hands: createSignVideoDto.videoData.hands || 'RIGHT',
        configuration: createSignVideoDto.videoData.configuration || 'EMPTY',
        configurationChanges: createSignVideoDto.videoData.configurationChanges || 'EMPTY',
        relationBetweenArticulators: createSignVideoDto.videoData.relationBetweenArticulators || 'EMPTY',
        location: createSignVideoDto.videoData.location || 'EMPTY',
        movementRelatedOrientation: createSignVideoDto.videoData.movementRelatedOrientation || 'EMPTY',
        orientationRelatedToLocation: createSignVideoDto.videoData.orientationRelatedToLocation || 'EMPTY',
        orientationChange: createSignVideoDto.videoData.orientationChange || 'EMPTY',
        contactType: createSignVideoDto.videoData.contactType || 'EMPTY',
        movementType: createSignVideoDto.videoData.movementType || 'EMPTY',
        movementDirection: createSignVideoDto.videoData.movementDirection || 'EMPTY',
        vocalization: createSignVideoDto.videoData.vocalization || '',
        nonManualComponent: createSignVideoDto.videoData.nonManualComponent || '',
        inicialization: createSignVideoDto.videoData.inicialization || ''
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
        hands: updateSignVideoDto.videoData.hands || 'RIGHT',
        configuration: updateSignVideoDto.videoData.configuration || 'EMPTY',
        configurationChanges: updateSignVideoDto.videoData.configurationChanges || 'EMPTY',
        relationBetweenArticulators: updateSignVideoDto.videoData.relationBetweenArticulators || 'EMPTY',
        location: updateSignVideoDto.videoData.location || 'EMPTY',
        movementRelatedOrientation: updateSignVideoDto.videoData.movementRelatedOrientation || 'EMPTY',
        orientationRelatedToLocation: updateSignVideoDto.videoData.orientationRelatedToLocation || 'EMPTY',
        orientationChange: updateSignVideoDto.videoData.orientationChange || 'EMPTY',
        contactType: updateSignVideoDto.videoData.contactType || 'EMPTY',
        movementType: updateSignVideoDto.videoData.movementType || 'EMPTY',
        movementDirection: updateSignVideoDto.videoData.movementDirection || 'EMPTY',
        vocalization: updateSignVideoDto.videoData.vocalization || '',
        nonManualComponent: updateSignVideoDto.videoData.nonManualComponent || '',
        inicialization: updateSignVideoDto.videoData.inicialization || ''
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

      return this.glossDataService.getGlossData(glossDataId);
    } catch (error) {
      throw new NotFoundException(`SignVideo with ID ${id} not found or could not be deleted`);
    }
  }
} 