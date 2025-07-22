import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage/HomePage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';
import PokemonDetailPage from './pages/PokemonDetailPage/PokemonDetailPage';
import BattleTeamPage from './pages/BattleTeamPage/BattleTeamPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ComparePage from './pages/ComparePage/ComparePage';
import EvolutionPage from './pages/EvolutionPage/EvolutionPage';
import RegionMapPage from './pages/RegionMapPage/RegionMapPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'pokemon/:id', element: <PokemonDetailPage /> },
      { path: 'battle-team', element: <BattleTeamPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'evolution/:id', element: <EvolutionPage /> },
      { path: 'region-map', element: <RegionMapPage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

const root = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <App>
        <RouterProvider router={router} />
      </App>
    </Provider>
  </React.StrictMode>
);
