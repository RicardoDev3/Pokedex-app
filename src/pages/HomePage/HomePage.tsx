import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PokemonCard from '../../components/PokemonCard/PokemonCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import styles from './HomePage.module.css';

function HomePage() {
  const { t } = useTranslation();
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Load initial data only once when component mounts
  useEffect(() => {
    const fetchInitialPokemonList = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        
        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon) => {
            const detailResponse = await fetch(pokemon.url);
            if (!detailResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
            return await detailResponse.json();
          })
        );
        
        setPokemonList(pokemonDetails);
        setInitialDataLoaded(true);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchInitialPokemonList();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search is cleared and we have initial data, show it
      if (initialDataLoaded) {
        setIsSearching(false);
      }
      return;
    }
    
    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        
        const filteredResults = data.results.filter(pokemon => 
          pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setTotalResults(filteredResults.length);
        
        if (filteredResults.length > 0) {
          const limitedResults = filteredResults.slice(0, 20);
          
          const pokemonDetails = await Promise.all(
            limitedResults.map(async (pokemon) => {
              const detailResponse = await fetch(pokemon.url);
              if (!detailResponse.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);
              return await detailResponse.json();
            })
          );
          
          setPokemonList(pokemonDetails);
        } else {
          setPokemonList([]);
        }
        
        setIsSearching(false);
      } catch (err) {
        setError(err.message);
        setIsSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(searchTimeout);
  }, [searchTerm, initialDataLoaded]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim() && initialDataLoaded) {
      // Don't set loading if we're just returning to initial view
      return;
    }
    setIsSearching(true);
  };

  if (isLoading && !initialDataLoaded) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('home.title')}</h2>
      
      <SearchBar onSearch={handleSearch} />
      
      {isSearching && (
        <div className={styles.loading}>{t('home.searching')}</div>
      )}
      
      {!isSearching && pokemonList.length === 0 && searchTerm.trim() !== '' && (
        <div className={styles.noResults}>
          <p>{t('home.noResults', { searchTerm })}</p>
        </div>
      )}
      
      {!isSearching && searchTerm.trim() !== '' && totalResults > 0 && (
        <div className={styles.searchResults}>
          <p>
            {t('home.resultsFound', { count: totalResults, searchTerm })}
            {totalResults > 20 && t('home.showingFirst')}
          </p>
        </div>
      )}
      
      {!isSearching && pokemonList.length > 0 && (
        <div className={styles.grid}>
          {pokemonList.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage; 