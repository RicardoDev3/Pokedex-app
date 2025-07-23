import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import ThemeSwitcher from "../ThemeSwitcher/ThemeSwitcher";
import UserMenu from "../UserMenu/UserMenu";
import BackToTop from "../BackToTop/BackToTop";
import styles from "./Layout.module.css";

const Layout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pokédex</h1>
        <nav className={styles.nav}>
          <div>
            <Link to="/" className={styles.navLink}>
              {t("common.home")}
            </Link>
            <Link to="/favorites" className={styles.navLink}>
              {t("common.favorites")}
            </Link>
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
        <p>Pokédex App</p>
      </footer>
      <BackToTop />
    </div>
  );
};

export default Layout;
