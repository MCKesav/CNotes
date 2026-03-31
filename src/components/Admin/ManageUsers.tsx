import { useState } from 'react';
import { Users, Search, Trash2, Shield, ShieldOff, User, Mail, Calendar, FileText, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';

export default function ManageUsers() {
  const { getAllUsers, deleteUser, toggleUserRole, notes, folders, currentUser } = useStore();
  const allUsers = getAllUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserStats = (userId: string) => {
    const userNotes = notes.filter(n => n.ownerId === userId);
    const userFolders = folders.filter(f => f.ownerId === userId);
    return { notes: userNotes.length, folders: userFolders.length };
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }
    
    if (confirm('Are you sure you want to delete this user? All their notes and folders will be deleted.')) {
      deleteUser(userId);
      setSelectedUserId(null);
    }
  };

  const selectedUser = selectedUserId ? allUsers.find(u => u.id === selectedUserId) : null;

  return (
    <div className="h-full flex">
      {/* User List */}
      <div className="w-80 border-r border-[#415a77]/30 flex flex-col">
        <div className="p-4 border-b border-[#415a77]/30">
          <h2 className="text-xl font-bold text-[#e0e1dd] mb-4">Manage Users</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#778da9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-[#1b263b] border border-[#415a77]/50 rounded-lg text-[#e0e1dd] placeholder-[#778da9]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#415a77]"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map(user => {
            const stats = getUserStats(user.id);
            const isSelected = selectedUserId === user.id;
            
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`p-4 border-b border-[#415a77]/20 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#415a77]' : 'hover:bg-[#1b263b]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[#e0e1dd] font-semibold ${
                    user.role === 'admin' ? 'bg-gradient-to-br from-[#415a77] to-[#778da9]' : 'bg-[#1b263b]'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#e0e1dd] truncate">{user.name}</p>
                      {user.role === 'admin' && (
                        <Shield className="w-4 h-4 text-[#778da9]" />
                      )}
                    </div>
                    <p className="text-sm text-[#778da9] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-[#778da9]">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {stats.notes} notes
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {stats.folders} folders
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-[#415a77]/30">
          <p className="text-sm text-[#778da9]">
            Total: {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* User Details */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedUser ? (
          <div>
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-[#e0e1dd] ${
                  selectedUser.role === 'admin' ? 'bg-gradient-to-br from-[#415a77] to-[#778da9]' : 'bg-[#1b263b]'
                }`}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-[#e0e1dd]">{selectedUser.name}</h2>
                    {selectedUser.role === 'admin' && (
                      <span className="px-2 py-1 bg-[#415a77] text-[#e0e1dd] text-xs rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[#778da9]">{selectedUser.email}</p>
                </div>
              </div>
              
              {selectedUser.id !== currentUser?.id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleUserRole(selectedUser.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#415a77]/30 hover:bg-[#415a77]/50 text-[#e0e1dd] rounded-lg transition-colors"
                    title={selectedUser.role === 'admin' ? 'Remove admin role' : 'Make admin'}
                  >
                    {selectedUser.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    {selectedUser.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  {selectedUser.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-[#1b263b] rounded-xl">
                <div className="flex items-center gap-2 text-[#778da9] mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">User ID</span>
                </div>
                <p className="text-[#e0e1dd] font-mono text-sm">{selectedUser.id}</p>
              </div>
              
              <div className="p-4 bg-[#1b263b] rounded-xl">
                <div className="flex items-center gap-2 text-[#778da9] mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email</span>
                </div>
                <p className="text-[#e0e1dd]">{selectedUser.email}</p>
              </div>
              
              <div className="p-4 bg-[#1b263b] rounded-xl">
                <div className="flex items-center gap-2 text-[#778da9] mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Joined</span>
                </div>
                <p className="text-[#e0e1dd]">{format(new Date(selectedUser.createdAt), 'MMMM d, yyyy')}</p>
              </div>
              
              <div className="p-4 bg-[#1b263b] rounded-xl">
                <div className="flex items-center gap-2 text-[#778da9] mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Role</span>
                </div>
                <p className="text-[#e0e1dd] capitalize">{selectedUser.role}</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-[#e0e1dd] mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-gradient-to-br from-[#415a77]/20 to-[#1b263b] rounded-xl border border-[#415a77]/30">
                  <FileText className="w-8 h-8 text-[#415a77] mb-2" />
                  <p className="text-3xl font-bold text-[#e0e1dd]">{getUserStats(selectedUser.id).notes}</p>
                  <p className="text-sm text-[#778da9]">Notes created</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-[#778da9]/20 to-[#1b263b] rounded-xl border border-[#778da9]/30">
                  <FolderOpen className="w-8 h-8 text-[#778da9] mb-2" />
                  <p className="text-3xl font-bold text-[#e0e1dd]">{getUserStats(selectedUser.id).folders}</p>
                  <p className="text-sm text-[#778da9]">Folders created</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#1b263b] flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-[#415a77]" />
            </div>
            <h3 className="text-xl font-semibold text-[#e0e1dd] mb-2">Select a user</h3>
            <p className="text-[#778da9] max-w-sm">
              Click on a user from the list to view their details and manage their account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
