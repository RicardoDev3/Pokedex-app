import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './PokemonCard.module.css';
import { useFavorites } from '../../context/FavoritesContext';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
}

interface PokemonCardProps {
  pokemon: Pokemon;
}

function PokemonCard({ pokemon }: PokemonCardProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites() || {};
  const navigate = useNavigate();
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
  };
  
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleFavorite && toggleFavorite(pokemon.id);
  };

  const handleCardClick = () => {
    navigate(`/pokemon/${pokemon.id}`);
  };

  const favoriteStatus = isFavorite ? isFavorite(pokemon.id) : false;

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <button 
        className={`${styles.favoriteButton} ${favoriteStatus ? styles.favorite : ''}`}
        onClick={handleFavoriteClick}
        aria-label={favoriteStatus ? t('pokemon.removeFavorite') : t('pokemon.addFavorite')}
      >
        ★
      </button>
      <div className={styles.imageContainer}>
        {isLoading && <div className={styles.loader}></div>}
        <img 
          src={pokemon.sprites.front_default} 
          alt={`${pokemon.name} sprite`} 
          className={styles.image}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{capitalizeFirstLetter(pokemon.name)}</h3>
        <span className={styles.number}>#{String(pokemon.id).padStart(3, '0')}</span>
      </div>
    </div>
  );
}

export default PokemonCard; 