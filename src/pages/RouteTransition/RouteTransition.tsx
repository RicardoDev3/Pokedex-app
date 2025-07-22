import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './RouteTransition.module.css';

const RouteTransition = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
      
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 300); // This should match the CSS transition time
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation]);

  return (
    <div className={`${styles.transitionContainer} ${styles[transitionStage]}`}>
      {children}
    </div>
  );
};

export default RouteTransition; 