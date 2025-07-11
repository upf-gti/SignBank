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
    <UsersTable
      :users="users"
      :loading="loading"
      :search-query="searchQuery"
      :role-options="roleOptions"
      :current-user="currentUser"
      @update:search-query="searchQuery = $event"
      @change-password="openChangePasswordDialog"
      @delete-user="confirmDeleteUser"
      @update-user-role="updateUserRole"
    />

    <!-- Create User Dialog -->
    <CreateUserDialog
      :show="showCreateDialog"
      :loading="creating"
      :role-options="roleOptions"
      @close="showCreateDialog = false"
      @submit="handleCreateUser"
    />

    <!-- Delete Confirmation Dialog -->
    <DeleteUserDialog
      :show="showDeleteDialog"
      :loading="deleting"
      :user="userToDelete"
      @close="showDeleteDialog = false"
      @confirm="handleDeleteUser"
    />

    <!-- Change Password Dialog -->
    <ChangePasswordDialog
      :show="showChangePasswordDialog"
      :loading="changingPassword"
      :user="userToChangePassword"
      @close="showChangePasswordDialog = false"
      @submit="handleChangePassword"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import translate from 'src/utils/translate';
import { useUserManagement } from 'src/composables/UserManagement/useUserManagement';
import {
  UsersTable,
  CreateUserDialog,
  DeleteUserDialog,
  ChangePasswordDialog
} from 'src/components/UserManagement';
import type { User } from 'src/types/models';

const pageHeight = ref(0);

// Use the composable
const {
  users,
  searchQuery,
  loading,
  creating,
  deleting,
  changingPassword,
  currentUser,
  roleOptions,
  loadUsers,
  updateUserRole,
  createUser,
  deleteUser,
  changePassword
} = useUserManagement();

// Dialog states
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const showChangePasswordDialog = ref(false);
const userToDelete = ref<User | null>(null);
const userToChangePassword = ref<User | null>(null);

// Event handlers
function confirmDeleteUser(user: User) {
  userToDelete.value = user;
  showDeleteDialog.value = true;
}

async function handleDeleteUser() {
  if (!userToDelete.value) return;
  
  const success = await deleteUser(userToDelete.value.id);
  if (success) {
    showDeleteDialog.value = false;
    userToDelete.value = null;
  }
}

function openChangePasswordDialog(user: User) {
  userToChangePassword.value = user;
  showChangePasswordDialog.value = true;
}

async function handleChangePassword(password: string) {
  if (!userToChangePassword.value) return;
  
  const success = await changePassword(userToChangePassword.value.id, password);
  if (success) {
    showChangePasswordDialog.value = false;
    userToChangePassword.value = null;
  }
}

async function handleCreateUser(userData: {
  username: string;
  email: string;
  name: string;
  lastName: string;
  password: string;
  role: any;
}) {
  const success = await createUser(userData);
  if (success) {
    showCreateDialog.value = false;
  }
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