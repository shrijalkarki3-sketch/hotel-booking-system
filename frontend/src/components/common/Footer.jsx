import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Heart, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-wide">GrandStay</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              University / BIM Final Year Project. Experience seamless luxury hotel discovery, real-time availability checks, and multi-role booking management.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified REST API & Database</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors">Home Page</Link></li>
              <li><Link to="/hotels" className="hover:text-cyan-400 transition-colors">Browse All Hotels</Link></li>
              <li><Link to="/hotels?city=Pokhara" className="hover:text-cyan-400 transition-colors">Hotels in Pokhara</Link></li>
              <li><Link to="/hotels?city=Kathmandu" className="hover:text-cyan-400 transition-colors">Hotels in Kathmandu</Link></li>
              <li><Link to="/login" className="hover:text-cyan-400 transition-colors">Sign In / Register</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Popular Destinations</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/hotels?city=Pokhara" className="hover:text-cyan-400 transition-colors">Pokhara Lakeside</Link></li>
              <li><Link to="/hotels?city=Nagarkot" className="hover:text-cyan-400 transition-colors">Nagarkot Hill Station</Link></li>
              <li><Link to="/hotels?city=Kathmandu" className="hover:text-cyan-400 transition-colors">Kathmandu Durbar Marg</Link></li>
              <li><Link to="/hotels?city=Chitwan" className="hover:text-cyan-400 transition-colors">Chitwan Safari Resort</Link></li>
              <li><Link to="/hotels?city=Lalitpur" className="hover:text-cyan-400 transition-colors">Patan Durbar Square</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Durbar Marg, Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-300">
                <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>+977 1 4220011</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-300">
                <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>support@grandstay.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} GrandStay Hotel Booking System. Developed for University / BIM Project.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-current" />
            <span>using React, Node & MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
