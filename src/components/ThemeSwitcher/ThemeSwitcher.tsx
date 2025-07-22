import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeSwitcher.module.css';
import { useEffect, useState } from 'react';

const ThemeSwitcher: React.FC = () => {
  const { darkMode, toggleTheme } = useTheme() as { darkMode: boolean; toggleTheme: () => void };
  const [mounted, setMounted] = useState(false);
  
  // Soluciona problema de hidratación entre servidor/cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  return (
    <button 
      className={`${styles.themeButton} ${darkMode ? styles.dark : styles.light}`}
      onClick={toggleTheme}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className={styles.iconContainer}>
        <span className={`${styles.icon} ${styles.sunIcon}`}>☀️</span>
        <span className={`${styles.icon} ${styles.moonIcon}`}>🌙</span>
      </div>
      <div className={styles.slider}></div>
    </button>
  );
}

export default ThemeSwitcher; 