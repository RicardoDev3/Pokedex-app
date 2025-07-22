import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import UserMenu from '../UserMenu/UserMenu';
import BackToTop from '../BackToTop/BackToTop';
import styles from './Layout.module.css';

const Layout: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pokédex</h1>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>{t('common.home')}</Link>
          <Link to="/favorites" className={styles.navLink}>{t('common.favorites')}</Link>
          <Link to="/battle-team" className={styles.navLink}>{t('common.battleTeam')}</Link>
          <div className={styles.toolsLinks}>
            <Link to="/compare" className={styles.toolLink}>{t('compare.title')}</Link>
            <Link to="/region-map" className={styles.toolLink}>{t('region.title')}</Link>
          </div>
          <div className={styles.controls}>
            <LanguageSwitcher />
            <ThemeSwitcher />
            <UserMenu />
          </div>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>Pokédex App - 2024</p>
      </footer>
      <BackToTop />
    </div>
  );
}

export default Layout; 