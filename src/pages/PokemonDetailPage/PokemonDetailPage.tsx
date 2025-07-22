import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../../context/FavoritesContext';
import styles from './PokemonDetailPage.module.css';

function PokemonDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [pokemonSpecies, setPokemonSpecies] = useState(null);
  const [pokemonMoves, setPokemonMoves] = useState([]);
  const [pokemonLocations, setPokemonLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    isFavorite, 
    toggleFavorite, 
    isInBattleTeam, 
    addToBattleTeam, 
    removeFromBattleTeam, 
    isBattleTeamFull 
  } = useFavorites();
  const [isVisible, setIsVisible] = useState(false);
  const [showTeamMessage, setShowTeamMessage] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setIsLoading(true);
        
        // Fetch basic pokemon data
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!pokemonResponse.ok) {
          throw new Error('Pokemon not found');
        }
        const pokemonData = await pokemonResponse.json();
        setPokemon(pokemonData);
        
        // Fetch species data for description
        const speciesResponse = await fetch(pokemonData.species.url);
        if (speciesResponse.ok) {
          const speciesData = await speciesResponse.json();
          setPokemonSpecies(speciesData);
        }
        
        // Fetch location areas
        const locationsResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setPokemonLocations(locationsData);
        }
        
        // Get the most recent moves (limited to 10)
        const allMoves = pokemonData.moves;
        // Sort moves by level (if available)
        const sortedMoves = allMoves
          .filter(move => move.version_group_details.length > 0)
          .sort((a, b) => {
            const aLevel = a.version_group_details[0].level_learned_at;
            const bLevel = b.version_group_details[0].level_learned_at;
            return bLevel - aLevel; // Sort descending
          })
          .slice(0, 10); // Limit to 10 moves
          
        const movesDetails = await Promise.all(
          sortedMoves.map(async (moveEntry) => {
            const moveResponse = await fetch(moveEntry.move.url);
            if (!moveResponse.ok) return null;
            const moveData = await moveResponse.json();
            return {
              ...moveData,
              level: moveEntry.version_group_details[0].level_learned_at,
              learn_method: moveEntry.version_group_details[0].move_learn_method.name
            };
          })
        );
        
        setPokemonMoves(movesDetails.filter(move => move !== null));
        setIsLoading(false);
        setTimeout(() => setIsVisible(true), 100);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleToggleFavorite = () => {
    if (pokemon) {
      toggleFavorite(pokemon.id);
    }
  };

  const handleToggleBattleTeam = () => {
    if (!pokemon) return;
    
    const pokemonId = pokemon.id;
    
    if (isInBattleTeam(pokemonId)) {
      removeFromBattleTeam(pokemonId);
      showMessage(t('pokemon.removedFromTeam', { name: capitalizeFirstLetter(pokemon.name) }));
    } else {
      if (isBattleTeamFull()) {
        showMessage(t('pokemon.teamIsFull'));
      } else {
        addToBattleTeam(pokemonId);
        showMessage(t('pokemon.addedToTeam', { name: capitalizeFirstLetter(pokemon.name) }));
      }
    }
  };
  
  const showMessage = (message) => {
    setTeamMessage(message);
    setShowTeamMessage(true);
    setTimeout(() => {
      setShowTeamMessage(false);
    }, 3000);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  const formatDescription = () => {
    if (!pokemonSpecies) return t('pokemon.noDescription');
    
    // Find flavor text in current language, fallback to English
    const currentLangEntry = pokemonSpecies.flavor_text_entries.find(
      entry => entry.language.name === (i18n.language === 'es' ? 'es' : 'en')
    );
    
    if (currentLangEntry) {
      return currentLangEntry.flavor_text.replace(/[\n\f]/g, ' ');
    }
    
    // Fallback to English if current language not found
    const englishEntry = pokemonSpecies.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    
    if (!englishEntry) return t('pokemon.noDescription');
    
    // Clean up the text (remove newlines and weird characters)
    return englishEntry.flavor_text.replace(/[\n\f]/g, ' ');
  };

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <div className={styles.loaderSpin}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button className={styles.button} onClick={handleGoBack}>{t('common.back')}</button>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className={styles.error}>
        <p>Pokémon not found</p>
        <button className={styles.button} onClick={handleGoBack}>{t('common.back')}</button>
      </div>
    );
  }

  const favoriteStatus = isFavorite(pokemon.id);
  const battleTeamStatus = isInBattleTeam(pokemon.id);

  return (
    <div className={`${styles.container} ${isVisible ? styles.visible : ''}`}>
      <button className={styles.backButton} onClick={handleGoBack}>
        &larr; {t('common.back')}
      </button>
      
      {showTeamMessage && (
        <div className={`${styles.teamMessage} ${styles.visible}`}>
          {teamMessage}
        </div>
      )}
      
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.name}>{capitalizeFirstLetter(pokemon.name)}</h1>
          <span className={styles.number}>#{String(pokemon.id).padStart(3, '0')}</span>
          
          <div className={styles.actionsContainer}>
            <button 
              className={`${styles.favoriteButton} ${favoriteStatus ? styles.favorite : ''}`}
              onClick={handleToggleFavorite}
              aria-label={favoriteStatus ? t('pokemon.removeFavorite') : t('pokemon.addFavorite')}
            >
              <span className={styles.favoriteIcon}>
                {favoriteStatus ? '❤️' : '🤍'}
              </span>
              {favoriteStatus ? t('pokemon.removeFavorite') : t('pokemon.addFavorite')}
            </button>
            
            <button 
              className={`${styles.battleTeamButton} ${battleTeamStatus ? styles.inTeam : ''}`}
              onClick={handleToggleBattleTeam}
              disabled={!favoriteStatus && isBattleTeamFull()}
              aria-label={battleTeamStatus ? t('pokemon.removeFromTeam') : t('pokemon.addToTeam')}
            >
              <span className={styles.battleTeamIcon}>
                {battleTeamStatus ? '⚔️' : '🔰'}
              </span>
              {battleTeamStatus ? t('pokemon.removeFromTeam') : t('pokemon.addToTeam')}
            </button>
          </div>
        </div>
        
        <div className={styles.content}>
          <div className={styles.imageContainer}>
            <img 
              src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
              alt={`${pokemon.name} artwork`} 
              className={styles.image}
            />
          </div>
          
          <div className={styles.info}>
            <div className={styles.description}>
              <h2>{t('pokemon.description')}</h2>
              <p>{formatDescription()}</p>
            </div>
            
            <div className={styles.stats}>
              <h2>{t('pokemon.baseStats')}</h2>
              {pokemon.stats.map(stat => (
                <div key={stat.stat.name} className={styles.statRow}>
                  <span className={styles.statName}>{capitalizeFirstLetter(stat.stat.name.replace('-', ' '))}</span>
                  <div className={styles.statBarContainer}>
                    <div 
                      className={styles.statBar} 
                      style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                    />
                  </div>
                  <span className={styles.statValue}>{stat.base_stat}</span>
                </div>
              ))}
            </div>
            
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <h3>{t('pokemon.type')}</h3>
                <div className={styles.typeList}>
                  {pokemon.types.map(type => (
                    <span key={type.type.name} className={`${styles.type} ${styles[type.type.name]}`}>
                      {capitalizeFirstLetter(type.type.name)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <h3>{t('pokemon.height')}</h3>
                <p>{pokemon.height / 10} m</p>
              </div>
              
              <div className={styles.detailItem}>
                <h3>{t('pokemon.weight')}</h3>
                <p>{pokemon.weight / 10} kg</p>
              </div>
              
              <div className={styles.detailItem}>
                <h3>{t('pokemon.abilities')}</h3>
                <ul className={styles.abilityList}>
                  {pokemon.abilities.map(ability => (
                    <li key={ability.ability.name}>
                      {capitalizeFirstLetter(ability.ability.name.replace('-', ' '))}
                      {ability.is_hidden && <span className={styles.hidden}> {t('pokemon.hidden')}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className={styles.movesSection}>
              <h2>{t('pokemon.moves')}</h2>
              {pokemonMoves.length > 0 ? (
                <div className={styles.movesGrid}>
                  {pokemonMoves.map(move => (
                    <div key={move.id} className={styles.moveCard}>
                      <h4 className={styles.moveName}>{capitalizeFirstLetter(move.name.replace('-', ' '))}</h4>
                      <div className={styles.moveDetails}>
                        <span className={`${styles.moveType} ${styles[move.type.name]}`}>
                          {capitalizeFirstLetter(move.type.name)}
                        </span>
                        <span className={styles.moveCategory}>
                          {capitalizeFirstLetter(move.damage_class.name)}
                        </span>
                      </div>
                      <div className={styles.movePower}>
                        {move.power ? (
                          <span>{t('pokemon.power')}: {move.power}</span>
                        ) : (
                          <span>{t('pokemon.power')}: —</span>
                        )}
                      </div>
                      <div className={styles.moveMethod}>
                        {move.learn_method === 'level-up' ? (
                          <span>{t('pokemon.learn')}: {t('pokemon.levelUp', { level: move.level })}</span>
                        ) : (
                          <span>{t('pokemon.learn')}: {t('pokemon.learnMethod', { method: capitalizeFirstLetter(move.learn_method.replace('-', ' ')) })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noData}>{t('pokemon.noMoves')}</p>
              )}
            </div>
            
            <div className={styles.locationsSection}>
              <h2>{t('pokemon.locations')}</h2>
              {pokemonLocations.length > 0 ? (
                <ul className={styles.locationList}>
                  {pokemonLocations.slice(0, 5).map((location, index) => (
                    <li key={index}>
                      {capitalizeFirstLetter(location.location_area.name.replace('-', ' ').replace('area', 'Area'))}
                    </li>
                  ))}
                  {pokemonLocations.length > 5 && (
                    <li className={styles.moreLocations}>
                      {t('pokemon.moreLocations', { count: pokemonLocations.length - 5 })}
                    </li>
                  )}
                </ul>
              ) : (
                <p className={styles.noData}>{t('pokemon.noLocations')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones para navegación avanzada */}
      <div className={styles.advancedTools}>
        <Link to={`/compare?pokemon1=${pokemon.id}`} className={styles.advancedButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z" />
          </svg>
          {t('compare.title')}
        </Link>
        
        <Link to={`/evolution/${pokemon.id}`} className={styles.advancedButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
          </svg>
          {t('evolution.title')}
        </Link>
        
        <Link to={`/region-map?pokemon=${pokemon.id}`} className={styles.advancedButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          {t('region.title')}
        </Link>
      </div>
    </div>
  );
}

export default PokemonDetailPage; 