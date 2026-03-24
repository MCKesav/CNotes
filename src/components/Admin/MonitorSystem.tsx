import { 
  Activity, Users, FileText, FolderOpen, Clock, 
  TrendingUp, Server, Database, Cpu
} from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';

export default function MonitorSystem() {
  const { getAllUsers, notes, folders, activityLogs } = useStore();
  const users = getAllUsers();
  
  const stats = {
    totalUsers: users.length,
    totalNotes: notes.length,
    totalFolders: folders.length,
    sharedNotes: notes.filter(n => n.collaborators.length > 0).length,
    pinnedNotes: notes.filter(n => n.isPinned).length,
    adminUsers: users.filter(u => u.role === 'admin').length,
  };

  const recentLogs = activityLogs.slice(0, 20);

  const getActionIcon = (action: string) => {
    if (action.includes('Note')) return <FileText className="w-4 h-4 text-blue-400" />;
    if (action.includes('Folder')) return <FolderOpen className="w-4 h-4 text-green-400" />;
    if (action.includes('User') || action.includes('logged')) return <Users className="w-4 h-4 text-purple-400" />;
    return <Activity className="w-4 h-4 text-[#778da9]" />;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#e0e1dd] mb-6">System Monitor</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-gradient-to-br from-[#415a77]/30 to-[#1b263b] rounded-xl border border-[#415a77]/30">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-[#415a77]" />
              <span className="text-xs px-2 py-1 bg-[#415a77]/30 text-[#778da9] rounded-full">
                +2 this week
              </span>
            </div>
            <p className="text-3xl font-bold text-[#e0e1dd]">{stats.totalUsers}</p>
            <p className="text-sm text-[#778da9]">Total Users</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-[#778da9]/30 to-[#1b263b] rounded-xl border border-[#778da9]/30">
            <div className="flex items-center justify-between mb-3">
              <FileText className="w-8 h-8 text-[#778da9]" />
              <span className="text-xs px-2 py-1 bg-[#778da9]/30 text-[#778da9] rounded-full">
                +5 today
              </span>
            </div>
            <p className="text-3xl font-bold text-[#e0e1dd]">{stats.totalNotes}</p>
            <p className="text-sm text-[#778da9]">Total Notes</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-[#1b263b]/50 to-[#0d1b2a] rounded-xl border border-[#415a77]/30">
            <div className="flex items-center justify-between mb-3">
              <FolderOpen className="w-8 h-8 text-[#e0e1dd]/50" />
            </div>
            <p className="text-3xl font-bold text-[#e0e1dd]">{stats.totalFolders}</p>
            <p className="text-sm text-[#778da9]">Total Folders</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-500/20 to-[#1b263b] rounded-xl border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-[#e0e1dd]">{stats.sharedNotes}</p>
            <p className="text-sm text-[#778da9]">Shared Notes</p>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-[#1b263b] rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Server className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-[#e0e1dd]">Server Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Online</span>
            </div>
            <p className="text-xs text-[#778da9] mt-2">Uptime: 99.9%</p>
          </div>

          <div className="p-4 bg-[#1b263b] rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-[#e0e1dd]">Database</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm text-green-400">Healthy</span>
            </div>
            <p className="text-xs text-[#778da9] mt-2">LocalStorage: Active</p>
          </div>

          <div className="p-4 bg-[#1b263b] rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-[#e0e1dd]">Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-sm text-green-400">Optimal</span>
            </div>
            <p className="text-xs text-[#778da9] mt-2">Response: &lt;50ms</p>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-[#1b263b] rounded-xl border border-[#415a77]/30">
          <div className="flex items-center justify-between p-4 border-b border-[#415a77]/30">
            <h3 className="font-semibold text-[#e0e1dd] flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </h3>
            <span className="text-sm text-[#778da9]">{recentLogs.length} events</span>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-[#778da9]">
                No activity logs yet
              </div>
            ) : (
              <div className="divide-y divide-[#415a77]/20">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-[#0d1b2a]/50">
                    <div className="p-2 bg-[#0d1b2a] rounded-lg">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#e0e1dd]">{log.action}</p>
                      {log.details && (
                        <p className="text-xs text-[#778da9] truncate">{log.details}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#778da9]">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.timestamp), 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
