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
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.hands"
              :label="translate('hands')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.hands }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('configuration') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.configuration"
              :label="translate('configuration')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.configuration }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('configurationChanges') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.configurationChanges"
              :label="translate('configurationChanges')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.configurationChanges }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('relationBetweenArticulators') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.relationBetweenArticulators"
              :label="translate('relationBetweenArticulators')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.relationBetweenArticulators }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('location') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.location"
              :label="translate('location')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.location }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('movementRelatedOrientation') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.movementRelatedOrientation"
              :label="translate('movementRelatedOrientation')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.movementRelatedOrientation }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('locationRelatedOrientation') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.locationRelatedOrientation"
              :label="translate('locationRelatedOrientation')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.locationRelatedOrientation }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('orientationChange') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.orientationChange"
              :label="translate('orientationChange')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.orientationChange }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('contactType') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.contactType"
              :label="translate('contactType')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.contactType }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('movementType') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.movementType"
              :label="translate('movementType')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.movementType }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('vocalization') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.vocalization"
              :label="translate('vocalization')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.vocalization }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('nonManualComponent') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.nonManualComponent"
              :label="translate('nonManualComponent')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.nonManualComponent }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>
              {{ translate('inicialization') }}
            </q-item-label>
            <q-input
              v-if="editMode !== 'none'"
              v-model="videoData.inicialization"
              :label="translate('inicialization')"
              outlined
              dense
            />
            <q-item-label v-else>{{ videoData.inicialization }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-item-label>
  </q-card-section>
</template>

<script setup lang="ts">
import translate from 'src/utils/translate';
import { VideoData } from 'src/types/models';

const { videoData, editMode } = defineProps<{
  videoData: VideoData;
  editMode: "strict" | "full" | "none";
}>();
</script>
