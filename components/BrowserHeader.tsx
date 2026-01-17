
import React, { useState, useEffect, useRef } from 'react';
import { Bookmark } from '../types';
import { analyzeImageForSearch } from '../services/geminiService';

interface BrowserHeaderProps {
  activeUrl: string;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
  bookmarks: Bookmark[];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onManageBookmarks: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeDownloadsCount: number;
  onToggleDownloads: () => void;
  onToggleMenu: () => void;
  adBlockEnabled?: boolean;
  onToggleAdBlock?: () => void;
  blockedCount?: number;
}

const BrowserHeader: React.FC<BrowserHeaderProps> = ({ 
  activeUrl, 
  onNavigate, 
  onBack, 
  onForward, 
  canGoBack, 
  canGoForward,
  bookmarks,
  isBookmarked,
  onToggleBookmark,
  onManageBookmarks,
  theme,
  onToggleTheme,
  activeDownloadsCount,
  onToggleDownloads,
  onToggleMenu,
  adBlockEnabled,
  onToggleAdBlock,
  blockedCount = 0
}) => {
  const [urlInput, setUrlInput] = useState(activeUrl === 'nupur://newtab' ? '' : activeUrl);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(activeUrl === 'nupur://newtab' ? '' : activeUrl);
  }, [activeUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) onNavigate(urlInput);
  };

  const handleVoiceSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    // Fix: check SpeechRecognition instead of recognition (which is defined later)
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUrlInput(transcript);
      onNavigate(transcript);
    };
    recognition.start();
  };

  const handlePhotoSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const searchTerms = await analyzeImageForSearch(base64, file.type);
      setUrlInput(searchTerms);
      onNavigate(searchTerms);
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const isNewTab = activeUrl === 'nupur://newtab';

  return (
    <div className={`flex flex-col ${theme === 'dark' ? 'bg-[#202124] border-white/5' : 'bg-white border-black/5'} border-b shadow-sm z-30`}>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="flex items-center">
          <button 
            disabled={!canGoBack}
            onClick={onBack}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${canGoBack ? 'hover:bg-current/10' : 'opacity-20 cursor-default'}`}
          >
            <i className="fa-solid fa-arrow-left text-sm"></i>
          </button>
          <button 
            disabled={!canGoForward}
            onClick={onForward}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${canGoForward ? 'hover:bg-current/10' : 'opacity-20 cursor-default'}`}
          >
            <i className="fa-solid fa-arrow-right text-sm"></i>
          </button>
          <button 
            onClick={() => onNavigate(activeUrl)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-current/10 transition-all"
          >
            <i className={`fa-solid fa-rotate-right text-[13px] ${isProcessingImage ? 'animate-spin text-indigo-500' : ''}`}></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`flex-1 flex items-center ${theme === 'dark' ? 'bg-[#35363a]' : 'bg-[#f1f3f4]'} rounded-full px-4 h-8 transition-all group mx-1`}>
          <div className="flex items-center opacity-40 mr-2.5">
            {isListening ? (
              <i className="fa-solid fa-microphone text-[10px] text-red-500 animate-pulse"></i>
            ) : (
              <i className="fa-solid fa-lock text-[10px]"></i>
            )}
          </div>
          <input 
            type="text" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Search Nupur AI or type a URL"}
            className="bg-transparent border-none outline-none text-[13px] w-full placeholder-current/40 font-normal text-current"
          />
          <div className="flex items-center gap-2 ml-2">
            {!isNewTab && (
              <button 
                type="button" 
                onClick={onToggleBookmark}
                className={`transition-all duration-300 ${isBookmarked ? 'text-indigo-500' : 'opacity-30 hover:opacity-100'}`}
              >
                <i className={`${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-star text-sm`}></i>
              </button>
            )}
            <button 
              type="button" 
              onClick={handleVoiceSearch} 
              className={`opacity-30 hover:opacity-100 transition-all ${isListening ? 'text-red-500 opacity-100 scale-110' : ''}`}
            >
              <i className="fa-solid fa-microphone text-xs"></i>
            </button>
            <button 
              type="button" 
              onClick={handlePhotoSearch} 
              className={`opacity-30 hover:opacity-100 transition-all ${isProcessingImage ? 'text-indigo-500 opacity-100' : ''}`}
            >
              <i className="fa-solid fa-camera text-xs"></i>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-1">
          {/* Ad Block Indicator */}
          <button 
            onClick={onToggleAdBlock}
            className={`flex items-center gap-1.5 px-2.5 h-8 rounded-full transition-all group relative ${adBlockEnabled ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-current/10 opacity-70'}`}
            title={adBlockEnabled ? `Ad Block Active: ${blockedCount} items blocked` : "Enable Ad Block"}
          >
            <i className={`fa-solid ${adBlockEnabled ? 'fa-shield-halved' : 'fa-shield'} text-[13px]`}></i>
            {adBlockEnabled && blockedCount > 0 && (
              <span className="text-[10px] font-black tracking-tighter">{blockedCount}</span>
            )}
          </button>

          <button 
            onClick={onToggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-current/10 transition-all"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-yellow-400' : 'fa-moon text-indigo-500'} text-[13px]`}></i>
          </button>

          <button 
            onClick={onToggleDownloads}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-current/10 transition-all relative ${activeDownloadsCount > 0 ? 'text-indigo-500' : 'opacity-70'}`}
          >
            <i className="fa-solid fa-download text-[13px]"></i>
            {activeDownloadsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] flex items-center justify-center border-2 border-white dark:border-[#202124]">
                {activeDownloadsCount}
              </span>
            )}
          </button>
          
          <button onClick={onManageBookmarks} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-current/10 opacity-70">
            <i className="fa-solid fa-bookmark text-[13px]"></i>
          </button>

          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-pointer ml-1">
            N
          </div>
          
          <button 
            onClick={onToggleMenu}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-current/10 opacity-70"
          >
            <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-0.5 px-3 h-7 overflow-x-auto no-scrollbar pb-1">
        {bookmarks.map(b => (
          <button 
            key={b.id}
            onClick={() => onNavigate(b.url)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-current/5 transition-all whitespace-nowrap group`}
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
              {b.icon && b.icon.length < 5 ? (
                <span className="text-[9px]">{b.icon}</span>
              ) : b.icon ? (
                <img src={b.icon} alt="" className="w-full h-full object-contain" />
              ) : (
                <i className="fa-solid fa-file text-[9px] opacity-30"></i>
              )}
            </div>
            <span className="text-[11px] font-normal opacity-70 group-hover:opacity-100 text-current">{b.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrowserHeader;
