import { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#415a77] to-[#1b263b] mb-4">
          <svg className="w-8 h-8 text-[#e0e1dd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#e0e1dd]">CNotes</h1>
        <p className="text-[#778da9] mt-2">Sign in to access your notes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#778da9] mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#778da9]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-3 bg-[#1b263b] border border-[#415a77] rounded-lg text-[#e0e1dd] placeholder-[#778da9]/50 focus:outline-none focus:ring-2 focus:ring-[#415a77] focus:border-transparent transition"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#778da9] mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#778da9]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 bg-[#1b263b] border border-[#415a77] rounded-lg text-[#e0e1dd] placeholder-[#778da9]/50 focus:outline-none focus:ring-2 focus:ring-[#415a77] focus:border-transparent transition"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#415a77] to-[#1b263b] hover:from-[#778da9] hover:to-[#415a77] text-[#e0e1dd] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-[#e0e1dd]/30 border-t-[#e0e1dd] rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[#778da9]">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-[#e0e1dd] hover:underline font-medium"
          >
            Create one
          </button>
        </p>
      </div>

      <div className="mt-8 p-4 bg-[#1b263b]/50 rounded-lg border border-[#415a77]/30">
        <p className="text-xs text-[#778da9] text-center mb-2">Demo Credentials:</p>
        <div className="text-xs text-[#e0e1dd]/70 space-y-1">
          <p><span className="text-[#778da9]">User:</span> kesav@example.com / password123</p>
          <p><span className="text-[#778da9]">Admin:</span> admin@cnotes.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
