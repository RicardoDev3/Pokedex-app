import { useTranslation } from 'react-i18next';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const LoadingSpinner = ({ size = 'medium', showText = true }: LoadingSpinnerProps) => {
  const { t } = useTranslation();
  
  // Determine size class
  const sizeClass = size === 'small' 
    ? styles.small 
    : size === 'large' 
      ? styles.large 
      : '';

  return (
    <div className={`${styles.spinner} ${sizeClass}`}>
      <div className={styles.spinnerCircle}></div>
      {showText && <p className={styles.spinnerText}>{t('common.loading')}</p>}
    </div>
  );
};

export default LoadingSpinner; 