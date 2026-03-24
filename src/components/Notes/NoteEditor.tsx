import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Save, X, Share2, FolderOpen, Tag, Palette, Trash2, 
  Pin, ChevronDown, Check
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Note } from '../../types';

interface NoteEditorProps {
  note: Note | null;
  onClose: () => void;
  isNew?: boolean;
}

const COLORS = ['#415a77', '#778da9', '#1b263b', '#e0e1dd', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function NoteEditor({ note, onClose, isNew = false }: NoteEditorProps) {
  const { 
    createNote, updateNote, deleteNote, getUserFolders, getAllUsers, 
    currentUser, shareNote, removeCollaborator 
  } = useStore();
  
  const folders = getUserFolders();
  const allUsers = getAllUsers().filter(u => u.id !== currentUser?.id);
  
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [folderId, setFolderId] = useState<string | null>(note?.folderId || null);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [color, setColor] = useState(note?.color || '#415a77');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [tagInput, setTagInput] = useState('');
  
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const collaborators = note?.collaborators || [];
  const isOwner = note?.ownerId === currentUser?.id;
  const canEdit = isNew || isOwner || collaborators.find(c => c.userId === currentUser?.id)?.permission === 'edit';

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setFolderId(note.folderId);
      setTags(note.tags);
      setColor(note.color);
      setIsPinned(note.isPinned);
    }
  }, [note]);

  useEffect(() => {
    if (note) {
      const changed = 
        title !== note.title ||
        content !== note.content ||
        folderId !== note.folderId ||
        JSON.stringify(tags) !== JSON.stringify(note.tags) ||
        color !== note.color ||
        isPinned !== note.isPinned;
      setHasChanges(changed);
    } else {
      setHasChanges(title.length > 0 || content.length > 0);
    }
  }, [title, content, folderId, tags, color, isPinned, note]);

  const handleSave = async () => {
    if (!canEdit) return;
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (isNew) {
      const newNote = createNote(title || 'Untitled', content, folderId);
      if (newNote) {
        updateNote(newNote.id, { tags, color, isPinned });
      }
    } else if (note) {
      updateNote(note.id, { title, content, folderId, tags, color, isPinned });
    }
    
    setIsSaving(false);
    setHasChanges(false);
    
    if (isNew) {
      onClose();
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleShare = (userId: string, permission: 'view' | 'edit') => {
    if (note && isOwner) {
      shareNote(note.id, userId, permission);
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    if (note && isOwner) {
      removeCollaborator(note.id, userId);
    }
  };

  const handleDelete = () => {
    if (note && isOwner && confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1b2a]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#415a77]/30">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-[#e0e1dd]">
              {isNew ? 'New Note' : 'Edit Note'}
            </h2>
            {note && (
              <p className="text-xs text-[#778da9]">
                Last modified: {format(new Date(note.modifiedAt), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit && hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#415a77] to-[#1b263b] hover:from-[#778da9] hover:to-[#415a77] text-[#e0e1dd] rounded-lg transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#e0e1dd]/30 border-t-[#e0e1dd] rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[#415a77]/30">
        {/* Pin */}
        <button
          onClick={() => canEdit && setIsPinned(!isPinned)}
          disabled={!canEdit}
          className={`p-2 rounded-lg transition-colors ${
            isPinned ? 'bg-[#415a77] text-[#e0e1dd]' : 'hover:bg-[#1b263b] text-[#778da9]'
          } disabled:opacity-50`}
          title={isPinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin className="w-5 h-5" />
        </button>

        {/* Folder */}
        <div className="relative">
          <button
            onClick={() => canEdit && setShowFolderMenu(!showFolderMenu)}
            disabled={!canEdit}
            className="flex items-center gap-2 px-3 py-2 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] transition-colors disabled:opacity-50"
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-sm">{folders.find(f => f.id === folderId)?.name || 'No folder'}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showFolderMenu && (
            <div className="absolute left-0 top-12 w-48 bg-[#0d1b2a] border border-[#415a77]/30 rounded-lg shadow-xl z-20 overflow-hidden">
              <button
                onClick={() => { setFolderId(null); setShowFolderMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e0e1dd] hover:bg-[#1b263b] ${!folderId ? 'bg-[#1b263b]' : ''}`}
              >
                <FolderOpen className="w-4 h-4 text-[#778da9]" />
                No folder
                {!folderId && <Check className="w-4 h-4 ml-auto" />}
              </button>
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => { setFolderId(folder.id); setShowFolderMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e0e1dd] hover:bg-[#1b263b] ${folderId === folder.id ? 'bg-[#1b263b]' : ''}`}
                >
                  <FolderOpen className="w-4 h-4" style={{ color: folder.color }} />
                  {folder.name}
                  {folderId === folder.id && <Check className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color */}
        <div className="relative">
          <button
            onClick={() => canEdit && setShowColorMenu(!showColorMenu)}
            disabled={!canEdit}
            className="flex items-center gap-2 px-3 py-2 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] transition-colors disabled:opacity-50"
          >
            <Palette className="w-5 h-5" />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
          </button>
          
          {showColorMenu && (
            <div className="absolute left-0 top-12 p-2 bg-[#0d1b2a] border border-[#415a77]/30 rounded-lg shadow-xl z-20">
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setShowColorMenu(false); }}
                    className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-[#e0e1dd]' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Share (only for owner) */}
        {isOwner && !isNew && (
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share</span>
              {collaborators.length > 0 && (
                <span className="px-1.5 py-0.5 bg-[#415a77] text-[#e0e1dd] text-xs rounded-full">
                  {collaborators.length}
                </span>
              )}
            </button>
            
            {showShareMenu && (
              <div className="absolute left-0 top-12 w-72 bg-[#0d1b2a] border border-[#415a77]/30 rounded-lg shadow-xl z-20 overflow-hidden">
                <div className="p-3 border-b border-[#415a77]/30">
                  <h4 className="text-sm font-semibold text-[#e0e1dd]">Share with users</h4>
                </div>
                
                {/* Current collaborators */}
                {collaborators.length > 0 && (
                  <div className="p-3 border-b border-[#415a77]/30">
                    <p className="text-xs text-[#778da9] mb-2">Current collaborators</p>
                    {collaborators.map(collab => {
                      const user = allUsers.find(u => u.id === collab.userId);
                      return (
                        <div key={collab.userId} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#415a77] flex items-center justify-center text-xs text-[#e0e1dd]">
                              {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm text-[#e0e1dd]">{user?.name}</p>
                              <p className="text-xs text-[#778da9]">{collab.permission}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveCollaborator(collab.userId)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Add collaborators */}
                <div className="p-3 max-h-48 overflow-y-auto">
                  <p className="text-xs text-[#778da9] mb-2">Add collaborators</p>
                  {allUsers.filter(u => !collaborators.find(c => c.userId === u.id)).map(user => (
                    <div key={user.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#415a77] flex items-center justify-center text-xs text-[#e0e1dd]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm text-[#e0e1dd]">{user.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleShare(user.id, 'view')}
                          className="px-2 py-1 text-xs bg-[#1b263b] hover:bg-[#415a77] text-[#778da9] hover:text-[#e0e1dd] rounded transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleShare(user.id, 'edit')}
                          className="px-2 py-1 text-xs bg-[#1b263b] hover:bg-[#415a77] text-[#778da9] hover:text-[#e0e1dd] rounded transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Delete (only for owner) */}
        {isOwner && !isNew && (
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          disabled={!canEdit}
          className="w-full text-2xl font-bold text-[#e0e1dd] bg-transparent border-none outline-none placeholder-[#778da9]/50 mb-4 disabled:opacity-70"
        />
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          disabled={!canEdit}
          className="w-full h-[calc(100%-120px)] text-[#e0e1dd] bg-transparent border-none outline-none resize-none placeholder-[#778da9]/50 leading-relaxed disabled:opacity-70"
        />

        {/* Tags */}
        <div className="mt-4 pt-4 border-t border-[#415a77]/30">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-[#778da9]" />
            {tags.map(tag => (
              <span 
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-[#1b263b] text-[#778da9] rounded text-sm"
              >
                #{tag}
                {canEdit && (
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-[#e0e1dd]">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {canEdit && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="px-2 py-1 bg-transparent text-[#e0e1dd] text-sm outline-none placeholder-[#778da9]/50 w-24"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
