import { ref, Ref } from 'vue';
import type { RelatedGloss, MinimalPair, SearchResult} from 'src/types/gloss';
import { RelationType } from 'src/types/gloss';
import translate from 'src/utils/translate'

export function useGlossRelations(
  initialRelatedGlosses: RelatedGloss[],
  initialMinimalPairs: MinimalPair[],
  onAddRelation: (gloss: RelatedGloss) => void,
  onRemoveRelation: (id: string) => void,
  onAddMinimalPair: (pair: MinimalPair) => void,
  onRemovePair: (id: string) => void
) {
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
      
      await onAddRelation({
        targetGlossId: selectedGloss.value.glossId,
        relationType: selectedRelationType.value,
        targetGloss: {
          gloss: selectedGloss.value.gloss
        }
      } as RelatedGloss);

      // Reset state
      selectedGloss.value = null;
      selectedRelationType.value = '';
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add relation';
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

      await onAddMinimalPair({
        targetGlossId: selectedGloss.value.glossId,
        distinction: distinction.value,
        targetGloss: {
          gloss: selectedGloss.value.gloss
        }
      } as MinimalPair);

      // Reset state
      selectedGloss.value = null;
      distinction.value = '';
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add minimal pair';
      return false;
    } finally {
      loading.value = false;
    }
  };

  const removeRelation = async (id: string) => {
    if (!id) return;
    
    try {
      loading.value = true;
      error.value = null;
      await onRemoveRelation(id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove relation';
    } finally {
      loading.value = false;
    }
  };

  const removeMinimalPair = async (id: string) => {
    if (!id) return;
    
    try {
      loading.value = true;
      error.value = null;
      await onRemovePair(id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to remove minimal pair';
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
    removeMinimalPair
  };
} 