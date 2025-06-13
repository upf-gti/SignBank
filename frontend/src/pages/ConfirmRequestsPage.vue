<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">
        {{ translate('pendingRequests') }}
      </div>
    </div>
  
    <div
      v-if="loading"
      class="row justify-center items-center"
      style="height: 200px;"
    >
      <q-spinner
        color="primary"
        size="3em"
      />
    </div>
  
    <div
      v-else-if="error"
      class="text-negative text-center"
    >
      {{ error }}
    </div>
  
    <div
      v-else
      class="row q-col-gutter-md"
    >
      <div
        v-for="request in requests"
        :key="request.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6">
                {{ request.requestedGlossData.gloss }}
              </div>
              <q-chip
                :color="getStatusColor(request.status)"
                text-color="white"
                dense
              >
                {{ translate(request.status) }}
              </q-chip>
            </div>
          </q-card-section>
  
          <q-card-section class="row justify-between items-center">
            <div class="column items-start">
              <div class="text-caption">
                {{ translate('requested') }}: {{ new Date(request.createdAt).toLocaleDateString() }}
              </div>
              <div class="text-caption">
                {{ translate('requestedBy') }}: {{ request.creator.name }} {{ request.creator.lastName }}
              </div>
            </div>
            
            <q-btn
              flat
              dense
              icon="rate_review"
              :label="translate('reviewRequest')"
              color="primary"
              @click="$router.push(`/confirm-requests/review/${request.id}`)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { api } from 'src/services/api';
  import translate from 'src/utils/translate';
  import type {GlossRequest, RequestStatus } from 'src/types/models';
  
  const $router = useRouter();
  
  const requests = ref<GlossRequest[]>();
  const loading = ref(true);
  const error = ref<string | null>(null);
  
  const showNewRequestDialog = ref(false);
  
  onMounted(async () => {
    await fetchRequests();
  });
  
  const fetchRequests = async () => {
    try {
      const response = await api.glossRequests.getPending();
      requests.value = response.data;
    } catch (err) {
      error.value = translate('errors.failedToLoadRequests');
      console.error(err);
    } finally {
      loading.value = false;
    }
  };
  
  const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case 'ACCEPTED':
        return 'positive';
      case 'DENIED':
        return 'negative';
      default:
        return 'warning';
    }
  };
  </script>