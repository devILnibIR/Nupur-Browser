
import React from 'react';
import { Download } from '../types';

interface DownloadsPanelProps {
  downloads: Download[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: Download['status']) => void;
  onClear: () => void;
  onOpenDirectory: () => void;
  theme?: 'dark' | 'light';
}

const DownloadsPanel: React.FC<DownloadsPanelProps> = ({ 
  downloads, 
  onClose, 
  onUpdateStatus, 
  onClear, 
  onOpenDirectory,
  theme 
}) => {
  return (
    <div className={`absolute top-0 right-4 w-[400px] max-h-[550px] mt-2 flex flex-col rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border ${theme === 'dark' ? 'bg-[#1a1c24] border-white/10' : 'bg-white border-black/5'} z-50 animate-in slide-in-from-top-4 duration-300 backdrop-blur-xl`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-current/5">
        <div>
          <h3 className="text-sm font-black tracking-tight opacity-90 uppercase italic">Active Streams</h3>
          <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-0.5">Download Management Core</p>
        </div>
        <div className="flex items-center gap-3">
          {downloads.length > 0 && (
            <button 
              onClick={onClear} 
              className="text-[10px] font-black text-indigo-500 hover:text-indigo-400 transition-colors uppercase tracking-tighter"
            >
              Flush Cache
            </button>
          )}
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-current/10 opacity-40 hover:opacity-100 transition-all"
          >
            <i className="fa-solid fa-chevron-up text-xs"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[150px]">
        {downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-10">
            <div className="w-16 h-16 rounded-full bg-current/5 flex items-center justify-center mb-4 border border-current/5 border-dashed">
              <i className="fa-solid fa-cloud-arrow-down text-4xl"></i>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Buffer Empty</p>
          </div>
        ) : (
          downloads.map(d => (
            <div key={d.id} className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} border border-current/5 flex flex-col gap-3 group transition-all hover:border-indigo-500/20`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                  d.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                  d.status === 'paused' ? 'bg-amber-500/10 text-amber-500' : 
                  d.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                  'bg-indigo-500/10 text-indigo-500'
                }`}>
                  <i className={`fa-solid ${
                    d.status === 'completed' ? 'fa-check-double' : 
                    d.status === 'paused' ? 'fa-circle-pause' : 
                    d.status === 'failed' ? 'fa-circle-exclamation' :
                    'fa-satellite-dish animate-pulse'
                  } text-lg`}></i>
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[13px] font-bold truncate opacity-90 group-hover:text-indigo-500 transition-colors">
                    {d.filename}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 opacity-40">
                    <span className="text-[9px] font-black uppercase tracking-tighter">{d.totalSize}</span>
                    <span className="text-[9px]">/</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-current">{d.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.status === 'downloading' && (
                    <button 
                      onClick={() => onUpdateStatus(d.id, 'paused')} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-500/20 text-amber-500 transition-all"
                      title="Pause Stream"
                    >
                      <i className="fa-solid fa-pause text-[10px]"></i>
                    </button>
                  )}
                  {d.status === 'paused' && (
                    <button 
                      onClick={() => onUpdateStatus(d.id, 'downloading')} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-500/20 text-indigo-500 transition-all"
                      title="Resume Stream"
                    >
                      <i className="fa-solid fa-play text-[10px]"></i>
                    </button>
                  )}
                  {(d.status === 'failed' || d.status === 'cancelled') && (
                    <button 
                      onClick={() => onUpdateStatus(d.id, 'downloading')} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-500/20 text-indigo-500 transition-all"
                      title="Retry Stream"
                    >
                      <i className="fa-solid fa-rotate-left text-[10px]"></i>
                    </button>
                  )}
                  {d.status !== 'completed' && d.status !== 'cancelled' && (
                    <button 
                      onClick={() => onUpdateStatus(d.id, 'cancelled')} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-500 transition-all"
                      title="Abort Mission"
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  )}
                  {d.status === 'completed' && (
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-500/20 text-indigo-500 transition-all">
                      <i className="fa-solid fa-folder-open text-[10px]"></i>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <div className="w-full h-2 bg-current/10 rounded-full overflow-hidden relative shadow-inner">
                  {/* Glowing progress line */}
                  <div 
                    className={`h-full transition-all duration-700 ease-out relative ${
                      d.status === 'paused' ? 'bg-amber-400' : 
                      d.status === 'completed' ? 'bg-green-500' : 
                      d.status === 'failed' ? 'bg-red-500' :
                      'bg-gradient-to-r from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${d.progress}%` }}
                  >
                    {d.status === 'downloading' && (
                      <div className="absolute inset-0 w-full h-full bg-white/20 animate-[shimmer_2s_infinite] skew-x-[-20deg]"></div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest opacity-40">
                  <span className={`${d.status === 'downloading' ? 'text-indigo-500 animate-pulse' : d.status === 'failed' ? 'text-red-500' : ''}`}>
                    {d.status === 'paused' ? 'Stream Suspended' : 
                     d.status === 'completed' ? 'Data Integrity Verified' : 
                     d.status === 'failed' ? 'Packet Loss Detected' : 
                     'Syncing Data...'}
                  </span>
                  <span className="font-mono">{Math.round(d.progress)}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-current/5 bg-current/5 rounded-b-[2rem]">
        <button 
          onClick={onOpenDirectory} 
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
        >
          <i className="fa-solid fa-hard-drive"></i>
          Nexus Directory
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
      `}} />
    </div>
  );
};

export default DownloadsPanel;
