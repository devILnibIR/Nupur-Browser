
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tab, Bookmark, Download } from './types';
import BrowserHeader from './components/BrowserHeader';
import WebContent from './components/WebContent';
import BookmarksModal from './components/BookmarksModal';
import DownloadsPanel from './components/DownloadsPanel';
import BrowserMenu from './components/BrowserMenu';
import DevTools from './components/DevTools';

const INITIAL_URL = 'nupur://newtab';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nupur_theme');
    return (saved as 'dark' | 'light') || 'light';
  });

  const [adBlockEnabled, setAdBlockEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('nupur_adblock');
    return saved === 'true';
  });

  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', url: INITIAL_URL, title: 'New Tab', isLoading: false, history: [INITIAL_URL], historyIndex: 0 }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('nupur_bookmarks');
    return saved ? JSON.parse(saved) : [
      { id: 'b1', title: 'Google', url: 'https://google.com' },
      { id: 'b2', title: 'YouTube', url: 'https://youtube.com' },
      { id: 'b3', title: 'GitHub', url: 'https://github.com' },
      { id: 'b4', title: 'Nupur AI', url: 'https://nupur.ai' },
    ];
  });
  
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopSite, setIsDesktopSite] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('nupur_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('nupur_theme', theme);
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nupur_adblock', adBlockEnabled.toString());
  }, [adBlockEnabled]);

  // Simulate download progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prev => prev.map(d => {
        if (d.status === 'downloading' && d.progress < 100) {
          if (Math.random() < 0.05 && d.progress > 10 && d.progress < 90) {
            return { ...d, status: 'failed' };
          }
          const newProgress = Math.min(100, d.progress + Math.random() * 15);
          return { 
            ...d, 
            progress: newProgress, 
            status: newProgress === 100 ? 'completed' : 'downloading' 
          };
        }
        return d;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const toggleAdBlock = useCallback(() => {
    setAdBlockEnabled(prev => !prev);
    // Reload active tab to apply ad block changes
    if (activeTab.url !== INITIAL_URL) {
      navigateTo(activeTab.url);
    }
  }, [adBlockEnabled, activeTabId]);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || tabs[0], [tabs, activeTabId]);

  const isCurrentPageBookmarked = useMemo(() => {
    return bookmarks.some(b => b.url === activeTab.url);
  }, [bookmarks, activeTab.url]);

  const toggleBookmark = useCallback(() => {
    if (activeTab.url === INITIAL_URL) return;
    if (isCurrentPageBookmarked) {
      setBookmarks(prev => prev.filter(b => b.url !== activeTab.url));
    } else {
      setBookmarks(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        title: activeTab.title || activeTab.url,
        url: activeTab.url,
        icon: activeTab.favicon
      }]);
    }
  }, [activeTab, isCurrentPageBookmarked]);

  const removeBookmark = useCallback((id: string) => setBookmarks(prev => prev.filter(b => b.id !== id)), []);
  const updateBookmark = useCallback((id: string, updates: Partial<Bookmark>) => setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)), []);

  const createNewTab = useCallback(() => {
    const newId = Math.random().toString(36).substr(2, 9);
    setTabs(prev => [...prev, { id: newId, url: INITIAL_URL, title: 'New Tab', isLoading: false, history: [INITIAL_URL], historyIndex: 0 }]);
    setActiveTabId(newId);
    setIsMenuOpen(false);
    setSelectedElementIndex(null);
    setIsPickerActive(false);
  }, []);

  const closeTab = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      setTabs([{ id: '1', url: INITIAL_URL, title: 'New Tab', isLoading: false, history: [INITIAL_URL], historyIndex: 0 }]);
      setActiveTabId('1');
      return;
    }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      const closingIndex = tabs.findIndex(t => t.id === id);
      const nextTab = newTabs[Math.min(closingIndex, newTabs.length - 1)];
      setActiveTabId(nextTab.id);
    }
  }, [tabs, activeTabId]);

  const navigateTo = useCallback((url: string) => {
    let finalUrl = url;
    if (!url.startsWith('http') && !url.startsWith('nupur://')) {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      url: finalUrl,
      history: [...t.history.slice(0, t.historyIndex + 1), finalUrl],
      historyIndex: t.historyIndex + 1,
      isLoading: finalUrl !== INITIAL_URL && !finalUrl.startsWith('nupur://'),
      title: 'Loading...',
      favicon: undefined,
      pageData: undefined
    } : t));
    setIsMenuOpen(false);
    setSelectedElementIndex(null);
    setIsPickerActive(false);
  }, [activeTabId]);

  const handleDownload = useCallback((url: string, filename: string) => {
    const newDownload: Download = {
      id: Math.random().toString(36).substr(2, 9),
      filename,
      url,
      progress: 0,
      status: 'downloading',
      totalSize: `${(Math.random() * 50 + 1).toFixed(1)} MB`,
      startTime: Date.now()
    };
    setDownloads(prev => [newDownload, ...prev]);
    setIsDownloadsOpen(true);
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: activeTab.title,
        url: activeTab.url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(activeTab.url);
      alert('URL copied to clipboard!');
    }
    setIsMenuOpen(false);
  }, [activeTab]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(activeTab.url).then(() => {
      console.log('Link copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
    setIsMenuOpen(false);
  }, [activeTab.url]);

  const updateDownloadStatus = useCallback((id: string, status: Download['status']) => {
    setDownloads(prev => prev.map(d => {
      if (d.id === id) {
        if (status === 'downloading' && (d.status === 'failed' || d.status === 'cancelled')) {
          return { ...d, status, progress: 0 };
        }
        return { ...d, status };
      }
      return d;
    }));
  }, []);

  const clearDownloads = useCallback(() => setDownloads([]), []);

  const goBack = useCallback(() => setTabs(prev => prev.map(t => t.id === activeTabId && t.historyIndex > 0 ? { ...t, url: t.history[t.historyIndex - 1], historyIndex: t.historyIndex - 1, isLoading: true } : t)), [activeTabId]);
  const goForward = useCallback(() => setTabs(prev => prev.map(t => t.id === activeTabId && t.historyIndex < t.history.length - 1 ? { ...t, url: t.history[t.historyIndex + 1], historyIndex: t.historyIndex + 1, isLoading: true } : t)), [activeTabId]);
  const updateTabInfo = useCallback((id: string, info: Partial<Tab>) => setTabs(prev => prev.map(t => t.id === id ? { ...t, ...info } : t)), []);

  const activeDownloadsCount = downloads.filter(d => d.status === 'downloading').length;

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-[#f4f7f9] text-[#1a1c1e]'}`}>
      <div className={`flex items-end px-3 pt-2 gap-0 select-none z-20 ${theme === 'dark' ? 'bg-[#151515]' : 'bg-[#dee1e6]'}`}>
        <div className="flex-1 flex items-end overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`
                group relative flex items-center h-[34px] px-4 min-w-[140px] max-w-[200px] rounded-t-lg cursor-pointer transition-all duration-150
                ${activeTabId === tab.id 
                  ? 'bg-white dark:bg-[#202124] text-current shadow-[0_-2px_8px_rgba(0,0,0,0.05)] border-t border-x dark:border-white/5' 
                  : 'text-current opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}
              `}
            >
              <div className="flex-1 flex items-center gap-2 overflow-hidden pr-2">
                {tab.isLoading ? (
                  <div className={`w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0`}></div>
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {tab.favicon && tab.favicon.length < 5 ? (
                      <span className="text-[10px]">{tab.favicon}</span>
                    ) : tab.favicon ? (
                      <img src={tab.favicon} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <i className="fa-solid fa-earth-americas text-[11px] opacity-40"></i>
                    )}
                  </div>
                )}
                <span className="text-[11px] font-medium truncate tracking-tight">{tab.title}</span>
              </div>
              <button 
                onClick={(e) => closeTab(tab.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-current/10 rounded-full w-4 h-4 flex items-center justify-center transition-all text-[9px]"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
              {activeTabId !== tab.id && (
                <div className="absolute right-0 top-2 bottom-2 w-[1px] bg-current opacity-10"></div>
              )}
            </div>
          ))}
          <button 
            onClick={createNewTab}
            className={`w-8 h-8 mb-1 ml-1 flex items-center justify-center rounded-full transition-all hover:bg-current/10 opacity-60 hover:opacity-100`}
          >
            <i className="fa-solid fa-plus text-xs"></i>
          </button>
        </div>
      </div>

      <BrowserHeader 
        activeUrl={activeTab.url} 
        onNavigate={navigateTo}
        onBack={goBack}
        onForward={goForward}
        canGoBack={activeTab.historyIndex > 0}
        canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
        bookmarks={bookmarks}
        isBookmarked={isCurrentPageBookmarked}
        onToggleBookmark={toggleBookmark}
        onManageBookmarks={() => setIsBookmarksModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeDownloadsCount={activeDownloadsCount}
        onToggleDownloads={() => setIsDownloadsOpen(!isDownloadsOpen)}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        adBlockEnabled={adBlockEnabled}
        onToggleAdBlock={toggleAdBlock}
        blockedCount={activeTab.pageData?.adBlockCount || 0}
      />

      <div className="flex-1 relative overflow-hidden flex">
        <div className={`flex-1 relative overflow-hidden transition-all duration-300 ${isDevToolsOpen ? 'mr-[450px]' : 'mr-0'}`}>
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`absolute inset-0 transition-opacity duration-200 ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <WebContent 
                tab={tab} 
                onUpdateInfo={(info) => updateTabInfo(tab.id, info)}
                onNavigate={navigateTo}
                theme={theme}
                onDownload={handleDownload}
                isPickerActive={isPickerActive}
                selectedElementIndex={selectedElementIndex}
                onSelectElement={(index) => {
                  setSelectedElementIndex(index);
                  setIsPickerActive(false);
                }}
                adBlockEnabled={adBlockEnabled}
              />
            </div>
          ))}
        </div>

        {isDevToolsOpen && (
          <DevTools 
            pageData={activeTab.pageData} 
            onClose={() => { setIsDevToolsOpen(false); setIsPickerActive(false); }} 
            theme={theme}
            isPickerActive={isPickerActive}
            onTogglePicker={() => setIsPickerActive(!isPickerActive)}
            selectedElementIndex={selectedElementIndex}
            onHighlightElement={setSelectedElementIndex}
          />
        )}

        {isDownloadsOpen && (
          <DownloadsPanel 
            downloads={downloads}
            onClose={() => setIsDownloadsOpen(false)}
            onUpdateStatus={updateDownloadStatus}
            onClear={clearDownloads}
            onOpenDirectory={() => navigateTo('nupur://downloads')}
            theme={theme}
          />
        )}

        {isMenuOpen && (
          <BrowserMenu 
            onClose={() => setIsMenuOpen(false)}
            onNewTab={createNewTab}
            onToggleBookmark={toggleBookmark}
            isBookmarked={isCurrentPageBookmarked}
            onToggleDownloads={() => { setIsDownloadsOpen(!isDownloadsOpen); setIsMenuOpen(false); }}
            onManageBookmarks={() => { setIsBookmarksModalOpen(true); setIsMenuOpen(false); }}
            onReload={() => navigateTo(activeTab.url)}
            onForward={goForward}
            canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
            isDesktopSite={isDesktopSite}
            onToggleDesktopSite={() => setIsDesktopSite(!isDesktopSite)}
            onSearch={navigateTo}
            onToggleInspect={() => { 
              setIsDevToolsOpen(true); 
              setIsPickerActive(true); 
              setIsMenuOpen(false); 
            }}
            onShare={handleShare}
            onCopyLink={handleCopyLink}
            theme={theme}
            adBlockEnabled={adBlockEnabled}
            onToggleAdBlock={toggleAdBlock}
          />
        )}
      </div>

      {isBookmarksModalOpen && (
        <BookmarksModal 
          bookmarks={bookmarks}
          onClose={() => setIsBookmarksModalOpen(false)}
          onDelete={removeBookmark}
          onUpdate={updateBookmark}
          onNavigate={(url) => {
            navigateTo(url);
            setIsBookmarksModalOpen(false);
          }}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;
