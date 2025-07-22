import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PokemonCard from '../../components/PokemonCard/PokemonCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useFavorites } from '../../context/FavoritesContext';
import styles from './FavoritesPage.module.css';

function FavoritesPage() {
  const { t } = useTranslation();
  const { favorites } = useFavorites();
  const [favoritePokemons, setFavoritePokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        
        // If there are favorites, fetch their details
        if (favorites.length > 0) {
          const favoritesDetails = await Promise.all(
            favorites.map(async (id) => {
              const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
              if (!response.ok) throw new Error(`Failed to fetch details for pokemon #${id}`);
              return await response.json();
            })
          );
          
          setFavoritePokemons(favoritesDetails);
          setFilteredPokemons(favoritesDetails);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading favorites:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [favorites]);

  // Filter pokemon based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPokemons(favoritePokemons);
    } else {
      const filtered = favoritePokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPokemons(filtered);
    }
  }, [searchTerm, favoritePokemons]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  if (isLoading && favorites.length > 0) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  if (error) {
    return <div className={styles.error}>Error loading favorites: {error}</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('favorites.title')}</h2>
        <div className={styles.emptyState}>
          <p>{t('favorites.noFavorites')}</p>
          <p>{t('favorites.goToHome')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('favorites.title')}</h2>
      
      <SearchBar onSearch={handleSearch} />
      
      {filteredPokemons.length === 0 ? (
        <div className={styles.noResults}>
          <p>{t('favorites.noResults', { searchTerm })}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredPokemons.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage; 