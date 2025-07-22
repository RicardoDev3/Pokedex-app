import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './EvolutionPage.module.css';

const EvolutionPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemonAndEvolution = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Paso 1: Obtener datos básicos del Pokémon
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        
        if (!pokemonResponse.ok) {
          throw new Error(`Error ${pokemonResponse.status}: ${pokemonResponse.statusText}`);
        }
        
        const pokemonData = await pokemonResponse.json();
        setPokemon(pokemonData);
        
        // Paso 2: Obtener especies del Pokémon (contiene el ID de la cadena evolutiva)
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        
        // Paso 3: Obtener la cadena evolutiva
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        
        // Procesar la cadena de evolución en formato plano
        const processedChain = await processEvolutionChain(evolutionData.chain);
        setEvolutionChain(processedChain);
      } catch (error) {
        console.error('Error fetching Pokémon evolution data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPokemonAndEvolution();
  }, [id]);

  // Función para procesar la cadena de evolución recursivamente
  const processEvolutionChain = async (chain) => {
    // Array para almacenar todas las evoluciones procesadas
    const evolutionData = [];
    
    // Función recursiva para extraer evoluciones
    const extractEvolutions = async (current, level = 0, parent = null) => {
      // Obtener datos detallados del Pokémon en esta etapa
      const pokemonUrl = current.species.url.replace('-species', '');
      const numberMatch = pokemonUrl.match(/\/pokemon-species\/(\d+)\//);
      const pokemonId = numberMatch ? numberMatch[1] : null;
      
      let pokemonDetails = null;
      
      try {
        const detailResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        pokemonDetails = await detailResponse.json();
      } catch (error) {
        console.error(`Error fetching details for Pokémon ${pokemonId}:`, error);
      }
      
      // Extraer condiciones de evolución
      const evolutionDetails = current.evolution_details[0] || {};
      
      // Crear objeto con la información de esta evolución
      const evolution = {
        id: pokemonId,
        name: current.species.name,
        sprite: pokemonDetails ? 
          (pokemonDetails.sprites.other['official-artwork'].front_default || pokemonDetails.sprites.front_default) 
          : null,
        level,
        parent,
        types: pokemonDetails ? pokemonDetails.types.map(t => t.type.name) : [],
        evolution_condition: getEvolutionCondition(evolutionDetails),
        stats: pokemonDetails ? pokemonDetails.stats.map(s => ({
          name: s.stat.name,
          value: s.base_stat
        })) : []
      };
      
      evolutionData.push(evolution);
      
      // Llamar recursivamente para cada evolución
      if (current.evolves_to && current.evolves_to.length > 0) {
        for (const evolve of current.evolves_to) {
          await extractEvolutions(evolve, level + 1, pokemonId);
        }
      }
    };
    
    // Iniciar procesamiento recursivo
    await extractEvolutions(chain);
    
    return evolutionData;
  };

  // Función para obtener la condición de evolución
  const getEvolutionCondition = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return { type: 'base', description: 'Base form' };
    }
    
    if (details.min_level) {
      return { 
        type: 'level', 
        description: `Level ${details.min_level}` 
      };
    }
    
    if (details.item) {
      return { 
        type: 'item', 
        description: `Use ${details.item.name.replace('-', ' ')}`,
        item: details.item.name
      };
    }
    
    if (details.trigger && details.trigger.name === 'trade') {
      let desc = 'Trade';
      if (details.held_item) {
        desc += ` holding ${details.held_item.name.replace('-', ' ')}`;
      }
      return { type: 'trade', description: desc };
    }
    
    if (details.min_happiness) {
      return { type: 'happiness', description: `Happiness ≥ ${details.min_happiness}` };
    }
    
    if (details.time_of_day) {
      return { type: 'time', description: `Level up during ${details.time_of_day}` };
    }
    
    if (details.known_move) {
      return { type: 'move', description: `Knows move ${details.known_move.name.replace('-', ' ')}` };
    }
    
    if (details.min_beauty) {
      return { type: 'beauty', description: `Beauty ≥ ${details.min_beauty}` };
    }
    
    if (details.min_affection) {
      return { type: 'affection', description: `Affection ≥ ${details.min_affection}` };
    }
    
    if (details.location) {
      return { type: 'location', description: `Level up at ${details.location.name.replace('-', ' ')}` };
    }
    
    // Si hay alguna condición desconocida o mixta
    return { type: 'other', description: 'Special conditions' };
  };

  // Renderizar grupo de evoluciones del mismo nivel
  const renderEvolutionGroup = (level) => {
    if (!evolutionChain) return null;
    
    const evolutions = evolutionChain.filter(evo => evo.level === level);
    
    return (
      <div className={styles.evolutionGroup}>
        {evolutions.map(evolution => (
          <div key={evolution.id} className={styles.evolutionCard}>
            <img 
              src={evolution.sprite} 
              alt={evolution.name} 
              className={styles.pokemonSprite}
            />
            <div className={styles.evolutionInfo}>
              <h3 className={styles.pokemonName}>
                {evolution.name.charAt(0).toUpperCase() + evolution.name.slice(1)}
                <span className={styles.pokemonId}>#{evolution.id}</span>
              </h3>
              
              <div className={styles.types}>
                {evolution.types.map(type => (
                  <span 
                    key={type} 
                    className={`${styles.type} ${styles[type]}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
              
              {evolution.level > 0 && (
                <div className={styles.evolutionCondition}>
                  <span className={styles.conditionLabel}>{t('evolution.condition')}:</span>
                  <span className={styles.conditionValue}>{evolution.evolution_condition.description}</span>
                </div>
              )}
              
              <div className={styles.statsPreview}>
                {evolution.stats.slice(0, 3).map(stat => (
                  <div key={stat.name} className={styles.statItem}>
                    <span className={styles.statName}>
                      {stat.name === 'hp' && t('pokemon.hp')}
                      {stat.name === 'attack' && t('pokemon.attack')}
                      {stat.name === 'defense' && t('pokemon.defense')}
                    </span>
                    <span className={styles.statValue}>{stat.value}</span>
                  </div>
                ))}
              </div>
              
              <Link to={`/pokemon/${evolution.id}`} className={styles.viewButton}>
                {t('evolution.viewDetails')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar flechas entre grupos de evoluciones
  const renderEvolutionArrow = () => {
    return (
      <div className={styles.evolutionArrow}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M5 13h11.17l-4.88 4.88c-.39.39-.39 1.03 0 1.42.39.39 1.02.39 1.41 0l6.59-6.59c.39-.39.39-1.02 0-1.41l-6.58-6.6c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L16.17 11H5c-.55 0-1 .45-1 1s.45 1 1 1z" />
        </svg>
      </div>
    );
  };

  // Determinar cuántos niveles de evolución hay en la cadena
  const getMaxEvolutionLevel = () => {
    if (!evolutionChain) return 0;
    return Math.max(...evolutionChain.map(evo => evo.level));
  };

  return (
    <div className={styles.evolutionPage}>
      <div className={styles.header}>
        <button 
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z" />
          </svg>
          {t('common.back')}
        </button>
        
        <h1 className={styles.title}>
          {pokemon ? (
            <>
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} {t('evolution.chain')}
            </>
          ) : (
            t('evolution.title')
          )}
        </h1>
      </div>
      
      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      )}
      
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')}
            className={styles.homeButton}
          >
            {t('notFound.homeLink')}
          </button>
        </div>
      )}
      
      {!loading && !error && evolutionChain && (
        <div className={styles.evolutionChain}>
          {/* Renderizar cada nivel de evolución con flechas entre ellos */}
          {renderEvolutionGroup(0)}
          
          {getMaxEvolutionLevel() >= 1 && (
            <>
              {renderEvolutionArrow()}
              {renderEvolutionGroup(1)}
            </>
          )}
          
          {getMaxEvolutionLevel() >= 2 && (
            <>
              {renderEvolutionArrow()}
              {renderEvolutionGroup(2)}
            </>
          )}
        </div>
      )}
      
      {!loading && !error && evolutionChain && evolutionChain.length > 0 && (
        <div className={styles.statsComparison}>
          <h2 className={styles.statsTitle}>{t('evolution.statsComparison')}</h2>
          <div className={styles.statsTable}>
            <div className={styles.statsHeader}>
              <div className={styles.statNameHeader}>{t('evolution.stat')}</div>
              {evolutionChain.map(evo => (
                <div key={evo.id} className={styles.pokemonColumn}>
                  {evo.name.charAt(0).toUpperCase() + evo.name.slice(1)}
                </div>
              ))}
            </div>
            
            {/* HP */}
            <div className={styles.statsRow}>
              <div className={styles.statName}>{t('pokemon.hp')}</div>
              {evolutionChain.map(evo => {
                const hpStat = evo.stats.find(s => s.name === 'hp');
                return (
                  <div key={evo.id} className={styles.statValueCell}>
                    <div className={styles.statValueBar} style={{ width: `${(hpStat?.value / 255) * 100}%` }}>
                      {hpStat?.value || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Attack */}
            <div className={styles.statsRow}>
              <div className={styles.statName}>{t('pokemon.attack')}</div>
              {evolutionChain.map(evo => {
                const attackStat = evo.stats.find(s => s.name === 'attack');
                return (
                  <div key={evo.id} className={styles.statValueCell}>
                    <div className={styles.statValueBar} style={{ width: `${(attackStat?.value / 255) * 100}%` }}>
                      {attackStat?.value || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Defense */}
            <div className={styles.statsRow}>
              <div className={styles.statName}>{t('pokemon.defense')}</div>
              {evolutionChain.map(evo => {
                const defenseStat = evo.stats.find(s => s.name === 'defense');
                return (
                  <div key={evo.id} className={styles.statValueCell}>
                    <div className={styles.statValueBar} style={{ width: `${(defenseStat?.value / 255) * 100}%` }}>
                      {defenseStat?.value || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Special Attack */}
            <div className={styles.statsRow}>
              <div className={styles.statName}>{t('pokemon.spAtk')}</div>
              {evolutionChain.map(evo => {
                const spAtkStat = evo.stats.find(s => s.name === 'special-attack');
                return (
                  <div key={evo.id} className={styles.statValueCell}>
                    <div className={styles.statValueBar} style={{ width: `${(spAtkStat?.value / 255) * 100}%` }}>
                      {spAtkStat?.value || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Special Defense */}
            <div className={styles.statsRow}>
              <div className={styles.statName}>{t('pokemon.spDef')}</div>
              {evolutionChain.map(evo => {
                const spDefStat = evo.stats.find(s => s.name === 'special-defense');
                return (
                  <div key={evo.id} className={styles.statValueCell}>
                    <div className={styles.statValueBar} style={{ width: `${(spDefStat?.value / 255) * 100}%` }}>
                      {spDefStat?.value || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Speed */}
            <div className={styles.statsRow}>
              <div className={styles.statName}>{t('pokemon.speed')}</div>
              {evolutionChain.map(evo => {
                const speedStat = evo.stats.find(s => s.name === 'speed');
                return (
                  <div key={evo.id} className={styles.statValueCell}>
                    <div className={styles.statValueBar} style={{ width: `${(speedStat?.value / 255) * 100}%` }}>
                      {speedStat?.value || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Total */}
            <div className={styles.statsRow}>
              <div className={styles.statName}>{t('compare.total')}</div>
              {evolutionChain.map(evo => {
                const total = evo.stats.reduce((sum, stat) => sum + stat.value, 0);
                return (
                  <div key={evo.id} className={styles.statValueCell}>
                    <div className={styles.statValueBar} style={{ width: `${(total / 1200) * 100}%` }}>
                      {total || '?'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvolutionPage; 