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
        v-if="searchResult.length > 0"
        class="my-sticky-header-table"
        :rows="searchResult"
        :columns="wordStructure"
        row-key="id"
        flat
        :style="'height: '+ pageHeight +'px'"
      >
        <template #body="props">
          <q-tr
            :props="props"
            @mouseenter="$event.target.querySelector('video').play()"
            @mouseleave="$event.target.querySelector('video').pause()"
          >
            <q-td
              key="videoUrl"
            >
              <video
                ref="videoRef"
                style="height: 150px; width: 150px; object-fit: cover"
                :src="props.row.videoUrl"
                loop
              />
            </q-td>
            <q-td
              key="word"
            >
              {{ props.row.word }}
            </q-td>
            <q-td
              key="description"
            >
              {{ props.row.description }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import axios from 'axios'
import type Word from 'src/types/word'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import wordStructure from 'src/utils/wordStructure'

const route = useRoute()
const searchResult = ref<Word[]>([])
const pageHeight = ref(0)

watch(() => route.query.search, (newSearch) => {
  if (newSearch) {
    search(newSearch as string)
  }
}, { immediate: true })

onMounted(() => {
    search(route.query.search as string)
})

function search(word: string) {
    axios.get(`/api/words/search?q=${word}`).then((response) => {
        searchResult.value = response.data
    }).catch((error) => {
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