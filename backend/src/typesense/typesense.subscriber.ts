import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TypesenseService } from './typesense.service';
import { VideoIndex } from './types/video-index.type';

@Injectable()
export class TypesenseSubscriber {
  constructor(private readonly typesenseService: TypesenseService) {}

  @OnEvent('video.created')
  async handleVideoCreated(payload: { signVideoId: string }) {
    await this.updateSignVideoInTypesense(payload.signVideoId);
  }

  @OnEvent('video.updated')
  async handleVideoUpdated(payload: { signVideoId: string }) {
    await this.updateSignVideoInTypesense(payload.signVideoId);
  }

  @OnEvent('video.deleted')
  async handleVideoDeleted(payload: { videoId: string }) {
    try {
      await this.typesenseService.deleteDocument(payload.videoId);
    } catch (error) {
      console.error('Error deleting video from Typesense:', error);
    }
  }

  private async updateSignVideoInTypesense(signVideoId: string) {
    try {
      const signVideo = await this.typesenseService.findSignVideo(signVideoId);

      if (!signVideo) return;

      // Update each video document for this SignVideo
      for (const video of signVideo.videos) {
        // Get the first description of the first sense
        let description = '';
        if (signVideo.glossData.senses && signVideo.glossData.senses.length > 0) {
          // Sort senses by priority (ascending) and get the first one
          const firstSense = signVideo.glossData.senses.sort((a, b) => a.priority - b.priority)[0];
          if (firstSense.definitions && firstSense.definitions.length > 0) {
            // Sort definitions by priority (ascending) and get the first one
            const firstDefinition = firstSense.definitions.sort((a, b) => a.priority - b.priority)[0];
            description = firstDefinition.definition;
          }
        }

        const document: VideoIndex = {
          id: video.id,
          url: video.url,
          signVideoTitle: signVideo.title,
          hands: signVideo.videoData.hands,
          configuration: signVideo.videoData.configuration,
          configurationChanges: signVideo.videoData.configurationChanges,
          relationBetweenArticulators: signVideo.videoData.relationBetweenArticulators,
          location: signVideo.videoData.location,
          movementRelatedOrientation: signVideo.videoData.movementRelatedOrientation,
          orientationRelatedToLocation: signVideo.videoData.orientationRelatedToLocation,
          orientationChange: signVideo.videoData.orientationChange,
          contactType: signVideo.videoData.contactType,
          movementType: signVideo.videoData.movementType,
          movementDirection: signVideo.videoData.movementDirection,
          vocalization: signVideo.videoData.vocalization,
          nonManualComponent: signVideo.videoData.nonManualComponent,
          inicialization: signVideo.videoData.inicialization,
          repeatedMovement: signVideo.videoData.repeatedMovement,
          glossId: signVideo.glossData.id,
          gloss: signVideo.glossData.gloss,
          description: description
        };

        await this.typesenseService.upsertDocument(document);
      }
    } catch (error) {
      console.error('Error updating video in Typesense:', error);
    }
  }
} 