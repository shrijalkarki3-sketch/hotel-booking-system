import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col justify-center items-center px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-3">
        403 - Access Denied
      </h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
        You do not have the required permissions to access this page or resource. Please log in with an authorized role account.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-semibold transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Home Page
      </Link>
    </div>
  );
};

export default Unauthorized;
