<template>
  <div class="video-player">
    <q-card
      class="video-card"
      flat
    >
      <q-card-section>
        <div
          v-if="videos.length > 0"
          class="video-container"
        >
          <video 
            :src="getVideoUrl(currentVideo!.url)"
            class="q-mb-md"
            style="height: 250px; width: 250px; object-fit: cover"
            loop
            autoplay
          />
          
          <div class="text-caption q-mb-md">
            {{ translate('word_detail.field.angle') }}: 
            {{ currentVideo!.angle || translate('word_detail.notSpecified') }}
          </div>
          
          <!-- Video navigation -->
          <div
            v-if="videos.length > 1"
            class="video-navigation q-mb-md"
          >
            <q-btn 
              icon="navigate_before" 
              color="primary" 
              flat 
              round 
              :disable="currentIndex === 0"
              @click="prevVideo" 
            />
            
            <span class="q-mx-sm">
              {{ currentIndex + 1 }} / {{ videos.length }}
            </span>
            
            <q-btn 
              icon="navigate_next" 
              color="primary" 
              flat 
              round 
              :disable="currentIndex === videos.length - 1"
              @click="nextVideo" 
            />
          </div>
        </div>
        
        <div
          v-else
          class="no-videos"
        >
          {{ translate('word_detail.noVideos') }}
        </div>
      </q-card-section>
    </q-card>
    <!-- Sign information below the video -->
    <SignInfo 
      :video="currentVideo" 
      :is-edit-mode="editMode !== 'none'"
      @update:video="updateVideo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Video } from 'src/types/models'
import translate from 'src/utils/translate'
import SignInfo from './SignInfo.vue'
import { getVideoUrl } from 'src/utils/videoUrl'

interface Props {
  videos: Video[]
  editMode: 'none' | 'strict' | 'full'
}

const emit = defineEmits<{
  (e: 'update:videos', videos: Video[]): void
}>()
const { videos, editMode = 'none' } = defineProps<Props>()

const currentIndex = ref(0)

// Reset current index when videos change
watch(() => videos, () => {
  currentIndex.value = 0
}, { immediate: true })

const currentVideo = computed(() => {
  if (videos.length === 0) {
    return {
      url: '',
      angle: '',
      priority: 0,
      id: '',
    } as Video
  }
  return videos[currentIndex.value] as Video
})

function nextVideo() {
  if (currentIndex.value < videos.length - 1) {
    currentIndex.value++
  }
}

function prevVideo() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function updateVideo(video: Video) {
  const updatedVideos = videos.map((v, index) => index === currentIndex.value ? video : v);
  emit('update:videos', updatedVideos);
}
</script>

<style scoped>
.video-card {
  height: 100%;
}

.video-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-videos {
  text-align: center;
  padding: 2rem 0;
  color: #aaa;
}
</style> 