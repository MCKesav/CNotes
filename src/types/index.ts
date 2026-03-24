export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  avatar?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  ownerId: string;
  createdAt: Date;
  modifiedAt: Date;
  collaborators: Collaborator[];
  tags: string[];
  isPinned: boolean;
  color: string;
}

export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;
  createdAt: Date;
  color: string;
}

export interface Collaborator {
  userId: string;
  permission: 'view' | 'edit';
  addedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'share' | 'edit' | 'system';
  read: boolean;
  createdAt: Date;
  noteId?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalNotes: number;
  totalFolders: number;
  activeUsers: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details?: string;
}
