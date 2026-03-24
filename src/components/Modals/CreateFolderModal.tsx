import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#415a77', '#778da9', '#1b263b', '#e0e1dd', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function CreateFolderModal({ isOpen, onClose }: CreateFolderModalProps) {
  const { createFolder, getUserFolders } = useStore();
  const folders = getUserFolders();
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [color, setColor] = useState('#415a77');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createFolder(name.trim(), parentId);
      setName('');
      setParentId(null);
      setColor('#415a77');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-[#0d1b2a] border border-[#415a77]/30 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#415a77]/30">
          <h2 className="text-lg font-semibold text-[#e0e1dd] flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#415a77]" />
            Create Folder
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#778da9] mb-2">Folder Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Folder"
              className="w-full px-4 py-2.5 bg-[#1b263b] border border-[#415a77]/50 rounded-lg text-[#e0e1dd] placeholder-[#778da9]/50 focus:outline-none focus:ring-2 focus:ring-[#415a77] focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#778da9] mb-2">Parent Folder (Optional)</label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-4 py-2.5 bg-[#1b263b] border border-[#415a77]/50 rounded-lg text-[#e0e1dd] focus:outline-none focus:ring-2 focus:ring-[#415a77] focus:border-transparent"
            >
              <option value="">No parent (root folder)</option>
              {folders.filter(f => !f.parentId).map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#778da9] mb-2">Color</label>
            <div className="flex items-center gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-[#e0e1dd] ring-offset-2 ring-offset-[#0d1b2a]' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#778da9] hover:text-[#e0e1dd] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#415a77] to-[#1b263b] hover:from-[#778da9] hover:to-[#415a77] text-[#e0e1dd] font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
