<template>
  <q-page
    class="row content-start justify-evenly q-pa-md"
    padding
  >
    <div class="search-container">
      <h1 class="text-h4 text-center q-mb-lg">
        {{ translate('signLanguageDictionary') }}
      </h1>
      
      <div class="row justify-center">
        <q-btn
          :label="translate('startSearching')"
          color="primary"
          size="lg"
          class="q-px-xl"
          @click="$router.push('/search')"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import translate from 'src/utils/translate';
const router = useRouter();
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 400px;
  margin: 10rem;
}
</style>