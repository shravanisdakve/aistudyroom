import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Input } from '../components/ui';

const Login: React.FC = () => {
  const { login, currentUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Redirect based on role when currentUser is populated
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/'); // Student dashboard (StudyHub)
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Navigation handled by useEffect
    } catch (err: any) {
      console.error("Login failed:", err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 bg-white text-slate-900">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-violet-600 rounded-lg">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">NexusAI</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back to NexusAI</h1>
          <p className="text-slate-500">Sign in to continue your learning and teaching workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-violet-500 focus:border-violet-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-violet-500 focus:border-violet-500 pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link to="/forgot-password" className="text-sm font-medium text-violet-600 hover:text-violet-700">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <Button
            type="submit"
            isLoading={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 h-auto transition-all"
          >
            Log in
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12.0003 20.45c4.65 0 8.35-3 9.77-7.25h-9.77v-4.5h14.1c.15.75.23 1.55.23 2.4 0 7.5-5.32 12.85-12.83 12.85C5.8503 24 0.85034 19 0.85034 12.85s5-11.15 11.15-11.15c3 0 5.7 1.1 7.8 2.95l-3.3 3.3c-1.15-1.05-3.05-2-4.5-2-4 0-7.3 3.25-7.3 7.25s3.3 7.25 7.3 7.25z" fill="currentColor" />
            </svg>
            Sign in with Google
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          New to NexusAI?{' '}
          <Link to="/signup" className="font-semibold text-violet-600 hover:text-violet-700">
            Create account
          </Link>
        </p>
      </div>

      {/* Right Column: Illustration/Marketing */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 to-slate-900/90"></div>

        <div className="relative z-10">
          {/* Top decoration maybe? */}
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-6">Unified AI workspace for students and educators.</h2>
          <ul className="space-y-4">
            {[
              "Personalized AI tutoring & adaptive quizzes",
              "Seamless classroom management for teachers",
              "Intelligent insights & progress tracking"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <span className="text-lg leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-sm text-slate-400">
          © 2026 NexusAI. Transforming education.
        </div>
      </div>
    </div>
  );
};

export default Login;