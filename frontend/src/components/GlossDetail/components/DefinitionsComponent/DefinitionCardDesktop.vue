<template>
  <q-item class="definition-card-desktop q-mb-lg">
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

        <!-- Definition Content - Side by Side Layout -->
        <div class="definition-content-desktop">
          <!-- Definition Video Section -->
          <div class="definition-video-section-desktop">
            <UploadVideoComponent
              v-if="isEditing && !definition.videoDefinitionUrl"
              video-type="definition"
              :custom-label="translate('addDefinitionVideo')"
              @upload-complete="(url) => $emit('uploadVideo', definition, url)"
            />
            <div
              v-else-if="definition.videoDefinitionUrl"
              class="video-container-desktop"
            >
              <video
                ref="videoPlayer"
                controls
                autoplay
                class="video-player-desktop"
                :src="getVideoUrl(definition.videoDefinitionUrl)"
                muted
                @error="$emit('videoError', $event)"
              />
              <q-btn
                v-if="isEditing"
                outline
                :label="translate('deleteDefinitionVideo')"
                icon="delete"
                class="delete-video-btn-desktop"
                @click="$emit('deleteVideo', definition)"
              />
            </div>
          </div>

          <!-- Definition Text Section -->
          <div class="definition-text-section-desktop">
            <q-input
              v-if="isEditing"
              v-model="definition.definition"
              :label="translate('definition')"
              outlined
              dense
              class="definition-input-desktop"
            />
            <div
              v-else
              class="definition-text-desktop"
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
.definition-card-desktop {
  min-height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 16px;
}

.definition-card-desktop:hover {
  background-color: rgba(0, 0, 0, 0.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.definition-title {
  font-weight: 600;
  color: var(--q-primary);
  font-size: 1.2rem;
  margin-bottom: 16px;
}

.definition-content-desktop {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.definition-video-section-desktop {
  flex-shrink: 0;
  min-width: 300px;
}

.definition-text-section-desktop {
  flex: 1;
  min-width: 0;
}

.video-container-desktop {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-player-desktop {
  max-width: 100%;
  max-height: 250px;
  width: auto;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.delete-video-btn-desktop {
  align-self: flex-start;
  min-width: 120px;
}

.definition-input-desktop {
  width: 100%;
  min-height: 80px;
}

.definition-text-desktop {
  line-height: 1.7;
  color: var(--q-dark);
  font-size: 1rem;
  text-align: justify;
}

/* Large Desktop Styles */
@media (min-width: 1440px) {
  .definition-content-desktop {
    gap: 32px;
  }
  
  .video-player-desktop {
    max-height: 300px;
  }
  
  .definition-title {
    font-size: 1.3rem;
  }
  
  .definition-text-desktop {
    font-size: 1.05rem;
  }
}
</style> 