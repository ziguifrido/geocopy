import React from 'react';
import { MapPin, Globe, Check, Copy, ClipboardCheck, MapIcon } from 'lucide-react';

/**
 * Properties for the SelectedPointPanel component.
 */
interface SelectedPointPanelProps {
  /** Currently selected coordinates */
  selectedCoord: { lat: number; lng: number } | null;
  /** Resolved address string from reverse geocoding */
  clickedAddress: string;
  /** Address loading state */
  reverseGeocoding: boolean;
  /** Currently active copy state for visual feedback */
  copiedType: string | null;
  /** Callback executed to copy text to the clipboard */
  onCopy: (text: string, type: string, addressLabel?: string) => void;
}

/**
 * Informative sidebar panel showing the details of the active pin and quick actions to copy coordinates.
 */
export const SelectedPointPanel: React.FC<SelectedPointPanelProps> = ({
  selectedCoord,
  clickedAddress,
  reverseGeocoding,
  copiedType,
  onCopy
}) => {
  const selectedCoordStr = selectedCoord 
    ? `${selectedCoord.lat.toFixed(6)}, ${selectedCoord.lng.toFixed(6)}` 
    : '';

  return (
    <section className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4.5" id="selected-point-section">
      <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-3.5 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          Selected Coordinates
        </span>
        {!selectedCoord && (
          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/50 font-normal">
            No Pin
          </span>
        )}
      </h2>

      {selectedCoord ? (
        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
          {/* Lat/Lng values columns */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 transition-all hover:shadow-sm">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider mb-1">Latitude</span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 break-all select-all">
                {selectedCoord.lat.toFixed(8)}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 transition-all hover:shadow-sm">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider mb-1">Longitude</span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 break-all select-all">
                {selectedCoord.lng.toFixed(8)}
              </span>
            </div>
          </div>

          {/* Reverse geocoded Address detail */}
          <div className="bg-white dark:bg-slate-800 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 shadow-inner-sm">
            <Globe className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {reverseGeocoding ? (
                <span className="text-slate-400 dark:text-slate-500 italic animate-pulse">Retrieving address details...</span>
              ) : (
                <p className="line-clamp-2 leading-relaxed font-semibold break-words text-slate-700 dark:text-slate-200">
                  {clickedAddress || 'Point selected directly on the map'}
                </p>
              )}
            </div>
          </div>

          {/* Copies row */}
          <div className="flex flex-col gap-2 mt-1">
            {/* Coordenadas Juntas */}
            <button
              id="copy-coords-btn"
              type="button"
              onClick={() => onCopy(selectedCoordStr, 'pair')}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-blue-200/50"
            >
              {copiedType === 'pair' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Pair (Lat, Lng)
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Copy Latitude only */}
              <button
                type="button"
                onClick={() => onCopy(selectedCoord.lat.toFixed(8), 'lat')}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedType === 'lat' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Lat Only</span>
                  </>
                )}
              </button>

              {/* Copy Longitude only */}
              <button
                type="button"
                onClick={() => onCopy(selectedCoord.lng.toFixed(8), 'lng')}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedType === 'lng' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>Lng Only</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Ficha Completa */}
            <button
              type="button"
              onClick={() => {
                const fullReport = `Address: ${clickedAddress || 'Not specified'}\nCoordinates: ${selectedCoordStr}\nOpenStreetMap: https://www.openstreetmap.org/?mlat=${selectedCoord.lat}&mlon=${selectedCoord.lng}`;
                onCopy(fullReport, 'complete');
              }}
              className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white py-2 px-3 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-transparent dark:border-slate-700"
            >
              {copiedType === 'complete' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  Report Copied!
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-3.5 h-3.5 text-blue-300 dark:text-blue-400" />
                  Copy Full Report (with link)
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="py-6 px-4 text-center border-2 border-dashed border-slate-200/80 dark:border-slate-800/80 rounded-xl bg-white/60 dark:bg-slate-800/40">
          <MapIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Select a point</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto leading-relaxed">
            Click anywhere on the map or enter coordinates below to mark your point of interest.
          </p>
        </div>
      )}
    </section>
  );
};
