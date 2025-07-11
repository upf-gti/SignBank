<template>
  <q-page class="q-pa-md column no-wrap" 
    :style-fn="(header: number, height: number) => {
      pageHeight = height-header
      return { height: `${height - header}px` };
    }">
    <div class="row q-mb-md items-center justify-between">
      <div class="text-h4">{{ translate('userManagement') }}</div>
      <q-btn
        :label="translate('createUser')"
        color="primary"
        icon="add"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Users Table -->
    <q-card flat class="col column no-wrap" >
      <q-card-section>
        <div class="text-h6">{{ translate('allUsers') }}</div>
      </q-card-section>
      
      <q-card-section class="col overflow-auto">
        <q-table
          flat
          :rows="users"
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
              <q-btn
                :icon="'delete'"
                color="negative"
                size="sm"
                flat
                :disable="isLastAdmin(props.row) || currentUser?.id === props.row.id"
                @click="confirmDeleteUser(props.row)"
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
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Create User Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ translate('createUser') }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="createUser" class="q-gutter-md">
            <q-input
              v-model="newUser.username"
              :label="translate('username')"
              outlined
              :rules="[val => !!val || translate('usernameRequired')]"
            />

            <q-input
              v-model="newUser.email"
              :label="translate('email')"
              type="email"
              outlined
              :rules="[val => !!val || translate('emailRequired')]"
            />

            <q-input
              v-model="newUser.name"
              :label="translate('name')"
              outlined
              :rules="[val => !!val || translate('nameRequired')]"
            />

            <q-input
              v-model="newUser.lastName"
              :label="translate('lastName')"
              outlined
              :rules="[val => !!val || translate('lastNameRequired')]"
            />

            <q-input
              v-model="newUser.password"
              :label="translate('password')"
              type="password"
              outlined
              :rules="[val => !!val || translate('passwordRequired')]"
            />

            <q-select
              v-model="newUser.role"
              :label="translate('role')"
              :options="roleOptions"
              outlined
              :rules="[val => !!val || translate('roleRequired')]"
            />

            <div class="row q-gutter-sm justify-end">
              <q-btn
                :label="translate('cancel')"
                color="grey"
                flat
                @click="showCreateDialog = false"
              />
              <q-btn
                :label="translate('create')"
                type="submit"
                color="primary"
                :loading="creating"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ translate('confirmDelete') }}</div>
        </q-card-section>

        <q-card-section>
          {{ translate('deleteUserConfirm', { username: userToDelete?.username }) }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            :label="translate('cancel')"
            color="grey"
            flat
            @click="showDeleteDialog = false"
          />
          <q-btn
            :label="translate('delete')"
            color="negative"
            @click="deleteUser"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/services/api';
import useUserStore from 'src/stores/user.store';
import type { User } from 'src/types/models';
import { Role } from 'src/types/models';
import translate from 'src/utils/translate';

const $q = useQuasar();
const userStore = useUserStore();
const pageHeight = ref(0);
// Reactive data
const users = ref<User[]>([]);
const loading = ref(false);
const creating = ref(false);
const deleting = ref(false);
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const userToDelete = ref<User | null>(null);

// New user form
const newUser = ref({
  username: '',
  email: '',
  name: '',
  lastName: '',
  password: '',
  role: Role.USER as Role
});

// Computed properties
const currentUser = computed(() => ({
  id: '', // We'll need to get this from the store or API
  role: userStore.role
}));
const roleOptions = [
  { label: translate('admin'), value: Role.ADMIN },
  { label: translate('user'), value: Role.USER }
];

// Table columns
const columns = [
  {
    name: 'username',
    label: translate('username'),
    field: 'username',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'email',
    label: translate('email'),
    field: 'email',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'name',
    label: translate('name'),
    field: 'name',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'lastName',
    label: translate('lastName'),
    field: 'lastName',
    align: 'left' as const,
    sortable: true
  },
  {
    name: 'role',
    label: translate('role'),
    field: 'role',
    align: 'left' as const,
    sortable: true,
    format: (val: Role) => translate(val.toLowerCase())
  },
  {
    name: 'createdAt',
    label: translate('createdAt'),
    field: 'createdAt',
    align: 'left' as const,
    sortable: true,
    format: (val: string) => new Date(val).toLocaleDateString()
  },
  {
    name: 'actions',
    label: translate('actions'),
    field: 'actions',
    align: 'center' as const,
    sortable: false
  }
];

// Methods
async function loadUsers() {
  try {
    loading.value = true;
    const response = await api.users.getAll();
    users.value = response.data;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : translate('errorLoadingUsers')
    });
  } finally {
    loading.value = false;
  }
}

async function updateUserRole(userId: string, newRole: Role) {
  try {
    await api.users.updateRole(userId, newRole);
    $q.notify({
      type: 'positive',
      message: translate('userRoleUpdated')
    });
    await loadUsers(); // Reload to get updated data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : translate('errorUpdatingRole')
    });
    await loadUsers(); // Reload to revert changes
  }
}

async function createUser() {
  try {
    creating.value = true;
    await api.auth.register(newUser.value);
    $q.notify({
      type: 'positive',
      message: translate('userCreated')
    });
    showCreateDialog.value = false;
    resetNewUserForm();
    await loadUsers();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : translate('errorCreatingUser')
    });
  } finally {
    creating.value = false;
  }
}

function confirmDeleteUser(user: User) {
  userToDelete.value = user;
  showDeleteDialog.value = true;
}

async function deleteUser() {
  if (!userToDelete.value) return;

  try {
    deleting.value = true;
    await api.users.delete(userToDelete.value.id);
    $q.notify({
      type: 'positive',
      message: translate('userDeleted')
    });
    showDeleteDialog.value = false;
    userToDelete.value = null;
    await loadUsers();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : translate('errorDeletingUser')
    });
  } finally {
    deleting.value = false;
  }
}

function resetNewUserForm() {
  newUser.value = {
    username: '',
    email: '',
    name: '',
    lastName: '',
    password: '',
    role: Role.USER
  };
}

function isLastAdmin(user: User): boolean {
  if (user.role !== Role.ADMIN) return false;
  const adminUsers = users.value.filter(u => u.role === Role.ADMIN);
  return adminUsers.length <= 1;
}

// Lifecycle
onMounted(() => {
  loadUsers();
});
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