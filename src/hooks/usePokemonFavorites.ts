import { useState, useEffect } from 'react';

function usePokemonFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('pokemonFavorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (pokemonId: number) => {
    setFavorites((prevFavorites) => {
      if (!prevFavorites.includes(pokemonId)) {
        return [...prevFavorites, pokemonId];
      }
      return prevFavorites;
    });
  };

  const removeFavorite = (pokemonId: number) => {
    setFavorites((prevFavorites) => 
      prevFavorites.filter(id => id !== pokemonId)
    );
  };

  const isFavorite = (pokemonId: number) => {
    return favorites.includes(pokemonId);
  };

  const toggleFavorite = (pokemonId: number) => {
    if (isFavorite(pokemonId)) {
      removeFavorite(pokemonId);
    } else {
      addFavorite(pokemonId);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite
  } as const;
}

export default usePokemonFavorites; 