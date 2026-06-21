import React from 'react';
import {
  School,
  Search,
  Plus,
  TrendingUp,
  Award,
  Users,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Calendar,
  Lock,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { CollegeDomain, UserProfile } from '../types';

interface CollegeCommunitiesProps {
  colleges: CollegeDomain[];
  students: UserProfile[];
  onRegisterCollege: (domain: string, name: string) => void;
}

export default function CollegeCommunities({
  colleges,
  students,
  onRegisterCollege
}: CollegeCommunitiesProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Whitelist Register State
  const [showFormModal, setShowFormModal] = React.useState(false);
  const [newDomain, setNewDomain] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState(false);

  // Filter approved colleges
  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ranks students according to rating (leaderboard)
  const sortedStudents = [...students].sort((a, b) => b.rating - a.rating);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !newName) return;

    let cleanDomain = newDomain.toLowerCase().replace('@', '').trim();
    onRegisterCollege(cleanDomain, newName.trim());

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setNewName('');
      setNewDomain('');
      setShowFormModal(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* SECTION HEADER */}
      <div className="md:flex md:items-center md:justify-between border-b border-gray-150 dark:border-zinc-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Campus Whitelists & Communities
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            A network of authorized universities. Only verified students bounds by official institutional suffixes can access the matching grids.
          </p>
        </div>
        <button
          id="btn-trigger-register-college"
          onClick={() => setShowFormModal(true)}
          className="mt-4 md:mt-0 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md cursor-pointer animate-pulse"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Register New Suffix</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLLEGES DIRECTORY FEED (LEFT 7 COLUMNS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <School className="h-4.5 w-4.5 text-indigo-500" />
              <span>Institutional Whitelist Directory</span>
            </h2>
            <span className="text-xs text-gray-500 font-bold bg-gray-105 px-2.5 py-1 rounded-full dark:bg-zinc-900 dark:text-zinc-400">
              {colleges.length} whitelisted
            </span>
          </div>

          {/* Search Colleges bar */}
          <div className="relative">
            <Search className="absolute top-3.5 left-3.5 h-4 w-4 text-gray-400" />
            <input
              id="col-dir-search"
              type="text"
              placeholder="Search universities, domains, affiliations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="space-y-4">
            {filteredColleges.map((col) => {
              // Calculate student counts registered under this domain suffix
              const studentsInColl = students.filter(s => s.domain === col.domain).length;
              const countToDisplay = Math.max(col.studentCount, studentsInColl);

              return (
                <div
                  key={col.id}
                  className={`border rounded-2xl bg-white dark:bg-zinc-900/80 p-5 flex items-center justify-between transition hover:border-indigo-400 ${
                    col.suspended 
                      ? 'border-gray-200 opacity-60 bg-gray-100'
                      : 'border-gray-200/80 dark:border-zinc-900'
                  }`}
                  id={`college-item-${col.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-tr from-indigo-100 to-indigo-50 dark:from-indigo-950/40 dark:to-zinc-900 p-3.5 rounded-xl">
                      <School className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {col.name}
                      </h4>
                      <p className="text-xs font-mono text-gray-500 dark:text-blue-400 select-all font-semibold mt-1">
                        @{col.domain}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block font-mono">
                      {countToDisplay} students
                    </span>
                    <span className={`inline-flex items-center space-x-1 font-sans text-[10px] font-bold uppercase tracking-wider mt-1.5 px-2.5 py-0.5 rounded-full ${
                      col.suspended
                        ? 'bg-red-100 text-red-650'
                        : col.approved
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      <ShieldCheck className="h-3 w-3" />
                      <span>{col.suspended ? 'Suspended' : col.approved ? 'Active Suffix' : 'Pending Verification'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP CONTRIBUTOR LEADERBOARD (RIGHT 5 COLUMNS) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="h-4.5 w-4.5 text-yellow-500" />
              <span>Campus Contributor Leaderboard</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Ranks student hackers based on profile completeness, project builds, and verified team participation scores.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-900 rounded-2xl divide-y divide-gray-100 dark:divide-zinc-850 overflow-hidden shadow-sm">
            {sortedStudents.slice(0, 5).map((student, index) => {
              const rankColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-400';
              return (
                <div key={student.uid} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/10 transition">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 font-mono font-black text-sm text-center ${rankColor}`}>
                      {index + 1}
                    </span>
                    <img src={student.photoUrl} alt={student.name} className="h-9 w-9 rounded-full object-cover border" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white truncate max-w-[150px]">
                        {student.name}
                      </h4>
                      <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                        {student.preferredRole}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-200 block">
                      {student.rating} pts
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-zinc-500 block truncate max-w-[110px]">
                      {student.college.split(' ')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FORM REGISTRATION SUFFIX DIALOG */}
      {showFormModal && (
        <div id="whitelist-form-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Register College Whitelist Suffix</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">Add your university suffix to test regional matching parameters immediately.</p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Domain Suffix</label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-sm text-gray-400 font-bold">@</span>
                  <input
                    id="txt-new-college-domain"
                    type="text"
                    required
                    placeholder="skcet.ac.in"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Full College Name</label>
                <input
                  id="txt-new-college-name"
                  type="text"
                  required
                  placeholder="Sri Krishna College of Engineering and Technology"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {successMsg ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-3 px-4 rounded-xl text-center font-semibold flex items-center justify-center space-x-1.5 animate-bounce">
                  <CheckCircle className="h-4 w-4" />
                  <span>College Whitelisted in Database Suffixes!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs shadow-md cursor-pointer"
                  >
                    Authorize Suffix
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
