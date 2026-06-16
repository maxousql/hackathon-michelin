import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';

import { createApiClient } from '@michelin/api-client';

import styles from './layout.module.css';

async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const client = createApiClient({
      baseUrl: process.env.API_INTERNAL_URL ?? 'http://localhost:3001/api/v1',
    });
    return await client.getMe(token);
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAdminUser();

  if (!user || !user.isAdmin) {
    redirect('/');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.wordmark}>MICHELIN</span>
          <span className={styles.product}>Back Office</span>
        </Link>

        <Link href="/admin/users" className={styles.navLink}>
          Utilisateurs
        </Link>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
