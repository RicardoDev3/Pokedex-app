import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginStart, loginSuccess, loginFailure, selectIsAuthenticated, selectAuthError, selectAuthLoading } from '../../features/auth/authSlice';
import { loadTeams } from '../../features/teams/teamsSlice';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Si ya está autenticado, redireccionar al home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.email || !formData.password) {
      dispatch(loginFailure(t('login.fillAllFields')));
      return;
    }

    dispatch(loginStart());

    // Simular una llamada a una API
    setTimeout(() => {
      // Comprobar si existe en localStorage para simular una BD
      const users = JSON.parse(localStorage.getItem('pokedexUsers') || '[]');
      const user = users.find(u => u.email === formData.email);

      if (user && user.password === formData.password) {
        const { password, ...userWithoutPassword } = user;
        dispatch(loginSuccess(userWithoutPassword));
        dispatch(loadTeams(user.id));
        navigate('/');
      } else {
        dispatch(loginFailure(t('login.invalidCredentials')));
      }
    }, 1000);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('login.title')}</h1>
        
        <div className={styles.pokemonLogoContainer}>
          <img src="/pokemon-logo.png" alt="Pokemon Logo" className={styles.pokemonLogo} />
        </div>
        
        {typeof error === 'string' && error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">{t('login.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('login.emailPlaceholder')}
              disabled={Boolean(loading)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">{t('login.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('login.passwordPlaceholder')}
              disabled={Boolean(loading)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={Boolean(loading)}
          >
            {loading ? t('common.loading') : t('login.loginButton')}
          </button>
        </form>
        
        <div className={styles.registerLink}>
          <p>{t('login.newUser')} <Link to="/register">{t('login.registerNow')}</Link></p>
        </div>
        
        <div className={styles.guestLink}>
          <Link to="/" className={styles.asGuestLink}>{t('login.continueAsGuest')}</Link>
        </div>
      </div>
      
      <div className={styles.imageContainer}>
        <div className={styles.imageOverlay}></div>
      </div>
    </div>
  );
};

export default LoginPage; 