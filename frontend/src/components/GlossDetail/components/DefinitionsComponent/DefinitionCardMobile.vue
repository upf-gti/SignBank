<template>
  <q-item class="definition-card-mobile q-mb-md">
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
          class="definition-title-mobile q-mb-sm text-subtitle1"
        >
          {{ definition.title }}
        </div>

        <!-- Definition Content - Stacked Layout for Mobile -->
        <div class="definition-content-mobile">
          <!-- Definition Text Section (First on Mobile) -->
          <div class="definition-text-section-mobile">
            <q-input
              v-if="isEditing"
              v-model="definition.definition"
              :label="translate('definition')"
              outlined
              dense
              class="definition-input-mobile"
            />
            <div
              v-else
              class="definition-text-mobile"
            >
              {{ definition.definition }}
            </div>
          </div>

          <!-- Definition Video Section (Second on Mobile) -->
          <div class="definition-video-section-mobile">
            <UploadVideoComponent
              v-if="isEditing && !definition.videoDefinitionUrl"
              video-type="definition"
              :custom-label="translate('addDefinitionVideo')"
              @upload-complete="(url) => $emit('uploadVideo', definition, url)"
            />
            <div
              v-else-if="definition.videoDefinitionUrl"
              class="video-container-mobile"
            >
              <video
                ref="videoPlayer"
                controls
                autoplay
                class="video-player-mobile"
                :src="getVideoUrl(definition.videoDefinitionUrl)"
                muted
                @error="$emit('videoError', $event)"
              />
              <q-btn
                v-if="isEditing"
                outline
                :label="translate('deleteDefinitionVideo')"
                icon="delete"
                class="delete-video-btn-mobile"
                @click="$emit('deleteVideo', definition)"
              />
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
.definition-card-mobile {
  min-height: 40px;
  border-radius: 12px;
  transition: all 0.3s ease;
  padding: 12px;
  margin-bottom: 16px;
  background-color: rgba(0, 0, 0, 0.02);
}

.definition-card-mobile:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.definition-title-mobile {
  font-weight: 600;
  color: var(--q-primary);
  font-size: 1.1rem;
  margin-bottom: 12px;
  line-height: 1.3;
}

.definition-content-mobile {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.definition-text-section-mobile {
  order: 1;
}

.definition-video-section-mobile {
  order: 2;
}

.video-container-mobile {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-player-mobile {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.delete-video-btn-mobile {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  font-size: 0.9rem;
}

.definition-input-mobile {
  width: 100%;
  min-height: 60px;
}

.definition-text-mobile {
  line-height: 1.6;
  color: var(--q-dark);
  font-size: 0.95rem;
  text-align: left;
  word-wrap: break-word;
}

/* Small Mobile Styles */
@media (max-width: 480px) {
  .definition-card-mobile {
    padding: 10px;
    margin-bottom: 12px;
  }
  
  .definition-title-mobile {
    font-size: 1rem;
    margin-bottom: 10px;
  }
  
  .definition-text-mobile {
    font-size: 0.9rem;
  }
  
  .video-player-mobile {
    max-height: 150px;
  }
  
  .delete-video-btn-mobile {
    height: 40px;
    font-size: 0.85rem;
  }
}

/* Medium Mobile Styles */
@media (min-width: 481px) and (max-width: 768px) {
  .definition-card-mobile {
    padding: 14px;
  }
  
  .video-player-mobile {
    max-height: 200px;
  }
  
  .definition-text-mobile {
    font-size: 1rem;
  }
}

/* Touch-friendly improvements */
.definition-card-mobile :deep(.q-btn) {
  min-height: 44px;
  font-size: 0.9rem;
}

.definition-card-mobile :deep(.q-input) {
  font-size: 0.95rem;
}

.definition-card-mobile :deep(.q-field__control) {
  min-height: 44px;
}
</style> 