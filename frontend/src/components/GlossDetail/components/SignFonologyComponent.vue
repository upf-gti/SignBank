<template>
  <q-card-section
    :style="{
      maxHeight: '30dvh',
      overflow: 'auto',
    }"
  >
    <span class="text-bold">
      {{ translate('signFonology') }}
    </span>
    <q-item-label>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('hands') }}
            </q-item-label>
            <q-item-label>{{ videoData.hands }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('configuration') }}
            </q-item-label>
            <q-item-label>{{ videoData.configuration }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('configurationChanges') }}
            </q-item-label>
            <q-item-label>{{ videoData.configurationChanges }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('relationBetweenArticulators') }}
            </q-item-label>
            <q-item-label>{{ videoData.relationBetweenArticulators }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('location') }}
            </q-item-label>
            <q-item-label>{{ videoData.location }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('movementRelatedOrientation') }}
            </q-item-label>
            <q-item-label>{{ videoData.movementRelatedOrientation }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('locationRelatedOrientation') }}
            </q-item-label>
            <q-item-label>{{ videoData.locationRelatedOrientation }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('orientationChange') }}
            </q-item-label>
            <q-item-label>{{ videoData.orientationChange }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('contactType') }}
            </q-item-label>
            <q-item-label>{{ videoData.contactType }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('movementType') }}
            </q-item-label>
            <q-item-label>{{ videoData.movementType }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('vocalization') }}
            </q-item-label>
            <q-item-label>{{ videoData.vocalization }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('nonManualComponent') }}
            </q-item-label>
            <q-item-label>{{ videoData.nonManualComponent }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('inicialization') }}
            </q-item-label>
            <q-item-label>{{ videoData.inicialization }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-item-label>
  </q-card-section>
</template>
<script setup lang="ts">
import translate from 'src/utils/translate';
import { VideoData } from 'src/types/models';

const { videoData } = defineProps<{
  videoData: VideoData;
}>();
</script>
