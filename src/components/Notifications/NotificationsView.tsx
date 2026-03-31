import { Bell, FileText, Share2, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { Note } from '../../types';

interface NotificationsViewProps {
  onSelectNote: (note: Note) => void;
}

export default function NotificationsView({ onSelectNote }: NotificationsViewProps) {
  const { getUserNotifications, markNotificationRead, clearNotifications, getNote } = useStore();
  const notifications = getUserNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'share':
        return <Share2 className="w-5 h-5 text-blue-400" />;
      case 'edit':
        return <FileText className="w-5 h-5 text-green-400" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-[#778da9]" />;
    }
  };

  const handleNotificationClick = (notificationId: string, noteId?: string) => {
    markNotificationRead(notificationId);
    if (noteId) {
      const note = getNote(noteId);
      if (note) {
        onSelectNote(note);
      }
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-[#1b263b] flex items-center justify-center mb-4">
          <Bell className="w-10 h-10 text-[#415a77]" />
        </div>
        <h3 className="text-xl font-semibold text-[#e0e1dd] mb-2">No notifications</h3>
        <p className="text-[#778da9] max-w-sm">
          You're all caught up! Notifications about shared notes and updates will appear here.
        </p>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#e0e1dd]">Notifications</h2>
          <div className="flex items-center gap-2">
            {unreadNotifications.length > 0 && (
              <span className="px-3 py-1 bg-[#415a77] text-[#e0e1dd] text-sm rounded-full">
                {unreadNotifications.length} unread
              </span>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="flex items-center gap-1.5 px-3 py-1 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {unreadNotifications.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-[#778da9] uppercase tracking-wider mb-3">New</h3>
            <div className="space-y-2">
              {unreadNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.noteId)}
                  className="flex items-start gap-4 p-4 bg-[#1b263b] border border-[#415a77]/30 rounded-xl cursor-pointer hover:bg-[#1b263b]/80 transition-all"
                >
                  <div className="p-2 bg-[#0d1b2a] rounded-lg">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e0e1dd] font-medium">{notification.message}</p>
                    <p className="text-sm text-[#778da9] mt-1">
                      {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-[#415a77] rounded-full mt-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {readNotifications.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#778da9] uppercase tracking-wider mb-3">Earlier</h3>
            <div className="space-y-2">
              {readNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.noteId)}
                  className="flex items-start gap-4 p-4 bg-[#1b263b]/50 border border-[#415a77]/20 rounded-xl cursor-pointer hover:bg-[#1b263b]/80 transition-all"
                >
                  <div className="p-2 bg-[#0d1b2a]/50 rounded-lg opacity-60">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#778da9]">{notification.message}</p>
                    <p className="text-sm text-[#778da9]/60 mt-1">
                      {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
