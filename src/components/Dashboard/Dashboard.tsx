import { useState } from 'react';
import Sidebar from '../Layout/Sidebar';
import NoteList from '../Notes/NoteList';
import NoteEditor from '../Notes/NoteEditor';
import SearchView from '../Search/SearchView';
import NotificationsView from '../Notifications/NotificationsView';
import ManageUsers from '../Admin/ManageUsers';
import MonitorSystem from '../Admin/MonitorSystem';
import CreateFolderModal from '../Modals/CreateFolderModal';
import { useStore } from '../../store/useStore';
import { Note } from '../../types';

export default function Dashboard() {
  const { setSelectedNote, selectedNoteId, getNote, selectedFolderId, getUserFolders } = useStore();
  const [activeView, setActiveView] = useState('notes');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  
  const selectedNote = selectedNoteId ? getNote(selectedNoteId) : null;
  const folders = getUserFolders();
  const currentFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null;

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note.id);
    setIsCreatingNote(false);
    setActiveView('notes');
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsCreatingNote(true);
    setActiveView('notes');
  };

  const handleCloseEditor = () => {
    setSelectedNote(null);
    setIsCreatingNote(false);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'search':
        return <SearchView onSelectNote={handleSelectNote} />;
      case 'notifications':
        return <NotificationsView onSelectNote={handleSelectNote} />;
      case 'admin-users':
        return <ManageUsers />;
      case 'admin-monitor':
        return <MonitorSystem />;
      default:
        return (
          <div className="flex h-full">
            {/* Note List Panel */}
            <div className="w-80 border-r border-[#415a77]/30 flex flex-col bg-[#0d1b2a]">
              <div className="p-4 border-b border-[#415a77]/30">
                <h2 className="text-lg font-semibold text-[#e0e1dd]">
                  {currentFolder ? currentFolder.name : 'All Notes'}
                </h2>
                {currentFolder && (
                  <p className="text-sm text-[#778da9]">
                    Folder
                  </p>
                )}
              </div>
              <NoteList onSelectNote={handleSelectNote} />
            </div>
            
            {/* Editor Panel */}
            <div className="flex-1">
              {(selectedNote || isCreatingNote) ? (
                <NoteEditor 
                  note={isCreatingNote ? null : (selectedNote ?? null)} 
                  onClose={handleCloseEditor}
                  isNew={isCreatingNote}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0d1b2a]">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#415a77]/30 to-[#1b263b] flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-[#415a77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#e0e1dd] mb-3">Select or Create a Note</h3>
                  <p className="text-[#778da9] max-w-md mb-6">
                    Choose a note from the list to view and edit, or create a new one to get started.
                  </p>
                  <button
                    onClick={handleCreateNote}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#415a77] to-[#1b263b] hover:from-[#778da9] hover:to-[#415a77] text-[#e0e1dd] font-medium rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Note
                  </button>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1b2a]">
      <Sidebar 
        onCreateNote={handleCreateNote}
        onCreateFolder={() => setShowFolderModal(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <main className="flex-1 overflow-hidden">
        {renderMainContent()}
      </main>

      <CreateFolderModal 
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
      />
    </div>
  );
}
