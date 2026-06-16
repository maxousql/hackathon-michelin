'use server';

import { revalidatePath } from 'next/cache';

import { patchAdminUser, removeAdminUser } from '../services/admin.api';

export async function toggleAdminAction(
  id: string,
  isAdmin: boolean,
): Promise<void> {
  await patchAdminUser(id, isAdmin);
  revalidatePath('/admin/users');
}

export async function deleteUserAction(id: string): Promise<void> {
  await removeAdminUser(id);
  revalidatePath('/admin/users');
}
