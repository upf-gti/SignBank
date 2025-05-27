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
        @save-gloss="saveGloss"
      />
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GlossDetailComponent from 'src/components/GlossDetail/GlossDetailComponent.vue';
import { GlossData } from 'src/types/models';
import api from 'src/services/api'
import useUserStore from 'src/stores/user.store';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();

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
    glossRequest: null,
    isCreatedFromEdit: false,
});
const editMode = ref<'full' | 'none'>('full');

const saveGloss = (glossData: GlossData) => {
  api.requests.create(glossData).then((response) => {
    router.push(`/gloss/${response.data.id}`)
  }).catch((error) => {
    console.error('Error creating gloss request:', error)
  })
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.push('/')
  }
})

</script>