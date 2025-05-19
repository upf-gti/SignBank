<template>
  <q-card-section>
    <div class="text-h5 q-mb-md">
      {{ translate('videos') }}
    </div>
    <div class="row q-col-gutter-md no-wrap overflow-auto">
      <div
        v-for="video in sense.signVideos"
        :key="video.id"
        class="col-12 col-sm-6 col-md-3"
      >
        <q-card
          flat
          bordered
        >
          <q-card-section>
            <q-item-label>
              {{ video.title }}
            </q-item-label>
            <GlossVideoComponent
              :sign-video="video"
            />
          </q-card-section>
          <q-card-section>
            <SignFonologyComponent
              :video-data="video.videoData"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-card-section>
</template>
<script setup lang="ts">
import { Sense } from 'src/types/models';
import translate from 'src/utils/translate';
import GlossVideoComponent from './GlossVideoComponent.vue';
import SignFonologyComponent from './SignFonologyComponent.vue';
const { sense } = defineProps<{
  sense: Sense;
}>();
</script>

<style scoped>
.overflow-auto {
  scrollbar-position: top;
}

</style>
