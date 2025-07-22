import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';
import { useEffect, useState } from 'react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  // Soluciona problema de hidratación entre servidor/cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  const isEnglish = i18n.language === 'en';
  
  const toggleLanguage = () => {
    const newLang = isEnglish ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <button 
      className={styles.languageButton} 
      onClick={toggleLanguage}
      aria-label={isEnglish ? 'Cambiar a Español' : 'Switch to English'}
    >
      <div className={styles.flagContainer}>
        <span className={`${styles.flag} ${isEnglish ? styles.active : styles.inactive}`}>
          🇺🇸
        </span>
        <span className={`${styles.flag} ${!isEnglish ? styles.active : styles.inactive}`}>
          🇪🇸
        </span>
      </div>
    </button>
  );
}

export default LanguageSwitcher; 