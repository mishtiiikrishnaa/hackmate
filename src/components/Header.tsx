import React from 'react';
import {
  Sparkles,
  Search,
  Users,
  Layers,
  School,
  LayoutDashboard,
  ShieldAlert,
  Moon,
  Sun,
  Bell,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Heart
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  unreadNotifications: number;
}

export default function Header({
  currentView,
  onNavigate,
  userProfile,
  onOpenAuth,
  onLogout,
  darkMode,
  toggleDarkMode,
  unreadNotifications
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Sparkles },
    { id: 'hackathons', label: 'Hackathons', icon: Search },
    { id: 'teammates', label: 'Find Teammates', icon: Users },
    { id: 'matchfinder', label: 'Match Finder', icon: Heart },
    { id: 'teams', label: 'Teams', icon: Layers },
    { id: 'communities', label: 'Colleges', icon: School },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md transition-colors duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex cursor-pointer items-center space-x-2 transition hover:opacity-90"
          id="hdr-logo-trigger"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-purple-500/20 text-white">
            <span className="font-sans text-xl font-black tracking-tight">H</span>
          </div>
          <div>
            <span className="font-sans text-lg font-black tracking-tight text-gray-900 dark:text-white">
              Hack<span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Mate</span>
            </span>
            <span className="block text-[10px] font-mono leading-none text-indigo-600 dark:text-purple-400">
              verified networks
            </span>
          </div>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50 dark:bg-indigo-950/40 dark:text-indigo-400 dark:shadow-none'
                    : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* CONTROLS & AUTH */}
        <div className="flex items-center space-x-2">
          
          {/* Dark Mode Switcher */}
          <button
            id="btn-toggle-theme"
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-900/80 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* User Logged In Actions */}
          {userProfile ? (
            <>
              {/* Notification Bell */}
              <button
                id="btn-bell-notif"
                onClick={() => onNavigate('dashboard')}
                className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-900/80 transition-colors cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 animate-pulse"></span>
                  </span>
                )}
              </button>

              {/* Dashboard Nav button */}
              <button
                id="btn-goto-dash"
                onClick={() => onNavigate('dashboard')}
                className={`hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentView === 'dashboard'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-gray-700 bg-gray-100/80 hover:bg-gray-100 dark:text-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Console</span>
              </button>

              {/* Admin Panel Link */}
              {(userProfile.email === 'haribala512c@skcet.ac.in' || userProfile.email === 'haribala512c@gmail.com') && (
                <button
                  id="btn-goto-admin"
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center justify-center p-2 rounded-xl border transition ${
                    currentView === 'admin'
                      ? 'border-pink-500 text-pink-500 bg-pink-500/10'
                      : 'border-yellow-600/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10'
                  }`}
                  title="Admin Control Unit"
                >
                  <ShieldAlert className="h-4.5 w-4.5" />
                </button>
              )}

              {/* Avatar Dropdown info */}
              <div className="flex items-center space-x-2 pl-1 border-l border-gray-200 dark:border-zinc-800">
                <img
                  src={userProfile.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                  alt={userProfile.name}
                  className="h-8 w-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-900 pointer-events-none"
                />
                <button
                  id="btn-header-logout"
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              id="btn-header-join"
              onClick={onOpenAuth}
              className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 transition duration-250 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Verify & Join</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* MOBILE DISCARD TOGGLE */}
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-900 md:hidden transition"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-drawer" className="md:hidden border-t border-gray-200 bg-white/95 px-4 py-3 space-y-1.5 dark:border-zinc-800 dark:bg-zinc-950/95 animate-in fade-in slide-in-from-top-3 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`m-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900/70 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          {userProfile && (
            <button
              id="m-nav-console"
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`flex w-full items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                currentView === 'dashboard'
                  ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/35 dark:text-purple-400'
                  : 'text-gray-600 hover:bg-purple-50 dark:text-zinc-400 dark:hover:bg-zinc-910'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Developer Console</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
