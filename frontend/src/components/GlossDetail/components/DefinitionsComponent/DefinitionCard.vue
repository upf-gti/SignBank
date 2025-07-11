<template>
  <q-item class="definition-card q-mb-lg">
    <EditableModule
      :allow-edit="allowEdit"
      :show-delete="true"
      :custom-edit-label="translate('editDefinition')"
      :custom-delete-label="translate('deleteDefinition')"
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
          class="definition-title q-mb-md text-subtitle1"
        >
          {{ definition.title }}
        </div>

        <!-- Definition Content -->
        <div class="definition-content">
          <!-- Definition Video -->
          <div class="definition-video-section">
            <UploadVideoComponent
              v-if="isEditing && !definition.videoDefinitionUrl"
              video-type="definition"
              :custom-label="translate('addDefinitionVideo')"
              @upload-complete="(url) => $emit('uploadVideo', definition, url)"
            />
            <div
              v-else-if="definition.videoDefinitionUrl"
              class="video-container"
            >
              <video
                ref="videoPlayer"
                controls
                autoplay
                class="video-player"
                :src="getVideoUrl(definition.videoDefinitionUrl)"
                muted
                @error="$emit('videoError', $event)"
              />
              <q-btn
                v-if="isEditing"
                outline
                :label="translate('deleteDefinitionVideo')"
                icon="delete"
                class="delete-video-btn"
                @click="$emit('deleteVideo', definition)"
              />
            </div>
          </div>

          <!-- Definition Text -->
          <div class="definition-text-section">
            <q-input
              v-if="isEditing"
              v-model="definition.definition"
              :label="translate('definition')"
              outlined
              dense
              class="definition-input"
            />
            <div
              v-else
              class="definition-text"
            >
              {{ definition.definition }}
            </div>
          </div>
        </div>

        <!-- Definition Translations -->
        <DefinitionTranslationsComponent
          :allow-edit="allowEdit"
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
.definition-card {
  min-height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.definition-card:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.definition-title {
  font-weight: 600;
  color: var(--q-primary);
}

.definition-content {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.definition-video-section {
  flex-shrink: 0;
}

.definition-text-section {
  flex: 1;
  min-width: 0;
}

.video-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-player {
  max-width: 100%;
  max-height: 200px;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.delete-video-btn {
  align-self: flex-start;
}

.definition-input {
  width: 100%;
}

.definition-text {
  line-height: 1.6;
  color: var(--q-dark);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .definition-content {
    flex-direction: column;
    gap: 12px;
  }

  .definition-video-section {
    order: 2;
  }

  .definition-text-section {
    order: 1;
  }

  .video-player {
    max-height: 150px;
    width: 100%;
    object-fit: cover;
  }

  .definition-title {
    font-size: 1.1rem;
    margin-bottom: 12px;
  }

  .definition-text {
    font-size: 0.95rem;
  }

  .delete-video-btn {
    width: 100%;
    margin-top: 8px;
  }
}

/* Tablet Styles */
@media (min-width: 769px) and (max-width: 1024px) {
  .definition-content {
    gap: 12px;
  }

  .video-player {
    max-height: 180px;
  }
}

/* Desktop Styles */
@media (min-width: 1025px) {
  .definition-content {
    gap: 20px;
  }

  .video-player {
    max-height: 200px;
  }
}
</style> 