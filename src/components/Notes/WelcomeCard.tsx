import { Sparkles, FileText, FolderOpen, Users, Search } from 'lucide-react';

interface WelcomeCardProps {
  onCreateNote: () => void;
}

export default function WelcomeCard({ onCreateNote }: WelcomeCardProps) {
  const features = [
    { icon: FileText, title: 'Create Notes', description: 'Write and organize your thoughts with rich text editing' },
    { icon: FolderOpen, title: 'Organize', description: 'Use folders to keep your notes structured and accessible' },
    { icon: Users, title: 'Collaborate', description: 'Share notes with others and work together in real-time' },
    { icon: Search, title: 'Quick Search', description: 'Find any note instantly with powerful search' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#415a77] to-[#1b263b] mb-4">
          <Sparkles className="w-8 h-8 text-[#e0e1dd]" />
        </div>
        <h2 className="text-3xl font-bold text-[#e0e1dd] mb-2">Welcome to CNotes</h2>
        <p className="text-[#778da9] max-w-md mx-auto">
          Your personal space for notes, ideas, and collaboration. Get started by creating your first note.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="p-4 bg-[#1b263b] rounded-xl border border-[#415a77]/20">
            <feature.icon className="w-6 h-6 text-[#415a77] mb-3" />
            <h3 className="font-semibold text-[#e0e1dd] mb-1">{feature.title}</h3>
            <p className="text-sm text-[#778da9]">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onCreateNote}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#415a77] to-[#1b263b] hover:from-[#778da9] hover:to-[#415a77] text-[#e0e1dd] font-medium rounded-xl transition-all shadow-lg shadow-[#415a77]/20"
        >
          <FileText className="w-5 h-5" />
          Create Your First Note
        </button>
      </div>
    </div>
  );
}
