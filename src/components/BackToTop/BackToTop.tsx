import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './BackToTop.module.css';

const BackToTop: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  // Manejar el scroll y mostrar/ocultar el botón
  useEffect(() => {
    const toggleVisibility = () => {
      // Mostrar el botón después de hacer scroll más de 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Escuchar el evento de scroll
    window.addEventListener('scroll', toggleVisibility);
    
    // Ejecutar inicialmente para verificar la posición actual
    toggleVisibility();

    // Limpiar listener al desmontar
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    // Scroll suave hacia arriba
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      className={`${styles.backToTop} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label={t('common.backToTop')}
      title={t('common.backToTop')}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
};

export default BackToTop; 