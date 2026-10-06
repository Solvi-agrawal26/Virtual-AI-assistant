import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Conversation } from '../../types';
import {
  Plus,
  MessageSquare,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    startNewChat,
    renameConversation,
    deleteConversation,
    searchQuery,
    setSearchQuery,
    isLoadingConversations,
  } = useChat();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string, e: React.FormEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim()) {
      renameConversation(id, editingTitle);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(id);
    }
  };

  // Group conversations by date
  const groupConversations = () => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    conversations.forEach((conv) => {
      const convDate = new Date(conv.updatedAt || conv.createdAt);
      const diffTime = now.getTime() - convDate.getTime();
      const diffDays = Math.floor(diffTime / oneDay);

      if (diffDays === 0 && now.getDate() === convDate.getDate()) {
        today.push(conv);
      } else if (diffDays <= 1) {
        yesterday.push(conv);
      } else if (diffDays <= 7) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    });

    return [
      { label: 'Today', list: today },
      { label: 'Yesterday', list: yesterday },
      { label: 'Previous 7 Days', list: last7Days },
      { label: 'Older', list: older },
    ].filter((group) => group.list.length > 0);
  };

  const groups = groupConversations();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 bg-gray-50/95 dark:bg-[#0E131F]/95 backdrop-blur-lg border-r border-gray-200 dark:border-dark-border flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header: New Chat */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                startNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-sm hover:shadow hover:border-brand-400 dark:hover:border-brand-500 font-medium text-sm text-gray-800 dark:text-gray-100 transition-all group"
            >
              <Plus className="w-4 h-4 text-brand-500 group-hover:rotate-90 transition-transform duration-200" />
              <span>New Chat</span>
            </button>

            <button
              onClick={onClose}
              className="md:hidden ml-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-200/50 dark:bg-dark-surface/60 border border-transparent focus:border-brand-400 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-dark-surface text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {isLoadingConversations && conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {group.label}
                </div>
                {group.list.map((conv) => {
                  const isActive = activeConversation?.id === conv.id;
                  const isEditing = editingId === conv.id;
                  const isMenuOpen = menuOpenId === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        selectConversation(conv.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition-all ${
                        isActive
                          ? 'bg-brand-50/80 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-dark-surface/80'
                      }`}
                    >
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(conv.id, e);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="flex-1 px-2 py-0.5 text-xs bg-white dark:bg-dark-surface border border-brand-500 rounded text-gray-900 dark:text-white focus:outline-none"
                          />
                          <button
                            onClick={(e) => handleSaveRename(conv.id, e)}
                            className="p-1 text-emerald-500 hover:text-emerald-600"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
                            <span className="truncate text-xs md:text-sm">{conv.title}</span>
                          </div>

                          {/* 3 dots action menu */}
                          <div
                            className="relative flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setMenuOpenId(isMenuOpen ? null : conv.id)}
                              className={`p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-opacity ${
                                isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 top-6 w-32 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-lg py-1 z-50 text-xs">
                                <button
                                  onClick={(e) => handleStartRename(conv, e)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-700 dark:text-gray-200"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Rename</span>
                                </button>
                                <button
                                  onClick={(e) => handleDelete(conv.id, e)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-dark-border/80 text-[11px] text-gray-400 text-center">
          Nova AI &bull; Claude 3.5 Sonnet
        </div>
      </aside>
    </>
  );
};
