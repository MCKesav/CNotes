import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, Note, Folder, Notification, ActivityLog } from '../types';

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  
  // Notes
  notes: Note[];
  
  // Folders
  folders: Folder[];
  
  // Notifications
  notifications: Notification[];
  
  // Activity logs
  activityLogs: ActivityLog[];
  
  // UI State
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  searchQuery: string;
  
  // Auth actions
  register: (name: string, email: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // User actions
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  getAllUsers: () => User[];
  
  // Note actions
  createNote: (title: string, content: string, folderId: string | null) => Note | null;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => void;
  getNote: (noteId: string) => Note | undefined;
  getUserNotes: () => Note[];
  searchNotes: (query: string) => Note[];
  shareNote: (noteId: string, userId: string, permission: 'view' | 'edit') => void;
  removeCollaborator: (noteId: string, userId: string) => void;
  
  // Folder actions
  createFolder: (name: string, parentId: string | null) => Folder | null;
  updateFolder: (folderId: string, updates: Partial<Folder>) => void;
  deleteFolder: (folderId: string) => void;
  getUserFolders: () => Folder[];
  
  // Notification actions
  addNotification: (userId: string, message: string, type: 'share' | 'edit' | 'system', noteId?: string) => void;
  markNotificationRead: (notificationId: string) => void;
  getUserNotifications: () => Notification[];
  
  // Activity logging
  logActivity: (action: string, details?: string) => void;
  
  // UI actions
  setSelectedFolder: (folderId: string | null) => void;
  setSelectedNote: (noteId: string | null) => void;
  setSearchQuery: (query: string) => void;
}

const defaultAdmin: User = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@cnotes.com',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  avatar: undefined
};

const demoUser: User = {
  id: 'user-1',
  name: 'kesav',
  email: 'kesav@example.com',
  password: 'password123',
  role: 'user',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  avatar: undefined
};

const demoFolders: Folder[] = [
  { id: 'folder-1', name: 'Work', ownerId: 'user-1', parentId: null, createdAt: new Date(), color: '#415a77' },
  { id: 'folder-2', name: 'Personal', ownerId: 'user-1', parentId: null, createdAt: new Date(), color: '#778da9' },
  { id: 'folder-3', name: 'Projects', ownerId: 'user-1', parentId: 'folder-1', createdAt: new Date(), color: '#1b263b' },
];

const demoNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Welcome to CNotes',
    content: '# Welcome to CNotes!\n\nThis is your personal note-taking and collaboration platform.\n\n## Features\n- Create and organize notes\n- Share notes with collaborators\n- Organize with folders\n- Search across all your notes\n\nStart creating notes and stay organized!',
    folderId: null,
    ownerId: 'user-1',
    createdAt: new Date(),
    modifiedAt: new Date(),
    collaborators: [],
    tags: ['welcome', 'getting-started'],
    isPinned: true,
    color: '#415a77'
  },
  {
    id: 'note-2',
    title: 'Meeting Notes - Q1 Planning',
    content: '## Q1 Planning Meeting\n\n### Attendees\n- Team Lead\n- Developers\n- PM\n\n### Action Items\n1. Review project roadmap\n2. Set milestones\n3. Allocate resources\n\n### Next Steps\nSchedule follow-up meeting for next week.',
    folderId: 'folder-1',
    ownerId: 'user-1',
    createdAt: new Date(Date.now() - 86400000),
    modifiedAt: new Date(Date.now() - 86400000),
    collaborators: [],
    tags: ['meeting', 'planning'],
    isPinned: false,
    color: '#778da9'
  },
  {
    id: 'note-3',
    title: 'Shopping List',
    content: '## Weekly Shopping\n\n- [ ] Milk\n- [ ] Bread\n- [ ] Eggs\n- [ ] Vegetables\n- [ ] Fruits\n- [ ] Coffee',
    folderId: 'folder-2',
    ownerId: 'user-1',
    createdAt: new Date(Date.now() - 172800000),
    modifiedAt: new Date(Date.now() - 172800000),
    collaborators: [],
    tags: ['personal', 'shopping'],
    isPinned: false,
    color: '#e0e1dd'
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      users: [defaultAdmin, demoUser],
      isAuthenticated: false,
      notes: demoNotes,
      folders: demoFolders,
      notifications: [],
      activityLogs: [],
      selectedFolderId: null,
      selectedNoteId: null,
      searchQuery: '',

      // Auth actions
      register: (name, email, password) => {
        const { users } = get();
        if (users.find(u => u.email === email)) {
          return false;
        }
        const newUser: User = {
          id: uuidv4(),
          name,
          email,
          password,
          role: 'user',
          createdAt: new Date(),
        };
        set({ users: [...users, newUser] });
        get().logActivity('User registered', email);
        return true;
      },

      login: (email, password) => {
        const { users } = get();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          // Always sync currentUser from the users array so any admin updates are reflected
          set({ currentUser: user, isAuthenticated: true });
          get().logActivity('User logged in', email);
          return true;
        }
        return false;
      },

      logout: () => {
        get().logActivity('User logged out');
        set({ currentUser: null, isAuthenticated: false, selectedFolderId: null, selectedNoteId: null });
      },

      // User actions
      updateUser: (userId, updates) => {
        set(state => {
          const updatedUsers = state.users.map(u => u.id === userId ? { ...u, ...updates } : u);
          const updatedCurrentUser = state.currentUser?.id === userId
            ? updatedUsers.find(u => u.id === userId) ?? state.currentUser
            : state.currentUser;
          return { users: updatedUsers, currentUser: updatedCurrentUser };
        });
      },

      deleteUser: (userId) => {
        set(state => ({
          users: state.users.filter(u => u.id !== userId),
          notes: state.notes.filter(n => n.ownerId !== userId),
          folders: state.folders.filter(f => f.ownerId !== userId)
        }));
        get().logActivity('User deleted', userId);
      },

      getAllUsers: () => get().users,

      // Note actions
      createNote: (title, content, folderId) => {
        const { currentUser } = get();
        if (!currentUser) return null;
        
        const newNote: Note = {
          id: uuidv4(),
          title,
          content,
          folderId,
          ownerId: currentUser.id,
          createdAt: new Date(),
          modifiedAt: new Date(),
          collaborators: [],
          tags: [],
          isPinned: false,
          color: '#415a77'
        };
        
        set(state => ({ notes: [...state.notes, newNote] }));
        get().logActivity('Note created', title);
        return newNote;
      },

      updateNote: (noteId, updates) => {
        set(state => ({
          notes: state.notes.map(n => 
            n.id === noteId ? { ...n, ...updates, modifiedAt: new Date() } : n
          )
        }));
        get().logActivity('Note updated', noteId);
      },

      deleteNote: (noteId) => {
        const note = get().notes.find(n => n.id === noteId);
        set(state => ({
          notes: state.notes.filter(n => n.id !== noteId),
          selectedNoteId: state.selectedNoteId === noteId ? null : state.selectedNoteId
        }));
        get().logActivity('Note deleted', note?.title);
      },

      getNote: (noteId) => get().notes.find(n => n.id === noteId),

      getUserNotes: () => {
        const { currentUser, notes, selectedFolderId, searchQuery } = get();
        if (!currentUser) return [];
        
        let userNotes = notes.filter(n => 
          n.ownerId === currentUser.id || 
          n.collaborators.some(c => c.userId === currentUser.id)
        );
        
        if (selectedFolderId) {
          userNotes = userNotes.filter(n => n.folderId === selectedFolderId);
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          userNotes = userNotes.filter(n => 
            n.title.toLowerCase().includes(query) ||
            n.content.toLowerCase().includes(query) ||
            n.tags.some(t => t.toLowerCase().includes(query))
          );
        }
        
        return userNotes.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        });
      },

      searchNotes: (query) => {
        const { currentUser, notes } = get();
        if (!currentUser || !query) return [];
        
        const lowerQuery = query.toLowerCase();
        return notes.filter(n => 
          (n.ownerId === currentUser.id || n.collaborators.some(c => c.userId === currentUser.id)) &&
          (n.title.toLowerCase().includes(lowerQuery) ||
           n.content.toLowerCase().includes(lowerQuery) ||
           n.tags.some(t => t.toLowerCase().includes(lowerQuery)))
        );
      },

      shareNote: (noteId, userId, permission) => {
        const { currentUser, users } = get();
        const targetUser = users.find(u => u.id === userId);
        
        set(state => ({
          notes: state.notes.map(n => {
            if (n.id === noteId) {
              const existingIndex = n.collaborators.findIndex(c => c.userId === userId);
              const newCollaborators = [...n.collaborators];
              
              if (existingIndex >= 0) {
                newCollaborators[existingIndex] = { ...newCollaborators[existingIndex], permission };
              } else {
                newCollaborators.push({ userId, permission, addedAt: new Date() });
              }
              
              return { ...n, collaborators: newCollaborators };
            }
            return n;
          })
        }));
        
        if (targetUser) {
          get().addNotification(
            userId, 
            `${currentUser?.name} shared a note with you (${permission} access)`,
            'share',
            noteId
          );
        }
        get().logActivity('Note shared', `${noteId} with ${userId}`);
      },

      removeCollaborator: (noteId, userId) => {
        set(state => ({
          notes: state.notes.map(n => {
            if (n.id === noteId) {
              return { ...n, collaborators: n.collaborators.filter(c => c.userId !== userId) };
            }
            return n;
          })
        }));
      },

      // Folder actions
      createFolder: (name, parentId) => {
        const { currentUser } = get();
        if (!currentUser) return null;
        
        const newFolder: Folder = {
          id: uuidv4(),
          name,
          ownerId: currentUser.id,
          parentId,
          createdAt: new Date(),
          color: '#415a77'
        };
        
        set(state => ({ folders: [...state.folders, newFolder] }));
        get().logActivity('Folder created', name);
        return newFolder;
      },

      updateFolder: (folderId, updates) => {
        set(state => ({
          folders: state.folders.map(f => f.id === folderId ? { ...f, ...updates } : f)
        }));
      },

      deleteFolder: (folderId) => {
        const folder = get().folders.find(f => f.id === folderId);
        set(state => ({
          folders: state.folders.filter(f => f.id !== folderId && f.parentId !== folderId),
          notes: state.notes.map(n => n.folderId === folderId ? { ...n, folderId: null } : n),
          selectedFolderId: state.selectedFolderId === folderId ? null : state.selectedFolderId
        }));
        get().logActivity('Folder deleted', folder?.name);
      },

      getUserFolders: () => {
        const { currentUser, folders } = get();
        if (!currentUser) return [];
        return folders.filter(f => f.ownerId === currentUser.id);
      },

      // Notification actions
      addNotification: (userId, message, type, noteId) => {
        const notification: Notification = {
          id: uuidv4(),
          userId,
          message,
          type,
          read: false,
          createdAt: new Date(),
          noteId
        };
        set(state => ({ notifications: [...state.notifications, notification] }));
      },

      markNotificationRead: (notificationId) => {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        }));
      },

      getUserNotifications: () => {
        const { currentUser, notifications } = get();
        if (!currentUser) return [];
        return notifications
          .filter(n => n.userId === currentUser.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      // Activity logging
      logActivity: (action, details) => {
        const { currentUser } = get();
        const log: ActivityLog = {
          id: uuidv4(),
          userId: currentUser?.id || 'system',
          action,
          timestamp: new Date(),
          details
        };
        set(state => ({ 
          activityLogs: [log, ...state.activityLogs].slice(0, 100) 
        }));
      },

      // UI actions
      setSelectedFolder: (folderId) => set({ selectedFolderId: folderId }),
      setSelectedNote: (noteId) => set({ selectedNoteId: noteId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'cnotes-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
        notes: state.notes,
        folders: state.folders,
        notifications: state.notifications,
        activityLogs: state.activityLogs,
      }),
      // After rehydrating from localStorage, ensure currentUser is synced from
      // the users array so any updates (role changes, deletes) are reflected.
      onRehydrateStorage: () => (rehydratedState) => {
        if (!rehydratedState) return;
        const { currentUser, users, isAuthenticated } = rehydratedState;
        if (isAuthenticated && currentUser) {
          const fresh = users.find(u => u.id === currentUser.id);
          if (fresh) {
            rehydratedState.currentUser = fresh;
          } else {
            // User was deleted — force logout
            rehydratedState.currentUser = null;
            rehydratedState.isAuthenticated = false;
          }
        }
      },
    }
  )
);
