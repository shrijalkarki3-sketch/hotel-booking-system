import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  User,
  Eye,
  EyeOff
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after successful login (supports both router state and ?redirect= query param)
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || location.state?.from?.pathname || '/';
  const sessionExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email address and password');
      return;
    }

    setIsSubmitting(true);
    let result;
    try {
      result = await login(email, password);
    } catch (err) {
      console.error('Login request failed:', err);
      result = { success: false, message: 'We could not sign you in right now. Please try again.' };
    } finally {
      setIsSubmitting(false);
    }

    if (result.success) {
      // Role-based smart redirection
      if (result.data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.data.role === 'hotel_manager') {
        navigate('/manager/dashboard');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } else {
      setFormError(result.message === 'Invalid email or password'
        ? 'The email address or password is incorrect. Check your details and try again.'
        : result.message || 'Sign in could not be completed. Please try again.');
    }
  };

  // Quick Demo Account Auto-Fill Handler
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setFormError('');
  };

  return (
    <div className="customer-page account-page min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="account-mark flex h-12 w-12 items-center justify-center rounded-xl text-white">
            <Building2 className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="mt-4 text-center font-display text-3xl text-ink">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in to your GrandStay Hotel account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="account-panel rounded-xl border px-5 py-7 sm:px-9">
          
          {/* Error Banner */}
          {sessionExpired && !formError && (
            <div className="customer-auth-notice mb-5 rounded-lg border px-4 py-3 text-sm" role="status">
              Your session expired. Please sign in again to continue.
            </div>
          )}

          {formError && (
            <div className="customer-error-state mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm" role="alert" aria-live="polite">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="mb-0.5 block font-semibold">Sign-in problem</span>
                {formError}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-ink">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="customer-field block w-full rounded-lg border py-3 pl-11 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-ink">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="customer-field block w-full rounded-lg border py-3 pl-11 pr-11 text-sm"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                  className="customer-primary-button flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration Redirect */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Create Account
            </Link>
          </div>

          {/* Quick Demo Login Pre-fill Buttons */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="mb-3 text-center text-xs font-semibold text-slate-500">
              Testing Quick-Fill Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('customer@example.com', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
              >
                <User className="h-4 w-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold text-slate-200">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('manager@example.com', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
              >
                <Briefcase className="h-4 w-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold text-slate-200">Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@example.com', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold text-slate-200">Admin</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
