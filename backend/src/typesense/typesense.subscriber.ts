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
          locationRelatedOrientation: signVideo.videoData.locationRelatedOrientation,
          orientationChange: signVideo.videoData.orientationChange,
          contactType: signVideo.videoData.contactType,
          movementType: signVideo.videoData.movementType,
          vocalization: signVideo.videoData.vocalization,
          nonManualComponent: signVideo.videoData.nonManualComponent,
          inicialization: signVideo.videoData.inicialization,
          senseId: signVideo.sense.id,
          senseTitle: signVideo.sense.senseTitle,
          lexicalCategory: signVideo.sense.lexicalCategory || 'OTHER',
          glossId: signVideo.sense.glossData.id,
          gloss: signVideo.sense.glossData.gloss
        };

        await this.typesenseService.upsertDocument(document);
      }
    } catch (error) {
      console.error('Error updating video in Typesense:', error);
    }
  }
} 