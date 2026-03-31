import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Save, X, Share2, FolderOpen, Tag, Palette, Trash2,
  Pin, ChevronDown, Check, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Minus, Image as ImageIcon,
  Undo2, Redo2, Strikethrough, Highlighter, Type,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Note } from '../../types';

interface NoteEditorProps {
  note: Note | null;
  onClose: () => void;
  isNew?: boolean;
}

const NOTE_COLORS = ['#415a77', '#778da9', '#1b263b', '#e0e1dd', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const FONT_FAMILIES = [
  { label: 'Default', value: 'inherit' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Comic Sans', value: 'Comic Sans MS, cursive' },
  { label: 'Impact', value: 'Impact, fantasy' },
];

const FONT_SIZES = ['8', '10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64'];

const TEXT_COLORS = [
  '#ffffff', '#e0e1dd', '#d1d5db', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#000000', '#1b263b', '#415a77', '#778da9',
];

const HIGHLIGHT_COLORS = [
  '#fef08a', '#fed7aa', '#fca5a5', '#86efac',
  '#93c5fd', '#c4b5fd', '#f9a8d4', 'transparent',
];

export default function NoteEditor({ note, onClose, isNew = false }: NoteEditorProps) {
  const {
    createNote, updateNote, deleteNote, getUserFolders, getAllUsers,
    currentUser, shareNote, removeCollaborator,
  } = useStore();

  const folders = getUserFolders();
  const allUsers = getAllUsers().filter(u => u.id !== currentUser?.id);
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(note?.title || '');
  const [folderId, setFolderId] = useState<string | null>(note?.folderId || null);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [color, setColor] = useState(note?.color || '#415a77');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [tagInput, setTagInput] = useState('');

  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Default');
  const [selectedSize, setSelectedSize] = useState('16');
  const [activeTextColor, setActiveTextColor] = useState('#ffffff');
  const [activeHighlight, setActiveHighlight] = useState('#fef08a');

  const collaborators = note?.collaborators || [];
  const isOwner = note?.ownerId === currentUser?.id;
  const canEdit = isNew || isOwner || collaborators.find(c => c.userId === currentUser?.id)?.permission === 'edit';

  // Load note content into editor
  useEffect(() => {
    if (!editorRef.current) return;
    const incoming = note?.content ?? '';
    if (editorRef.current.innerHTML !== incoming) {
      editorRef.current.innerHTML = incoming;
    }
    setTitle(note?.title ?? '');
    setFolderId(note?.folderId ?? null);
    setTags(note?.tags ?? []);
    setColor(note?.color ?? '#415a77');
    setIsPinned(note?.isPinned ?? false);
    setHasChanges(false);
  }, [note?.id]);

  const handleSave = async () => {
    if (!canEdit) return;
    const content = editorRef.current?.innerHTML ?? '';
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (isNew) {
      const newNote = createNote(title || 'Untitled', content, folderId);
      if (newNote) updateNote(newNote.id, { tags, color, isPinned });
    } else if (note) {
      updateNote(note.id, { title, content, folderId, tags, color, isPinned });
    }
    setIsSaving(false);
    setHasChanges(false);
    if (isNew) onClose();
  };

  // Execute document command and refocus editor
  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleFontFamily = (value: string, label: string) => {
    exec('fontName', value);
    setSelectedFont(label);
    setShowFontMenu(false);
  };

  const handleFontSize = (size: string) => {
    // Use a marker size then replace with inline style
    exec('fontSize', '7');
    const markers = editorRef.current?.querySelectorAll('font[size="7"]');
    markers?.forEach(el => {
      (el as HTMLElement).removeAttribute('size');
      (el as HTMLElement).style.fontSize = `${size}px`;
    });
    setSelectedSize(size);
    setShowSizeMenu(false);
    editorRef.current?.focus();
  };

  const handleTextColor = (c: string) => {
    exec('foreColor', c);
    setActiveTextColor(c);
    setShowTextColorMenu(false);
  };

  const handleHighlight = (c: string) => {
    if (c === 'transparent') {
      exec('hiliteColor', 'transparent');
    } else {
      exec('hiliteColor', c);
    }
    setActiveHighlight(c);
    setShowHighlightMenu(false);
  };

  const handleHeading = (tag: string) => {
    exec('formatBlock', tag);
    setShowHeadingMenu(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      editorRef.current?.focus();
      exec('insertImage', dataUrl);
      // Style freshly inserted image
      const imgs = editorRef.current?.querySelectorAll('img');
      if (imgs && imgs.length > 0) {
        const last = imgs[imgs.length - 1];
        last.style.maxWidth = '100%';
        last.style.height = 'auto';
        last.style.borderRadius = '8px';
        last.style.margin = '8px 0';
        last.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    if (note && isOwner) shareNote(note.id, userId, permission);
  };

  const handleRemoveCollaborator = (userId: string) => {
    if (note && isOwner) removeCollaborator(note.id, userId);
  };

  const handleDelete = () => {
    if (note && isOwner && confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
      onClose();
    }
  };

  // Reusable toolbar button
  const TBtn = ({
    onClick, title, children, active = false,
  }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-[#415a77] text-[#e0e1dd]'
          : 'hover:bg-[#1b263b] text-[#778da9] hover:text-[#e0e1dd]'
      }`}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-5 bg-[#415a77]/50 mx-0.5 self-center" />;

  return (
    <div className="flex flex-col h-full bg-[#0d1b2a]">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#415a77]/30">
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

        <div className="flex items-center gap-1">
          {/* Pin */}
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={() => canEdit && setIsPinned(!isPinned)}
            disabled={!canEdit}
            title={isPinned ? 'Unpin' : 'Pin'}
            className={`p-2 rounded-lg transition-colors ${
              isPinned ? 'bg-[#415a77] text-[#e0e1dd]' : 'text-[#778da9] hover:bg-[#1b263b]'
            } disabled:opacity-40`}
          >
            <Pin className="w-4 h-4" />
          </button>

          {/* Folder picker */}
          <div className="relative">
            <button
              onClick={() => canEdit && setShowFolderMenu(v => !v)}
              disabled={!canEdit}
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] text-sm transition-colors disabled:opacity-40"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="max-w-[80px] truncate">
                {folders.find(f => f.id === folderId)?.name || 'Folder'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFolderMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFolderMenu(false)} />
                <div className="absolute right-0 top-10 w-48 bg-[#0d1b2a] border border-[#415a77]/40 rounded-lg shadow-2xl z-40 overflow-hidden">
                  <button
                    onClick={() => { setFolderId(null); setShowFolderMenu(false); setHasChanges(true); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e0e1dd] hover:bg-[#1b263b] ${!folderId ? 'bg-[#1b263b]' : ''}`}
                  >
                    <FolderOpen className="w-4 h-4 text-[#778da9]" /> No folder
                    {!folderId && <Check className="w-4 h-4 ml-auto text-[#778da9]" />}
                  </button>
                  {folders.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setFolderId(f.id); setShowFolderMenu(false); setHasChanges(true); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-[#e0e1dd] hover:bg-[#1b263b] ${folderId === f.id ? 'bg-[#1b263b]' : ''}`}
                    >
                      <FolderOpen className="w-4 h-4" style={{ color: f.color }} />
                      {f.name}
                      {folderId === f.id && <Check className="w-4 h-4 ml-auto text-[#778da9]" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Note accent color */}
          <div className="relative">
            <button
              onClick={() => canEdit && setShowColorMenu(v => !v)}
              disabled={!canEdit}
              title="Note color"
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] transition-colors disabled:opacity-40"
            >
              <Palette className="w-4 h-4" />
              <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
            </button>
            {showColorMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowColorMenu(false)} />
                <div className="absolute right-0 top-10 p-2 bg-[#0d1b2a] border border-[#415a77]/40 rounded-lg shadow-2xl z-40">
                  <div className="grid grid-cols-4 gap-1.5">
                    {NOTE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => { setColor(c); setShowColorMenu(false); setHasChanges(true); }}
                        className={`w-7 h-7 rounded-lg hover:scale-110 transition-transform ${color === c ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Share */}
          {isOwner && !isNew && (
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#1b263b] rounded-lg text-[#778da9] hover:text-[#e0e1dd] text-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
                {collaborators.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#415a77] text-[#e0e1dd] text-xs rounded-full">
                    {collaborators.length}
                  </span>
                )}
              </button>
              {showShareMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowShareMenu(false)} />
                  <div className="absolute right-0 top-10 w-72 bg-[#0d1b2a] border border-[#415a77]/40 rounded-lg shadow-2xl z-40 overflow-hidden">
                    <div className="p-3 border-b border-[#415a77]/30">
                      <h4 className="text-sm font-semibold text-[#e0e1dd]">Share with users</h4>
                    </div>
                    {collaborators.length > 0 && (
                      <div className="p-3 border-b border-[#415a77]/30">
                        <p className="text-xs text-[#778da9] mb-2">Current collaborators</p>
                        {collaborators.map(collab => {
                          const u = allUsers.find(x => x.id === collab.userId);
                          return (
                            <div key={collab.userId} className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#415a77] flex items-center justify-center text-xs text-[#e0e1dd]">
                                  {u?.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs text-[#e0e1dd]">{u?.name}</p>
                                  <p className="text-xs text-[#778da9]">{collab.permission}</p>
                                </div>
                              </div>
                              <button onClick={() => handleRemoveCollaborator(collab.userId)} className="p-1 hover:bg-red-500/20 rounded text-red-400">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="p-3 max-h-48 overflow-y-auto">
                      <p className="text-xs text-[#778da9] mb-2">Add collaborators</p>
                      {allUsers.filter(u => !collaborators.find(c => c.userId === u.id)).map(u => (
                        <div key={u.id} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#415a77] flex items-center justify-center text-xs text-[#e0e1dd]">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-xs text-[#e0e1dd]">{u.name}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleShare(u.id, 'view')} className="px-2 py-1 text-xs bg-[#1b263b] hover:bg-[#415a77] text-[#778da9] hover:text-[#e0e1dd] rounded">View</button>
                            <button onClick={() => handleShare(u.id, 'edit')} className="px-2 py-1 text-xs bg-[#1b263b] hover:bg-[#415a77] text-[#778da9] hover:text-[#e0e1dd] rounded">Edit</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Delete */}
          {isOwner && !isNew && (
            <button onClick={handleDelete} title="Delete note" className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Save */}
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#415a77] to-[#1b263b] hover:from-[#778da9] hover:to-[#415a77] text-[#e0e1dd] rounded-lg transition-all disabled:opacity-40 text-sm"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-[#e0e1dd]/30 border-t-[#e0e1dd] rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          )}
        </div>
      </div>

      {/* ── Formatting Toolbar ── */}
      {canEdit && (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[#415a77]/30 bg-[#0a1628]">
          {/* Undo / Redo */}
          <TBtn onClick={() => exec('undo')} title="Undo"><Undo2 className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('redo')} title="Redo"><Redo2 className="w-4 h-4" /></TBtn>
          <Sep />

          {/* Font Family */}
          <div className="relative">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setShowFontMenu(v => !v); setShowSizeMenu(false); setShowTextColorMenu(false); setShowHighlightMenu(false); setShowHeadingMenu(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1b263b] text-[#778da9] hover:text-[#e0e1dd] text-xs transition-colors min-w-[90px]"
              title="Font family"
            >
              <Type className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[60px]">{selectedFont}</span>
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>
            {showFontMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFontMenu(false)} />
                <div className="absolute left-0 top-8 w-44 bg-[#0d1b2a] border border-[#415a77]/40 rounded-lg shadow-2xl z-40 overflow-hidden">
                  {FONT_FAMILIES.map(f => (
                    <button
                      key={f.value}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => handleFontFamily(f.value, f.label)}
                      className="w-full text-left px-3 py-2 text-sm text-[#e0e1dd] hover:bg-[#1b263b] transition-colors"
                      style={{ fontFamily: f.value }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Font Size */}
          <div className="relative">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setShowSizeMenu(v => !v); setShowFontMenu(false); setShowTextColorMenu(false); setShowHighlightMenu(false); setShowHeadingMenu(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1b263b] text-[#778da9] hover:text-[#e0e1dd] text-xs transition-colors min-w-[54px]"
              title="Font size"
            >
              <span>{selectedSize}px</span>
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>
            {showSizeMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSizeMenu(false)} />
                <div className="absolute left-0 top-8 w-24 bg-[#0d1b2a] border border-[#415a77]/40 rounded-lg shadow-2xl z-40 overflow-y-auto max-h-52">
                  {FONT_SIZES.map(s => (
                    <button
                      key={s}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => handleFontSize(s)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-[#1b263b] transition-colors ${
                        selectedSize === s ? 'text-[#e0e1dd] bg-[#1b263b]' : 'text-[#778da9]'
                      }`}
                    >
                      {s}px
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Sep />

          {/* Heading */}
          <div className="relative">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setShowHeadingMenu(v => !v); setShowFontMenu(false); setShowSizeMenu(false); setShowTextColorMenu(false); setShowHighlightMenu(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1b263b] text-[#778da9] hover:text-[#e0e1dd] text-xs transition-colors"
              title="Heading"
            >
              H<ChevronDown className="w-3 h-3" />
            </button>
            {showHeadingMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowHeadingMenu(false)} />
                <div className="absolute left-0 top-8 w-36 bg-[#0d1b2a] border border-[#415a77]/40 rounded-lg shadow-2xl z-40 overflow-hidden">
                  {[
                    { label: 'Heading 1', tag: 'h1', cls: 'text-2xl font-bold' },
                    { label: 'Heading 2', tag: 'h2', cls: 'text-xl font-bold' },
                    { label: 'Heading 3', tag: 'h3', cls: 'text-lg font-semibold' },
                    { label: 'Paragraph', tag: 'p', cls: 'text-sm' },
                    { label: 'Preformat', tag: 'pre', cls: 'text-xs font-mono' },
                  ].map(h => (
                    <button
                      key={h.tag}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => handleHeading(h.tag)}
                      className={`w-full text-left px-3 py-2 text-[#e0e1dd] hover:bg-[#1b263b] transition-colors ${h.cls}`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Sep />

          {/* Bold / Italic / Underline / Strikethrough */}
          <TBtn onClick={() => exec('bold')} title="Bold"><Bold className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('italic')} title="Italic"><Italic className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('underline')} title="Underline"><Underline className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('strikeThrough')} title="Strikethrough"><Strikethrough className="w-4 h-4" /></TBtn>
          <Sep />

          {/* Text color */}
          <div className="relative">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setShowTextColorMenu(v => !v); setShowHighlightMenu(false); setShowFontMenu(false); setShowSizeMenu(false); setShowHeadingMenu(false); }}
              title="Text color"
              className="flex items-center gap-0.5 p-1.5 rounded hover:bg-[#1b263b] text-[#778da9] hover:text-[#e0e1dd] transition-colors"
            >
              <span className="text-xs font-bold" style={{ color: activeTextColor }}>A</span>
              <div className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: activeTextColor }} />
            </button>
            {showTextColorMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTextColorMenu(false)} />
                <div className="absolute left-0 top-9 p-2 bg-[#0d1b2a] border border-[#415a77]/40 rounded-lg shadow-2xl z-40">
                  <p className="text-xs text-[#778da9] mb-1.5">Text color</p>
                  <div className="grid grid-cols-5 gap-1">
                    {TEXT_COLORS.map(c => (
                      <button
                        key={c}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => handleTextColor(c)}
                        title={c}
                        className={`w-6 h-6 rounded hover:scale-110 transition-transform border ${
                          activeTextColor === c ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Highlight */}
          <div className="relative">
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setShowHighlightMenu(v => !v); setShowTextColorMenu(false); setShowFontMenu(false); setShowSizeMenu(false); setShowHeadingMenu(false); }}
              title="Highlight"
              className="flex items-center gap-0.5 p-1.5 rounded hover:bg-[#1b263b] text-[#778da9] hover:text-[#e0e1dd] transition-colors"
            >
              <Highlighter className="w-4 h-4" />
              <div
                className="w-4 h-1 rounded-sm mt-0.5"
                style={{ backgroundColor: activeHighlight === 'transparent' ? '#555' : activeHighlight }}
              />
            </button>
            {showHighlightMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowHighlightMenu(false)} />
                <div className="absolute left-0 top-9 p-2 bg-[#0d1b2a] border border-[#415a77]/40 rounded-lg shadow-2xl z-40">
                  <p className="text-xs text-[#778da9] mb-1.5">Highlight</p>
                  <div className="grid grid-cols-4 gap-1">
                    {HIGHLIGHT_COLORS.map(c => (
                      <button
                        key={c}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => handleHighlight(c)}
                        title={c === 'transparent' ? 'Remove highlight' : c}
                        className={`w-7 h-7 rounded hover:scale-110 transition-transform border text-xs ${
                          c === 'transparent'
                            ? 'border-[#415a77] text-[#778da9]'
                            : activeHighlight === c ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c === 'transparent' ? '#1b263b' : c }}
                      >
                        {c === 'transparent' ? '✕' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <Sep />

          {/* Alignment */}
          <TBtn onClick={() => exec('justifyLeft')} title="Align left"><AlignLeft className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('justifyCenter')} title="Align center"><AlignCenter className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('justifyRight')} title="Align right"><AlignRight className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('justifyFull')} title="Justify"><AlignJustify className="w-4 h-4" /></TBtn>
          <Sep />

          {/* Lists */}
          <TBtn onClick={() => exec('insertUnorderedList')} title="Bullet list"><List className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('insertOrderedList')} title="Numbered list"><ListOrdered className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => exec('indent')} title="Indent">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h18M3 12h12M3 16h18M7 10l4 2-4 2" /></svg>
          </TBtn>
          <TBtn onClick={() => exec('outdent')} title="Outdent">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h18M9 12h12M3 16h18M11 10l-4 2 4 2" /></svg>
          </TBtn>
          <Sep />

          {/* Insert */}
          <TBtn onClick={() => exec('insertHorizontalRule')} title="Horizontal rule"><Minus className="w-4 h-4" /></TBtn>
          <TBtn onClick={() => imageInputRef.current?.click()} title="Insert image"><ImageIcon className="w-4 h-4" /></TBtn>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <TBtn onClick={() => exec('removeFormat')} title="Clear formatting">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
          </TBtn>
        </div>
      )}

      {/* ── Editor area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">
          {/* Note title */}
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
            placeholder="Note title…"
            disabled={!canEdit}
            className="w-full text-2xl font-bold text-[#e0e1dd] bg-transparent border-none outline-none placeholder-[#778da9]/40 mb-4 disabled:opacity-60"
          />

          {/* Rich-text content area */}
          <div
            ref={editorRef}
            contentEditable={!!canEdit}
            suppressContentEditableWarning
            onInput={() => setHasChanges(true)}
            data-placeholder="Start writing your note…"
            className={`min-h-[320px] text-[#e0e1dd] leading-relaxed outline-none focus:outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_pre]:bg-[#1b263b] [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:text-sm [&_hr]:border-[#415a77]/50 [&_hr]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-[#415a77] [&_blockquote]:pl-4 [&_blockquote]:text-[#778da9] empty:before:content-[attr(data-placeholder)] empty:before:text-[#778da9]/40 empty:before:pointer-events-none ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}
          />

          {/* Tags */}
          <div className="mt-6 pt-4 border-t border-[#415a77]/30">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-[#778da9] shrink-0" />
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-[#1b263b] text-[#778da9] rounded text-sm">
                  #{tag}
                  {canEdit && (
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {canEdit && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag…"
                  className="px-2 py-0.5 bg-transparent text-[#e0e1dd] text-sm outline-none placeholder-[#778da9]/40 w-24 border-b border-[#415a77]/50 focus:border-[#778da9]"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
