<template>
  <q-card-section>
    <div class="text-h5 q-mb-md row justify-between items-center">
      {{ translate('videos') }}
      <q-btn v-if="editMode !== 'none'" flat round icon="add" @click="addVideo" />
    </div>
    <div class="row q-col-gutter-md no-wrap overflow-auto">
      <div
        v-for="(video, index) in sense.signVideos"
        :key="video.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          flat
          bordered
        >
          <q-card-section class="row justify-between items-center">
            <q-input
              v-if="editMode !== 'none'"
              v-model="video.title"
              :label="translate('title')"
              outlined
              dense
              class="col-12 q-mb-sm"
            />
            <q-item-label v-else>
              {{ video.title }}
            </q-item-label>
            <q-btn v-if="editMode !== 'none'" flat round icon="delete" @click="removeVideo(index)" />
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

const { sense, editMode } = defineProps<{
  sense: Sense;
  editMode: "strict" | "full" | "none";
}>();

const addVideo = () => {
  sense.signVideos.push({
    id: Date.now().toString(),
    title: '',
    url: '',
    priority: sense.signVideos.length + 1,
    videoDataId: '',
    senseId: sense.id || '',
    videos: [{
      id: Date.now().toString(),
      angle: translate('newAngle'),
      url: '',
      priority: 1,
    }],
    minimalPairs: [],
    videoData: {
      hands: '',
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
  sense.signVideos.splice(index, 1)
}

const updateSignVideo = (signVideo: SignVideo) => {
  const index = sense.signVideos.findIndex(video => video.id === signVideo.id)
  if (index > -1) {
    sense.signVideos[index] = signVideo
  }
}
</script>

<style scoped>
.overflow-auto {
  scrollbar-position: top;
}
</style>
