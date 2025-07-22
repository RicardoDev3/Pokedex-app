import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import styles from './BattleTeamPage.module.css';

interface PokemonType {
  type: {
    name: string;
  };
}

interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  stats: PokemonStat[];
  types: PokemonType[];
}

const BattleTeamPage: React.FC = () => {
  const { t } = useTranslation();
  const { battleTeam, removeFromBattleTeam } = useFavorites() as {
    battleTeam: number[];
    removeFromBattleTeam: (id: number) => void;
  };
  const [teamPokemon, setTeamPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamPokemon = async () => {
      if (battleTeam.length === 0) {
        setTeamPokemon([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const pokemonPromises = battleTeam.map(async (id) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          if (!response.ok) {
            throw new Error(`Error fetching pokemon with ID ${id}`);
          }
          return response.json();
        });

        const pokemonData = await Promise.all(pokemonPromises);
        setTeamPokemon(pokemonData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamPokemon();
  }, [battleTeam]);

  const handleRemoveFromTeam = (id: number) => {
    removeFromBattleTeam(id);
  };

  const renderTeamStats = () => {
    if (teamPokemon.length === 0) return null;

    // Calculamos los totales para cada tipo de estadística
    const statTotals: Record<string, number> = {
      hp: 0,
      attack: 0,
      defense: 0,
      'special-attack': 0,
      'special-defense': 0,
      speed: 0
    };

    // Recolectamos todos los tipos del equipo
    const teamTypes = new Set<string>();

    teamPokemon.forEach(pokemon => {
      pokemon.stats.forEach(stat => {
        statTotals[stat.stat.name] += stat.base_stat;
      });

      pokemon.types.forEach(type => {
        teamTypes.add(type.type.name);
      });
    });

    // Calcular el promedio dividiendo por el número de Pokémon en el equipo
    const statAverages = Object.keys(statTotals).reduce((averages, statName) => {
      averages[statName] = Math.round(statTotals[statName] / teamPokemon.length);
      return averages;
    }, {} as Record<string, number>);

    // Convertir los tipos a un array para renderizar
    const uniqueTypes = Array.from(teamTypes);

    return (
      <div className={styles.teamStats}>
        <h2>{t('battleTeam.teamStats')}</h2>
        
        <div className={styles.statsContainer}>
          <div className={styles.statColumn}>
            <h3>{t('battleTeam.averageStats')}</h3>
            <div className={styles.statsList}>
              {Object.entries(statAverages).map(([statName, value]) => (
                <div key={statName} className={styles.statItem}>
                  <span className={styles.statName}>
                    {statName === 'hp' ? 'HP' : 
                     statName === 'attack' ? t('pokemon.attack') :
                     statName === 'defense' ? t('pokemon.defense') :
                     statName === 'special-attack' ? t('pokemon.spAtk') :
                     statName === 'special-defense' ? t('pokemon.spDef') :
                     t('pokemon.speed')}
                  </span>
                  <div className={styles.statBarContainer}>
                    <div 
                      className={styles.statBar} 
                      style={{ width: `${Math.min(100, (value / 150) * 100)}%` }}
                    ></div>
                  </div>
                  <span className={styles.statValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.typesColumn}>
            <h3>{t('battleTeam.teamTypes')}</h3>
            <div className={styles.typesList}>
              {uniqueTypes.map(type => (
                <span 
                  key={type} 
                  className={`${styles.typeTag} ${styles[type]}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.battleTeamPage}>
      <h1 className={styles.title}>{t('battleTeam.title')}</h1>
      
      {loading ? (
        <div className={styles.loading}>{t('common.loading')}</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          {battleTeam.length === 0 ? (
            <div className={styles.emptyTeam}>
              <h2>{t('battleTeam.emptyTeam')}</h2>
              <p>{t('battleTeam.emptyTeamDescription')}</p>
              <Link to="/" className={styles.findPokemonBtn}>
                {t('battleTeam.findPokemon')}
              </Link>
            </div>
          ) : (
            <>
              {renderTeamStats()}
              
              <div className={styles.teamGrid}>
                {teamPokemon.map(pokemon => (
                  <div key={pokemon.id} className={styles.pokemonCard}>
                    <Link to={`/pokemon/${pokemon.id}`} className={styles.pokemonLink}>
                      <div className={styles.imageContainer}>
                        <img
                          src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                          alt={pokemon.name}
                          className={styles.pokemonImage}
                        />
                      </div>
                      <div className={styles.pokemonInfo}>
                        <h3 className={styles.pokemonName}>
                          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </h3>
                        <p className={styles.pokemonNumber}>#{pokemon.id.toString().padStart(3, '0')}</p>
                        <div className={styles.typesContainer}>
                          {pokemon.types.map(type => (
                            <span 
                              key={type.type.name} 
                              className={`${styles.typeTag} ${styles[type.type.name]}`}
                            >
                              {type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                    <button 
                      className={styles.removeButton}
                      onClick={() => handleRemoveFromTeam(pokemon.id)}
                      aria-label={t('battleTeam.remove')}
                    >
                      {t('battleTeam.remove')}
                    </button>
                  </div>
                ))}
                
                {/* Slots vacíos si el equipo no está completo */}
                {Array.from({ length: 6 - battleTeam.length }).map((_, index) => (
                  <div key={`empty-${index}`} className={`${styles.pokemonCard} ${styles.emptySlot}`}>
                    <div className={styles.emptySlotContent}>
                      <span className={styles.emptySlotPlus}>+</span>
                      <p>{t('battleTeam.emptySlot')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BattleTeamPage; 