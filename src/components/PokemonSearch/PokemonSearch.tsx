import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './PokemonSearch.module.css';

const PokemonSearch = ({ onSelectPokemon, className }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Cerrar resultados cuando se hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Buscar pokémon cuando se escribe en el campo de búsqueda
  useEffect(() => {
    const fetchPokemon = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        // Obtener la lista completa de Pokémon (limitado a 1000 para rendimiento)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        
        // Filtrar los resultados basados en el término de búsqueda
        const filteredResults = data.results
          .filter(pokemon => pokemon.name.includes(searchTerm.toLowerCase()))
          .slice(0, 10);
        
        // Obtener más detalles de cada Pokémon filtrado
        const detailedResults = await Promise.all(
          filteredResults.map(async (pokemon) => {
            const detailResponse = await fetch(pokemon.url);
            const detailData = await detailResponse.json();
            return {
              id: detailData.id,
              name: detailData.name,
              sprite: detailData.sprites.front_default,
              types: detailData.types.map(type => type.type.name)
            };
          })
        );
        
        setSearchResults(detailedResults);
      } catch (error) {
        console.error('Error searching Pokemon:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce para evitar muchas peticiones mientras se escribe
    const timeoutId = setTimeout(() => {
      fetchPokemon();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setShowResults(true);
  };

  const handleSelectPokemon = (pokemon) => {
    if (onSelectPokemon) {
      onSelectPokemon(pokemon);
    }
    setShowResults(false);
    setSearchTerm('');
  };

  return (
    <div className={`${styles.searchContainer} ${className}`} ref={searchRef}>
      <div className={styles.inputContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder={t('common.searchPlaceholder')}
          className={styles.searchInput}
          onFocus={() => setShowResults(true)}
        />
        <button 
          className={styles.searchButton}
          onClick={() => setShowResults(true)}
          type="button"
          aria-label={t('common.search')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      </div>

      {showResults && (searchResults.length > 0 || loading) && (
        <div className={styles.resultsContainer}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t('common.loading')}</p>
            </div>
          )}

          {!loading && searchResults.length === 0 && searchTerm && (
            <div className={styles.noResults}>
              <p>{t('common.noResults')}</p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <ul className={styles.resultsList}>
              {searchResults.map(pokemon => (
                <li 
                  key={pokemon.id} 
                  className={styles.resultItem}
                  onClick={() => handleSelectPokemon(pokemon)}
                >
                  <img 
                    src={pokemon.sprite} 
                    alt={pokemon.name} 
                    className={styles.pokemonSprite} 
                  />
                  <div className={styles.pokemonInfo}>
                    <span className={styles.pokemonName}>
                      {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </span>
                    <span className={styles.pokemonId}>#{pokemon.id}</span>
                    <div className={styles.types}>
                      {pokemon.types.map(type => (
                        <span 
                          key={type} 
                          className={`${styles.type} ${styles[type]}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className={styles.selectButton}>
                    {t('common.select')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PokemonSearch; 