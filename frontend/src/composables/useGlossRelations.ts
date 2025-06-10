import { ref } from 'vue';
import type { SearchResult } from 'src/types/gloss';
import { RelationType } from 'src/types/gloss';
import type { GlossData } from 'src/types/models';
import translate from 'src/utils/translate';
import { api } from 'src/services/api';
import { useQuasar } from 'quasar';

export function useGlossRelations(
  glossId: string,
  onGlossDataUpdate: (glossData: GlossData) => void
) {
  const $q = useQuasar();
  const selectedGloss = ref<SearchResult | null>(null);
  const selectedRelationType = ref<RelationType | ''>('');
  const distinction = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  const relationTypes = Object.values(RelationType).map(type => ({
    label: translate(type),
    value: type,
  }));

  const addRelation = async () => {
    if (!selectedGloss.value || !selectedRelationType.value) return false;
    
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.relations.create(glossId, {
        targetGlossId: selectedGloss.value.glossId,
        relationType: selectedRelationType.value
      });

      onGlossDataUpdate(response.data);

      // Show success notification
      $q.notify({
        type: 'positive',
        message: translate('relationCreatedSuccessfully'),
        icon: 'link',
        position: 'bottom'
      });

      // Reset state
      selectedGloss.value = null;
      selectedRelationType.value = '';
      return true;
    } catch (e: any) {
      let errorMessage = 'Failed to add relation';
      
      // Handle specific error cases
      if (e.response?.status === 409) {
        errorMessage = translate('relationAlreadyExists');
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }

      error.value = errorMessage;
      
      // Show error notification
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'bottom'
      });
      
      return false;
    } finally {
      loading.value = false;
    }
  };

  const addMinimalPair = async () => {
    if (!selectedGloss.value || !distinction.value) return false;

    try {
      loading.value = true;
      error.value = null;

      const response = await api.minimalPairs.create(glossId, {
        targetGlossId: selectedGloss.value.glossId,
        distinction: distinction.value
      });

      onGlossDataUpdate(response.data);

      // Show success notification
      $q.notify({
        type: 'positive',
        message: translate('minimalPairCreatedSuccessfully'),
        icon: 'compare',
        position: 'bottom'
      });

      // Reset state
      selectedGloss.value = null;
      distinction.value = '';
      return true;
    } catch (e: any) {
      let errorMessage = 'Failed to add minimal pair';
      
      // Handle specific error cases
      if (e.response?.status === 409) {
        errorMessage = translate('minimalPairAlreadyExists');
      } else if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }

      error.value = errorMessage;
      
      // Show error notification
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'bottom'
      });
      
      return false;
    } finally {
      loading.value = false;
    }
  };

  const removeRelation = async (relationId: string) => {
    if (!relationId) return;
    
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.relations.delete(relationId);
      onGlossDataUpdate(response.data);

      // Show success notification
      $q.notify({
        type: 'positive',
        message: translate('relationRemovedSuccessfully'),
        icon: 'link_off',
        position: 'bottom'
      });
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || 'Failed to remove relation';
      error.value = errorMessage;
      
      // Show error notification
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'top'
      });
    } finally {
      loading.value = false;
    }
  };

  const removeMinimalPair = async (pairId: string) => {
    if (!pairId) return;
    
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.minimalPairs.delete(pairId);
      onGlossDataUpdate(response.data);

      // Show success notification
      $q.notify({
        type: 'positive',
        message: translate('minimalPairRemovedSuccessfully'),
        icon: 'compare',
        position: 'top'
      });
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || 'Failed to remove minimal pair';
      error.value = errorMessage;
      
      // Show error notification
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'bottom'
      });
    } finally {
      loading.value = false;
    }
  };

  const updateRelation = async (relationId: string, relationType: RelationType) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.relations.update(relationId, { relationType });
      onGlossDataUpdate(response.data);

      // Show success notification
      $q.notify({
        type: 'positive',
        message: translate('relationUpdatedSuccessfully'),
        icon: 'edit',
        position: 'bottom'
      });
      
      return true;
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || 'Failed to update relation';
      error.value = errorMessage;
      
      // Show error notification
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
        position: 'bottom'
      });
      
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateMinimalPair = async (pairId: string, distinction: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await api.minimalPairs.update(pairId, { distinction });
      onGlossDataUpdate(response.data);

      // Show success notification
      $q.notify({
        type: 'positive',
        message: translate('minimalPairUpdatedSuccessfully'),
        icon: 'edit',
        position: 'bottom'
      });
      
      return true;
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message || 'Failed to update minimal pair';
      error.value = errorMessage;
      
      // Show error notification
      $q.notify({
        type: 'negative',
        message: errorMessage,
        icon: 'error',
          position: 'bottom'
      });
      
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    selectedGloss,
    selectedRelationType,
    distinction,
    loading,
    error,
    relationTypes,

    // Methods
    addRelation,
    addMinimalPair,
    removeRelation,
    removeMinimalPair,
    updateRelation,
    updateMinimalPair
  };
} 