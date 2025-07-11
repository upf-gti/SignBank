import { Role } from 'src/types/models';
import translate from 'src/utils/translate';

export const getUserTableColumns = () => [
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