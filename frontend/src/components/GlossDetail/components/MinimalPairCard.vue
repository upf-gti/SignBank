<!-- A reusable card component for displaying a minimal pair -->
<template>
  <q-card bordered flat class="minimal-pair-card">
    <q-card-section horizontal>
      <q-card-section class="col">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6 gloss-title">
              {{ pair.glossTo.gloss }}
              <q-tooltip>{{ t('clickToView') }}</q-tooltip>
            </div>
            <div class="distinction-section q-mt-sm">
              <q-icon name="compare_arrows" color="primary" size="sm" />
              <span class="distinction-text">{{ pair.distinction }}</span>
              <q-tooltip>{{ t('distinctionExplanation') }}</q-tooltip>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              :label="t('view')"
              :loading="loading"
              @click="$emit('view', pair.glossToId || '')"
            />
            <q-btn
              v-if="editMode"
              color="negative"
              flat
              icon="delete"
              :loading="loading"
              @click="handleDelete"
            >
              <q-tooltip>{{ t('removeMinimalPair') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import translate from 'src/utils/translate';
import type { MinimalPair } from 'src/types/gloss';

const t = (key: string) => translate(key);

const props = defineProps<{
  pair: MinimalPair;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'view', id: string): void;
  (e: 'delete', id: string): void;
}>();

const loading = ref(false);

async function handleDelete() {
  if (!props.pair.id) return;
  loading.value = true;
  try {
    await emit('delete', props.pair.id);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.minimal-pair-card {
  transition: all 0.2s ease;
}

.minimal-pair-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gloss-title {
  cursor: pointer;
}

.gloss-title:hover {
  color: var(--q-primary);
}

.distinction-section {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--q-primary);
}

.distinction-text {
  font-size: 0.9rem;
  font-style: italic;
}
</style> 