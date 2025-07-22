import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (value: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  
  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    // Focus the input again after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
      <div className={styles.searchContainer}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('common.searchPlaceholder')}
          value={searchTerm}
          onChange={handleChange}
          ref={searchInputRef}
        />
        {searchTerm && (
          <button 
            type="button" 
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <button 
        type="submit" 
        className={styles.searchButton}
        disabled={!searchTerm.trim()}
      >
        {t('common.search')}
      </button>
    </form>
  );
}

export default SearchBar; 