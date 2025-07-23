import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/services/api';
import useUserStore from 'src/stores/user.store';
import type { User } from 'src/types/models';
import { Role } from 'src/types/models';
import translate from 'src/utils/translate';

export function useUserManagement() {
  const $q = useQuasar();
  const userStore = useUserStore();

  // Reactive data
  const users = ref<User[]>([]);
  const searchQuery = ref('');
  const loading = ref(false);
  const creating = ref(false);
  const deleting = ref(false);
  const changingPassword = ref(false);

  // Computed properties
  const currentUser = computed(() => ({
    id: '', // We'll need to get this from the store or API
    role: userStore.role as Role
  }));

  const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value;
    
    const query = searchQuery.value.toLowerCase();
    return users.value.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const roleOptions = [
    { label: translate('admin'), value: Role.ADMIN },
    { label: translate('user'), value: Role.USER }
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

  async function createUser(userData: {
    username: string;
    email: string;
    name: string;
    lastName: string;
    password: string;
    role: Role;
  }) {
    try {
      creating.value = true;
      await api.auth.register(userData);
      $q.notify({
        type: 'positive',
        message: translate('userCreated')
      });
      await loadUsers();
      return true;
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : translate('errorCreatingUser')
      });
      return false;
    } finally {
      creating.value = false;
    }
  }

  async function deleteUser(userId: string) {
    try {
      deleting.value = true;
      await api.users.delete(userId);
      $q.notify({
        type: 'positive',
        message: translate('userDeleted')
      });
      await loadUsers();
      return true;
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : translate('errorDeletingUser')
      });
      return false;
    } finally {
      deleting.value = false;
    }
  }

  async function changePassword(userId: string, newPassword: string) {
    try {
      changingPassword.value = true;
      await api.users.changePassword(userId, newPassword);
      $q.notify({
        type: 'positive',
        message: translate('passwordChanged')
      });
      return true;
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error instanceof Error ? error.message : translate('errorChangingPassword')
      });
      return false;
    } finally {
      changingPassword.value = false;
    }
  }

  function isLastAdmin(user: User): boolean {
    if (user.role !== Role.ADMIN) return false;
    const adminUsers = users.value.filter(u => u.role === Role.ADMIN);
    return adminUsers.length <= 1;
  }

  return {
    // State
    users,
    searchQuery,
    loading,
    creating,
    deleting,
    changingPassword,
    
    // Computed
    currentUser,
    filteredUsers,
    roleOptions,
    
    // Methods
    loadUsers,
    updateUserRole,
    createUser,
    deleteUser,
    changePassword,
    isLastAdmin
  };
} 