<template>
  <q-card-section class="column">
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('videos') }}
      <q-btn
        v-if="editMode"
        flat
        round
        icon="add"
        :label="translate('addVideo')"
        @click="addVideo"
      />
    </div>
    <div class="row q-col-gutter-md no-wrap overflow-auto">
      <div
        v-for="(video, index) in sense.signVideos"
        :key="video.id || index"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          flat
          bordered
        >
          <q-card-section class="row justify-between items-center">
            <q-input
              v-if="editMode"
              v-model="video.title"
              :label="translate('title')"
              outlined
              dense
              class="col-12 q-mb-sm"
            />
            <q-item-label v-else>
              {{ video.title }}
            </q-item-label>
            <q-btn
              v-if="editMode"
              flat
              round
              icon="delete"
              :label="translate('deleteVideo')"
              @click="removeVideo(index)"
            />
          </q-card-section>
          <q-card-section>
            <GlossVideoComponent
              :sign-video="video"
              :edit-mode="editMode"
              @update:sign-video="updateSignVideo"
            />
          </q-card-section>
          <q-card-section>
            <SignFonologyComponent
              :video-data="video.videoData"
              :edit-mode="editMode"
              @update:video-data="updateVideoData(index, $event)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { Sense, SignVideo, VideoData } from 'src/types/models';
import translate from 'src/utils/translate';
import GlossVideoComponent from './GlossVideoComponent.vue';
import SignFonologyComponent from './SignFonologyComponent.vue';

const sense = defineModel<Sense>({ required: true })
const { editMode } = defineProps<{
  editMode: boolean;
}>();

const addVideo = () => {
  sense.value.signVideos.push({
    id: Date.now().toString(),
    title: '',
    url: '',
    priority: sense.value.signVideos.length + 1,
    videoDataId: '',
    senseId: sense.value.id || '',
    videos: [{
      id: Date.now().toString(),
      angle: translate('newAngle'),
      url: '',
      priority: 1,
    }],
    minimalPairs: [],
    videoData: {
      hands: '',  // Empty string for unselected state
      configuration: '',
      configurationChanges: '',
      relationBetweenArticulators: '',
      location: '',
      movementRelatedOrientation: '',
      locationRelatedOrientation: '',
      orientationChange: '',
      contactType: '',
      movementType: '',
      vocalization: '',
      nonManualComponent: '',
      inicialization: '',
      id: Date.now().toString()
    }
  })
}

const removeVideo = (index: number) => {
  sense.value.signVideos.splice(index, 1)
}

const updateSignVideo = (signVideo: SignVideo) => {
  const index = sense.value.signVideos.findIndex(video => video.id === signVideo.id)
  if (index > -1) {
    sense.value.signVideos[index] = signVideo
  }
}

const updateVideoData = (index: number, videoData: VideoData) => {
  if (sense.value.signVideos[index]) {
    sense.value.signVideos[index].videoData = videoData
  }
}
</script>

<style scoped>
.overflow-auto {
  scrollbar-position: top;
}
</style>
