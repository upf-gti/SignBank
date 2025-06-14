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
    const sense = await this.prisma.sense.findUnique({
      where: { id: createSignVideoDto.senseId },
      include: {
        glossData: true
      }
    });

    if (!sense) {
      throw new NotFoundException(`Sense with ID "${createSignVideoDto.senseId}" not found`);
    }

    // Create the video data first
    const videoData = await this.prisma.videoData.create({
      data: {
        id: createSignVideoDto.videoData.id,
        hands: createSignVideoDto.videoData.hands,
        configuration: createSignVideoDto.videoData.configuration,
        configurationChanges: createSignVideoDto.videoData.configurationChanges,
        relationBetweenArticulators: createSignVideoDto.videoData.relationBetweenArticulators,
        location: createSignVideoDto.videoData.location,
        movementRelatedOrientation: createSignVideoDto.videoData.movementRelatedOrientation,
        orientationRelatedToLocation: createSignVideoDto.videoData.orientationRelatedToLocation,
        orientationChange: createSignVideoDto.videoData.orientationChange,
        contactType: createSignVideoDto.videoData.contactType,
        movementType: createSignVideoDto.videoData.movementType,
        vocalization: createSignVideoDto.videoData.vocalization,
        nonManualComponent: createSignVideoDto.videoData.nonManualComponent,
        inicialization: createSignVideoDto.videoData.inicialization
      }
    });

    // Create the sign video with the video data
    const signVideoData: Prisma.SignVideoCreateInput = {
      title: createSignVideoDto.title,
      priority: createSignVideoDto.priority,
      sense: {
        connect: {
          id: createSignVideoDto.senseId
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

    return this.glossDataService.getGlossData(sense.glossData.id);
  }

  async update(id: string, updateSignVideoDto: UpdateSignVideoDto): Promise<GlossData> {
    const signVideo = await this.prisma.signVideo.findUnique({
      where: { id },
      include: {
        sense: {
          include: {
            glossData: true
          }
        },
        videoData: true,
        videos: true
      }
    });

    if (!signVideo) {
      throw new NotFoundException(`Sign video with ID "${id}" not found`);
    }

    // Update video data
    await this.prisma.videoData.update({
      where: { id: signVideo.videoData.id },
      data: {
        id: updateSignVideoDto.videoData.id,
        hands: updateSignVideoDto.videoData.hands,
        configuration: updateSignVideoDto.videoData.configuration,
        configurationChanges: updateSignVideoDto.videoData.configurationChanges,
        relationBetweenArticulators: updateSignVideoDto.videoData.relationBetweenArticulators,
        location: updateSignVideoDto.videoData.location,
        movementRelatedOrientation: updateSignVideoDto.videoData.movementRelatedOrientation,
        orientationRelatedToLocation: updateSignVideoDto.videoData.orientationRelatedToLocation,
        orientationChange: updateSignVideoDto.videoData.orientationChange,
        contactType: updateSignVideoDto.videoData.contactType,
        movementType: updateSignVideoDto.videoData.movementType,
        vocalization: updateSignVideoDto.videoData.vocalization,
        nonManualComponent: updateSignVideoDto.videoData.nonManualComponent,
        inicialization: updateSignVideoDto.videoData.inicialization
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

    return this.glossDataService.getGlossData(signVideo.sense.glossData.id);
  }

  async remove(id: string): Promise<GlossData> {
    try {
      const signVideo = await this.prisma.signVideo.findUniqueOrThrow({
        where: { id },
        include: {
          sense: {
            include: {
              glossData: true
            }
          },
          videoData: true
        }
      });

      const glossDataId = signVideo.sense.glossData.id;
      
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