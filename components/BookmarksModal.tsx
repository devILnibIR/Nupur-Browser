
import React, { useState } from 'react';
import { Bookmark } from '../types';

interface BookmarksModalProps {
  bookmarks: Bookmark[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Bookmark>) => void;
  onNavigate: (url: string) => void;
  theme?: 'dark' | 'light';
}

const BookmarksModal: React.FC<BookmarksModalProps> = ({ bookmarks, onClose, onDelete, onUpdate, onNavigate, theme }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEdit = (b: Bookmark) => {
    setEditingId(b.id);
    setEditTitle(b.title);
  };

  const saveEdit = (id: string) => {
    onUpdate(id, { title: editTitle });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className={`relative w-full max-w-xl glass rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] border ${theme === 'dark' ? 'border-white/20' : 'border-black/5'} animate-in zoom-in-95 duration-300`}>
        <div className={`flex items-center justify-between px-8 py-6 border-b border-current/10 bg-current/5 text-current`}>
          <div>
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3">
              <i className="fa-solid fa-bookmark text-indigo-500"></i>
              Nexus Storage
            </h2>
            <p className="text-[10px] opacity-30 font-bold uppercase tracking-widest mt-1">Saved Hyper-Link Nodes</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-current/10 opacity-40 hover:opacity-100 transition-all"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar text-current">
          {bookmarks.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-current/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-current/5 border-dashed">
                <i className="fa-solid fa-ghost text-3xl opacity-10"></i>
              </div>
              <p className="font-bold text-lg tracking-tight">Void Detected</p>
              <p className="opacity-20 text-xs mt-1">No bookmark data synchronized to this node.</p>
            </div>
          ) : (
            bookmarks.map(b => (
              <div 
                key={b.id}
                className={`group flex items-center gap-4 p-4 rounded-3xl bg-current/5 hover:bg-current/10 border border-transparent hover:border-current/10 transition-all duration-300`}
              >
                <div 
                  className="flex-1 flex items-center gap-4 min-w-0 cursor-pointer"
                  onClick={() => editingId !== b.id && onNavigate(b.url)}
                >
                  <div className={`w-12 h-12 flex-shrink-0 bg-current/5 rounded-2xl flex items-center justify-center border border-current/5`}>
                    {b.icon && b.icon.length < 5 ? (
                      <span className="text-xl">{b.icon}</span>
                    ) : b.icon ? (
                      <img src={b.icon} alt="" className="w-6 h-6 object-contain opacity-50 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <i className="fa-solid fa-link opacity-10 group-hover:opacity-100 group-hover:text-indigo-500 transition-all"></i>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    {editingId === b.id ? (
                      <input 
                        autoFocus
                        className={`bg-current/10 border border-indigo-500 outline-none rounded-xl px-3 py-1 text-sm text-current mb-1`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(b.id)}
                        onBlur={() => saveEdit(b.id)}
                      />
                    ) : (
                      <span className="text-sm font-bold opacity-90 truncate group-hover:opacity-100 transition-opacity">{b.title}</span>
                    )}
                    <span className="text-[10px] opacity-20 truncate uppercase tracking-tighter">{b.url}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => handleEdit(b)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-current/5 hover:bg-current/10 opacity-40 hover:opacity-100 transition-all">
                    <i className="fa-solid fa-pen-nib text-xs"></i>
                  </button>
                  <button onClick={() => onDelete(b.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500 text-white/40 hover:text-white transition-all">
                    <i className="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={`p-8 border-t border-current/10 bg-current/5 flex justify-between items-center text-current`}>
          <p className="text-[10px] opacity-20 font-bold tracking-widest uppercase">Nodes: {bookmarks.length}</p>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            Terminal Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarksModal;
