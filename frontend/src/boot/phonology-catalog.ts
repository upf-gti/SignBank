import { boot } from 'quasar/wrappers';
import { usePhonologyCatalogStore } from 'src/stores/phonology-catalog.store';

export default boot(async () => {
  const catalog = usePhonologyCatalogStore();
  try {
    await catalog.ensureLoaded();
  } catch (error) {
    console.error('Failed to load phonology catalog', error);
  }
});
