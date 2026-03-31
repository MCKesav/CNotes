import { format } from 'date-fns';
import { FileText, Pin, Users, MoreVertical, Trash2, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Note } from '../../types';

interface NoteListProps {
  onSelectNote: (note: Note) => void;
}

export default function NoteList({ onSelectNote }: NoteListProps) {
  const { getUserNotes, selectedNoteId, deleteNote, updateNote, getUserFolders } = useStore();
  const notes = getUserNotes();
  const folders = getUserFolders();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return null;
    const folder = folders.find(f => f.id === folderId);
    return folder?.name;
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    // Create a temporary element to strip HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    if (plainText.length <= maxLength) return plainText;
    return plainText.slice(0, maxLength) + '...';
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-[#1b263b] flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-[#415a77]" />
        </div>
        <h3 className="text-xl font-semibold text-[#e0e1dd] mb-2">No notes yet</h3>
        <p className="text-[#778da9] max-w-sm">
          Create your first note to get started. Click the "New Note" button in the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {notes.map(note => {
          const isSelected = selectedNoteId === note.id;
          const folderName = getFolderName(note.folderId);
          
          return (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className={`relative p-4 rounded-xl cursor-pointer transition-all group ${
                isSelected
                  ? 'bg-[#415a77] shadow-lg shadow-[#415a77]/20'
                  : 'bg-[#1b263b] hover:bg-[#1b263b]/80 border border-[#415a77]/20 hover:border-[#415a77]/40'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {note.isPinned && (
                    <Pin className="w-4 h-4 text-[#e0e1dd] flex-shrink-0" />
                  )}
                  <h3 className={`font-semibold truncate ${isSelected ? 'text-[#e0e1dd]' : 'text-[#e0e1dd]'}`}>
                    {note.title || 'Untitled'}
                  </h3>
                </div>
                
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === note.id ? null : note.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected ? 'hover:bg-[#778da9]/30' : 'hover:bg-[#415a77]/30'
                    } opacity-0 group-hover:opacity-100`}
                  >
                    <MoreVertical className="w-4 h-4 text-[#778da9]" />
                  </button>
                  
                  {menuOpenId === note.id && (
                    <div className="absolute right-0 top-8 w-40 bg-[#0d1b2a] border border-[#415a77]/30 rounded-lg shadow-xl z-10 overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateNote(note.id, { isPinned: !note.isPinned });
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e0e1dd] hover:bg-[#1b263b]"
                      >
                        <Pin className="w-4 h-4" />
                        {note.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content preview */}
              <p className={`text-sm mb-3 line-clamp-2 ${isSelected ? 'text-[#e0e1dd]/80' : 'text-[#778da9]'}`}>
                {truncateContent(note.content)}
              </p>

              {/* Bottom row */}
              <div className="flex items-center gap-3 text-xs">
                <span className={isSelected ? 'text-[#e0e1dd]/60' : 'text-[#778da9]/70'}>
                  {format(new Date(note.modifiedAt), 'MMM d, yyyy')}
                </span>
                
                {folderName && (
                  <span className={`flex items-center gap-1 ${isSelected ? 'text-[#e0e1dd]/60' : 'text-[#778da9]/70'}`}>
                    <FolderOpen className="w-3 h-3" />
                    {folderName}
                  </span>
                )}
                
                {note.collaborators.length > 0 && (
                  <span className={`flex items-center gap-1 ${isSelected ? 'text-[#e0e1dd]/60' : 'text-[#778da9]/70'}`}>
                    <Users className="w-3 h-3" />
                    {note.collaborators.length}
                  </span>
                )}
                
                {note.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {note.tags.slice(0, 2).map(tag => (
                      <span 
                        key={tag}
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          isSelected ? 'bg-[#778da9]/30 text-[#e0e1dd]' : 'bg-[#415a77]/30 text-[#778da9]'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className={isSelected ? 'text-[#e0e1dd]/60' : 'text-[#778da9]/60'}>
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Color indicator */}
              <div 
                className="absolute left-0 top-4 bottom-4 w-1 rounded-r"
                style={{ backgroundColor: note.color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
