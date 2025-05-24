<template>
   <q-page>
    <div
      class="column full-width justify-center items-center"
      style="height: fit-content"
    >
      <GlossDetailComponent
        v-if="glossData"
        class="col full-width"
        :gloss-data="glossData"
        v-model:edit-mode="editMode"
      />
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import GlossDetailComponent from 'src/components/GlossDetail/GlossDetailComponent.vue';
import { GlossData } from 'src/types/models';

const glossData = ref<GlossData | null>({
    id: '',
    gloss: '',
    createdAt: '',
    updatedAt: '',
    editComment: '',
    currentVersion: 0,
    isCreatedFromRequest: false,
    minimalPairs: [],
    relatedGlosses: [],
    senses: [],
    senseId: '',
    glossRequest: null,
    isCreatedFromEdit: false,
});
const editMode = ref<'full' | 'none'>('full');


</script>