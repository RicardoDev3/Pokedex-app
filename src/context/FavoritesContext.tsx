import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFavorites, updateBattleTeam } from '../features/teams/teamsSlice';
import { selectUser } from '../features/auth/authSlice';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (pokemonId: number) => void;
  isFavorite: (pokemonId: number) => boolean;
  battleTeam: number[];
  addToBattleTeam: (pokemonId: number) => void;
  removeFromBattleTeam: (pokemonId: number) => void;
  isInBattleTeam: (pokemonId: number) => boolean;
  isBattleTeamFull: () => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [battleTeam, setBattleTeam] = useState<number[]>([]);
  const dispatch = useDispatch();
  const user = useSelector(selectUser) as { id: string } | null;
  const userId = user?.id || 'guest';
  
  useEffect(() => {
    if (!user) {
      const storedFavorites = localStorage.getItem('pokemonFavorites');
      const storedBattleTeam = localStorage.getItem('pokemonBattleTeam');
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
      if (storedBattleTeam) setBattleTeam(JSON.parse(storedBattleTeam));
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      const storedTeams = JSON.parse(sessionStorage.getItem('pokemonTeams') || '{}');
      const userTeams = storedTeams[userId] || { favorites: [], battleTeam: [] };
      setFavorites(userTeams.favorites || []);
      setBattleTeam(userTeams.battleTeam || []);
    }
  }, [user, userId]);
  
  useEffect(() => {
    if (user) {
      dispatch(updateFavorites({ userId, favorites }));
    } else {
      localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
    }
  }, [favorites, user, userId, dispatch]);
  
  useEffect(() => {
    if (user) {
      dispatch(updateBattleTeam({ userId, battleTeam }));
    } else {
      localStorage.setItem('pokemonBattleTeam', JSON.stringify(battleTeam));
    }
  }, [battleTeam, user, userId, dispatch]);
  
  const toggleFavorite = (pokemonId: number) => {
    setFavorites(prev => {
      const isFav = prev.includes(pokemonId);
      if (isFav) {
        const newFavorites = prev.filter(id => id !== pokemonId);
        setBattleTeam(prevTeam => prevTeam.filter(id => id !== pokemonId));
        return newFavorites;
      } else {
        return [...prev, pokemonId];
      }
    });
  };

  const isFavorite = (pokemonId: number) => favorites.includes(pokemonId);

  const addToBattleTeam = (pokemonId: number) => {
    if (!isFavorite(pokemonId)) toggleFavorite(pokemonId);
    setBattleTeam(prev => {
      if (prev.includes(pokemonId)) return prev;
      if (prev.length >= 6) return prev;
      return [...prev, pokemonId];
    });
  };

  const removeFromBattleTeam = (pokemonId: number) => {
    setBattleTeam(prev => prev.filter(id => id !== pokemonId));
  };

  const isInBattleTeam = (pokemonId: number) => battleTeam.includes(pokemonId);

  const isBattleTeamFull = () => battleTeam.length >= 6;

  return (
    <FavoritesContext.Provider 
      value={{ 
        favorites, 
        toggleFavorite, 
        isFavorite,
        battleTeam,
        addToBattleTeam,
        removeFromBattleTeam,
        isInBattleTeam,
        isBattleTeamFull
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 