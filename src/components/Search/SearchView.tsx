import { useState, useEffect } from 'react';
import { Search, FileText, FolderOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { Note } from '../../types';

interface SearchViewProps {
  onSelectNote: (note: Note) => void;
}

export default function SearchView({ onSelectNote }: SearchViewProps) {
  const { searchNotes, searchQuery, setSearchQuery, getUserFolders } = useStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [results, setResults] = useState<Note[]>([]);
  const folders = getUserFolders();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
      if (localQuery.trim()) {
        setResults(searchNotes(localQuery));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, searchNotes, setSearchQuery]);

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return null;
    const folder = folders.find(f => f.id === folderId);
    return folder?.name;
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-[#415a77] text-[#e0e1dd] px-0.5 rounded">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-6 border-b border-[#415a77]/30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#778da9]" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search notes by title, content, or tags..."
            className="w-full pl-12 pr-4 py-3 bg-[#1b263b] border border-[#415a77]/50 rounded-xl text-[#e0e1dd] placeholder-[#778da9]/50 focus:outline-none focus:ring-2 focus:ring-[#415a77] focus:border-transparent transition"
            autoFocus
          />
        </div>
        
        {localQuery && (
          <p className="mt-3 text-sm text-[#778da9]">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6">
        {!localQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#1b263b] flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-[#415a77]" />
            </div>
            <h3 className="text-xl font-semibold text-[#e0e1dd] mb-2">Search your notes</h3>
            <p className="text-[#778da9] max-w-sm">
              Find notes by title, content, or tags. Start typing to search.
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#1b263b] flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-[#415a77]" />
            </div>
            <h3 className="text-xl font-semibold text-[#e0e1dd] mb-2">No results found</h3>
            <p className="text-[#778da9] max-w-sm">
              Try different keywords or check your spelling.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map(note => {
              const folderName = getFolderName(note.folderId);
              
              return (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="p-4 bg-[#1b263b] hover:bg-[#1b263b]/80 border border-[#415a77]/20 hover:border-[#415a77]/40 rounded-xl cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-[#e0e1dd]">
                      {highlightMatch(note.title || 'Untitled', localQuery)}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-[#778da9] line-clamp-2 mb-3">
                    {highlightMatch(note.content.slice(0, 150), localQuery)}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-[#778da9]/70">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(note.modifiedAt), 'MMM d, yyyy')}
                    </span>
                    
                    {folderName && (
                      <span className="flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        {folderName}
                      </span>
                    )}
                    
                    {note.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-[#415a77]/30 rounded text-xs">
                            {highlightMatch(`#${tag}`, localQuery)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
