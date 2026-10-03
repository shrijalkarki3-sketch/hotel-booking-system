import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  AlertCircle, 
  ArrowRight, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer', // 'customer' or 'hotel_manager'
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const { name, email, password, confirmPassword, phone, role } = formData;

    if (!name || !email || !password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    let result;
    try {
      result = await register({ name, email, password, phone, role });
    } catch (err) {
      console.error('Registration request failed:', err);
      result = { success: false, message: 'We could not create your account right now. Please try again.' };
    } finally {
      setIsSubmitting(false);
    }

    if (result.success) {
      if (role === 'hotel_manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setFormError(result.message || 'Registration could not be completed. Please check your details and try again.');
    }
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
          Create an Account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Join GrandStay to book hotels or list your property
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="account-panel rounded-xl border px-5 py-7 sm:px-9">
          
          {/* Error Banner */}
          {formError && (
            <div className="customer-error-state mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm" role="alert" aria-live="polite">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <span className="mb-0.5 block font-semibold">Registration problem</span>
                {formError}
              </div>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-ink">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'customer' })}
                aria-pressed={formData.role === 'customer'}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  formData.role === 'customer'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-ink'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'hotel_manager' })}
                aria-pressed={formData.role === 'hotel_manager'}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  formData.role === 'hotel_manager'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-ink'
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Hotel Manager</span>
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold text-ink">
                Full Name *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="register-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="customer-field block w-full rounded-lg border py-3 pl-11 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-ink">
                Email Address *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="customer-field block w-full rounded-lg border py-3 pl-11 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="register-phone" className="mb-1.5 block text-sm font-semibold text-ink">
                Phone Number
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  id="register-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+977 9800000000"
                  className="customer-field block w-full rounded-lg border py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-ink">
                Password *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  id="register-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="customer-field block w-full rounded-lg border py-3 pl-11 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm-password" className="mb-1.5 block text-sm font-semibold text-ink">
                Confirm Password *
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  id="register-confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="customer-field block w-full rounded-lg border py-3 pl-11 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="customer-primary-button flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Register Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Log In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
