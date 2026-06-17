<template>
  <q-item class="q-mb-md q-pa-md q-hover:bg-grey-1 q-transition-all q-rounded-borders column">
    <EditableModule
      :allow-edit="allowEdit"
      :inline-edit="inlineEdit"
      :show-delete="!inlineEdit || Boolean(definition.id)"
      @save="() => $emit('save', definition)"
      @delete="() => $emit('delete', definition)"
    >
      <template #default="{ isEditing }">
        <!-- Definition Title -->
        <q-input
          v-if="isEditing"
          v-model="definition.title"
          :label="translate('definitionTitle')"
          outlined
          dense
          class="col-12 q-mb-sm"
        />
        <div
          v-else
          class="q-mb-sm text-subtitle1 text-weight-medium text-primary"
        >
          {{ definition.title }}
        </div>

        <!-- Definition Content -->
        <div class="column q-gutter-md q-mb-lg">
          <!-- Definition Text Section -->
          <div class="col">
            <q-input
              v-if="isEditing"
              v-model="definition.definition"
              :label="translate('definition')"
              outlined
              dense
              class="full-width"
              style="min-height: 80px;"
            />
            <div
              v-else
              class="text-body1 text-dark q-line-height-1-7"
            >
              {{ definition.definition }}
            </div>
          </div>

          <!-- Definition Video Section -->
          <div
            v-if="!hideDefinitionVideo && (definition.videoDefinitionUrl || isEditing)"
            class="col"
          >
            <UploadVideoComponent
              v-if="isEditing && !definition.videoDefinitionUrl"
              video-type="definition"
              :custom-label="translate('addDefinitionVideo')"
              @upload-complete="(url) => $emit('uploadVideo', definition, url)"
            />
            <div
              v-else-if="definition.videoDefinitionUrl"
              class="column q-gutter-sm"
            >
              <video
                ref="videoPlayer"
                controls
                autoplay
                class="rounded-borders shadow-2 definition-video"
                :src="getVideoUrl(definition.videoDefinitionUrl)"
                muted
                @error="$emit('videoError', $event)"
              />
              <q-btn
                v-if="isEditing"
                outline
                :label="translate('deleteDefinitionVideo')"
                icon="delete"
                class="self-start"
                style="min-width: 120px;"
                @click="$emit('deleteVideo', definition)"
              />
            </div>
          </div>
        </div>

        <!-- Definition Translations -->
        <DefinitionTranslationsComponent
          :allow-edit="allowEdit"
          :inline-edit="inlineEdit"
          :definition-id="definition.id || ''"
          :translations="definition.definitionTranslations"
          @update:translations="(translations: DefinitionTranslation[]) => $emit('updateTranslations', definition, translations)"
        />
      </template>
    </EditableModule>
  </q-item>
</template>

<script setup lang="ts">
import { Definition, DefinitionTranslation } from 'src/types/models';
import translate from 'src/utils/translate';
import EditableModule from 'src/components/Shared/EditableModule.vue';
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';
import DefinitionTranslationsComponent from './DefinitionTranslationsComponent.vue';
import { getVideoUrl } from 'src/utils/videoUrl';

const props = defineProps<{
  definition: Definition;
  allowEdit: boolean;
  inlineEdit?: boolean;
  hideDefinitionVideo?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', definition: Definition): void;
  (e: 'delete', definition: Definition): void;
  (e: 'uploadVideo', definition: Definition, url: string): void;
  (e: 'deleteVideo', definition: Definition): void;
  (e: 'videoError', event: Event): void;
  (e: 'updateTranslations', definition: Definition, translations: DefinitionTranslation[]): void;
}>();
</script>

<style scoped>
.definition-video {
  max-width: 100%;
  max-height: 200px;
  width: 100%;
  height: auto;
  object-fit: contain;
}
</style>