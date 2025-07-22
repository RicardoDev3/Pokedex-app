import { ReactNode } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import './App.css';

interface AppProps {
  children: ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
