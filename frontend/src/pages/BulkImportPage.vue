<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">{{ translate('bulkImport') }}</div>
    <p class="text-body1 text-grey-8 q-mb-lg">
      {{ translate('bulkImportDescription') }}
    </p>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <q-file
          v-model="files"
          multiple
          accept=".json,application/json"
          :label="translate('bulkImportSelectFiles')"
          outlined
          use-chips
          counter
          :max-files="MAX_FILES"
          :max-file-size="MAX_FILE_SIZE"
          :max-total-size="MAX_TOTAL_SIZE"
          :disable="loading"
          @rejected="onFilesRejected"
        >
          <template #prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
        <div class="text-caption text-grey-7 q-mt-xs">
          {{ translate('bulkImportLimitsHint') }}
        </div>

        <q-checkbox
          v-model="overwriteAll"
          class="q-mt-md"
          :disable="loading"
          :label="translate('bulkImportOverwrite')"
        />
        <div class="text-caption text-grey-7 q-ml-lg">
          {{ translate('bulkImportOverwriteHint') }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          color="primary"
          unelevated
          icon="upload"
          :label="translate('bulkImportStart')"
          :loading="loading"
          :disable="!files.length"
          @click="runImport"
        />
      </q-card-actions>
    </q-card>

    <div v-if="result" class="column q-gutter-md">
      <div class="row q-gutter-sm">
        <q-banner class="bg-positive text-white col">
          {{ translate('bulkImportCreated') }}: {{ result.created }}
        </q-banner>
        <q-banner class="bg-info text-white col">
          {{ translate('bulkImportUpdated') }}: {{ result.updated }}
        </q-banner>
        <q-banner class="bg-secondary col">
          {{ translate('bulkImportStubs') }}: {{ result.stubsCreated }}
        </q-banner>
        <q-banner class="bg-warning col">
          {{ translate('bulkImportSkipped') }}: {{ result.skipped }}
        </q-banner>
        <q-banner class="bg-grey-4 col">
          {{ translate('relatedGlosses') }}: {{ result.relationsCreated }}
        </q-banner>
      </div>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-sm">
            {{ translate('bulkImportErrors') }} ({{ result.errors.length }})
          </div>
          <q-table
            v-if="result.errors.length"
            :rows="errorRows"
            :columns="errorColumns"
            row-key="rowKey"
            flat
            :pagination="{ rowsPerPage: 10 }"
          />
          <div v-else class="text-grey-7">{{ translate('bulkImportNoErrors') }}</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-sm">
            {{ translate('bulkImportDuplicates') }} ({{ result.duplicates.length }})
          </div>
          <q-table
            v-if="result.duplicates.length"
            :rows="duplicateRows"
            :columns="duplicateColumns"
            row-key="rowKey"
            flat
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  color="primary"
                  unelevated
                  dense
                  size="sm"
                  :label="translate('bulkImportOverwriteOne')"
                  :loading="overwritingGloss === props.row.gloss"
                  :disable="loading || Boolean(overwritingGloss)"
                  @click="overwriteDuplicate(props.row)"
                />
              </q-td>
            </template>
          </q-table>
          <div v-else class="text-grey-7">{{ translate('bulkImportNoDuplicates') }}</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import translate from 'src/utils/translate';
import { api } from 'src/services/api';
import useUserStore from 'src/stores/user.store';

interface ImportIssue {
  gloss: string;
  fileName: string;
  field: string;
  value: string;
  message: string;
}

interface ImportDuplicate {
  gloss: string;
  fileName: string;
  existingGlossId: string;
  reason: string;
}

interface BulkImportResult {
  created: number;
  updated: number;
  stubsCreated: number;
  skipped: number;
  relationsCreated: number;
  errors: ImportIssue[];
  duplicates: ImportDuplicate[];
}

const router = useRouter();
const $q = useQuasar();
const userStore = useUserStore();

const MAX_FILES = 2000;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024;

const files = ref<File[]>([]);
const overwriteAll = ref(false);
const loading = ref(false);
const overwritingGloss = ref<string | null>(null);
const result = ref<BulkImportResult | null>(null);

const errorColumns = [
  { name: 'gloss', label: translate('gloss'), field: 'gloss', align: 'left' as const, sortable: true },
  { name: 'fileName', label: translate('bulkImportFile'), field: 'fileName', align: 'left' as const, sortable: true },
  { name: 'field', label: translate('bulkImportField'), field: 'field', align: 'left' as const, sortable: true },
  { name: 'value', label: translate('bulkImportValue'), field: 'value', align: 'left' as const },
  { name: 'message', label: translate('bulkImportMessage'), field: 'message', align: 'left' as const },
];

const duplicateColumns = [
  { name: 'gloss', label: translate('gloss'), field: 'gloss', align: 'left' as const, sortable: true },
  { name: 'fileName', label: translate('bulkImportFile'), field: 'fileName', align: 'left' as const, sortable: true },
  { name: 'reason', label: translate('bulkImportMessage'), field: 'reason', align: 'left' as const },
  { name: 'actions', label: translate('actions'), field: 'actions', align: 'right' as const },
];

const errorRows = computed(() =>
  (result.value?.errors || []).map((error, index) => ({
    ...error,
    rowKey: `${error.fileName}-${error.field}-${index}`,
  })),
);

const duplicateRows = computed(() =>
  (result.value?.duplicates || []).map((duplicate, index) => ({
    ...duplicate,
    rowKey: `${duplicate.fileName}-${duplicate.gloss}-${index}`,
  })),
);

onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/').catch((err) => console.error(err));
  }
});

const overwriteDuplicate = async (duplicate: ImportDuplicate) => {
  const selected = Array.isArray(files.value) ? files.value : files.value ? [files.value] : [];
  if (!selected.length || !result.value) return;

  overwritingGloss.value = duplicate.gloss;
  try {
    const response = await api.bulkImport.importFitxas(selected, false, [duplicate.gloss]);
    const single = response.data as BulkImportResult;
    result.value.duplicates = result.value.duplicates.filter(
      (row) => row.gloss !== duplicate.gloss,
    );
    result.value.updated += single.updated;
    result.value.stubsCreated += single.stubsCreated;
    result.value.relationsCreated += single.relationsCreated;
    result.value.skipped = Math.max(0, result.value.skipped - 1);
    result.value.errors.push(...single.errors);
    $q.notify({
      type: single.errors.length ? 'warning' : 'positive',
      message: translate('bulkImportOverwriteOneDone'),
    });
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: translate('bulkImportFailed'),
    });
  } finally {
    overwritingGloss.value = null;
  }
};

const onFilesRejected = () => {
  $q.notify({
    type: 'warning',
    message: translate('bulkImportLimitsHint'),
  });
};

const runImport = async () => {
    const selected = Array.isArray(files.value) ? files.value : files.value ? [files.value] : [];
    if (!selected.length) return;

    const totalSize = selected.reduce((sum, file) => sum + file.size, 0);
    if (
      selected.length > MAX_FILES ||
      selected.some((file) => file.size > MAX_FILE_SIZE) ||
      totalSize > MAX_TOTAL_SIZE
    ) {
      $q.notify({
        type: 'warning',
        message: translate('bulkImportLimitsHint'),
      });
      return;
    }

    loading.value = true;
    result.value = null;
    try {
    const response = await api.bulkImport.importFitxas(selected, overwriteAll.value);
    result.value = response.data;
    $q.notify({
      type: 'positive',
      message: translate('bulkImportFinished'),
    });
  } catch (error) {
    console.error(error);
    $q.notify({
      type: 'negative',
      message: translate('bulkImportFailed'),
    });
  } finally {
    loading.value = false;
  }
};
</script>
