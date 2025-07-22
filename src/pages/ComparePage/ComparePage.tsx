import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import PokemonSearch from '../../components/PokemonSearch/PokemonSearch';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ComparePage.module.css';

const ComparePage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState(null);
  const [error2, setError2] = useState(null);

  // Obtener IDs de los Pokémon de los parámetros de URL
  const id1 = searchParams.get('pokemon1');
  const id2 = searchParams.get('pokemon2');

  // Cargar datos del primer Pokémon si existe ID en URL
  useEffect(() => {
    const fetchPokemon1 = async () => {
      if (!id1) {
        setPokemon1(null);
        return;
      }
      
      setLoading1(true);
      setError1(null);
      
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id1}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const pokemonData = await response.json();
        
        // Obtener descripción del Pokémon
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        
        setPokemon1({
          ...pokemonData,
          description: getDescription(speciesData)
        });
      } catch (error) {
        console.error('Error fetching Pokémon 1:', error);
        setError1(error.message);
      } finally {
        setLoading1(false);
      }
    };

    fetchPokemon1();
  }, [id1]);

  // Cargar datos del segundo Pokémon si existe ID en URL
  useEffect(() => {
    const fetchPokemon2 = async () => {
      if (!id2) {
        setPokemon2(null);
        return;
      }
      
      setLoading2(true);
      setError2(null);
      
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id2}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const pokemonData = await response.json();
        
        // Obtener descripción del Pokémon
        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();
        
        setPokemon2({
          ...pokemonData,
          description: getDescription(speciesData)
        });
      } catch (error) {
        console.error('Error fetching Pokémon 2:', error);
        setError2(error.message);
      } finally {
        setLoading2(false);
      }
    };

    fetchPokemon2();
  }, [id2]);

  // Función para obtener la descripción en el idioma actual
  const getDescription = (speciesData) => {
    const englishEntries = speciesData.flavor_text_entries.filter(
      entry => entry.language.name === 'en'
    );
    
    if (englishEntries.length > 0) {
      return englishEntries[0].flavor_text.replace(/\f/g, ' ');
    }
    
    return t('pokemon.noDescription');
  };

  // Manejar la selección del primer Pokémon
  const handleSelectPokemon1 = (pokemon) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('pokemon1', pokemon.id);
      return newParams;
    });
  };

  // Manejar la selección del segundo Pokémon
  const handleSelectPokemon2 = (pokemon) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('pokemon2', pokemon.id);
      return newParams;
    });
  };

  // Calcular diferencia de stats para mostrar comparación
  const getStatDifference = (stat1, stat2) => {
    if (!stat1 || !stat2) return 0;
    return stat1 - stat2;
  };

  // Determinar el ganador de una batalla simulada
  const calculateBattleWinner = () => {
    if (!pokemon1 || !pokemon2) return null;
    
    let score1 = 0;
    let score2 = 0;
    
    // Comparación simple basada en stats totales ponderados
    const stats1 = pokemon1.stats;
    const stats2 = pokemon2.stats;
    
    // HP tiene peso 1
    score1 += stats1[0].base_stat;
    score2 += stats2[0].base_stat;
    
    // Ataque y Defensa tienen peso 1.1
    score1 += stats1[1].base_stat * 1.1; // Ataque
    score2 += stats2[1].base_stat * 1.1;
    score1 += stats1[2].base_stat * 1.1; // Defensa
    score2 += stats2[2].base_stat * 1.1;
    
    // Ataque Especial y Defensa Especial tienen peso 1.2
    score1 += stats1[3].base_stat * 1.2; // Sp. Atk
    score2 += stats2[3].base_stat * 1.2;
    score1 += stats1[4].base_stat * 1.2; // Sp. Def
    score2 += stats2[4].base_stat * 1.2;
    
    // Velocidad tiene peso 1.3
    score1 += stats1[5].base_stat * 1.3;
    score2 += stats2[5].base_stat * 1.3;
    
    // Calcular total
    const total1 = Math.round(score1);
    const total2 = Math.round(score2);
    
    return {
      winner: total1 > total2 ? 1 : (total2 > total1 ? 2 : 0),
      score1: total1,
      score2: total2,
      difference: Math.abs(total1 - total2)
    };
  };

  // Renderizar barra de stats con comparación
  const renderStatBar = (statName, value1, value2) => {
    const maxValue = 255; // Valor máximo posible para stats de Pokémon
    const percent1 = (value1 / maxValue) * 100;
    const percent2 = (value2 / maxValue) * 100;
    const diff = getStatDifference(value1, value2);
    
    return (
      <div className={styles.statRow}>
        <div className={styles.statName}>{statName}</div>
        
        <div className={styles.statBarContainer}>
          <div className={`${styles.statBar} ${styles.statBar1}`} style={{ width: `${percent1}%` }}>
            <span className={styles.statValue}>{value1}</span>
          </div>
        </div>
        
        <div className={styles.statDiff}>
          {diff > 0 ? (
            <span className={styles.better}>+{diff}</span>
          ) : diff < 0 ? (
            <span className={styles.worse}>{diff}</span>
          ) : (
            <span className={styles.equal}>=</span>
          )}
        </div>
        
        <div className={styles.statBarContainer}>
          <div className={`${styles.statBar} ${styles.statBar2}`} style={{ width: `${percent2}%` }}>
            <span className={styles.statValue}>{value2}</span>
          </div>
        </div>
      </div>
    );
  };

  // Calcular resultado de batalla
  const battleResult = calculateBattleWinner();

  return (
    <div className={styles.comparePage}>
      <h1 className={styles.title}>{t('compare.title')}</h1>
      
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <h2>{t('compare.selectPokemon1')}</h2>
          <PokemonSearch 
            onSelectPokemon={handleSelectPokemon1} 
            className={styles.search}
          />
        </div>
        
        <div className={styles.searchBox}>
          <h2>{t('compare.selectPokemon2')}</h2>
          <PokemonSearch 
            onSelectPokemon={handleSelectPokemon2}
            className={styles.search}
          />
        </div>
      </div>
      
      {(loading1 || loading2) && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      )}
      
      {(error1 || error2) && (
        <div className={styles.errorContainer}>
          {error1 && <p className={styles.error}>{error1}</p>}
          {error2 && <p className={styles.error}>{error2}</p>}
        </div>
      )}
      
      {pokemon1 && pokemon2 && !loading1 && !loading2 && (
        <>
          <div className={styles.comparison}>
            <div className={styles.pokemonCard}>
              <img 
                src={pokemon1.sprites.other['official-artwork'].front_default || pokemon1.sprites.front_default} 
                alt={pokemon1.name} 
                className={styles.pokemonImage}
              />
              <h2 className={styles.pokemonName}>
                {pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)} 
                <span className={styles.pokemonId}>#{pokemon1.id}</span>
              </h2>
              
              <div className={styles.types}>
                {pokemon1.types.map(type => (
                  <span 
                    key={type.type.name} 
                    className={`${styles.type} ${styles[type.type.name]}`}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
              
              <p className={styles.description}>{pokemon1.description}</p>
              
              <div className={styles.basicInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('pokemon.height')}</span>
                  <span>{(pokemon1.height / 10).toFixed(1)}m</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('pokemon.weight')}</span>
                  <span>{(pokemon1.weight / 10).toFixed(1)}kg</span>
                </div>
              </div>
            </div>
            
            <div className={styles.vsContainer}>
              <div className={styles.vsCircle}>VS</div>
              
              {battleResult && (
                <div className={styles.battleResult}>
                  <h3>{t('compare.battleSimulation')}</h3>
                  <div className={styles.battleScore}>
                    <span className={styles.score1}>{battleResult.score1}</span>
                    <span className={styles.versus}>vs</span>
                    <span className={styles.score2}>{battleResult.score2}</span>
                  </div>
                  
                  <div className={styles.winner}>
                    {battleResult.winner === 0 ? (
                      <p>{t('compare.draw')}</p>
                    ) : (
                      <p>
                        {t('compare.winner')}: 
                        <span className={battleResult.winner === 1 ? styles.winner1 : styles.winner2}>
                          {battleResult.winner === 1 
                            ? pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)
                            : pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)
                          }
                        </span>
                        <span className={styles.winMargin}>
                          ({battleResult.difference} {t('compare.points')})
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.pokemonCard}>
              <img 
                src={pokemon2.sprites.other['official-artwork'].front_default || pokemon2.sprites.front_default} 
                alt={pokemon2.name} 
                className={styles.pokemonImage}
              />
              <h2 className={styles.pokemonName}>
                {pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)}
                <span className={styles.pokemonId}>#{pokemon2.id}</span>
              </h2>
              
              <div className={styles.types}>
                {pokemon2.types.map(type => (
                  <span 
                    key={type.type.name} 
                    className={`${styles.type} ${styles[type.type.name]}`}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
              
              <p className={styles.description}>{pokemon2.description}</p>
              
              <div className={styles.basicInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('pokemon.height')}</span>
                  <span>{(pokemon2.height / 10).toFixed(1)}m</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('pokemon.weight')}</span>
                  <span>{(pokemon2.weight / 10).toFixed(1)}kg</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.statsComparison}>
            <h2>{t('compare.statsComparison')}</h2>
            
            {renderStatBar(t('pokemon.hp'), 
              pokemon1.stats[0].base_stat, 
              pokemon2.stats[0].base_stat
            )}
            
            {renderStatBar(t('pokemon.attack'), 
              pokemon1.stats[1].base_stat, 
              pokemon2.stats[1].base_stat
            )}
            
            {renderStatBar(t('pokemon.defense'), 
              pokemon1.stats[2].base_stat, 
              pokemon2.stats[2].base_stat
            )}
            
            {renderStatBar(t('pokemon.spAtk'), 
              pokemon1.stats[3].base_stat, 
              pokemon2.stats[3].base_stat
            )}
            
            {renderStatBar(t('pokemon.spDef'), 
              pokemon1.stats[4].base_stat, 
              pokemon2.stats[4].base_stat
            )}
            
            {renderStatBar(t('pokemon.speed'), 
              pokemon1.stats[5].base_stat, 
              pokemon2.stats[5].base_stat
            )}
            
            {renderStatBar(t('compare.total'), 
              pokemon1.stats.reduce((total, stat) => total + stat.base_stat, 0),
              pokemon2.stats.reduce((total, stat) => total + stat.base_stat, 0)
            )}
          </div>
          
          <div className={styles.abilitiesComparison}>
            <h2>{t('compare.abilitiesComparison')}</h2>
            
            <div className={styles.abilitiesContainer}>
              <div className={styles.abilitiesList}>
                <h3>{pokemon1.name.charAt(0).toUpperCase() + pokemon1.name.slice(1)}</h3>
                <ul>
                  {pokemon1.abilities.map(ability => (
                    <li key={ability.ability.name}>
                      {ability.ability.name.replace('-', ' ')}
                      {ability.is_hidden && <span className={styles.hidden}> {t('pokemon.hidden')}</span>}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.abilitiesList}>
                <h3>{pokemon2.name.charAt(0).toUpperCase() + pokemon2.name.slice(1)}</h3>
                <ul>
                  {pokemon2.abilities.map(ability => (
                    <li key={ability.ability.name}>
                      {ability.ability.name.replace('-', ' ')}
                      {ability.is_hidden && <span className={styles.hidden}> {t('pokemon.hidden')}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
      
      {(!pokemon1 || !pokemon2) && !loading1 && !loading2 && (
        <div className={styles.instruction}>
          <p>{t('compare.instruction')}</p>
        </div>
      )}
    </div>
  );
};

export default ComparePage; 