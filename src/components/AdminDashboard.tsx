import React from 'react';
import {
  ShieldAlert,
  Users,
  School,
  Award,
  Zap,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  AlertTriangle,
  Send,
  Loader2,
  TrendingUp,
  CircleAlert,
  ArrowDownCircle,
  FolderLock
} from 'lucide-react';
import { CollegeDomain, Hackathon, UserProfile } from '../types';

interface AdminDashboardProps {
  colleges: CollegeDomain[];
  students: UserProfile[];
  hackathons: Hackathon[];
  onAddCollege: (domain: string, name: string) => void;
  onUpdateCollegeStatus: (collegeId: string, updates: Partial<CollegeDomain>) => void;
  onDeleteCollege: (id: string) => void;
  onAddHackathon: (hack: Hackathon) => void;
  onDeleteHackathon: (id: string) => void;
}

export default function AdminDashboard({
  colleges,
  students,
  hackathons,
  onAddCollege,
  onUpdateCollegeStatus,
  onDeleteCollege,
  onAddHackathon,
  onDeleteHackathon
}: AdminDashboardProps) {

  // College forms
  const [colDomain, setColDomain] = React.useState('');
  const [colName, setColName] = React.useState('');
  const [colSuccess, setColSuccess] = React.useState(false);

  // Hackathon forms
  const [hTitle, setHTitle] = React.useState('');
  const [hOrg, setHOrg] = React.useState('');
  const [hPrize, setHPrize] = React.useState('');
  const [hMode, setHMode] = React.useState<'online' | 'offline'>('online');
  const [hSize, setHSize] = React.useState('2-4 Members');
  const [hElig, setHElig] = React.useState('All Undergrads');
  const [hTags, setHTags] = React.useState('');
  const [hDesc, setHDesc] = React.useState('');
  const [hSuccess, setHSuccess] = React.useState(false);

  // Growth calculations
  const totalUsers = students.length;
  const activatedDomains = colleges.filter(c => c.approved && !c.suspended).length;

  const handleCollegeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colDomain || !colName) return;

    const cleanDomain = colDomain.toLowerCase().replace('@', '').trim();
    onAddCollege(cleanDomain, colName.trim());
    setColSuccess(true);
    setTimeout(() => {
      setColSuccess(false);
      setColDomain('');
      setColName('');
    }, 1500);
  };

  const handleHackathonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hTitle || !hOrg || !hPrize) return;

    const newH: Hackathon = {
      id: 'hack_' + Math.random().toString(36).substr(2, 9),
      title: hTitle,
      organizer: hOrg,
      prizePool: hPrize,
      mode: hMode,
      teamSize: hSize,
      eligibility: hElig,
      tags: hTags.split(',').map(s => s.trim()).filter(Boolean),
      description: hDesc,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days hence
    };

    onAddHackathon(newH);
    setHSuccess(true);
    setTimeout(() => {
      setHSuccess(false);
      setHTitle('');
      setHOrg('');
      setHPrize('');
      setHDesc('');
      setHTags('');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* HEADER BAR */}
      <div className="border-b border-gray-150 dark:border-zinc-900 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldAlert className="h-7 w-7 text-pink-500" />
            <span>Admin Control Terminal</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Platform governance center. Whitelist college domains, approve networks, moderate events catalogue, and monitor active student tallies.
          </p>
        </div>
      </div>

      {/* REVENUE & STATS TILES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-2xl p-5 shadow-sm">
          <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Signed Students</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline space-x-1.5">
            <span>{totalUsers}</span>
            <span className="text-xs text-emerald-500 font-sans font-bold">+100% live</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-2xl p-5 shadow-sm">
          <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Whitelisted Campuses</span>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {colleges.length}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-2xl p-5 shadow-sm">
          <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Ranked Hackathons</span>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {hackathons.length}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-2xl p-5 shadow-sm">
          <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Active Suffix Nodes</span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {activatedDomains}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: COLLEGE DOMAINS MANAGING CONTAINER (7 COLS) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Suffix authorizer form */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 p-6 rounded-3xl dark:border-zinc-900">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center space-x-2">
              <School className="h-4.5 w-4.5 text-indigo-500" />
              <span>Authorize College Suffix</span>
            </h3>

            <form onSubmit={handleCollegeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Domain Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., skcet.ac.in"
                    value={colDomain}
                    onChange={(e) => setColDomain(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">College Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sri Krishna College..."
                    value={colName}
                    onChange={(e) => setColName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              {colSuccess && (
                <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs py-2.5 rounded-xl text-center font-bold">
                  University whitelists locked into client schemas!
                </div>
              )}

              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm cursor-pointer shadow">
                Lock Domain Authoritative Suffix
              </button>
            </form>
          </div>

          {/* Suffix manager database index */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 rounded-3xl overflow-hidden shadow-sm dark:border-zinc-900">
            <div className="p-4 bg-gray-50 border-b border-gray-150 dark:bg-zinc-950 dark:border-zinc-850 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Active Whitelisted Directories</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 rounded-full font-bold">{colleges.length} total</span>
            </div>

            <div className="divide-y divide-gray-105 dark:divide-zinc-850 max-h-[350px] overflow-y-auto">
              {colleges.map((col) => {
                // Count registered student instances
                const studentCount = students.filter(s => s.domain === col.domain).length;
                return (
                  <div key={col.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-zinc-800/10 transition">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{col.name}</span>
                      <span className="font-mono text-gray-400 block pb-1">@{col.domain} - {studentCount} registered</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateCollegeStatus(col.id, { suspended: !col.suspended })}
                        className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer border ${
                          col.suspended
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                            : 'bg-slate-50 hover:bg-yellow-50 text-gray-600 border-gray-200 hover:text-yellow-650'
                        }`}
                        title="Toggle suspension status"
                      >
                        {col.suspended ? 'Reinstate' : 'Suspend'}
                      </button>
                      <button
                        onClick={() => onDeleteCollege(col.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded border hover:bg-red-50 dark:border-zinc-800 transition cursor-pointer"
                        title="Delete college record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: HACKATHONS MANAGER COMPONENT (5 COLS) */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="bg-white border rounded-3xl p-6 dark:border-zinc-900 dark:bg-zinc-900">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center space-x-2">
              <Award className="h-4.5 w-4.5 text-indigo-500" />
              <span>Catalog New Hackathon</span>
            </h3>

            <form onSubmit={handleHackathonSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Headline TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart India Hackathon"
                  value={hTitle}
                  onChange={(e) => setHTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Organizer / Host</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Cloud / SKCET"
                  value={hOrg}
                  onChange={(e) => setHOrg(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Prize pool valuation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹5,00,000 INR"
                    value={hPrize}
                    onChange={(e) => setHPrize(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Attendance Mode</label>
                  <select
                    value={hMode}
                    onChange={(e) => setHMode(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-2 py-2 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="online">Online Sprint</option>
                    <option value="offline">Offline Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Required Tags (comma split)</label>
                <input
                  type="text"
                  placeholder="React, AI/ML, Blockchain"
                  value={hTags}
                  onChange={(e) => setHTags(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Event details summary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Draft deep descriptions of tracks, registry steps, dates..."
                  value={hDesc}
                  onChange={(e) => setHDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              {hSuccess && (
                <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs py-2 rounded-xl text-center font-bold">
                  Hackathon successfully logged into index boards!
                </div>
              )}

              <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow">
                Save & Index Hackathon
              </button>
            </form>
          </div>

          {/* Hackathons catalog control log */}
          <div className="bg-white border rounded-3xl overflow-hidden shadow-sm dark:border-zinc-900 dark:bg-zinc-900">
            <div className="p-4 bg-gray-50 border-b border-gray-150 dark:bg-zinc-950 dark:border-zinc-850 flex items-center justify-between font-bold text-xs">
              <span>Cataloged Events Registry</span>
              <span>{hackathons.length} listed</span>
            </div>
            
            <div className="divide-y divide-gray-105 dark:divide-zinc-850 max-h-[220px] overflow-y-auto">
              {hackathons.map((h) => (
                <div key={h.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50">
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-zinc-200">{h.title}</span>
                    <span className="text-[10px] text-gray-400 block">{h.organizer}</span>
                  </div>
                  <button
                    onClick={() => onDeleteHackathon(h.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded border hover:bg-red-50 dark:border-zinc-800 transition cursor-pointer"
                    title="Delete Hackathon"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
