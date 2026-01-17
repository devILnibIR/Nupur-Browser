
import React, { useState, useEffect } from 'react';
import { Tab, WebPageData } from '../types';
import { fetchWebSimContent } from '../services/geminiService';
import NewTabPage from './NewTabPage';

interface WebContentProps {
  tab: Tab;
  onUpdateInfo: (info: Partial<Tab>) => void;
  onNavigate: (url: string) => void;
  theme?: 'dark' | 'light';
  onDownload?: (url: string, filename: string) => void;
  isPickerActive?: boolean;
  selectedElementIndex?: number | null;
  onSelectElement?: (index: number) => void;
  adBlockEnabled?: boolean;
}

const WebContent: React.FC<WebContentProps> = ({ 
  tab, 
  onUpdateInfo, 
  onNavigate, 
  theme, 
  onDownload,
  isPickerActive,
  selectedElementIndex,
  onSelectElement,
  adBlockEnabled = false
}) => {
  const [pageData, setPageData] = useState<WebPageData | null>(null);
  const isNewTab = tab.url === 'nupur://newtab';

  useEffect(() => {
    if (isNewTab) {
      setPageData(null);
      onUpdateInfo({ title: 'New Tab', favicon: undefined, isLoading: false, pageData: undefined });
      return;
    }

    const loadContent = async () => {
      onUpdateInfo({ isLoading: true });
      const data = await fetchWebSimContent(tab.url, adBlockEnabled);
      setPageData(data);
      onUpdateInfo({ 
        title: data.title, 
        favicon: data.favicon, 
        isLoading: false,
        pageData: data 
      });
    };

    loadContent();
  }, [tab.url, adBlockEnabled]);

  const handleManualDownload = () => {
    if (onDownload) {
      onDownload(tab.url, `${pageData?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    }
  };

  if (isNewTab) return <NewTabPage onSearch={onNavigate} theme={theme} />;

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-[#121212] text-current ${isPickerActive ? 'cursor-crosshair' : ''}`}>
      {tab.isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-[3px] border-current/10 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-[11px] font-medium opacity-40 uppercase tracking-widest">Loading...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-10 py-16">
            <header className="mb-12 flex items-start gap-8">
               <div className={`w-20 h-20 flex items-center justify-center bg-current/5 rounded-3xl border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} flex-shrink-0 shadow-sm`}>
                 {pageData?.favicon && pageData.favicon.length < 5 ? (
                   <span className="text-4xl">{pageData.favicon}</span>
                 ) : pageData?.favicon ? (
                   <img src={pageData.favicon} alt="" className="w-12 h-12 object-contain" />
                 ) : (
                   <i className="fa-solid fa-earth-americas text-3xl opacity-10"></i>
                 )}
               </div>
               <div className="flex-1 pt-2">
                 <div className="flex items-center justify-between mb-3">
                   <h1 className="text-5xl font-bold tracking-tight text-current">{pageData?.title}</h1>
                   <div className="flex gap-2">
                    {adBlockEnabled && pageData?.adBlockCount && pageData.adBlockCount > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm animate-in fade-in duration-500">
                        <i className="fa-solid fa-shield-halved"></i>
                        {pageData.adBlockCount} Ads Cleaned
                      </div>
                    )}
                    <button 
                      onClick={handleManualDownload}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
                    >
                      <i className="fa-solid fa-download"></i>
                      Download Page
                    </button>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <i className="fa-solid fa-circle-check text-indigo-500 text-sm"></i>
                   <span className="text-xs font-medium opacity-50 uppercase tracking-wide">Secure Simulation Protocol</span>
                 </div>
               </div>
            </header>
            
            <div className={`prose max-w-none dark:prose-invert`}>
              <div className={`text-[17px] opacity-90 leading-[1.7] font-normal space-y-8 text-current`}>
                {pageData?.content.split('\n').map((line, i) => (
                  <p 
                    key={i} 
                    onClick={() => isPickerActive && onSelectElement && onSelectElement(i)}
                    className={`
                      transition-all duration-200 rounded-sm px-2 -mx-2 relative z-0
                      ${isPickerActive ? 'hover:bg-indigo-500/15 hover:shadow-[0_0_0_1px_rgba(99,102,241,0.4)]' : ''}
                      ${selectedElementIndex === i ? 'bg-indigo-500/20 shadow-[0_0_0_1px_rgba(99,102,241,0.6)] z-10' : ''}
                    `}
                  >
                    {line}
                    {(selectedElementIndex === i || (isPickerActive && selectedElementIndex === null)) && (
                      <div className={`absolute -top-7 left-0 flex items-center gap-1 bg-[#333] dark:bg-[#444] text-white text-[9px] px-2 py-0.5 rounded shadow-xl font-bold pointer-events-none z-[100] border border-white/10 ${selectedElementIndex === i ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-[#ff79c6]">p</span>
                        <span className="text-[#bd93f9]">.content-block</span>
                        <span className="mx-1 opacity-30">|</span>
                        <span className="text-white opacity-90">800 × 24</span>
                      </div>
                    )}
                  </p>
                ))}
              </div>
            </div>

            {pageData?.suggestedUrls && pageData.suggestedUrls.length > 0 && (
              <div className={`mt-20 p-10 bg-current/5 rounded-3xl border border-current/5`}>
                <h3 className={`text-[10px] font-bold mb-6 flex items-center gap-2 uppercase tracking-[0.2em] opacity-30`}>
                  Suggested Navigation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pageData.suggestedUrls.map((url, i) => (
                    <button 
                      key={i} 
                      onClick={() => onNavigate(url)}
                      className={`group flex items-center justify-between p-4 rounded-2xl bg-current/5 hover:bg-current/10 transition-all text-left`}
                    >
                      <span className={`text-[13px] font-medium truncate pr-4 text-indigo-500`}>{url}</span>
                      <i className="fa-solid fa-chevron-right text-[10px] opacity-0 group-hover:opacity-40 transition-all"></i>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <footer className="mt-24 pt-10 border-t border-current/5">
              <div className="flex justify-between items-center opacity-20 text-[10px] font-bold uppercase tracking-widest">
                <span>Nupur AI Simulation</span>
                <div className="flex gap-4">
                  <span>Privacy</span>
                  <span>Terms</span>
                  <span>Help</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContent;
