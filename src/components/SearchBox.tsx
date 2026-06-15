import React from 'react';
import { Search, X } from 'lucide-react';
import { SearchPlace } from '../types';

/**
 * Properties for the SearchBox component.
 */
interface SearchBoxProps {
  /** Current text search query */
  searchQuery: string;
  /** Callback executed when modifying the search query */
  setSearchQuery: (query: string) => void;
  /** State indicating whether an API search is currently in progress */
  searching: boolean;
  /** Collection of geocoded search place results */
  searchResults: SearchPlace[];
  /** Callback to reset or clean up the search results in parent state */
  setSearchResults: (results: SearchPlace[]) => void;
  /** Callback to trigger forward geocoding search submission */
  onSearchSubmit: (e?: React.FormEvent) => void;
  /** Event callback fired when one of the search results is clicked */
  onSelectResult: (lat: number, lng: number, displayName: string) => void;
}

/**
 * Modular component for searching addresses/places with autocomplete and quick list view.
 */
export const SearchBox: React.FC<SearchBoxProps> = ({
  searchQuery,
  setSearchQuery,
  searching,
  searchResults,
  setSearchResults,
  onSearchSubmit,
  onSelectResult
}) => {
  return (
    <section className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80" id="search-section">
      <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-blue-500" />
        Search Place or Address
      </h2>
      <form onSubmit={onSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="search-input"
            type="text"
            placeholder="e.g., New York, Central Park..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 pl-3 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900/40 text-sm dark:text-slate-100 transition-all placeholder-slate-400 dark:placeholder-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition-colors cursor-pointer"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          id="search-button"
          type="submit"
          disabled={searching || !searchQuery.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors cursor-pointer flex-shrink-0"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Places Search Results Dropdown List */}
      {searchResults.length > 0 && (
        <div className="mt-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-700 max-h-[160px] overflow-y-auto shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
          {searchResults.map((place) => (
            <button
              key={place.place_id}
              type="button"
              onClick={() => {
                const lat = parseFloat(place.lat);
                const lng = parseFloat(place.lon);
                if (!isNaN(lat) && !isNaN(lng)) {
                  onSelectResult(lat, lng, place.display_name);
                }
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col gap-0.5 cursor-pointer"
            >
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                {place.display_name.split(',')[0]}
              </span>
              <span className="text-slate-400 dark:text-slate-400 truncate text-[10px]">
                {place.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
