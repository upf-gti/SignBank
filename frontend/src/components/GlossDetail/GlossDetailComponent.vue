<template>
  <q-card flat style="max-width: 1200px">
    <GlossHeader :gloss-data="glossData" :edit-mode="editMode" :allow-edit="allowEdit" @edit-gloss="editGloss" @save-gloss="saveGloss" @cancel-gloss="cancelGloss" />
    <SenseSelector
      v-model="selectedSenseId"
      :senses="glossData.senses"
      :edit-mode="editMode"
      :gloss-data="glossData"
      @add-sense="addSense"
    />
    <MainContent
      v-if="editMode === 'none' && selectedSense"
      :selected-sense="selectedSense"
    />
    <MoreContentComponent
      v-if="glossData.senses.length > 0"
      v-model="selectedSense"
      :gloss-data="glossData"
      :edit-mode="editMode"
      @add-relation="addRelation"
      @remove-relation="removeRelation"
      @add-minimal-pair="addMinimalPair"
      @remove-pair="removeMinimalPair"
    />
  </q-card>
</template>

<script setup lang="ts">
import { GlossData, Sense, RelatedGloss, MinimalPair } from 'src/types/models'
import GlossHeader from './components/GlossHeader.vue'
import { ref, computed } from 'vue'
import SenseSelector from './components/SenseSelector.vue';
import MainContent from './components/MainContent.vue';
import MoreContentComponent from './components/MoreContentComponent.vue';
import { api } from 'src/services/api';
import { validateGloss } from 'src/utils/glossValidation';
import { useQuasar } from 'quasar';
import translate from 'src/utils/translate'

const emit = defineEmits<{
  (e: 'update:editMode', mode: 'none' | 'strict' | 'full'): void
  (e: 'saveGloss', glossData: GlossData): void
}>()

const { glossData, editMode, allowEdit = true } = defineProps<{
  glossData: GlossData,
  editMode: "strict" | "full" | "none",
  allowEdit: boolean
}>()

const selectedSenseId = ref<string>(glossData.senses[0]?.id as string)
const selectedSense = computed<Sense>(() => glossData.senses.find((sense) => sense.id === selectedSenseId.value) as Sense) 
const $q = useQuasar()

const editGloss = () => {
  if (!allowEdit) return
  emit('update:editMode', 'strict')
}

const saveGloss = () => {
  if (!allowEdit) return

  // Validate the gloss data
  const validationErrors = validateGloss(glossData)
  
  if (validationErrors.length > 0) {
    // Show validation errors to the user
    $q.dialog({
      title: translate('validationErrors'),
      message: `
        <ul style="list-style-type: disc; margin: 0; padding-left: 20px;">
          ${validationErrors.map(error => `<li>${error.message}</li>`).join('')}
        </ul>
      `,
      html: true,
      style: 'min-width: 300px',
      ok: {
        label: translate('ok'),
        flat: true,
        color: 'primary'
      }
    })
    return
  }

  emit('saveGloss', glossData)
}

const cancelGloss = () => {
  if (!allowEdit) return
  emit('update:editMode', 'none')
}

const addSense = (sense: { senseTitle: string, lexicalCategory: string }) => {
  glossData.senses.push({
    id: Date.now().toString(),
    senseTitle: sense.senseTitle,
    priority: glossData.senses.length + 1,
    lexicalCategory: sense.lexicalCategory,
    glossDataId: glossData.id || '',
    definitions: [],
    signVideos: [],
    examples: [],
    senseTranslations: [],
  })
  selectedSenseId.value = glossData.senses[glossData.senses.length - 1]?.id as string
}

const addRelation = async (relation: Partial<RelatedGloss>) => {
  try {
    const response = await api.glosses.addRelation(glossData.id || '', {
      relationType: relation.relationType!,
      relatedGlossId: relation.relatedGlossId!
    });
    glossData.relatedGlosses.push(response.data);
  } catch (error) {
    console.error('Error adding relation:', error);
  }
};

const removeRelation = async (relationId: string) => {
  try {
    await api.glosses.removeRelation(glossData.id || '', relationId);
    const index = glossData.relatedGlosses.findIndex(r => r.id === relationId);
    if (index > -1) {
      glossData.relatedGlosses.splice(index, 1);
    }
  } catch (error) {
    console.error('Error removing relation:', error);
  }
};

const addMinimalPair = async (pair: Partial<MinimalPair>) => {
  try {
    const response = await api.glosses.addMinimalPair(glossData.id || '', {
      distinction: pair.distinction!,
      signVideoId: pair.signVideoId!,
      minimalPairGlossDataId: pair.minimalPairGlossDataId!
    });
    glossData.minimalPairs.push(response.data);
  } catch (error) {
    console.error('Error adding minimal pair:', error);
  }
};

const removeMinimalPair = async (pairId: string) => {
  try {
    await api.glosses.removeMinimalPair(glossData.id || ''  , pairId);
    const index = glossData.minimalPairs.findIndex(p => p.id === pairId);
    if (index > -1) {
      glossData.minimalPairs.splice(index, 1);
    }
  } catch (error) {
    console.error('Error removing minimal pair:', error);
  }
};


</script>
