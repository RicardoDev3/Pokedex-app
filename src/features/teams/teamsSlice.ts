import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserTeams {
  battleTeam: number[];
  favorites: number[];
}

interface TeamsState {
  teams: Record<string, UserTeams>;
  loading: boolean;
  error: string | null;
}

const getTeamsFromStorage = (): Record<string, UserTeams> => {
  if (typeof window !== 'undefined') {
    const storedTeams = sessionStorage.getItem('pokemonTeams');
    if (storedTeams) {
      try {
        return JSON.parse(storedTeams);
      } catch (error) {
        console.error('Error parsing teams from sessionStorage:', error);
        return {};
      }
    }
  }
  return {};
};

const initialState: TeamsState = {
  teams: getTeamsFromStorage(),
  loading: false,
  error: null,
};

export const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    loadTeams: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!state.teams[userId]) {
        state.teams[userId] = {
          battleTeam: [],
          favorites: [],
        };
      }
    },
    updateFavorites: (
      state,
      action: PayloadAction<{ userId: string; favorites: number[] }>
    ) => {
      const { userId, favorites } = action.payload;
      if (!state.teams[userId]) {
        state.teams[userId] = { battleTeam: [], favorites: [] };
      }
      state.teams[userId].favorites = favorites;
      sessionStorage.setItem('pokemonTeams', JSON.stringify(state.teams));
    },
    updateBattleTeam: (
      state,
      action: PayloadAction<{ userId: string; battleTeam: number[] }>
    ) => {
      const { userId, battleTeam } = action.payload;
      if (!state.teams[userId]) {
        state.teams[userId] = { battleTeam: [], favorites: [] };
      }
      state.teams[userId].battleTeam = battleTeam;
      sessionStorage.setItem('pokemonTeams', JSON.stringify(state.teams));
    },
    clearUserTeams: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (state.teams[userId]) {
        delete state.teams[userId];
        sessionStorage.setItem('pokemonTeams', JSON.stringify(state.teams));
      }
    },
  },
});

export const { loadTeams, updateFavorites, updateBattleTeam, clearUserTeams } = teamsSlice.actions;

// Selectors
type RootState = { teams: TeamsState };
export const selectUserTeams = (state: RootState, userId: string): UserTeams =>
  state.teams.teams[userId] || { battleTeam: [], favorites: [] };

export const selectUserFavorites = (state: RootState, userId: string): number[] =>
  state.teams.teams[userId]?.favorites || [];

export const selectUserBattleTeam = (state: RootState, userId: string): number[] =>
  state.teams.teams[userId]?.battleTeam || [];

export default teamsSlice.reducer; 