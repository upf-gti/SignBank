<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md items-center justify-between">
      <div>
        <div class="text-h4">{{ translate('phonologyCatalog') }}</div>
        <p class="text-body2 text-grey-7 q-mb-none q-mt-sm">
          {{ translate('phonologyCatalogDescription') }}
        </p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        :label="translate('phonologyAddValue')"
        :disable="!selectedDimension"
        @click="openCreate"
      />
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-select
          v-model="selectedDimension"
          :options="dimensionOptions"
          emit-value
          map-options
          outlined
          dense
          :label="translate('phonologyDimension')"
        />
      </div>
      <div class="col-12 col-md-8">
        <q-input
          v-model="searchQuery"
          outlined
          dense
          clearable
          :label="translate('search')"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      :rows="filteredRows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
      :pagination="{ rowsPerPage: 20 }"
    >
      <template #body-cell-active="props">
        <q-td :props="props">
          <q-toggle
            :model-value="props.row.active"
            color="primary"
            @update:model-value="toggleActive(props.row, $event)"
          />
        </q-td>
      </template>
      <template #body-cell-aliases="props">
        <q-td :props="props">
          <span class="text-caption">{{ (props.row.aliases || []).join(', ') }}</span>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            round
            icon="edit"
            @click="openEdit(props.row)"
          />
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click="openDelete(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 480px; max-width: 640px">
        <q-card-section class="text-h6">
          {{ editing ? translate('phonologyEditValue') : translate('phonologyAddValue') }}
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-banner
            v-if="formError"
            class="bg-red-1 text-negative"
            rounded
          >
            {{ formError }}
          </q-banner>
          <q-input
            :model-value="form.code"
            outlined
            dense
            :label="translate('phonologyCode')"
            :hint="translate('phonologyCodeHint')"
            :error="!!codeError"
            :error-message="codeError"
            @update:model-value="onCodeInput"
          />
          <q-input
            v-model="form.labelCa"
            outlined
            dense
            :label="translate('phonologyLabelCa')"
            :error="!!labelError"
            :error-message="labelError"
          />
          <q-input
            v-model="form.labelEn"
            outlined
            dense
            :label="translate('phonologyLabelEn')"
          />
          <q-input
            v-model="form.labelEs"
            outlined
            dense
            :label="translate('phonologyLabelEs')"
          />
          <q-input
            v-model="form.descriptionCa"
            outlined
            dense
            type="textarea"
            autogrow
            :label="translate('phonologyDescription')"
          />
          <q-select
            v-model="form.aliases"
            outlined
            dense
            multiple
            use-chips
            use-input
            hide-dropdown-icon
            new-value-mode="add-unique"
            :label="translate('phonologyAliases')"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            :label="translate('cancel')"
            @click="showDialog = false"
          />
          <q-btn
            color="primary"
            :label="translate('save')"
            :loading="saving"
            @click="saveValue"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width: 420px; max-width: 560px">
        <q-card-section class="text-h6 text-negative">
          {{ translate('phonologyDeleteValue') }}
        </q-card-section>
        <q-card-section>
          <p class="q-mb-sm">
            {{ translate('phonologyDeleteConfirm', { code: deletingRow?.code ?? '' }) }}
          </p>
          <q-banner
            v-if="(deletingRow?.usageCount ?? 0) > 0"
            class="bg-orange-1 text-orange-10 q-mb-md"
            rounded
          >
            {{ translate('phonologyDeleteInUseWarning', {
              code: deletingRow?.code ?? '',
              count: deletingRow?.usageCount ?? 0,
            }) }}
          </q-banner>
          <q-input
            v-if="(deletingRow?.usageCount ?? 0) > 0"
            v-model="deleteConfirmText"
            outlined
            dense
            :label="translate('phonologyDeleteTypeCode')"
            :error="!!deleteError"
            :error-message="deleteError"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            :label="translate('cancel')"
            :disable="deleting"
            @click="closeDelete"
          />
          <q-btn
            color="negative"
            :label="translate('delete')"
            :loading="deleting"
            :disable="!canConfirmDelete"
            @click="deleteValue"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import translate from 'src/utils/translate';
import { api } from 'src/services/api';
import { apiErrorMessage, isConflictError } from 'src/utils/apiError';
import { usePhonologyCatalogStore } from 'src/stores/phonology-catalog.store';
import {
  PHONOLOGY_DIMENSIONS,
  type PhonologyDimension,
  type PhonologyValue,
} from 'src/types/phonology-catalog';

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9_]*$/;

function normalizeCode(code: string): string {
  return code.trim().replace(/[\s-]+/g, '_').toUpperCase();
}

const $q = useQuasar();
const catalog = usePhonologyCatalogStore();

const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const rows = ref<PhonologyValue[]>([]);
const selectedDimension = ref<PhonologyDimension>('HAND_CONFIGURATION');
const searchQuery = ref('');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const editing = ref<PhonologyValue | null>(null);
const deletingRow = ref<PhonologyValue | null>(null);
const formError = ref('');
const codeError = ref('');
const labelError = ref('');
const deleteError = ref('');
const deleteConfirmText = ref('');
const form = ref({
  code: '',
  labelCa: '',
  labelEn: '',
  labelEs: '',
  descriptionCa: '',
  aliases: [] as string[],
});

const dimensionOptions = PHONOLOGY_DIMENSIONS.map((dimension) => ({
  label: translate(`phonologyDim_${dimension}`),
  value: dimension,
}));

const columns = [
  { name: 'code', label: translate('phonologyCode'), field: 'code', align: 'left' as const, sortable: true },
  { name: 'labelCa', label: translate('phonologyLabelCa'), field: 'labelCa', align: 'left' as const, sortable: true },
  { name: 'aliases', label: translate('phonologyAliases'), field: 'aliases', align: 'left' as const },
  { name: 'usageCount', label: translate('phonologyUsage'), field: 'usageCount', align: 'right' as const, sortable: true },
  { name: 'active', label: translate('phonologyActive'), field: 'active', align: 'center' as const },
  { name: 'actions', label: translate('actions'), field: 'actions', align: 'right' as const },
];

const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return rows.value;
  return rows.value.filter((row) =>
    row.code.toLowerCase().includes(query)
    || row.labelCa.toLowerCase().includes(query)
    || (row.labelEn || '').toLowerCase().includes(query)
    || (row.aliases || []).some((alias) => alias.toLowerCase().includes(query)),
  );
});

async function loadRows() {
  loading.value = true;
  try {
    const response = await api.phonologyValues.list({
      dimension: selectedDimension.value,
      includeInactive: true,
      withUsage: true,
    });
    rows.value = response.data;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: apiErrorMessage(error, translate('errorLoadingPhonologyCatalog')),
    });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.value = {
    code: '',
    labelCa: '',
    labelEn: '',
    labelEs: '',
    descriptionCa: '',
    aliases: [],
  };
  formError.value = '';
  codeError.value = '';
  labelError.value = '';
}

function onCodeInput(value: string | number | null) {
  form.value.code = String(value ?? '').toUpperCase();
  codeError.value = '';
  formError.value = '';
}

function openCreate() {
  editing.value = null;
  resetForm();
  showDialog.value = true;
}

function openEdit(row: PhonologyValue) {
  editing.value = row;
  form.value = {
    code: row.code,
    labelCa: row.labelCa,
    labelEn: row.labelEn || '',
    labelEs: row.labelEs || '',
    descriptionCa: row.descriptionCa || '',
    aliases: [...(row.aliases || [])],
  };
  formError.value = '';
  codeError.value = '';
  labelError.value = '';
  showDialog.value = true;
}

function validateForm(): boolean {
  codeError.value = '';
  labelError.value = '';
  formError.value = '';

  const code = normalizeCode(form.value.code);
  form.value.code = code;
  if (!code) {
    codeError.value = translate('phonologyCodeRequired');
  } else if (!CODE_PATTERN.test(code)) {
    codeError.value = translate('phonologyCodeInvalid');
  } else {
    const duplicate = rows.value.some(
      (row) => row.code === code && row.id !== editing.value?.id,
    );
    if (duplicate) {
      codeError.value = translate('phonologyCodeExists');
    }
  }

  if (!form.value.labelCa.trim()) {
    labelError.value = translate('phonologyLabelRequired');
  }

  return !codeError.value && !labelError.value;
}

async function saveValue() {
  if (!validateForm()) return;

  saving.value = true;
  try {
    if (editing.value) {
      await api.phonologyValues.update(editing.value.id, {
        code: form.value.code,
        labelCa: form.value.labelCa,
        labelEn: form.value.labelEn,
        labelEs: form.value.labelEs,
        descriptionCa: form.value.descriptionCa,
        aliases: form.value.aliases,
      });
      $q.notify({ type: 'positive', message: translate('phonologyValueUpdated') });
    } else {
      await api.phonologyValues.create({
        dimension: selectedDimension.value,
        code: form.value.code,
        labelCa: form.value.labelCa,
        labelEn: form.value.labelEn,
        labelEs: form.value.labelEs,
        descriptionCa: form.value.descriptionCa,
        aliases: form.value.aliases,
      });
      $q.notify({ type: 'positive', message: translate('phonologyValueCreated') });
    }
    showDialog.value = false;
    await catalog.load(true);
    await loadRows();
  } catch (error) {
    formError.value = isConflictError(error)
      ? translate('phonologyCodeExists')
      : apiErrorMessage(error, translate('errorSavingPhonologyValue'));
  } finally {
    saving.value = false;
  }
}

async function toggleActive(row: PhonologyValue, active: boolean) {
  try {
    await api.phonologyValues.update(row.id, { active });
    await catalog.load(true);
    await loadRows();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: apiErrorMessage(error, translate('errorSavingPhonologyValue')),
    });
  }
}

const canConfirmDelete = computed(() => {
  const row = deletingRow.value;
  if (!row || deleting.value) return false;
  if ((row.usageCount ?? 0) === 0) return true;
  return normalizeCode(deleteConfirmText.value) === row.code;
});

function openDelete(row: PhonologyValue) {
  deletingRow.value = row;
  deleteConfirmText.value = '';
  deleteError.value = '';
  showDeleteDialog.value = true;
}

function closeDelete() {
  showDeleteDialog.value = false;
  deletingRow.value = null;
  deleteConfirmText.value = '';
  deleteError.value = '';
}

async function deleteValue() {
  const row = deletingRow.value;
  if (!row || !canConfirmDelete.value) {
    deleteError.value = translate('phonologyCodeMismatch');
    return;
  }

  deleting.value = true;
  deleteError.value = '';
  try {
    await api.phonologyValues.remove(
      row.id,
      (row.usageCount ?? 0) > 0 ? { confirmCode: row.code } : undefined,
    );
    $q.notify({ type: 'positive', message: translate('phonologyValueDeleted') });
    closeDelete();
    await catalog.load(true);
    await loadRows();
  } catch (error) {
    deleteError.value = apiErrorMessage(error, translate('phonologyDeleteFailed'));
  } finally {
    deleting.value = false;
  }
}

watch(selectedDimension, () => {
  void loadRows();
});

onMounted(() => {
  void loadRows();
});
</script>
