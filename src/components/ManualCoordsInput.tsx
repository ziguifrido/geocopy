import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';

/**
 * Properties of the manual coordinates input component.
 */
interface ManualCoordsInputProps {
  /** Value entered corresponding to the Latitude */
  manualLat: string;
  /** Callback executed to modify the Latitude value */
  setManualLat: (val: string) => void;
  /** Value entered corresponding to the Longitude */
  manualLng: string;
  /** Callback executed to modify the Longitude value */
  setManualLng: (val: string) => void;
  /** Parent method that centers the map and locks onto the specified coordinates */
  onGo: () => void;
}

/**
 * Modular component for users to quickly navigate to specific coordinates via direct text inputs.
 */
export const ManualCoordsInput: React.FC<ManualCoordsInputProps> = ({
  manualLat,
  setManualLat,
  manualLng,
  setManualLng,
  onGo
}) => {
  return (
    <section className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80" id="manual-coords-section">
      <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-emerald-500" />
        Manual Coordinates
      </h2>
      <div className="flex gap-2.5 items-end">
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
              Lat (-90 to 90)
            </label>
            <input
              id="manual-lat"
              type="text"
              value={manualLat}
              placeholder="e.g., -23.5505"
              onChange={(e) => setManualLat(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 text-xs font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
              Lng (-180 to 180)
            </label>
            <input
              id="manual-lng"
              type="text"
              value={manualLng}
              placeholder="e.g., -46.6333"
              onChange={(e) => setManualLng(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 text-xs font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>
        <button
          id="manual-go-button"
          type="button"
          onClick={onGo}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0"
        >
          <span>Go</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
