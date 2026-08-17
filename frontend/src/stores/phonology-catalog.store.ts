import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'src/services/api';
import { i18n } from 'boot/i18n';
import type { PhonologyDimension, PhonologySelectOption, PhonologyValue } from 'src/types/phonology-catalog';

function currentLocale(): string {
  const locale = i18n.global.locale;
  return typeof locale === 'string' ? locale : locale.value;
}

function pickLocalized(
  value: PhonologyValue,
  kind: 'label' | 'description',
): string {
  const locale = currentLocale();
  if (kind === 'label') {
    if (locale.startsWith('en')) return value.labelEn || value.labelCa;
    if (locale.startsWith('es')) return value.labelEs || value.labelCa;
    return value.labelCa;
  }
  if (locale.startsWith('en')) return value.descriptionEn || value.descriptionCa || '';
  if (locale.startsWith('es')) return value.descriptionEs || value.descriptionCa || '';
  return value.descriptionCa || '';
}

export const usePhonologyCatalogStore = defineStore('phonologyCatalog', () => {
  const values = ref<PhonologyValue[]>([]);
  const loaded = ref(false);
  const loading = ref(false);

  async function load(force = false) {
    if (loading.value) return;
    if (loaded.value && !force) return;
    loading.value = true;
    try {
      const response = await api.phonologyValues.list({ includeInactive: true });
      values.value = response.data;
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function ensureLoaded() {
    if (!loaded.value) await load();
  }

  function optionsFor(dimension: PhonologyDimension, includeInactive = false): PhonologySelectOption[] {
    return values.value
      .filter((value) => value.dimension === dimension && (includeInactive || value.active))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
      .map((value) => {
        const description = pickLocalized(value, 'description');
        return {
          value: value.code,
          label: pickLocalized(value, 'label'),
          ...(description ? { description } : {}),
        };
      });
  }

  function labelFor(dimension: PhonologyDimension, code: string | null | undefined): string {
    if (!code) return '';
    const match = values.value.find((value) => value.dimension === dimension && value.code === code);
    return match ? pickLocalized(match, 'label') : code;
  }

  return {
    values,
    loaded,
    loading,
    load,
    ensureLoaded,
    optionsFor,
    labelFor,
  };
});
