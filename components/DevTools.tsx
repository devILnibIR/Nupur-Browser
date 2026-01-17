
import React, { useState, useEffect } from 'react';
import { WebPageData } from '../types';

interface DevToolsProps {
  pageData?: WebPageData;
  onClose: () => void;
  theme?: 'dark' | 'light';
  isPickerActive?: boolean;
  onTogglePicker?: () => void;
  selectedElementIndex?: number | null;
  onHighlightElement?: (index: number | null) => void;
}

const DevTools: React.FC<DevToolsProps> = ({ 
  pageData, 
  onClose, 
  theme,
  isPickerActive,
  onTogglePicker,
  selectedElementIndex,
  onHighlightElement
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'console' | 'sources' | 'network'>('elements');
  const [logs, setLogs] = useState<{msg: string, type: string, time: string}[]>([]);

  useEffect(() => {
    if (pageData) {
      setLogs(prev => [
        ...prev,
        { msg: `Navigated to ${pageData.title}`, type: 'info', time: new Date().toLocaleTimeString() }
      ]);
    }
  }, [pageData]);

  const getSourceCode = () => {
    if (!pageData) return '<!-- No page data to inspect -->';
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${pageData.title}</title>
</head>
<body>
  <div id="root">
    ${pageData.content.split('\n').map(line => `<p>${line}</p>`).join('\n    ')}
  </div>
</body>
</html>`;
  };

  return (
    <div className={`absolute top-0 right-0 w-[450px] h-full z-40 flex flex-col border-l shadow-2xl animate-in slide-in-from-right duration-300 ${theme === 'dark' ? 'bg-[#202124] border-white/10 text-[#e8eaed]' : 'bg-[#f1f3f4] border-black/10 text-[#202124]'}`}>
      {/* Header Tabs */}
      <div className={`flex items-center justify-between px-2 py-1 border-b ${theme === 'dark' ? 'border-white/5 bg-[#35363a]' : 'border-black/5 bg-white'}`}>
        <div className="flex items-center h-8">
          <button 
            onClick={onTogglePicker}
            className={`w-8 h-8 flex items-center justify-center rounded transition-all mr-2 ${isPickerActive ? 'bg-indigo-500 text-white' : 'hover:bg-current/10 opacity-60'}`}
            title="Select an element in the page to inspect it"
          >
            <i className="fa-solid fa-arrow-pointer text-xs transform -rotate-45"></i>
          </button>
          
          <div className="flex items-center gap-1">
            {['elements', 'console', 'sources', 'network'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1.5 text-[11px] font-medium capitalize rounded transition-all ${activeTab === tab ? 'bg-indigo-500/10 text-indigo-500' : 'opacity-60 hover:opacity-100 hover:bg-current/5'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full opacity-40 hover:opacity-100 hover:bg-current/10 transition-all">
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed select-text custom-scrollbar">
        {activeTab === 'elements' && (
          <div className="space-y-1">
            <span className="text-blue-500 italic">&lt;!DOCTYPE html&gt;</span>
            <div className="ml-0">
              <span className="text-[#881280]">&lt;html&gt;</span>
              <div className="ml-4 border-l border-current/5 pl-2">
                <span className="text-[#881280]">&lt;head&gt;</span> ... <span className="text-[#881280]">&lt;/head&gt;</span>
                <br />
                <span className="text-[#881280]">&lt;body&gt;</span>
                <div className="ml-4 border-l border-current/5 pl-2">
                  <span className="text-[#881280]">&lt;div <span className="text-[#994500]">id</span>=<span className="text-[#1a1aa6]">"root"</span>&gt;</span>
                  <div className="ml-4 border-l border-current/5 pl-2 space-y-0.5">
                    {pageData?.content.split('\n').map((line, i) => (
                      <div 
                        key={i} 
                        onMouseEnter={() => !isPickerActive && onHighlightElement && onHighlightElement(i)}
                        onMouseLeave={() => !isPickerActive && onHighlightElement && onHighlightElement(null)}
                        className={`group relative px-1 rounded transition-all cursor-default 
                          ${selectedElementIndex === i 
                            ? 'bg-indigo-500/15 outline outline-1 outline-indigo-500/30' 
                            : 'hover:bg-indigo-500/10'}`}
                      >
                        {/* Realistic Chrome-style Tooltip in Elements Tree */}
                        <div className="absolute -top-6 left-2 flex items-center gap-1.5 bg-[#333] dark:bg-[#444] text-white text-[9px] px-2 py-0.5 rounded-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap border border-white/10">
                          <span className="text-[#ff79c6]">p</span>
                          <span className="text-[#bd93f9]">.content-block</span>
                          <span className="opacity-40">|</span>
                          <span className="opacity-80">800 × 24</span>
                        </div>

                        <span className="text-[#881280]">&lt;p <span className="text-[#994500]">class</span>=<span className="text-[#1a1aa6]">"content-block"</span>&gt;</span>
                        <span className="opacity-80 truncate inline-block max-w-[180px] align-bottom text-current">{line}</span>
                        <span className="text-[#881280]">&lt;/p&gt;</span>
                      </div>
                    ))}
                    {!pageData && <div className="opacity-30 italic">&lt;!-- No content available --&gt;</div>}
                  </div>
                  <span className="text-[#881280]">&lt;/div&gt;</span>
                </div>
                <span className="text-[#881280]">&lt;/body&gt;</span>
              </div>
              <span className="text-[#881280]">&lt;/html&gt;</span>
            </div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="space-y-1.5">
            <div className="flex gap-2 text-indigo-500 opacity-60 border-b border-current/5 pb-2 mb-2">
              <i className="fa-solid fa-ban text-[10px] mt-1 cursor-pointer" onClick={() => setLogs([])}></i>
              <span className="text-[10px] uppercase font-bold tracking-widest">Console Output</span>
            </div>
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2 group">
                <span className="opacity-20 text-[10px] w-16 flex-shrink-0">{log.time}</span>
                <i className="fa-solid fa-chevron-right text-[9px] mt-1 opacity-20"></i>
                <span className={`${log.type === 'error' ? 'text-red-500' : 'text-current opacity-80'}`}>{log.msg}</span>
              </div>
            ))}
            <div className="flex gap-2 items-center opacity-40 pt-2">
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
              <div className="w-1 h-4 bg-indigo-500 animate-pulse"></div>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <pre className="whitespace-pre-wrap break-all opacity-80 leading-5">
            {getSourceCode().split('\n').map((line, i) => (
              <div key={i} className="flex gap-4">
                <span className="w-8 text-right opacity-20 select-none">{i + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </pre>
        )}

        {activeTab === 'network' && (
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-4 gap-2 text-[10px] font-bold opacity-30 uppercase tracking-tighter border-b border-current/5 pb-2 mb-2">
              <span>Name</span>
              <span>Status</span>
              <span>Type</span>
              <span>Time</span>
            </div>
            {[
              { name: 'document.html', status: '200', type: 'document', time: '124ms' },
              { name: 'styles.css', status: '200', type: 'stylesheet', time: '45ms' },
              { name: 'bundle.js', status: '200', type: 'script', time: '210ms' },
              { name: 'favicon.ico', status: '200', type: 'image', time: '12ms' },
              { name: 'api/simulation', status: '200', type: 'fetch', time: '890ms' },
            ].map((req, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 py-1 px-1 rounded hover:bg-current/5 border-b border-current/5 last:border-0 text-[11px] opacity-80">
                <span className="truncate text-indigo-500 font-medium">{req.name}</span>
                <span className="text-green-500">{req.status} OK</span>
                <span className="opacity-50">{req.type}</span>
                <span className="opacity-50 text-right">{req.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Styles / Properties Panel */}
      <div className={`h-[280px] border-t overflow-auto ${theme === 'dark' ? 'border-white/5 bg-[#35363a]' : 'border-black/5 bg-[#f1f3f4]'}`}>
        <div className="flex items-center px-4 py-1.5 border-b border-current/5 bg-current/5 sticky top-0 z-10 backdrop-blur">
           <div className="flex gap-3">
             <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 border-b-2 border-indigo-500 pb-1">Styles</span>
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Computed</span>
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Layout</span>
           </div>
        </div>
        <div className="p-4 space-y-5">
           {selectedElementIndex !== null ? (
             <div className="space-y-5">
               <div className="space-y-1">
                 <div className="flex items-center justify-between">
                   <span className="text-[#881280] font-bold text-[11px]">element.style <span className="text-current font-normal opacity-40">{' {'}</span></span>
                 </div>
                 <div className="ml-4 space-y-0.5 opacity-80">
                   <p className="flex items-center gap-2">
                     <span className="w-3 h-3 rounded-sm bg-indigo-500/20 border border-indigo-500/30"></span>
                     background-color: <span className="text-[#1a1aa6]">rgba(79, 70, 229, 0.15);</span>
                   </p>
                   <p>outline: <span className="text-[#1a1aa6]">1px solid rgba(99, 102, 241, 0.3);</span></p>
                 </div>
                 <span className="text-current font-normal opacity-40">{'}'}</span>
               </div>

               <div className="space-y-1">
                 <div className="flex items-center justify-between">
                   <span className="text-[#881280] font-bold text-[11px]">p.content-block <span className="text-current font-normal opacity-40">{' {'}</span></span>
                   <span className="text-[10px] opacity-20 underline">index.css:42</span>
                 </div>
                 <div className="ml-4 space-y-0.5 opacity-80">
                   <p>display: <span className="text-[#1a1aa6]">block;</span></p>
                   <p>margin-block-start: <span className="text-[#1a1aa6]">1.2em;</span></p>
                   <p>margin-block-end: <span className="text-[#1a1aa6]">1.2em;</span></p>
                   <p>line-height: <span className="text-[#1a1aa6]">1.7;</span></p>
                   <p>font-size: <span className="text-[#1a1aa6]">17px;</span></p>
                   <p>color: <span className="text-[#1a1aa6]">var(--text-primary);</span></p>
                   <p className="line-through opacity-40">transition: <span className="text-[#1a1aa6]">none;</span></p>
                 </div>
                 <span className="text-current font-normal opacity-40">{'}'}</span>
               </div>

               {/* Simulated Box Model */}
               <div className="pt-4 flex justify-center">
                 <div className="w-32 h-20 border border-current/10 rounded flex items-center justify-center relative text-[9px] opacity-30">
                    <span className="absolute top-1 left-2">margin</span>
                    <div className="w-24 h-12 border border-indigo-500/20 rounded flex items-center justify-center relative bg-indigo-500/5">
                      <span className="absolute top-0.5 left-1 text-indigo-500/60 font-bold">padding</span>
                      <div className="w-16 h-6 border border-indigo-500/40 rounded bg-indigo-500/10 flex items-center justify-center">
                        <span className="text-indigo-500 font-bold">800 × 24</span>
                      </div>
                    </div>
                 </div>
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
               <i className="fa-solid fa-arrow-pointer text-2xl mb-3"></i>
               <p className="text-[11px] font-bold uppercase tracking-widest text-center px-10">Select an element on the page to view its styles</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DevTools;
