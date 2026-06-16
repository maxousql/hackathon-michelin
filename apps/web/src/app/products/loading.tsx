import styles from './loading.module.css';

const PLACEHOLDERS = Array.from({ length: 8 });

export default function ProductsLoading() {
  return (
    <div
      className={styles.wrapper}
      aria-busy="true"
      aria-label="Chargement du catalogue"
    >
      <div className={styles.introBar} />
      <div className={styles.layout}>
        <div className={styles.sidebar} />
        <div className={styles.cards}>
          {PLACEHOLDERS.map((_, index) => (
            <div key={index} className={styles.card} />
          ))}
        </div>
      </div>
    </div>
  );
}
