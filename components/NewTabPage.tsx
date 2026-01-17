
import React, { useState, useRef } from 'react';
import { analyzeImageForSearch } from '../services/geminiService';

interface NewTabPageProps {
  onSearch: (query: string) => void;
  theme?: 'dark' | 'light';
}

interface Shortcut {
  name: string;
  icon: string;
  url: string;
  isImage?: boolean;
  color?: string;
}

const NewTabPage: React.FC<NewTabPageProps> = ({ onSearch, theme }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onSearch(transcript);
    };

    recognition.start();
  };

  const handlePhotoSearch = () => {
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
      setQuery(searchTerms);
      onSearch(searchTerms);
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const shortcuts: Shortcut[] = [
    { 
      name: 'Gemini', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Gemini_language_model_logo.png', 
      url: 'https://gemini.google.com',
      isImage: true,
      color: 'rgba(74, 144, 226, 0.4)'
    },
    { 
      name: 'YouTube', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png', 
      url: 'https://youtube.com',
      isImage: true,
      color: 'rgba(255, 0, 0, 0.3)'
    },
    { 
      name: 'GitHub', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', 
      url: 'https://github.com',
      isImage: true,
      color: 'rgba(128, 128, 128, 0.3)'
    },
    { 
      name: 'Gmail', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', 
      url: 'https://gmail.com',
      isImage: true,
      color: 'rgba(234, 67, 53, 0.3)'
    },
    { 
      name: 'Maps', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg', 
      url: 'https://maps.google.com',
      isImage: true,
      color: 'rgba(52, 168, 83, 0.3)'
    },
    { 
      name: 'Add shortcut', 
      icon: 'fa-plus', 
      url: '#',
      isImage: false,
      color: 'rgba(99, 102, 241, 0.3)'
    },
  ];

  return (
    <div className={`h-full flex flex-col items-center justify-center transition-colors duration-500 pb-20`}>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Floating Glass Branding for Nupur AI */}
        <div className="mb-12 group cursor-default flex flex-col items-center text-center animate-float">
          <div className="glass px-6 py-3 rounded-full flex items-center gap-3 shadow-sm hover:shadow-xl transition-all duration-700">
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-[10px] font-black select-none">N</span>
            </div>
            <h1 className="text-xs font-bold uppercase tracking-[0.4em] text-current opacity-80 select-none">
              Nupur AI
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full mb-12 group">
          <div className={`relative flex items-center w-full max-w-xl mx-auto shadow-sm hover:shadow-xl focus-within:shadow-xl transition-all duration-300 rounded-full overflow-hidden border ${theme === 'dark' ? 'border-white/10 bg-[#303134]' : 'border-black/5 bg-white'}`}>
            <div className="absolute left-6 opacity-40">
              {isProcessingImage ? (
                <i className="fa-solid fa-spinner fa-spin text-sm text-indigo-500"></i>
              ) : (
                <i className="fa-solid fa-magnifying-glass text-sm"></i>
              )}
            </div>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? "Listening..." : isProcessingImage ? "Analyzing image..." : "Search Nupur AI or type a URL"}
              disabled={isListening || isProcessingImage}
              className={`w-full h-14 pl-14 pr-24 bg-transparent outline-none text-[16px] text-current font-normal placeholder-current/30 ${isListening ? 'animate-pulse' : ''}`}
            />
            <div className="absolute right-6 flex items-center gap-5">
              <i 
                onClick={handleVoiceSearch}
                className={`fa-solid fa-microphone cursor-pointer transition-all text-lg ${isListening ? 'text-red-500 scale-125' : 'opacity-40 hover:opacity-100 hover:text-indigo-500'}`}
                title="Voice Search"
              ></i>
              <i 
                onClick={handlePhotoSearch}
                className={`fa-solid fa-camera cursor-pointer transition-all text-lg ${isProcessingImage ? 'text-indigo-500 animate-bounce' : 'opacity-40 hover:opacity-100 hover:text-indigo-500'}`}
                title="Search by image"
              ></i>
            </div>
          </div>
        </form>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-10 gap-x-4 w-full max-w-2xl px-4">
          {shortcuts.map((sc, i) => (
            <button 
              key={i}
              onClick={() => sc.url !== '#' && onSearch(sc.url)}
              className="flex flex-col items-center gap-3 group relative"
            >
              <div 
                className={`w-14 h-14 rounded-[1.25rem] ${theme === 'dark' ? 'bg-[#303134] hover:bg-[#3c3e42]' : 'bg-white hover:bg-[#f8f9fa]'} flex items-center justify-center transition-all duration-300 shadow-sm border ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} group-hover:-translate-y-1.5 group-hover:shadow-lg`}
              >
                {sc.isImage ? (
                  <img 
                    src={sc.icon} 
                    alt={sc.name} 
                    className={`w-7 h-7 object-contain transition-transform duration-300 group-hover:scale-110 ${theme === 'dark' && sc.name === 'GitHub' ? 'invert' : ''}`} 
                  />
                ) : (
                  <i className={`fa-solid ${sc.icon} text-xl opacity-40 group-hover:opacity-100 group-hover:text-indigo-500 transition-all`}></i>
                )}
                <div 
                  className="absolute inset-0 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ backgroundColor: sc.color }}
                ></div>
              </div>
              <span className="text-[11px] font-semibold opacity-60 group-hover:opacity-100 text-current transition-all truncate w-full text-center px-1">
                {sc.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex items-center gap-3 opacity-30 hover:opacity-100 transition-all duration-300">
        <button className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-current/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-[11px] font-bold tracking-wider uppercase transition-all text-current">
          <i className="fa-solid fa-palette text-[10px]"></i>
          Customize Nupur AI
        </button>
      </div>
    </div>
  );
};

export default NewTabPage;
