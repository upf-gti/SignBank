<template>
  <q-page
    class="row content-start justify-evenly q-pa-md"
    padding
  >
    <div class="search-container">
      <h1 class="text-h4 text-center q-mb-lg">
        Sign Language Dictionary
      </h1>
      
      <q-form
        class="q-gutter-y-md"
        @submit="onSubmit"
      >
        <q-input
          v-model="search"
          label="Enter a word"
          filled
          clearable
          :rules="[val => !!val || 'Please enter a word']"
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        
        <div class="row justify-center">
          <q-btn
            label="Search"
            color="primary"
            type="submit"
            class="q-px-xl"
          />
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const search = ref('');

const onSubmit = async () => {
  if (search.value.trim()) {
    await router.push({
      path: '/results',
      query: { search: search.value.trim() }
    });
  }
};
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 400px;
  margin: 10rem;
}

.search-input {
  width: 100%;
}
</style>