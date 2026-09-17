import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  KeyRound,
  Sparkles,
  Briefcase
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password Form State
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  // RBAC Test Endpoint State
  const [testResult, setTestResult] = useState(null);
  const [testingEndpoint, setTestingEndpoint] = useState('');

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);

    const res = await updateProfile(profileData);
    setProfileLoading(false);

    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Profile details saved successfully!' });
    } else {
      setProfileMsg({ type: 'error', text: res.message });
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setPassLoading(true);
    const res = await updatePassword(passData.currentPassword, passData.newPassword);
    setPassLoading(false);

    if (res.success) {
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPassMsg({ type: 'error', text: res.message });
    }
  };

  // Test Role-Based Endpoint Protection Live
  const runRbacTest = async (endpointName, url) => {
    setTestingEndpoint(endpointName);
    setTestResult(null);
    try {
      const response = await API.get(url);
      setTestResult({
        success: true,
        status: response.status,
        message: response.data.message,
        payload: response.data,
      });
    } catch (err) {
      setTestResult({
        success: false,
        status: err.response?.status || 500,
        message: err.response?.data?.message || 'Access Denied',
        payload: err.response?.data || {},
      });
    } finally {
      setTestingEndpoint('');
    }
  };

  const roleBadgeColor = {
    customer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    hotel_manager: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    admin: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Badge */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border capitalize ${roleBadgeColor[user?.role]}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
              <div className="text-xs text-slate-500 mt-1">
                Account Status: <span className="text-emerald-400 font-semibold uppercase">{user?.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile & Password Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Edit Profile Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-400" />
              Edit Profile Information
            </h2>

            {profileMsg.text && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {profileMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email (Cannot be modified)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+977 9800000000"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-all disabled:opacity-50 mt-2"
              >
                <Save className="h-4 w-4" />
                <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-purple-400" />
              Change Account Password
            </h2>

            {passMsg.text && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
                passMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {passMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{passMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all disabled:opacity-50 mt-2"
              >
                <Lock className="h-4 w-4" />
                <span>{passLoading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

        </div>

        {/* Live RBAC Route Guard Tester */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Live Role-Based Authorization Guard Tester</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Test backend protected API endpoints using your active account's JWT token to verify authorization enforcement.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => runRbacTest('Customer Test Route', '/auth/customer-test')}
              disabled={!!testingEndpoint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 transition-all"
            >
              <User className="h-4 w-4" />
              <span>Test Customer Endpoint</span>
            </button>

            <button
              onClick={() => runRbacTest('Manager Test Route', '/auth/manager-test')}
              disabled={!!testingEndpoint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-purple-400 transition-all"
            >
              <Briefcase className="h-4 w-4" />
              <span>Test Manager Endpoint</span>
            </button>

            <button
              onClick={() => runRbacTest('Admin Test Route', '/auth/admin-test')}
              disabled={!!testingEndpoint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-400 transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Test Admin Endpoint</span>
            </button>
          </div>

          {/* Response Payload Display */}
          {testResult && (
            <div className={`p-4 rounded-xl border font-mono text-xs ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10 font-bold">
                <span>Status Code: {testResult.status}</span>
                <span>{testResult.success ? 'HTTP 200 OK' : 'HTTP Access Denied'}</span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(testResult.payload, null, 2)}</pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
