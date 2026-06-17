<template>
  <q-page class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h5">
        {{ translate('myGlossRequests') }}
      </div>
      <q-btn
        color="primary"
        unelevated
        :label="translate('newRequest')"
        icon="add"
        @click="$router.push('/my-requests/create')"
      />
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

    <div v-else>
      <q-tabs
        v-model="activeTab"
        class="text-primary q-mb-md"
        align="left"
        narrow-indicator
        outside-arrows
        mobile-arrows
      >
        <q-tab
          name="not_sent"
          icon="edit"
          :label="translate('notSent') + ' (' + filteredRequests.not_sent.length + ')'"
        />
        <q-tab
          name="pending"
          icon="pending"
          :label="translate('pending') + ' (' + filteredRequests.pending.length + ')'"
        />
        <q-tab
          name="accepted"
          icon="check_circle"
          :label="translate('accepted') + ' (' + filteredRequests.accepted.length + ')'"
        />
        <q-tab
          name="denied"
          icon="cancel"
          :label="translate('denied') + ' (' + filteredRequests.denied.length + ')'"
        />
      </q-tabs>

      <q-tab-panels
        v-model="activeTab"
        animated
      >
        <q-tab-panel
          v-for="(statusRequests, status) in filteredRequests"
          :key="status"
          :name="status.toLowerCase()"
          class="q-pa-none q-pt-md"
        >
          <EmptyState
            v-if="statusRequests.length === 0"
            :icon="getEmptyIcon(status)"
            :title="translate('noRequestsInTab')"
            :action-label="status === 'not_sent' ? translate('createFirstRequest') : undefined"
            :action-icon="status === 'not_sent' ? 'add' : undefined"
            @action="goToCreateRequest(status)"
          />

          <div
            v-else
            class="row q-col-gutter-md"
          >
            <div
              v-for="request in statusRequests"
              :key="request.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                bordered
                flat
                :class="'request-card sb-card-interactive ' + status.toLowerCase()"
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
                  <div class="text-caption text-grey-7 q-mb-xs">
                    {{ translate('requested') }}: {{ formatDate(request.createdAt) }}
                  </div>
                  <div
                    v-if="request.status === 'ACCEPTED'"
                    class="text-caption text-grey-7 q-mb-xs"
                  >
                    {{ translate('acceptedBy') }}: {{ request.acceptedBy?.name }} {{ request.acceptedBy?.lastName }}
                  </div>
                  <div
                    v-if="request.status === 'DENIED'"
                    class="text-caption text-grey-7 q-mb-xs"
                  >
                    {{ translate('deniedBy') }}: {{ request.deniedBy?.name }} {{ request.deniedBy?.lastName }}
                  </div>
                  <div
                    v-if="request.status === 'DENIED' && request.denyReason"
                    class="text-caption text-negative"
                  >
                    {{ translate('reason') }}: {{ request.denyReason }}
                  </div>
                </q-card-section>

                <q-separator />

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
                    color="primary"
                    @click="request.status === 'NOT_COMPLETED' ? $router.push(`/my-requests/edit/${request.id}`) : $router.push(`/my-requests/view/${request.id}`)"
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
import { GlossRequest, RequestStatus } from 'src/types/models';
import EmptyState from 'src/components/Shared/EmptyState.vue';

const $router = useRouter();
const requests = ref<GlossRequest[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref('not_sent');

onMounted(async () => {
  await fetchRequests();
});

const fetchRequests = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await api.glossRequests.getMine();
    requests.value = response.data;
  } catch (err) {
    error.value = translate('errors.failedToLoadRequests');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const retry = () => fetchRequests();

const filteredRequests = computed(() => {
  return {
    not_sent: requests.value?.filter(r => r.status === RequestStatus.NOT_COMPLETED) || [],
    pending: requests.value?.filter(r => r.status === RequestStatus.WAITING_FOR_APPROVAL) || [],
    accepted: requests.value?.filter(r => r.status === RequestStatus.ACCEPTED) || [],
    denied: requests.value?.filter(r => r.status === RequestStatus.DENIED) || []
  };
});

const getStatusColor = (status: RequestStatus): string => {
  switch (status) {
    case RequestStatus.ACCEPTED:
      return 'positive';
    case RequestStatus.DENIED:
      return 'negative';
    case RequestStatus.NOT_COMPLETED:
      return 'grey';
    default:
      return 'warning';
  }
};

const getEmptyIcon = (status: string): string => {
  switch (status) {
    case 'not_sent': return 'edit_note';
    case 'pending': return 'hourglass_empty';
    case 'accepted': return 'check_circle_outline';
    case 'denied': return 'block';
    default: return 'inbox';
  }
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();

const goToCreateRequest = (status: string) => {
  if (status === 'not_sent') {
    $router.push('/my-requests/create');
  }
};
</script>

<style lang="scss" scoped>
.request-card {
  border-left: 4px solid transparent;
  border-radius: var(--sb-card-radius);

  &.not_sent {
    border-left-color: var(--q-grey);
  }

  &.pending {
    border-left-color: var(--q-warning);
  }

  &.accepted {
    border-left-color: var(--q-positive);
  }

  &.denied {
    border-left-color: var(--q-negative);
  }
}
</style>
