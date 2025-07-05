<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 600px">
      <q-card-section>
        <div class="text-h6">
          {{ translate('addDefinition') }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="column q-gutter-md">
          <!-- Definition Title -->
          <q-input
            v-model="definition.title"
            :label="translate('definitionTitle')"
            outlined
            dense
            ref="titleInput"
          />

          <!-- Definition Text -->
          <q-input
            v-model="definition.definition"
            :label="translate('definition')"
            outlined
            type="textarea"
            rows="3"
            :rules="[val => !!val || translate('definitionRequired')]"
            ref="definitionInput"
          />

          <!-- Definition Video -->
          <div class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">
              {{ translate('definitionVideo') }} ({{ translate('optional') }})
            </div>
            <UploadVideoComponent
              v-if="!definition.videoDefinitionUrl"
              video-type="definition"
              :custom-label="translate('addDefinitionVideo')"
              @upload-complete="(url) => definition.videoDefinitionUrl = url"
            />
            <div
              v-else
              class="column q-gutter-sm"
            >
              <video
                controls
                autoplay
                class="video-player"
                :src="getVideoUrl(definition.videoDefinitionUrl)"
                muted
                @error="handleVideoError"
              />
              <q-btn
                outline
                :label="translate('deleteDefinitionVideo')"
                icon="delete"
                @click="definition.videoDefinitionUrl = ''"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="translate('cancel')"
          @click="cancel"
        />
        <q-btn
          unelevated
          color="primary"
          :label="translate('create')"
          :loading="loading"
          :disable="!isFormValid"
          @click="createDefinition"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Definition } from 'src/types/models';
import translate from 'src/utils/translate';
import UploadVideoComponent from 'src/components/UploadVideoComponent.vue';
import { getVideoUrl } from 'src/utils/videoUrl';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const loading = ref(false);
const titleInput = ref<HTMLInputElement>();
const definitionInput = ref<HTMLInputElement>();

const definition = ref<Definition>({
  id: '',
  title: '',
  definition: '',
  videoDefinitionUrl: '',
  priority: 99,
  senseId: '',
  definitionTranslations: [],
  isEditing: true,
  isNew: true,
});

const props = defineProps<{
  modelValue: boolean;
  senseId: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'definition-created', definition: Definition): void;
}>();

const showDialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isFormValid = computed(() => {
  return definition.value.definition.trim();
});

const resetForm = () => {
  definition.value = {
    id: '',
    title: '',
    definition: '',
    videoDefinitionUrl: '',
    priority: 99,
    senseId: props.senseId,
    definitionTranslations: [],
    isEditing: true,
    isNew: true,
  };
};

const cancel = () => {
  resetForm();
  showDialog.value = false;
};

const createDefinition = async () => {
  if (!isFormValid.value) return;

  try {
    loading.value = true;
    
    // Create a clean definition object without Vue reactivity
    const newDefinition: Definition = {
      id: '',
      title: definition.value.title.trim(),
      definition: definition.value.definition.trim(),
      videoDefinitionUrl: definition.value.videoDefinitionUrl || '',
      priority: 0,
      senseId: props.senseId,
      definitionTranslations: [],
      isEditing: false,
      isNew: true,
    };

    emit('definition-created', newDefinition);
    resetForm();
    showDialog.value = false;

    $q.notify({
      type: 'positive',
      message: translate('definitionCreatedSuccessfully')
    });
  } catch (error) {
    console.error('Error creating definition:', error);
    $q.notify({
      type: 'negative',
      message: translate('errors.failedToCreateDefinition')
    });
  } finally {
    loading.value = false;
  }
};

const handleVideoError = (event: Event) => {
  console.error('Error playing video:', event);
  $q.notify({
    type: 'negative',
    message: translate('errors.failedToPlayVideo')
  });
};

// Focus on title input when dialog opens
const focusTitleInput = () => {
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus();
    }
  });
};

// Watch for dialog opening to focus the input
import { watch } from 'vue';
watch(showDialog, (newValue) => {
  if (newValue) {
    focusTitleInput();
  }
});
</script>

<style scoped>
.video-player {
  max-width: 100%;
  max-height: 200px;
  width: auto;
  height: auto;
}
</style> 