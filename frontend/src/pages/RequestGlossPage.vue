<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">
        {{ translate('myGlossRequests') }}
      </div>
      <q-btn
        color="primary"
        :label="translate('newRequest')"
        icon="add"
        @click="$router.push('/requests/create')"
      />
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

    <div v-else>
      <q-tabs
        v-model="activeTab"
        class="text-primary q-mb-md"
        align="justify"
      >
        <q-tab name="pending" icon="pending" :label="' ' + translate('pending') + ' (' + filteredRequests.pending.length + ')'"/>
        <q-tab name="accepted" icon="check_circle" :label="' ' + translate('accepted') + ' (' + filteredRequests.accepted.length + ')'"/>
        <q-tab name="denied" icon="cancel" :label="' ' + translate('denied') + ' (' + filteredRequests.denied.length + ')'"/>
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel 
          v-for="(statusRequests, status) in filteredRequests"
          :key="status"
          :name="status.toLowerCase()"
        >
          <div class="row q-col-gutter-md">
            <div
              v-for="request in statusRequests"
              :key="request.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card :class="'request-card ' + status.toLowerCase()">
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

                <q-card-section>
                  <div class="text-caption q-mb-sm">
                    {{ translate('requested') }}: {{ new Date(request.createdAt).toLocaleDateString() }}
                  </div>
                  <div v-if="request.status === 'DENIED' && request.denyReason" class="text-caption text-negative q-mb-sm">
                    {{ translate('reason') }}: {{ request.denyReason }}
                  </div>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn
                    v-if="request.glossId"
                    flat
                    dense
                    icon="visibility"
                    :label="translate('viewGloss')"
                    color="primary"
                    @click="$router.push(`/gloss/${request.glossId}`)"
                  />
                  <q-btn
                    flat
                    dense
                    icon="info"
                    :label="translate('details')"
                    @click="$router.push(`/requests/view/${request.id}`)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/services/api';
import translate from 'src/utils/translate';
import type { GlossRequest, RequestStatus } from 'src/types/models';

const $router = useRouter();

const requests = ref<GlossRequest[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref('pending');

onMounted(async () => {
  await fetchRequests();
});

const fetchRequests = async () => {
  try {
    const response = await api.requests.getAll();
    requests.value = response.data;
  } catch (err) {
    error.value = translate('errors.failedToLoadRequests');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const filteredRequests = computed(() => {
  return {
    pending: requests.value?.filter(r => r.status === 'PENDING') || [],
    accepted: requests.value?.filter(r => r.status === 'ACCEPTED') || [],
    denied: requests.value?.filter(r => r.status === 'DENIED') || []
  };
});

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

<style lang="scss" scoped>
.request-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;

  &.pending {
    border-left-color: var(--q-warning);
  }

  &.accepted {
    border-left-color: var(--q-positive);
  }

  &.denied {
    border-left-color: var(--q-negative);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>