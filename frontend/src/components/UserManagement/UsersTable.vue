<template>
  <q-card flat class="col column no-wrap">
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-h6">{{ translate('allUsers') }}</div>
        <q-input
          v-model="searchQueryModel"
          :placeholder="translate('searchUsers')"
          dense
          outlined
          clearable
          class="search-input"
          style="width: 300px;"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </q-card-section>

    <q-card-section class="col overflow-auto">
      <q-table
        flat
        :rows="filteredUsers"
        :columns="columns"
        :loading="loading"
        row-key="id"
        class="my-sticky-header-table"
        hide-bottom
        virtual-scroll
        :pagination="{ rowsPerPage: 0 }"
      >
        <!-- Role Column -->
        <template #body-cell-role="props">
          <q-td :props="props">
            <q-select
              v-model="props.row.role"
              :options="roleOptions"
              dense
              outlined
              :disable="isLastAdmin(props.row)"
              @update:model-value="(newRole) => {
                const roleValue = typeof newRole === 'object' ? newRole.value : newRole;
                updateUserRole(props.row.id, roleValue);
              }"
            >
              <q-tooltip v-if="isLastAdmin(props.row)">
                {{ translate('cannotDemoteLastAdmin') }}
              </q-tooltip>
            </q-select>
          </q-td>
        </template>

        <!-- Actions Column -->
        <template #body-cell-actions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs justify-center">
              <q-btn
                :icon="'lock'"
                color="primary"
                size="sm"
                flat
                @click="$emit('changePassword', props.row)"
              >
                <q-tooltip>{{ translate('changePassword') }}</q-tooltip>
              </q-btn>
              <q-btn
                :icon="'delete'"
                color="negative"
                size="sm"
                flat
                :disable="isLastAdmin(props.row) || currentUser?.id === props.row.id"
                @click="$emit('deleteUser', props.row)"
              >
                <q-tooltip v-if="!isLastAdmin(props.row) && currentUser?.id !== props.row.id">
                  {{ translate('deleteUser') }}
                </q-tooltip>
                <q-tooltip v-else-if="isLastAdmin(props.row)">
                  {{ translate('cannotDeleteLastAdmin') }}
                </q-tooltip>
                <q-tooltip v-else>
                  {{ translate('deleteUser') }}
                </q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { User } from 'src/types/models';
import { Role } from 'src/types/models';
import translate from 'src/utils/translate';
import { getUserTableColumns } from 'src/utils/UserManagement/tableColumns';

interface Props {
  users: User[];
  loading: boolean;
  searchQuery: string;
  roleOptions: { label: string; value: Role }[];
  currentUser: { id: string; role: Role } | null;
}

interface Emits {
  (e: 'update:searchQuery', value: string): void;
  (e: 'changePassword', user: User): void;
  (e: 'deleteUser', user: User): void;
  (e: 'updateUserRole', userId: string, newRole: Role): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const columns = getUserTableColumns();

const searchQueryModel = computed({
  get: () => props.searchQuery,
  set: (value) => emit('update:searchQuery', value)
});

const filteredUsers = computed(() => {
  if (!props.searchQuery) return props.users;
  
  const query = props.searchQuery.toLowerCase();
  return props.users.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
});

function isLastAdmin(user: User): boolean {
  if (user.role !== Role.ADMIN) return false;
  const adminUsers = props.users.filter(u => u.role === Role.ADMIN);
  return adminUsers.length <= 1;
}

function updateUserRole(userId: string, newRole: Role) {
  emit('updateUserRole', userId, newRole);
}
</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 100%

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: white

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style> 