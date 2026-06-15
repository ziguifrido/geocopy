/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  X, 
  Info, 
  Layers, 
  Compass, 
  MapPin, 
  Navigation,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Internal Modules / Types / Sub-components
import { HistoryItem, SearchPlace, MAP_LAYERS, LayerId } from './types';
import { SearchBox } from './components/SearchBox';
import { SelectedPointPanel } from './components/SelectedPointPanel';
import { ManualCoordsInput } from './components/ManualCoordsInput';
import { HistoryList } from './components/HistoryList';

/**
 * Main component of the "GeoCopy" application that offers advanced search
 * of places via the OSM Nominatim API, multiple terrain/satellite map layers,
 * quick and easy copying of geographical coordinates, and robust offline support via localStorage.
 */
export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Global State Configuration / Map Layer
  const [activeLayer, setActiveLayer] = useState<LayerId>('streets');
  const [lastNonDarkLayer, setLastNonDarkLayer] = useState<LayerId>('streets');
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCoord, setSelectedCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('geocopy_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (_) {
      return false;
    }
  });

  // Effect to sync the .dark class on HTML/Body and persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('geocopy_dark_mode', String(isDarkMode));
    } catch (_) {}

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync the map layer selection based on the active dark mode setting
  useEffect(() => {
    if (isDarkMode) {
      if (activeLayer !== 'dark') {
        setLastNonDarkLayer(activeLayer);
        setActiveLayer('dark');
      }
    } else {
      if (activeLayer === 'dark') {
        setActiveLayer(lastNonDarkLayer === 'dark' ? 'streets' : lastNonDarkLayer);
      }
    }
  }, [isDarkMode]);
  
  // Location Details and Copy States
  const [clickedAddress, setClickedAddress] = useState<string>('');
  const [reverseGeocoding, setReverseGeocoding] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Manual Coordinates Input
  const [manualLat, setManualLat] = useState<string>('');
  const [manualLng, setManualLng] = useState<string>('');
  
  // Place Search / OSM API
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchPlace[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  
  // User Clicked Coordinates History
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [locating, setLocating] = useState<boolean>(false);

  // User Tip Tooltip Display State (Persisted in LocalStorage)
  const [showTip, setShowTip] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('geocopy_show_tip');
      return saved !== null ? saved === 'true' : true;
    } catch (_) {
      return true;
    }
  });

  const handleCloseError = () => {
    setErrorMsg('');
  };

  const handleToggleTip = () => {
    const nextVal = !showTip;
    setShowTip(nextVal);
    try {
      localStorage.setItem('geocopy_show_tip', String(nextVal));
    } catch (_) {}
  };

  // Initialize Leaflet Map and assign global event listeners
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // São Paulo como coordenada inicial de fallback padrão
    const initialCenter: [number, number] = [-23.55052, -46.633308];
    const initialZoom = 12;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false // Controle de zoom configurado manualmente e posicionado em 'bottomright'
    }).setView(initialCenter, initialZoom);

    // Zoom no canto inferior direito
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Barra de Escala métrica no canto inferior esquerdo para precisão visual
    L.control.scale({
      imperial: false,
      metric: true,
      position: 'bottomleft'
    }).addTo(map);

    mapRef.current = map;

  // Helper function to recalculate the exact dimensions of Leaflet tiles
    const invalidateSizes = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    
    // Consecutive setTimeout agendas to guarantee a precise redraw flow
    const t1 = setTimeout(invalidateSizes, 100);
    const t2 = setTimeout(invalidateSizes, 400);
    const t3 = setTimeout(invalidateSizes, 1000);

    const handleResize = () => {
      invalidateSizes();
    };
    window.addEventListener('resize', handleResize);

    // Map Click Handler - Registers coordinates and resolves address details via reverse geocoding
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      selectPoint(lat, lng);
    });

    // Mouse hover trackers for the coordinates inspection toolbar
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.on('mouseout', () => {
      setHoverCoords(null);
    });

    // Geolocation detection using free IP geocoders for user convenience
    const detectApproximateLocation = async () => {
      try {
        const res = await fetch('https://freeipapi.com/api/json');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number' && data.latitude !== 0) {
            map.setView([data.latitude, data.longitude], 12);
            setTimeout(invalidateSizes, 150);
            return;
          }
        }
      } catch (err) {
        console.warn('Primary IP geocoder offline, trying fallback API...', err);
      }

      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            map.setView([data.latitude, data.longitude], 12);
            setTimeout(invalidateSizes, 150);
          }
        }
      } catch (err) {
        console.warn('Fallback IP geocoding failed, using standard center.', err);
      }
    };

    detectApproximateLocation();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Dynamically sync and render the map style layers selected by the user
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = MAP_LAYERS[activeLayer];
    const layerOptions: L.TileLayerOptions = {
      attribution: config.attribution,
      maxZoom: config.maxZoom
    };
    if (config.subdomains) {
      layerOptions.subdomains = config.subdomains;
    }

    const newLayer = L.tileLayer(config.url, layerOptions);
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;

    // Force rebuild size layouts to eliminate leaf tiling gaps
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [activeLayer]);

  // Sync the standard red map pin with the active map marker position
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedCoord) {
      const position: [number, number] = [selectedCoord.lat, selectedCoord.lng];

      const customIcon = L.divIcon({
        html: `
          <div class="relative flex flex-col items-center justify-end w-9 h-11">
            <!-- Classic Red Location Map Pin (Exact mouse point alignment) -->
            <svg viewBox="0 0 24 24" class="w-9 h-11 drop-shadow-md select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path 
                fill="#EF4444" 
                stroke="#FFFFFF" 
                stroke-width="1.5" 
                d="M12 2C7.58 2 4 5.58 4 10c0 6 8 12 8 12s8-6 8-12c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
              />
            </svg>
            <!-- Animated aura under the map pin -->
            <div class="absolute w-5 h-5 bg-red-500/40 rounded-full animate-ping left-1/2 -translate-x-1/2 top-[34px]" style="z-index: -1;"></div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [36, 44],
        iconAnchor: [18, 44] // Positioned on the exact anchor corresponding to the tip of the pin
      });

      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      } else {
        markerRef.current = L.marker(position, { icon: customIcon }).addTo(map);
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [selectedCoord]);

  // Load persisted coordinates history
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gmaps_coord_history');
      if (stored) {
        setHistoryList(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading persisted history:', e);
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    setHistoryList(items);
    try {
      localStorage.setItem('gmaps_coord_history', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving persisted history:', e);
    }
  };

  // Reverse geocode latitude and longitude to a real address string using the OSM Nominatim API
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.display_name || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
      }
    } catch (error) {
      console.error('Error performing reverse geocoding:', error);
    }
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  };

  // Mark a location pin, adjust view configurations, and query address details
  const selectPoint = async (lat: number, lng: number, addressPreset?: string) => {
    setSelectedCoord({ lat, lng });
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
    setErrorMsg('');

    if (addressPreset) {
      setClickedAddress(addressPreset);
    } else {
      setReverseGeocoding(true);
      const resolvedAddress = await reverseGeocode(lat, lng);
      setClickedAddress(resolvedAddress);
      setReverseGeocoding(false);
    }
  };

  // Handles structured Address or Place keyword queries
  const handlePlaceSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setErrorMsg('');
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&limit=6`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8'
          }
        }
      );

      if (response.ok) {
        const results: SearchPlace[] = await response.json();
        if (results && results.length > 0) {
          setSearchResults(results);
          const topResult = results[0];
          
          const lat = parseFloat(topResult.lat);
          const lng = parseFloat(topResult.lon);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            flyToCoord(lat, lng, 15);
            selectPoint(lat, lng, topResult.display_name);
          }
        } else {
          setErrorMsg('No results found. Try searching for different terms.');
        }
      } else {
        setErrorMsg('Error in search service response.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMsg('Error connecting to search service (Nominatim).');
    } finally {
      setSearching(false);
    }
  };

  const flyToCoord = (lat: number, lng: number, zoom = 16) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  };

  // Center on manually supplied geographic latitude and longitude inputs
  const handleGoToCoordinates = () => {
    const lat = parseFloat(manualLat.trim());
    const lng = parseFloat(manualLng.trim());
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErrorMsg('Invalid coordinates. Ensure Latitude is between -90 and 90, and Longitude is between -180 and 180.');
      return;
    }
    
    flyToCoord(lat, lng, 16);
    selectPoint(lat, lng);
  };

  // Copies text to user clipboard and aggregates it in the search history
  const handleCopyToClipboard = (text: string, type: string, addressLabel?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);

      if (selectedCoord) {
        const isDuplicate = historyList.some(
          item => Math.abs(item.lat - selectedCoord.lat) < 0.00001 && Math.abs(item.lng - selectedCoord.lng) < 0.00001
        );
        
        if (!isDuplicate) {
          const newItem: HistoryItem = {
            id: Date.now().toString(),
            lat: selectedCoord.lat,
            lng: selectedCoord.lng,
            address: addressLabel || clickedAddress || 'Point on Map',
            timestamp: Date.now()
          };
          saveHistory([newItem, ...historyList].slice(0, 40));
        }
      }
    }).catch(err => {
      console.error('Error copying coordinates:', err);
    });
  };

  const handleNavigateToHistory = (item: HistoryItem) => {
    flyToCoord(item.lat, item.lng, 16);
    selectPoint(item.lat, item.lng, item.address);
  };

  const handleRemoveHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = historyList.filter(item => item.id !== id);
    saveHistory(filtered);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your saved coordinates history?')) {
      saveHistory([]);
    }
  };

  // Prompts for browser geolocation permissions to center the map view on the user's GPS position
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by this browser.');
      return;
    }
    setLocating(true);
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        flyToCoord(lat, lng, 16);
        await selectPoint(lat, lng);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setErrorMsg('Geolocation access denied. Please grant permission in your browser settings.');
        } else {
          setErrorMsg('Could not retrieve your current location via GPS.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const selectedCoordStr = selectedCoord ? `${selectedCoord.lat.toFixed(6)}, ${selectedCoord.lng.toFixed(6)}` : '';

  return (
    <div className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden font-sans transition-colors duration-350 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Control Sidebar and History Panel */}
      <div className="w-full md:w-[440px] flex-shrink-0 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-[50vh] md:h-full overflow-y-auto shadow-xl z-20 transition-colors duration-300">
        
        {/* Primary Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-slate-755/50 shadow-inner flex-shrink-0">
              <img 
                src="/src/assets/images/geocopy_logo_1781560704194.jpg" 
                alt="GeoCopy Logo" 
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight tracking-tight">GeoCopy</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Location & Coordinates</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark Mode Selector */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-200 border border-slate-700 dark:border-slate-800 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title={isDarkMode ? 'Activate Light Mode' : 'Activate Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            <button 
              type="button" 
              onClick={handleLocateUser}
              disabled={locating}
              className="p-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 disabled:bg-slate-800 disabled:opacity-50 text-slate-200 rounded-lg transition-colors border border-slate-700 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Locate my GPS"
            >
              <Navigation className={`w-3.5 h-3.5 text-blue-400 ${locating ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{locating ? 'GPS...' : 'GPS'}</span>
            </button>
          </div>
        </div>

        {/* Notifications and Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-100 dark:border-rose-900/40 text-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500" />
              <span className="leading-normal font-medium">{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={handleCloseError}
              className="p-1 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 rounded text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer flex-shrink-0"
              aria-label="Close error message"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Grid of Modular Subcomponents */}
        <div className="p-5 flex flex-col gap-6">
          
          {/* Section 1: Address Search via OSM Nominatim */}
          <SearchBox 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searching={searching}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            onSearchSubmit={handlePlaceSearch}
            onSelectResult={(lat, lng, displayName) => {
              flyToCoord(lat, lng, 16);
              selectPoint(lat, lng, displayName);
            }}
          />

          {/* Section 2: Actively Selected Coordinates Pin */}
          <SelectedPointPanel 
            selectedCoord={selectedCoord}
            clickedAddress={clickedAddress}
            reverseGeocoding={reverseGeocoding}
            copiedType={copiedType}
            onCopy={handleCopyToClipboard}
          />

          {/* Section 3: Manual Coordinate Inputs & Movement */}
          <ManualCoordsInput 
            manualLat={manualLat}
            setManualLat={setManualLat}
            manualLng={manualLng}
            setManualLng={setManualLng}
            onGo={handleGoToCoordinates}
          />

          {/* Section 4: History List of Saved Copied Pins */}
          <HistoryList 
            historyList={historyList}
            isHistoryOpen={isHistoryOpen}
            setIsHistoryOpen={setIsHistoryOpen}
            onNavigate={handleNavigateToHistory}
            onRemoveItem={handleRemoveHistoryItem}
            onClearHistory={handleClearHistory}
          />

        </div>

        {/* Informative Footer */}
        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60 text-[10px] text-slate-400 dark:text-slate-500 text-center select-none flex items-center justify-between transition-colors duration-305">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Active Map</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleTip}
              className="text-blue-600 hover:text-blue-850 dark:text-blue-400 dark:hover:text-blue-300 font-semibold cursor-pointer select-none transition-colors"
            >
              {showTip ? 'Hide Tip' : 'Show Tip'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="flex-1 relative h-[50vh] md:h-full w-full">
        {/* Geographic Leaflet Map Mount Point */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Layers Switcher Button (Pinned to top-left for accessibility) */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-md border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-805 flex items-center justify-center transition-all cursor-pointer group"
            title="Map View Layers"
          >
            <Layers className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </button>

          <AnimatePresence>
            {isLayersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-205 text-xs">Map Layers</span>
                  <button
                    type="button"
                    onClick={() => setIsLayersOpen(false)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  {(Object.keys(MAP_LAYERS) as LayerId[]).map((key) => {
                    const layer = MAP_LAYERS[key];
                    const isActive = activeLayer === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setActiveLayer(key);
                          if (key !== 'dark') {
                            setLastNonDarkLayer(key);
                            setIsDarkMode(false);
                          } else {
                            setIsDarkMode(true);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-lg border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-50/50 dark:bg-blue-955/20 border-blue-500 dark:border-blue-400 ring-2 ring-blue-50 dark:ring-blue-950/40'
                            : 'bg-white dark:bg-slate-850 border-slate-200/60 dark:border-slate-755 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        {/* Preview miniatura estilizada */}
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                          key === 'streets' ? 'bg-gradient-to-tr from-sky-400 via-emerald-355 to-amber-200 border-slate-100' :
                          key === 'satellite' ? 'bg-indigo-950 border-white/20' :
                          key === 'topo' ? 'bg-emerald-700 border-slate-200' :
                          'bg-slate-900 border-slate-800'
                        }`}>
                          <Compass className={`w-4 h-4 ${
                            isActive ? 'text-blue-600 animate-spin-slow' :
                            key === 'satellite' ? 'text-slate-200' :
                            key === 'topo' ? 'text-slate-100' :
                            key === 'dark' ? 'text-slate-400' :
                            'text-slate-600'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-205'}`}>
                            {layer.name}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-450 font-medium leading-normal line-clamp-1">
                            {layer.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hover coordinates coordinates coordinates indicator */}
        <AnimatePresence>
          {hoverCoords && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-800 text-[10px] text-slate-200 flex items-center gap-2 z-[1000] pointer-events-none select-none font-medium whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow animate-pulse" />
              <span>Inspect:</span>
              <span className="font-mono text-blue-300 font-semibold">Lat: {hoverCoords.lat.toFixed(6)}</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-blue-300 font-semibold">Lng: {hoverCoords.lng.toFixed(6)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informative card of the active marker (visible bottom-right popup) */}
        {selectedCoord && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl shadow-2xl max-w-sm border border-slate-100 dark:border-slate-800 text-xs flex flex-col gap-2.5 z-[1000] animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Active Marker</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCoord(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 rounded-lg p-0.5 cursor-pointer"
                title="Close card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-305 font-bold bg-slate-50 dark:bg-slate-850 rounded p-1.5 border border-slate-100 dark:border-slate-800 break-all select-all">
              {selectedCoord.lat.toFixed(6)}, {selectedCoord.lng.toFixed(6)}
            </p>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-semibold">
              {reverseGeocoding ? (
                <span className="italic animate-pulse">Retrieving address details...</span>
              ) : (
                clickedAddress || 'Exact point on map'
              )}
            </p>

            <button
              id="map-pop-copy-btn"
              type="button"
              onClick={() => handleCopyToClipboard(selectedCoordStr, 'pair')}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-sm hover:shadow-blue-200"
            >
              {copiedType === 'pair' ? (
                <span>Copied!</span>
              ) : (
                <span>Copy Coordinates (Lat, Lng)</span>
              )}
            </button>
          </div>
        )}

        {/* Usage instructions overlay on initialization */}
        {!selectedCoord && showTip && (
          <div className="absolute top-16 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3.5 rounded-xl shadow-lg max-w-[325px] border border-slate-100 dark:border-slate-800 text-xs hidden sm:flex items-start gap-3 pointer-events-auto z-[1000] animate-in fade-in duration-300">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-800 dark:text-slate-205 mb-0.5">Usage Tip</p>
                <button
                  type="button"
                  onClick={handleToggleTip}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Hide Tip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-normal mt-0.5">
                Use the search box to navigate to your region of interest, and click anywhere on the map to place a pinnable marker and show coordinate copying options.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
