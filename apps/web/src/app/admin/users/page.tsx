import { fetchAdminUsers } from '@/features/admin/services/admin.api';
import { UsersTable } from '@/features/admin/components/users-table';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await fetchAdminUsers();
  return <UsersTable users={users} />;
}
