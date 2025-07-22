import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './NotFoundPage.module.css';

function NotFoundPage() {
  const { t } = useTranslation();
  
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2>{t('notFound.title')}</h2>
        <p>{t('notFound.message')}</p>
        <Link to="/" className={styles.homeLink}>
          {t('notFound.homeLink')}
        </Link>
        
        <div className={styles.pokeball}>
          <div className={styles.pokeballTop}></div>
          <div className={styles.pokeballMiddle}></div>
          <div className={styles.pokeballBottom}></div>
          <div className={styles.pokeballCenter}></div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage; 