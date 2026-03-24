import { Search, Bell } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface HeaderProps {
  onSearchClick: () => void;
  onNotificationsClick: () => void;
}

export default function Header({ onSearchClick, onNotificationsClick }: HeaderProps) {
  const { currentUser, getUserNotifications, searchQuery, setSearchQuery } = useStore();
  const notifications = getUserNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 px-6 border-b border-[#415a77]/30 flex items-center justify-between bg-[#0d1b2a]">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#778da9]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={onSearchClick}
            placeholder="Search notes... (⌘K)"
            className="w-72 pl-10 pr-4 py-2 bg-[#1b263b] border border-[#415a77]/30 rounded-lg text-sm text-[#e0e1dd] placeholder-[#778da9]/50 focus:outline-none focus:ring-2 focus:ring-[#415a77] focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNotificationsClick}
          className="relative p-2 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#415a77] rounded-full" />
          )}
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-[#415a77]/30">
          <div className="text-right">
            <p className="text-sm font-medium text-[#e0e1dd]">{currentUser?.name}</p>
            <p className="text-xs text-[#778da9]">{currentUser?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#415a77] to-[#778da9] flex items-center justify-center text-[#e0e1dd] font-semibold">
            {currentUser?.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
