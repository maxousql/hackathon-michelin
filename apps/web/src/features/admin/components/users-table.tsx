import Link from 'next/link';

import type { AdminUser } from '@michelin/contracts';

import { deleteUserAction, toggleAdminAction } from '../actions/admin.actions';
import styles from './users-table.module.css';

interface Props {
  users: AdminUser[];
}

export function UsersTable({ users }: Props) {
  return (
    <section className={styles.section}>
      <Link href="/" className={styles.backLink}>
        ← Retour à l&apos;accueil
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Utilisateurs</h1>
        <span className={styles.count}>
          {users.length} compte{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Nom</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Rôle</th>
              <th className={styles.th}>Inscription</th>
              <th className={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.name}`}>
                  {user.firstName} {user.lastName}
                </td>
                <td className={`${styles.td} ${styles.email}`}>{user.email}</td>
                <td className={styles.td}>
                  <span
                    className={`${styles.badge} ${user.isAdmin ? styles.badgeAdmin : styles.badgeUser}`}
                  >
                    {user.isAdmin ? 'Admin' : 'Utilisateur'}
                  </span>
                </td>
                <td className={styles.td}>
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <form
                      action={toggleAdminAction.bind(
                        null,
                        user.id,
                        !user.isAdmin,
                      )}
                    >
                      <button type="submit" className={styles.toggleBtn}>
                        {user.isAdmin ? 'Retirer admin' : 'Passer admin'}
                      </button>
                    </form>
                    <form action={deleteUserAction.bind(null, user.id)}>
                      <button
                        type="submit"
                        className={styles.deleteBtn}
                        aria-label={`Supprimer ${user.firstName} ${user.lastName}`}
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
