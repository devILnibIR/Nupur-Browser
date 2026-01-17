
import React from 'react';

interface BrowserMenuProps {
  onClose: () => void;
  onNewTab: () => void;
  onToggleBookmark: () => void;
  isBookmarked: boolean;
  onToggleDownloads: () => void;
  onManageBookmarks: () => void;
  onReload: () => void;
  onForward: () => void;
  canGoForward: boolean;
  isDesktopSite: boolean;
  onToggleDesktopSite: () => void;
  onSearch: (query: string) => void;
  onToggleInspect: () => void;
  onShare: () => void;
  onCopyLink: () => void;
  theme?: 'dark' | 'light';
  adBlockEnabled?: boolean;
  onToggleAdBlock?: () => void;
}

const BrowserMenu: React.FC<BrowserMenuProps> = ({
  onClose,
  onNewTab,
  onToggleBookmark,
  isBookmarked,
  onToggleDownloads,
  onManageBookmarks,
  onReload,
  onForward,
  canGoForward,
  isDesktopSite,
  onToggleDesktopSite,
  onSearch,
  onToggleInspect,
  onShare,
  onCopyLink,
  theme,
  adBlockEnabled,
  onToggleAdBlock
}) => {
  const MenuItem = ({ icon, label, onClick, showCheckbox, isChecked }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left`}
    >
      <div className="w-4 h-4 flex items-center justify-center opacity-60">
        <i className={`fa-solid ${icon} text-[13px]`}></i>
      </div>
      <span className="flex-1 text-[13px] font-medium text-[#333] dark:text-[#ccc]">{label}</span>
      {showCheckbox && (
        <div className={`w-3.5 h-3.5 rounded border ${isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-current/20'} flex items-center justify-center transition-all`}>
          {isChecked && <i className="fa-solid fa-check text-[8px] text-white"></i>}
        </div>
      )}
    </button>
  );

  const Divider = () => <div className="h-[1px] bg-black/5 dark:bg-white/5 my-0.5" />;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Invisible backdrop to catch clicks and close menu */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className={`absolute top-2 right-4 w-[230px] bg-white dark:bg-[#202124] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] overflow-hidden border ${theme === 'dark' ? 'border-white/10' : 'border-black/5'} animate-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right`}>
        
        {/* Top Control Bar - Scaled Down */}
        <div className="flex items-center justify-around p-1.5 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <button 
            disabled={!canGoForward}
            onClick={onForward}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${canGoForward ? 'hover:bg-black/5 dark:hover:bg-white/5 text-[#333] dark:text-[#ccc]' : 'opacity-20 cursor-default text-current'}`}
          >
            <i className="fa-solid fa-arrow-right text-[13px]"></i>
          </button>
          <button 
            onClick={onToggleBookmark}
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all ${isBookmarked ? 'text-indigo-500' : 'text-[#333] dark:text-[#ccc]'}`}
          >
            <i className={`${isBookmarked ? 'fa-solid' : 'fa-regular'} fa-star text-[13px]`}></i>
          </button>
          <button 
            onClick={onToggleDownloads}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#333] dark:text-[#ccc]"
          >
            <i className="fa-solid fa-download text-[13px]"></i>
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#333] dark:text-[#ccc]"
          >
            <i className="fa-solid fa-circle-info text-[13px]"></i>
          </button>
          <button 
            onClick={onReload}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#333] dark:text-[#ccc]"
          >
            <i className="fa-solid fa-rotate-right text-[13px]"></i>
          </button>
        </div>

        {/* Menu List Items - Compact */}
        <div className="py-1">
          {/* Group 1 */}
          <MenuItem icon="fa-plus" label="New tab" onClick={onNewTab} />
          <MenuItem icon="fa-user-secret" label="New Incognito tab" onClick={() => {}} />
          <MenuItem icon="fa-layer-group" label="Add tab to group" onClick={() => {}} />
          
          <Divider />

          {/* Group 2 */}
          <MenuItem icon="fa-clock-rotate-left" label="History" onClick={() => onSearch('nupur://history')} />
          <MenuItem icon="fa-trash" label="Clear data" onClick={() => {}} />

          <Divider />

          {/* Group 3 */}
          <MenuItem icon="fa-check-to-slot" label="Downloads" onClick={onToggleDownloads} />
          <MenuItem icon="fa-star" label="Bookmarks" onClick={onManageBookmarks} />
          <MenuItem icon="fa-shield-halved" label="Ad Block" onClick={onToggleAdBlock} showCheckbox={true} isChecked={adBlockEnabled} />

          <Divider />

          {/* Group 4 */}
          <MenuItem icon="fa-share-nodes" label="Share..." onClick={onShare} />
          <MenuItem icon="fa-link" label="Copy link" onClick={onCopyLink} />
          <MenuItem icon="fa-magnifying-glass" label="Find in page" onClick={() => {}} />
          <MenuItem icon="fa-language" label="Translate..." onClick={() => {}} />
          <MenuItem icon="fa-mobile-screen-button" label="Add to Home" onClick={() => {}} />
          <MenuItem 
            icon="fa-desktop" 
            label="Desktop site" 
            onClick={onToggleDesktopSite} 
            showCheckbox={true} 
            isChecked={isDesktopSite} 
          />
          <MenuItem icon="fa-code" label="Inspect Element" onClick={onToggleInspect} />

          <Divider />

          {/* Group 5 */}
          <MenuItem icon="fa-gear" label="Settings" onClick={() => {}} />
          <MenuItem icon="fa-circle-question" label="Help" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default BrowserMenu;
