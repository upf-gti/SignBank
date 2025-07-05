<template>
  <div class="videos-component q-pa-sm">
    <div class="text-h5 q-mb-md">
      {{ translate('videos') }}
    </div>

    <div class="row q-col-gutter-md no-wrap overflow-auto">
      <!-- Add video button - visible when editMode is true and not creating a video -->
      <div
        v-if="editMode && !isCreatingVideo"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          flat
          bordered
          class="add-video-card cursor-pointer"
          @click="addVideo"
        >
          <q-card-section class="column items-center justify-center text-grey-7 fit">
            <q-icon
              name="add"
              size="48px"
            />
            <div class="text-subtitle1 q-mt-sm">
              {{ translate('addVideo') }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div
        v-for="(video, index) in sortedVideos"
        :key="video.id || index"
        class="col-12 col-sm-6 col-md-4"
      >
        <EditableModule
          :allow-edit="editMode"
          :initial-edit-state="video.isNew ?? false"
          :show-delete="Boolean(video.id)"
          :validate-before-save="() => validateVideo(video)"
          @save="() => updateSignVideo(video, index)"
          @cancel="() => handleVideoCancel(index)"
          @delete="() => removeVideo(index)"
        >
          <template #header>
            <div class="row items-center justify-between full-width">
              <div class="text-subtitle1 ellipsis">
                {{ video.title }}
              </div>
              <div
                v-if="editMode && !video.isNew"
                class="row"
              >
                <q-btn
                  flat
                  round
                  dense
                  icon="keyboard_arrow_left"
                  size="sm"
                  :disable="index === 0"
                  @click="moveVideoLeft(index)"
                >
                  <q-tooltip>{{ translate('moveLeft') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="keyboard_arrow_right"
                  size="sm"
                  :disable="index === sortedVideos.length - 1"
                  @click="moveVideoRight(index)"
                >
                  <q-tooltip>{{ translate('moveRight') }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>

          <template #default="{ isEditing }">
            <q-input
              v-if="isEditing"
              v-model="video.title"
              :label="translate('title')"
              outlined
              dense
              class="q-mb-sm"
            />
            <div class="video-content">
              <GlossVideoComponent
                :sign-video="video"
                :edit-mode="isEditing"
                @update:sign-video="(newVideo) => updateLocalVideo(newVideo, index)"
              />
              <SignFonologyComponent
                :video-data="video.videoData"
                :edit-mode="isEditing"
                @update:video-data="updateVideoData(index, $event)"
              />
            </div>
          </template>
        </EditableModule>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GlossData, Sense, SignVideo, PhonologyData } from 'src/types/models';
import translate from 'src/utils/translate';
import GlossVideoComponent from './GlossVideoComponent.vue';
import SignFonologyComponent from './SignFonologyComponent.vue';
import EditableModule from 'src/components/Shared/EditableModule.vue';
import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import api from 'src/services/api';
import { Hand, HandConfiguration, ConfigurationChange, RelationBetweenArticulators, Location, MovementRelatedOrientation, OrientationRelatedToLocation, OrientationChange, ContactType, MovementType, MovementDirection } from 'src/types/enums';

const sense = defineModel<Sense>({ required: true });
const emit = defineEmits<{
  (e: 'update:glossData', glossData: GlossData): void
}>();
const { editMode } = defineProps<{
  editMode: boolean;
}>();

const $q = useQuasar();

// Keep a backup of videos for cancellation
const videosBackup = ref<SignVideo[]>([]);
const isCreatingVideo = ref(false);

const videos = computed(() => sense.value?.signVideos || []);

const sortedVideos = computed(() => {
  const videoList = [...videos.value];
  // Sort by priority (lower number = higher priority), but put new videos first
  return videoList.sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return (a.priority || 0) - (b.priority || 0);
  });
});

watch(() => sense.value.signVideos, (newVideos) => {
  videosBackup.value = JSON.parse(JSON.stringify(newVideos));
}, { deep: true });

const updateLocalVideo = (newVideo: SignVideo, index: number) => {
  sense.value.signVideos[index] = newVideo;
};

const addVideo = () => {
  // Get the highest priority
  const maxPriority = Math.max(...sense.value.signVideos.map(v => v.priority || 0), 0);
  
  // Create new video with the highest priority
  const newVideo: SignVideo = {
    id: '',
    title: '',
    priority: maxPriority + 1,
    videoDataId: '',
    senseId: sense.value.id || '',
    isNew: true,
    videos: [{
      id: Date.now().toString(),
      angle: translate('newAngle'),
      url: '',
      priority: 1
    }],
    minimalPairs: [],
    videoData: {
      hands: Hand.RIGHT,
      configuration: HandConfiguration.CONF_1,
      configurationChanges: ConfigurationChange.BENDING,
      relationBetweenArticulators: RelationBetweenArticulators.ABOVE,
      location: Location.NEUTRAL_SPACE,
      movementRelatedOrientation: MovementRelatedOrientation.FRONT,
      orientationRelatedToLocation: OrientationRelatedToLocation.AO_FINGERS_CONTRA,
      orientationChange: OrientationChange.EXTENSION,
      contactType: ContactType.CONTINUOUS,
      movementType: MovementType.STRAIGHT,
      movementDirection: MovementDirection.FORWARDS,
      repeatedMovement: null,
      vocalization: '',
      nonManualComponent: '',
      inicialization: '',
      id: Date.now().toString()
    }
  };

  // Add the video at the beginning of the array
  sense.value.signVideos.unshift(newVideo);
  isCreatingVideo.value = true;
}

const removeVideo = async (index: number) => {
  const video = sense.value.signVideos[index];
  if (!video) return;
  
  try {
    if (video.id) {
        await api.signVideos.delete(video.id);
    }
    
    if (index === 0 && isCreatingVideo.value) {
      isCreatingVideo.value = false;
    }
    sense.value.signVideos.splice(index, 1);
    
    $q.notify({
      type: 'positive',
      message: translate('videoDeleted')
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    $q.notify({
      type: 'negative',
      message: translate('errorDeletingVideo')
    });
  }
}

const updateSignVideo = async (video: SignVideo, index: number) => {
  try {
    const currentVideo = sense.value.signVideos[index];
    if (!currentVideo) return;

    // Validate if video has a videoUrl and an angle
    if (!currentVideo.videos?.[0]?.url) {
      $q.notify({
        type: 'negative',
        message: translate('videoUrlRequired')
      });
      return;
    }
    if (!currentVideo.videos[0].angle) {
      $q.notify({
        type: 'negative',
        message: translate('videoAngleRequired')
      });
      return;
    }

    let response;
    if (currentVideo.id) {
      // Update the video
      const payload = { ...currentVideo };
      
      // Remove empty values from videoData (phonology)
      if (payload.videoData) {
        Object.keys(payload.videoData).forEach((key: string) => {
          if (payload.videoData[key as keyof PhonologyData] === '' || payload.videoData[key as keyof PhonologyData] === null || payload.videoData[key as keyof PhonologyData] === undefined) {
            delete payload.videoData[key as keyof PhonologyData];
          }
        });
      }
      
      response = await api.signVideos.update(currentVideo.id, payload);
    } else {
      // Create the video
      response = await api.signVideos.create(currentVideo);

      emit('update:glossData', response.data);
    }

    if (index === 0 && currentVideo.isNew) {
      currentVideo.isNew = false;
      isCreatingVideo.value = false;
    }

    $q.notify({
      type: 'positive',
      message: currentVideo.id ? translate('videoUpdated') : translate('videoCreated')
    });
  } catch (error) {
    console.error('Error saving video:', error);
    $q.notify({
      type: 'negative',
      message: translate('errorSavingVideo')
    });
  }
}

const updateVideoData = (index: number, videoData: PhonologyData) => {
  if (sense.value.signVideos[index]) {
    sense.value.signVideos[index].videoData = videoData;
  }
}

const handleVideoCancel = (index: number) => {
  if (index === 0 && isCreatingVideo.value) {
    // If cancelling a new video creation, remove it
    removeVideo(index).catch((err) => {
      console.error(err)
    })
  } else {
    // Otherwise revert to backup
    if (videosBackup.value[index]) {
      sense.value.signVideos[index] = JSON.parse(JSON.stringify(videosBackup.value[index]));
    }
  }
}

const moveVideoLeft = async (index: number) => {
  if (index === 0) return;
  
  const sortedVideoList = sortedVideos.value;
  const currentVideo = sortedVideoList[index];
  const previousVideo = sortedVideoList[index - 1];
  
  if (!currentVideo?.id || !previousVideo?.id) return;
  
  try {
    // Swap priorities
    const tempPriority = currentVideo.priority || 0;
    currentVideo.priority = previousVideo.priority || 0;
    previousVideo.priority = tempPriority;
    
    // Update in backend
    await Promise.all([
      api.signVideoPriority.update(currentVideo.id, { priority: currentVideo.priority }),
      api.signVideoPriority.update(previousVideo.id, { priority: previousVideo.priority })
    ]);
    
    $q.notify({
      type: 'positive',
      message: translate('videoOrderUpdated'),
      position: 'bottom'
    });
  } catch (error) {
    console.error('Error updating video order:', error);
    $q.notify({
      type: 'negative',
      message: translate('errorUpdatingVideoOrder'),
      position: 'bottom'
    });
  }
}

const moveVideoRight = async (index: number) => {
  const sortedVideoList = sortedVideos.value;
  if (index === sortedVideoList.length - 1) return;
  
  const currentVideo = sortedVideoList[index];
  const nextVideo = sortedVideoList[index + 1];
  
  if (!currentVideo?.id || !nextVideo?.id) return;
  
  try {
    // Swap priorities
    const tempPriority = currentVideo.priority || 0;
    currentVideo.priority = nextVideo.priority || 0;
    nextVideo.priority = tempPriority;
    
    // Update in backend
    await Promise.all([
      api.signVideoPriority.update(currentVideo.id, { priority: currentVideo.priority }),
      api.signVideoPriority.update(nextVideo.id, { priority: nextVideo.priority })
    ]);
    
    $q.notify({
      type: 'positive',
      message: translate('videoOrderUpdated'),
      position: 'bottom'
    });
  } catch (error) {
    console.error('Error updating video order:', error);
    $q.notify({
      type: 'negative',
      message: translate('errorUpdatingVideoOrder'),
      position: 'bottom'
    });
  }
}

function validateVideo(video: SignVideo): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!video.videos?.length) {
    errors.push(translate('errors.atLeastOneVideoRequired'));
  } 
  video.videos.forEach((v, index) => {
    if (!v.angle?.trim()) {
      errors.push(translate('errors.angleRequired', { index: index + 1 }));
    }
    if (!v.url?.trim()) {
      errors.push(translate('errors.videoRequired', { index: index + 1 }));
    }
  });

  if (!video.videoData?.hands) {
    errors.push(translate('errors.handsRequired'));
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
</script>

<style scoped>
.videos-component {
  width: 100%;
}

.overflow-auto {
  scrollbar-position: top;
}

.video-content {
  width: 100%;
}

.add-video-card {
  height: 200px;
  transition: all 0.3s ease;
}

.add-video-card:hover {
  background: rgba(0, 0, 0, 0.03);
}
</style>

