import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  email: string;
  // Agrega aquí otros campos que uses en tu app
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
}

const getUserFromStorage = (): User | null => {
  if (typeof window !== 'undefined') {
    const storedUser = sessionStorage.getItem('pokedexUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        return null;
      }
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
  error: null,
  loading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      sessionStorage.setItem('pokedexUser', JSON.stringify(action.payload));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('pokedexUser');
    },
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      sessionStorage.setItem('pokedexUser', JSON.stringify(action.payload));
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserData: (state, action: PayloadAction<Partial<User>>) => {
      state.user = {
        ...state.user,
        ...action.payload,
      } as User;
      sessionStorage.setItem('pokedexUser', JSON.stringify(state.user));
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  updateUserData,
} = authSlice.actions;

type RootState = { auth: AuthState };
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer; 