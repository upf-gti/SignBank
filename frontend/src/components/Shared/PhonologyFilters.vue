<template>
  <div class="phonology-filters">
    <q-list>
      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('hands') }}
          </q-item-label>
          <q-btn-toggle
            v-if="isEditable"
            :model-value="localData.hands"
            :options="[
              { label: translate('rightHand'), value: 'RIGHT' },
              { label: translate('leftHand'), value: 'LEFT' },
              { label: translate('bothHands'), value: 'BOTH' }
            ]"
            spread
            no-caps
            unelevated
            toggle-color="primary"
            color="grey-3"
            text-color="grey-8"
            class="full-width"
            @update:model-value="updateField('hands', $event)"
          />
          <q-item-label v-else>{{ modelValue.hands }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('configuration') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.configuration"
            :label="translate('configuration')"
            outlined
            dense
            @update:model-value="updateField('configuration', $event)"
          />
          <q-item-label v-else>{{ modelValue.configuration }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('configurationChanges') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.configurationChanges"
            :label="translate('configurationChanges')"
            outlined
            dense
            @update:model-value="updateField('configurationChanges', $event)"
          />
          <q-item-label v-else>{{ modelValue.configurationChanges }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('relationBetweenArticulators') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.relationBetweenArticulators"
            :label="translate('relationBetweenArticulators')"
            outlined
            dense
            @update:model-value="updateField('relationBetweenArticulators', $event)"
          />
          <q-item-label v-else>{{ modelValue.relationBetweenArticulators }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('location') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.location"
            :label="translate('location')"
            outlined
            dense
            @update:model-value="updateField('location', $event)"
          />
          <q-item-label v-else>{{ modelValue.location }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('movementRelatedOrientation') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.movementRelatedOrientation"
            :label="translate('movementRelatedOrientation')"
            outlined
            dense
            @update:model-value="updateField('movementRelatedOrientation', $event)"
          />
          <q-item-label v-else>{{ modelValue.movementRelatedOrientation }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('locationRelatedOrientation') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.locationRelatedOrientation"
            :label="translate('locationRelatedOrientation')"
            outlined
            dense
            @update:model-value="updateField('locationRelatedOrientation', $event)"
          />
          <q-item-label v-else>{{ modelValue.locationRelatedOrientation }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('orientationChange') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.orientationChange"
            :label="translate('orientationChange')"
            outlined
            dense
            @update:model-value="updateField('orientationChange', $event)"
          />
          <q-item-label v-else>{{ modelValue.orientationChange }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('contactType') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.contactType"
            :label="translate('contactType')"
            outlined
            dense
            @update:model-value="updateField('contactType', $event)"
          />
          <q-item-label v-else>{{ modelValue.contactType }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('movementType') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.movementType"
            :label="translate('movementType')"
            outlined
            dense
            @update:model-value="updateField('movementType', $event)"
          />
          <q-item-label v-else>{{ modelValue.movementType }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('vocalization') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.vocalization"
            :label="translate('vocalization')"
            outlined
            dense
            @update:model-value="updateField('vocalization', $event)"
          />
          <q-item-label v-else>{{ modelValue.vocalization }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('nonManualComponent') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.nonManualComponent"
            :label="translate('nonManualComponent')"
            outlined
            dense
            @update:model-value="updateField('nonManualComponent', $event)"
          />
          <q-item-label v-else>{{ modelValue.nonManualComponent }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label caption>
            {{ translate('inicialization') }}
          </q-item-label>
          <q-input
            v-if="isEditable"
            :model-value="localData.inicialization"
            :label="translate('inicialization')"
            outlined
            dense
            @update:model-value="updateField('inicialization', $event)"
          />
          <q-item-label v-else>{{ modelValue.inicialization }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import translate from 'src/utils/translate';

interface PhonologyData {
  hands: string;
  configuration: string;
  configurationChanges: string;
  relationBetweenArticulators: string;
  location: string;
  movementRelatedOrientation: string;
  locationRelatedOrientation: string;
  orientationChange: string;
  contactType: string;
  movementType: string;
  vocalization: string;
  nonManualComponent: string;
  inicialization: string;
}

const props = defineProps<{
  modelValue: PhonologyData;
  isEditable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: PhonologyData): void;
}>();

const localData = ref<PhonologyData>({ ...props.modelValue });

// Keep local data in sync with prop changes
watch(() => props.modelValue, (newValue) => {
  localData.value = { ...newValue };
}, { deep: true });

const updateField = (field: keyof PhonologyData, value: string | number | null) => {
  localData.value = {
    ...localData.value,
    [field]: String(value || '')
  };
  emit('update:modelValue', localData.value);
};
</script>

<style scoped>
.phonology-filters {
  max-height: 100%;
  overflow-y: auto;
}
</style> 