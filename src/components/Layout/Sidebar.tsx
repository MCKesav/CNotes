import { useState } from 'react';
import { 
  Home, FolderOpen, Plus, Search, Bell, LogOut, 
  ChevronDown, ChevronRight, Trash2, Users, Shield,
  FileText
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface SidebarProps {
  onCreateNote: () => void;
  onCreateFolder: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ onCreateNote, onCreateFolder, activeView, setActiveView }: SidebarProps) {
  const { 
    currentUser, 
    logout, 
    getUserFolders, 
    getUserNotifications,
    selectedFolderId, 
    setSelectedFolder,
    deleteFolder
  } = useStore();
  
  const folders = getUserFolders();
  const notifications = getUserNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folderId: string | null) => {
    setSelectedFolder(folderId);
    setActiveView('notes');
  };

  const renderFolderTree = (parentId: string | null, level: number = 0): React.ReactNode[] => {
    const childFolders = folders.filter(f => f.parentId === parentId);
    
    return childFolders.map(folder => {
      const hasChildren = folders.some(f => f.parentId === folder.id);
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolderId === folder.id;
      
      return (
        <div key={folder.id}>
          <div 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group ${
              isSelected 
                ? 'bg-[#415a77] text-[#e0e1dd]' 
                : 'text-[#778da9] hover:bg-[#1b263b] hover:text-[#e0e1dd]'
            }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            {hasChildren && (
              <button onClick={() => toggleFolder(folder.id)} className="p-0.5">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            <div 
              className="flex items-center gap-2 flex-1"
              onClick={() => handleFolderClick(folder.id)}
            >
              <FolderOpen className="w-4 h-4" style={{ color: folder.color }} />
              <span className="text-sm truncate">{folder.name}</span>
            </div>
            <div className="hidden group-hover:flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                className="p-1 hover:bg-red-500/20 rounded text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && renderFolderTree(folder.id, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="w-64 bg-[#0d1b2a] border-r border-[#415a77]/30 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-[#415a77]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#415a77] to-[#1b263b] flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#e0e1dd]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#e0e1dd]">CNotes</h1>
            <p className="text-xs text-[#778da9]">{currentUser?.role === 'admin' ? 'Administrator' : 'Personal Notes'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 space-y-2">
        <button 
          onClick={onCreateNote}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-[#415a77] to-[#1b263b] hover:from-[#778da9] hover:to-[#415a77] text-[#e0e1dd] rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Note</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <button
          onClick={() => { handleFolderClick(null); setActiveView('notes'); }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            activeView === 'notes' && !selectedFolderId
              ? 'bg-[#415a77] text-[#e0e1dd]'
              : 'text-[#778da9] hover:bg-[#1b263b] hover:text-[#e0e1dd]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>All Notes</span>
        </button>

        <button
          onClick={() => setActiveView('search')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            activeView === 'search'
              ? 'bg-[#415a77] text-[#e0e1dd]'
              : 'text-[#778da9] hover:bg-[#1b263b] hover:text-[#e0e1dd]'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        <button
          onClick={() => setActiveView('notifications')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
            activeView === 'notifications'
              ? 'bg-[#415a77] text-[#e0e1dd]'
              : 'text-[#778da9] hover:bg-[#1b263b] hover:text-[#e0e1dd]'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto px-2 py-0.5 text-xs bg-[#415a77] text-[#e0e1dd] rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Folders Section */}
        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-[#778da9] uppercase tracking-wider">Folders</span>
            <button 
              onClick={onCreateFolder}
              className="p-1 hover:bg-[#1b263b] rounded text-[#778da9] hover:text-[#e0e1dd]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {renderFolderTree(null)}
        </div>

        {/* Admin Section */}
        {currentUser?.role === 'admin' && (
          <div className="pt-4">
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-[#778da9] uppercase tracking-wider">Admin</span>
            </div>
            <button
              onClick={() => setActiveView('admin-users')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                activeView === 'admin-users'
                  ? 'bg-[#415a77] text-[#e0e1dd]'
                  : 'text-[#778da9] hover:bg-[#1b263b] hover:text-[#e0e1dd]'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => setActiveView('admin-monitor')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                activeView === 'admin-monitor'
                  ? 'bg-[#415a77] text-[#e0e1dd]'
                  : 'text-[#778da9] hover:bg-[#1b263b] hover:text-[#e0e1dd]'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Monitor System</span>
            </button>
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-[#415a77]/30">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#415a77] to-[#778da9] flex items-center justify-center text-[#e0e1dd] font-semibold">
            {currentUser?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#e0e1dd] truncate">{currentUser?.name}</p>
            <p className="text-xs text-[#778da9] truncate">{currentUser?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
