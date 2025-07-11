<template>
  <q-item class="q-mb-md q-pa-md q-hover:bg-grey-1 q-transition-all q-rounded-borders column">
    <EditableModule
      :allow-edit="allowEdit"
      :show-delete="true"
      :custom-edit-label="translate('editExample')"
      :custom-delete-label="translate('deleteExample')"
      @save="() => $emit('save', example)"
      @delete="() => $emit('delete', example)"
    >
      <template #default="{ isEditing }">
        <!-- Example Content - Stacked Layout for Mobile -->
        <div class="column q-gutter-md q-mb-lg">
          <!-- Example Text Section (First on Mobile) -->
          <div class="col">
            <q-input
              v-if="isEditing"
              v-model="example.example"
              :label="translate('example')"
              outlined
              dense
              class="full-width"
              style="min-height: 80px;"
            />
            <div
              v-else
              class="text-body1 text-dark q-line-height-1-7"
            >
              {{ example.example }}
            </div>
          </div>

          <!-- Example Video Section (Second on Mobile) -->
          <div class="col" v-if="example.exampleVideoURL || isEditing">
            <UploadVideoComponent
              v-if="isEditing && !example.exampleVideoURL"
              video-type="example"
              :custom-label="translate('addExampleVideo')"
              @upload-complete="(url) => $emit('uploadVideo', example, url)"
            />
            <div
              v-else-if="example.exampleVideoURL"
              class="column q-gutter-sm"
            >
              <video
                ref="videoPlayer"
                controls
                autoplay
                class="rounded-borders shadow-2 full-width"
                :src="getVideoUrl(example.exampleVideoURL)"
                muted
                @error="$emit('videoError', $event)"
                style="max-width: 100%; max-height: 200px; width: 100%; height: auto; object-fit: contain;"
              />
              <q-btn
                v-if="isEditing"
                outline
                :label="translate('deleteExampleVideo')"
                icon="delete"
                class="self-start"
                style="min-width: 120px;"
                @click="$emit('deleteVideo', example)"
              />
            </div>
          </div>
        </div>

        <!-- Example Translations -->
        <ExampleTranslationsComponent
          v-if="!example.isNew"
          :example="example"
          :allow-edit="allowEdit"
          @update:gloss-data="(data) => $emit('updateGlossData', data)"
        />
      </template>
    </EditableModule>
  </q-item>
</template>

<script setup lang="ts">
import { Example, GlossData } from 'src/types/models';
import translate from 'src/utils/translate';
import EditableModule from 'src/components/Shared/EditableModule.vue';
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';
import ExampleTranslationsComponent from '../ExampleTranslationsComponent.vue';
import { getVideoUrl } from 'src/utils/videoUrl';

const props = defineProps<{
  example: Example;
  allowEdit: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', example: Example): void;
  (e: 'delete', example: Example): void;
  (e: 'uploadVideo', example: Example, url: string): void;
  (e: 'deleteVideo', example: Example): void;
  (e: 'videoError', event: Event): void;
  (e: 'updateGlossData', glossData: GlossData): void;
}>();
</script> 