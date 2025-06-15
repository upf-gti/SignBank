<!-- A reusable card component for displaying a related gloss -->
<template>
  <q-card
    bordered
    flat
    class="related-gloss-card"
  >
    <q-card-section horizontal>
      <q-card-section class="col">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6 gloss-title">
              {{ gloss.targetGloss.gloss }}
              <q-tooltip>{{ t('clickToView') }}</q-tooltip>
            </div>
            <div class="relation-type">
              <q-chip
                dense
                color="primary"
                text-color="white"
                class="relation-chip"
              >
                {{ gloss.relationType }}
                <q-tooltip>{{ getRelationDescription(gloss.relationType) }}</q-tooltip>
              </q-chip>
            </div>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              color="primary"
              :label="t('view')"
              :loading="loading"
              @click="$emit('view', gloss.targetGlossId || '')"
            />
            <q-btn
              v-if="editMode"
              color="secondary"
              unelevated
              icon="edit"
              :label="t('edit')"
              :loading="loading"
              @click="$emit('edit', gloss)"
            >
              <q-tooltip>{{ t('editRelationType') }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="editMode"
              color="negative"
              flat
              icon="delete"
              :loading="loading"
              @click="handleDelete"
            >
              <q-tooltip>{{ t('removeRelation') }}</q-tooltip>
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
import type { RelatedGloss } from 'src/types/gloss';

const t = (key: string) => translate(key);

const props = defineProps<{
  gloss: RelatedGloss;
  editMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'view', id: string): void;
  (e: 'delete', id: string): void;
  (e: 'edit', gloss: RelatedGloss): void;
}>();

const loading = ref(false);

function getRelationDescription(type: string): string {
  const descriptions: Record<string, string> = {
    SYNONYM: t('synonymDescription'),
    ANTONYM: t('antonymDescription'),
    HOMONYM: t('homonymDescription'),
    VARIANT: t('variantDescription'),
    ASSOCIATED_CONCEPT: t('associatedConceptDescription')
  };
  return descriptions[type] || type;
}

 function handleDelete() {
  if (!props.gloss.id) return;
  loading.value = true;
  try {
    emit('delete', props.gloss.id);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.related-gloss-card {
  transition: all 0.2s ease;
}

.related-gloss-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gloss-title {
  cursor: pointer;
}

.gloss-title:hover {
  color: var(--q-primary);
}

.relation-type {
  margin-top: 4px;
}

.relation-chip {
  font-size: 0.8rem;
}
</style> 