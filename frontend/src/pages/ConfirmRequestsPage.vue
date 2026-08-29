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
      style="min-height: 200px;"
    >
      <q-spinner
        color="primary"
        size="3em"
      />
    </div>

    <div
      v-else-if="error"
      class="column items-center q-pa-lg"
    >
      <q-icon
        name="error_outline"
        size="48px"
        color="negative"
        class="q-mb-md"
      />
      <p class="text-negative text-center q-mb-md">
        {{ error }}
      </p>
      <q-btn
        color="primary"
        outline
        icon="refresh"
        :label="translate('retry')"
        @click="retry"
      />
    </div>

    <EmptyState
      v-else-if="!requests?.length"
      icon="inbox"
      :title="translate('noPendingRequests')"
    />

    <div
      v-else
      class="row q-col-gutter-md"
    >
      <div
        v-for="request in requests"
        :key="request.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card
          bordered
          flat
          class="request-card sb-card-interactive"
        >
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div class="text-h6 text-truncate q-mr-sm">
                {{ request.requestedGlossData.gloss }}
              </div>
              <q-chip
                :color="getStatusColor(request.status)"
                text-color="white"
                dense
                size="sm"
              >
                {{ translate(request.status) }}
              </q-chip>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-caption text-grey-7">
              {{ translate('requested') }}: {{ formatDate(request.createdAt) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ translate('requestedBy') }}: {{ request.creator.name }} {{ request.creator.lastName }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              unelevated
              dense
              icon="rate_review"
              :label="translate('reviewRequest')"
              color="primary"
              @click="$router.push(`/confirm-requests/review/${request.id}`)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from 'src/services/api';
import translate from 'src/utils/translate';
import type { GlossRequest } from 'src/types/models';
import { RequestStatus } from 'src/types/models';
import EmptyState from 'src/components/Shared/EmptyState.vue';

const requests = ref<GlossRequest[]>();
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  await fetchRequests();
});

const fetchRequests = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await api.glossRequests.getPending();
    requests.value = response.data;
  } catch (err) {
    error.value = translate('errors.failedToLoadRequests');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const retry = () => fetchRequests();

const getStatusColor = (status: RequestStatus): string => {
  switch (status) {
    case RequestStatus.ACCEPTED:
      return 'positive';
    case RequestStatus.DENIED:
      return 'negative';
    default:
      return 'warning';
  }
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();
</script>

<style scoped>
.request-card {
  border-radius: var(--sb-card-radius);
  border-left: 4px solid var(--q-warning);
}
</style>
