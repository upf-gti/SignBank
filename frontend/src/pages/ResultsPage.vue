<template>
  <q-page
    :style-fn="
      (header: number, height: number) => {
        pageHeight = height-header
        return { height: `${height - header}px` };
      }
    "
    class="row items-center justify-evenly fit"
  >
    <q-card class="fit">
      <q-table
        v-if="searchResult.hits.length > 0"
        class="my-sticky-header-table"
        :rows="searchResult.hits"
        row-key="id"
        flat
        :style="'height: '+ pageHeight +'px'"
        :columns="wordStructure"
      >
        <template #body="scope: BodyScope">
          <q-tr
            class="cursor-pointer"
            :props="scope"
            @click="openWord(scope.row.word.id)"
            @mouseenter="$event.target.querySelector('video').play()"
            @mouseleave="$event.target.querySelector('video').pause()"
          >
            <q-td
              key="videoUrl"
            >
              <video
                ref="videoRef"
                style="height: 150px; width: 150px; object-fit: cover"
                :src="scope.row.word.description"
                loop
              />
            </q-td>
            <q-td
              key="word"
            >
              {{ scope.row.word.word }}
            </q-td>
            <q-td
              key="description"
            >
              {{ getMostImportantDescription(scope.row.word) }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">

import type {SearchHit, SearchResponse} from 'src/types/word'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from 'src/services/api'
import wordStructure from 'src/utils/wordStructure'
const route = useRoute()
const searchResult = ref<SearchResponse>({hits: [] as SearchHit[], found: 0, page: 1, total: 0} as SearchResponse)
const pageHeight = ref(0)
const router = useRouter()
import type { QTableSlots } from 'quasar';

interface BodyScope<T = SearchHit> extends Parameters<QTableSlots["body"]> {
  row: T;
}

watch(() => route.query.search, (newSearch) => {
  if (newSearch) {
    search(newSearch as string)
  }
}, { immediate: true })

onMounted(() => {
    search(route.query.search as string)
})

function search(word: string) {
  api.words.search(word).then((response) => {
      searchResult.value = response.data
  }).catch((error) => {
      console.log(error)
  })
}

function openWord(wordId: string) {
  router.push(`/word/${wordId}`).catch((error) => {
    console.log(error)
  })
}

function getMostImportantDescription(word: any): string {
  // If there are no senses, fall back to the general description
  if (!word.senses || word.senses.length === 0) {
    return word.description || '';
  }

  // Sort senses by priority if they exist (lower number = higher priority)
  const sortedSenses = [...word.senses].sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0));
  const primarySense = sortedSenses[0];
  
  // Check if the primary sense has descriptions
  if (primarySense && primarySense.descriptions && primarySense.descriptions.length > 0) {
    return primarySense.descriptions[0].text;
  }
  
  // Fall back to the general description if no sense descriptions are available
  return word.description || '';
}
</script>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: white

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>