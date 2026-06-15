import React from 'react';
import { History, ChevronDown, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';

/**
 * Properties for the HistoryList component.
 */
interface HistoryListProps {
  /** Collection of saved copied points in local preferences */
  historyList: HistoryItem[];
  /** Determins whether the history accordion is expanded */
  isHistoryOpen: boolean;
  /** Callback to toggle history list display */
  setIsHistoryOpen: (open: boolean) => void;
  /** Callback fired when clicking a history item to pan/focus map */
  onNavigate: (item: HistoryItem) => void;
  /** Callback to remove an individual item from history */
  onRemoveItem: (id: string, e: React.MouseEvent) => void;
  /** Callback to clear all stored history */
  onClearHistory: () => void;
}

/**
 * Modular component for managing and listing previously copied/saved coordinates.
 */
export const HistoryList: React.FC<HistoryListProps> = ({
  historyList,
  isHistoryOpen,
  setIsHistoryOpen,
  onNavigate,
  onRemoveItem,
  onClearHistory
}) => {
  return (
    <section className="border-t border-slate-100 dark:border-slate-800 pt-5">
      <div className="flex items-center justify-between mb-3.5">
        <button
          type="button"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
        >
          <History className="w-3.5 h-3.5 text-violet-500" />
          Copied Points ({historyList.length})
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isHistoryOpen ? 'rotate-180' : ''}`} />
        </button>
        {historyList.length > 0 && isHistoryOpen && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-[10px] text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-semibold cursor-pointer transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {isHistoryOpen && (
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 animate-in fade-in duration-300">
          {historyList.length > 0 ? (
            historyList.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigate(item)}
                className="group flex items-start justify-between p-2.5 bg-white dark:bg-slate-800/40 border border-slate-200/75 dark:border-slate-800/85 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 hover:bg-violet-50/20 dark:hover:bg-violet-950/10 cursor-pointer transition-all gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded border border-violet-100 dark:border-violet-900/50">
                      {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 leading-normal font-medium">
                    {item.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => onRemoveItem(item.id, e)}
                  className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer self-center"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-slate-400 dark:text-slate-550 border border-dashed border-slate-100 dark:border-slate-800/80 rounded-lg">
              <p className="text-[11px] font-medium leading-relaxed">
                No items in history yet.<br />Copy a coordinate to save.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
