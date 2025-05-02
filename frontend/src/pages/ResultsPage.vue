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
        :pagination="{
          sortBy: 'desc',
          descending: false,
          page: 1,
          rowsPerPage: 50
        // rowsNumber: xx if getting data from a server
        }"
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
                v-if="scope.row.word.videoUrls && scope.row.word.videoUrls.length > 0"
                ref="videoRef"
                style="height: 200px; width: 200px; object-fit: cover"
                :src="scope.row.word.videoUrls[0] || ''"
                loop
              />
              <div
                v-else
                style="height: 150px; width: 150px;"
                class="flex items-center justify-center bg-grey-3"
              >
                No video
              </div>
            </q-td>
            <q-td
              key="word"
            >
              {{ scope.row.word.word }}
            </q-td>
            <q-td
              key="description"
            >
              {{ scope.row.word.description }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from 'src/services/api'
import wordStructure from 'src/utils/wordStructure'
const route = useRoute()
const searchResult = ref<WordSearchResponse>({hits: [] as Hit[], found: 0, page: 1} as WordSearchResponse)
const pageHeight = ref(0)
const router = useRouter()
import type { QTableSlots } from 'quasar';
import type { Hit, WordSearchResponse } from 'src/types/databaseSearch'

interface BodyScope<T = Hit> extends Parameters<QTableSlots["body"]> {
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