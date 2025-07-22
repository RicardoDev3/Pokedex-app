import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { registerStart, registerSuccess, registerFailure, selectIsAuthenticated, selectAuthError, selectAuthLoading } from '../../features/auth/authSlice';
import { loadTeams } from '../../features/teams/teamsSlice';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const error = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      dispatch(registerFailure(t('register.fillAllFields')));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      dispatch(registerFailure(t('register.passwordsDoNotMatch')));
      return;
    }

    if (formData.password.length < 6) {
      dispatch(registerFailure(t('register.passwordTooShort')));
      return;
    }

    dispatch(registerStart());

    // Simular una llamada a una API
    setTimeout(() => {
      // Comprobar si el usuario ya existe
      const users = JSON.parse(localStorage.getItem('pokedexUsers') || '[]');
      const emailExists = users.some(u => u.email === formData.email);

      if (emailExists) {
        dispatch(registerFailure(t('register.emailAlreadyExists')));
        return;
      }

      // Crear nuevo usuario
      const newUser = {
        id: uuidv4(),
        username: formData.username,
        email: formData.email,
        password: formData.password, // En una app real, esto estaría hasheado
        createdAt: new Date().toISOString()
      };

      // Guardar usuario en localStorage (simulando BD)
      localStorage.setItem('pokedexUsers', JSON.stringify([...users, newUser]));

      // Guardar en Redux sin la contraseña
      const { password, ...userWithoutPassword } = newUser;
      dispatch(registerSuccess(userWithoutPassword));
      dispatch(loadTeams(newUser.id));
      navigate('/');
    }, 1000);
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('register.title')}</h1>
        
        <div className={styles.pokemonLogoContainer}>
          <img src="/pokemon-logo.png" alt="Pokemon Logo" className={styles.pokemonLogo} />
        </div>
        
        {typeof error === 'string' && error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">{t('register.username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder={t('register.usernamePlaceholder')}
              disabled={Boolean(loading)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email">{t('register.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('register.emailPlaceholder')}
              disabled={Boolean(loading)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">{t('register.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('register.passwordPlaceholder')}
              disabled={Boolean(loading)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder={t('register.confirmPasswordPlaceholder')}
              disabled={Boolean(loading)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.registerButton}
            disabled={Boolean(loading)}
          >
            {loading ? t('common.loading') : t('register.registerButton')}
          </button>
        </form>
        
        <div className={styles.loginLink}>
          <p>{t('register.alreadyHaveAccount')} <Link to="/login">{t('register.loginNow')}</Link></p>
        </div>
        
        <div className={styles.guestLink}>
          <Link to="/" className={styles.asGuestLink}>{t('register.continueAsGuest')}</Link>
        </div>
      </div>
      
      <div className={styles.imageContainer}>
        <div className={styles.imageOverlay}></div>
      </div>
    </div>
  );
};

export default RegisterPage; 