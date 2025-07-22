import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout, selectUser, selectIsAuthenticated } from '../../features/auth/authSlice';
import { clearUserTeams } from '../../features/teams/teamsSlice';
import styles from './UserMenu.module.css';

const UserMenu: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser) as { id: string; username: string; email: string } | null;
  const isAuthenticated = useSelector(selectIsAuthenticated) as boolean;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Cerrar sesión y limpiar equipos del usuario
    if (user) {
      dispatch(clearUserTeams(user.id));
    }
    dispatch(logout());
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <div className={styles.userMenuContainer} ref={menuRef}>
      <button 
        className={styles.userButton} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={isAuthenticated ? t('user.toggleMenu') : t('user.login')}
      >
        {isAuthenticated ? (
          <div className={styles.userAvatar}>
            <span className={styles.userInitial}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        ) : (
          <div className={styles.loginIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5v-2.5h6v2.5l3.5-3.5-3.5-3.5v2.5h-6v-2.5l-3.5 3.5z" />
            </svg>
          </div>
        )}
      </button>

      {menuOpen && (
        <div className={styles.dropdown}>
          {isAuthenticated ? (
            <>
              <div className={styles.userInfo}>
                <p className={styles.username}>{user?.username}</p>
                <p className={styles.email}>{user?.email}</p>
              </div>
              <hr className={styles.divider} />
              <Link to="/profile" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                {t('user.profile')}
              </Link>
              <Link to="/battle-team" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M7 5h10v2h2V3c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v4h2V5zm10 14H7v-2H5v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v2zM16 13H8c-1.1 0-2 .9-2 2v2h12v-2c0-1.1-.9-2-2-2zm-4-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                {t('user.battleTeam')}
              </Link>
              <button className={styles.menuItem} onClick={handleLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                {t('user.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
                </svg>
                {t('user.login')}
              </Link>
              <Link to="/register" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                {t('user.register')}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu; 