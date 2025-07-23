import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PokemonSearch from "../../components/PokemonSearch/PokemonSearch";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./RegionMapPage.module.css";

const RegionMapPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pokemon, setPokemon] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [regions, setRegions] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);

  // Obtener ID del Pokémon de los parámetros de URL
  const pokemonId = searchParams.get("pokemon");

  // Cargar datos del Pokémon
  useEffect(() => {
    const fetchPokemonData = async () => {
      if (!pokemonId) {
        setPokemon(null);
        setLocations([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Obtener datos básicos del Pokémon
        const pokemonResponse = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
        );

        if (!pokemonResponse.ok) {
          throw new Error(
            `Error ${pokemonResponse.status}: ${pokemonResponse.statusText}`
          );
        }

        const pokemonData = await pokemonResponse.json();
        setPokemon(pokemonData);

        // Obtener ubicaciones
        await fetchPokemonLocations(pokemonData.id);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonData();
  }, [pokemonId]);

  // Función para obtener todas las ubicaciones del pokémon
  const fetchPokemonLocations = async (id) => {
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${id}/encounters`
      );
      const locationsData = await response.json();

      if (locationsData.length === 0) {
        setLocations([]);
        setRegions([]);
        return;
      }

      // Obtener detalles de cada ubicación
      const detailedLocations = await Promise.all(
        locationsData.map(async (locationData) => {
          const locationResponse = await fetch(locationData.location_area.url);
          const locationDetail = await locationResponse.json();

          // Obtener detalles de la ubicación principal
          const mainLocationResponse = await fetch(locationDetail.location.url);
          const mainLocationDetail = await mainLocationResponse.json();

          // Obtener la región a la que pertenece esta ubicación
          const regionResponse = await fetch(mainLocationDetail.region.url);
          const regionDetail = await regionResponse.json();

          return {
            id: locationDetail.id,
            name: locationDetail.name.replace(/-/g, " "),
            location: mainLocationDetail.name.replace(/-/g, " "),
            region: {
              id: regionDetail.id,
              name: regionDetail.name,
              displayName:
                regionDetail.names.find((n) => n.language.name === "en")
                  ?.name || regionDetail.name,
            },
            encounter_details: locationData.version_details.map((detail) => ({
              version: detail.version.name,
              max_chance: detail.max_chance,
              encounter_details: detail.encounter_details.map((encounter) => ({
                method: encounter.method.name,
                min_level: encounter.min_level,
                max_level: encounter.max_level,
                chance: encounter.chance,
              })),
            })),
          };
        })
      );

      // Extraer todas las regiones únicas
      const uniqueRegions = Array.from(
        new Set(detailedLocations.map((loc) => loc.region.id))
      ).map((regionId) => {
        const location = detailedLocations.find(
          (loc) => loc.region.id === regionId
        );
        return {
          id: regionId,
          name: location.region.name,
          displayName: location.region.displayName,
        };
      });

      setLocations(detailedLocations);
      setRegions(uniqueRegions);

      // Seleccionar la primera región por defecto si no hay región seleccionada
      if (selectedRegion === "all" && uniqueRegions.length > 0) {
        setSelectedRegion(uniqueRegions[0].name);
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      setLocations([]);
      setRegions([]);
    }
  };

  // Manejar selección de Pokémon
  const handleSelectPokemon = (selectedPokemon) => {
    setSearchParams({ pokemon: selectedPokemon.id });
  };

  // Cambiar región seleccionada
  const handleRegionChange = (regionName) => {
    setSelectedRegion(regionName);
  };

  // Filtrar ubicaciones por región seleccionada
  const filteredLocations =
    selectedRegion === "all"
      ? locations
      : locations.filter((loc) => loc.region.name === selectedRegion);

  // Limitar el número de ubicaciones mostradas a menos que se solicite ver todas
  const displayedLocations = showAllLocations
    ? filteredLocations
    : filteredLocations.slice(0, 8);

  // Función para renderizar el mapa de la región
  const renderRegionMap = () => {
    if (!pokemon || regions.length === 0) return null;

    const region = regions.find((r) => r.name === selectedRegion);
    if (!region) return null;

    // Obtener la imagen del mapa según la región
    const normalizedRegionName = region.name.toLowerCase().replace(/\s+/g, "-");
    const mapImage = `/maps/${normalizedRegionName}.png`;

    return (
      <div className={styles.mapContainer}>
        <div className={styles.mapHeader}>
          <h2 className={styles.mapTitle}>
            {region.displayName} {t("region.region")}
          </h2>
          <p className={styles.mapDescription}>
            {t("region.locationsFound", { count: filteredLocations.length })}
          </p>
        </div>

        <div className={styles.mapWrapper}>
          <img
            src={mapImage}
            alt={`${region.displayName} map`}
            className={styles.regionMap}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/maps/default-map.png";
            }}
          />

          {/* Render location markers */}
          {filteredLocations.map((location, index) => (
            <div
              key={location.id}
              className={styles.locationMarker}
              style={{
                // Posiciones simuladas para las ubicaciones en el mapa
                // En una implementación real, estas serían coordenadas precisas
                left: `${15 + (index % 6) * 10}%`,
                top: `${20 + Math.floor(index / 6) * 15}%`,
              }}
              title={location.location}
            >
              <div className={styles.markerDot}></div>
              <div className={styles.markerTooltip}>
                <p className={styles.locationName}>{location.location}</p>
                <p className={styles.encounterDetails}>
                  {t("region.levels")}: {getMinMaxLevels(location)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Función auxiliar para obtener los niveles mínimos y máximos
  const getMinMaxLevels = (location) => {
    const levels = location.encounter_details.flatMap((detail) =>
      detail.encounter_details.map((encounter) => ({
        min: encounter.min_level,
        max: encounter.max_level,
      }))
    );

    if (levels.length === 0) return "N/A";

    const minLevel = Math.min(...levels.map((l) => l.min));
    const maxLevel = Math.max(...levels.map((l) => l.max));

    return minLevel === maxLevel ? `${minLevel}` : `${minLevel}-${maxLevel}`;
  };

  return (
    <div className={styles.regionPage}>
      <h1 className={styles.title}>{t("region.title")}</h1>

      <div className={styles.searchContainer}>
        <PokemonSearch
          onSelectPokemon={handleSelectPokemon}
          className={styles.search}
        />
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {pokemon && !loading && (
        <div className={styles.content}>
          <div className={styles.pokemonInfo}>
            <img
              src={
                pokemon.sprites.other["official-artwork"].front_default ||
                pokemon.sprites.front_default
              }
              alt={pokemon.name}
              className={styles.pokemonImage}
            />
            <div className={styles.pokemonDetails}>
              <h2 className={styles.pokemonName}>
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                <span className={styles.pokemonId}>#{pokemon.id}</span>
              </h2>

              <div className={styles.types}>
                {pokemon.types.map((type) => (
                  <span
                    key={type.type.name}
                    className={`${styles.type} ${styles[type.type.name]}`}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {locations.length > 0 ? (
            <>
              <div className={styles.regionsTabContainer}>
                <div className={styles.regionsTab}>
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      className={`${styles.regionButton} ${
                        selectedRegion === region.name ? styles.active : ""
                      }`}
                      onClick={() => handleRegionChange(region.name)}
                    >
                      {region.displayName}
                    </button>
                  ))}
                </div>
              </div>

              {renderRegionMap()}

              <div className={styles.locationsList}>
                <h3 className={styles.locationsTitle}>
                  {t("region.detailedLocations")}
                </h3>

                <div className={styles.locationsGrid}>
                  {displayedLocations.map((location) => (
                    <div key={location.id} className={styles.locationCard}>
                      <h4 className={styles.locationCardTitle}>
                        {location.location}
                      </h4>
                      <div className={styles.locationAreaName}>
                        {location.name}
                      </div>
                      <div className={styles.locationDetails}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {t("region.region")}:
                          </span>
                          <span className={styles.detailValue}>
                            {location.region.displayName}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {t("region.levels")}:
                          </span>
                          <span className={styles.detailValue}>
                            {getMinMaxLevels(location)}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>
                            {t("region.games")}:
                          </span>
                          <span className={styles.detailValue}>
                            {location.encounter_details
                              .map((detail) =>
                                detail.version.replace(/-/g, " ")
                              )
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredLocations.length > 8 && !showAllLocations && (
                  <button
                    className={styles.showMoreButton}
                    onClick={() => setShowAllLocations(true)}
                  >
                    {t("region.showMore", {
                      count: filteredLocations.length - 8,
                    })}
                  </button>
                )}

                {showAllLocations && filteredLocations.length > 8 && (
                  <button
                    className={styles.showLessButton}
                    onClick={() => setShowAllLocations(false)}
                  >
                    {t("region.showLess")}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className={styles.noLocations}>
              <p>{t("pokemon.noLocations")}</p>
            </div>
          )}
        </div>
      )}

      {!pokemon && !loading && !error && (
        <div className={styles.instruction}>
          <div className={styles.instructionIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="48"
              height="48"
            >
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z" />
            </svg>
          </div>
          <p>{t("region.searchInstruction")}</p>
        </div>
      )}
    </div>
  );
};

export default RegionMapPage;
