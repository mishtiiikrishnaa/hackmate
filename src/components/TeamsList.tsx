import React from 'react';
import {
  Users,
  Search,
  PlusCircle,
  HelpCircle,
  FolderPlus,
  ArrowUpRight,
  ShieldCheck,
  Award,
  CircleDot,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers
} from 'lucide-react';
import { Team, UserProfile, Hackathon, TeamMember } from '../types';

interface TeamsListProps {
  teams: Team[];
  hackathons: Hackathon[];
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onCreateTeam: (teamData: {
    name: string;
    description: string;
    requiredSkills: string[];
    maxSize: number;
    openPositions: string[];
    hackathonId: string;
    hackathonTitle: string;
  }) => void;
  onApplyToTeam: (applicationData: {
    teamId: string;
    teamName: string;
    message: string;
    userRole: string;
    skills: string[];
  }) => void;
}

export default function TeamsList({
  teams,
  hackathons,
  userProfile,
  onOpenAuth,
  onCreateTeam,
  onApplyToTeam
}: TeamsListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Create Team Modal State
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [tName, setTName] = React.useState('');
  const [tDesc, setTDesc] = React.useState('');
  const [tSkills, setTSkills] = React.useState('');
  const [tMaxSize, setTMaxSize] = React.useState(4);
  const [tOpenPositions, TOpenPositions] = React.useState('');
  const [tHackId, setTHackId] = React.useState('');

  // Apply State
  const [applyingTeam, setApplyingTeam] = React.useState<Team | null>(null);
  const [applyRole, setApplyRole] = React.useState('');
  const [applyCoverLetter, setApplyCoverLetter] = React.useState('');
  const [applySuccessAlert, setApplySuccessAlert] = React.useState(false);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.hackathonTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      onOpenAuth();
      return;
    }
    const selectedHack = hackathons.find(h => h.id === tHackId);
    if (!tName || !tDesc || !tHackId) return;

    onCreateTeam({
      name: tName,
      description: tDesc,
      requiredSkills: tSkills.split(',').map(s => s.trim()).filter(Boolean),
      maxSize: Number(tMaxSize),
      openPositions: tOpenPositions.split(',').map(o => o.trim()).filter(Boolean),
      hackathonId: tHackId,
      hackathonTitle: selectedHack ? selectedHack.title : 'General Coding Sprint'
    });

    // Reset
    setTName('');
    setTDesc('');
    setTSkills('');
    setTMaxSize(4);
    TOpenPositions('');
    setTHackId('');
    setShowCreateModal(false);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !applyingTeam) {
      onOpenAuth();
      return;
    }
    if (!applyRole || !applyCoverLetter) return;

    onApplyToTeam({
      teamId: applyingTeam.id,
      teamName: applyingTeam.name,
      message: applyCoverLetter,
      userRole: applyRole,
      skills: userProfile.skills || []
    });

    setApplySuccessAlert(true);
    setTimeout(() => {
      setApplySuccessAlert(false);
      setApplyingTeam(null);
      setApplyRole('');
      setApplyCoverLetter('');
    }, 1500);
  };

  const triggerCreateTeam = () => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }
    setShowCreateModal(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* SECTION HEADER */}
      <div className="sm:flex sm:items-center sm:justify-between border-b border-gray-150 dark:border-zinc-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Hackathon Teams Recruiting
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Browse campus squads searching for specialized positions or publish your own team recruiting guidelines.
          </p>
        </div>
        <button
          id="btn-trigger-create-team"
          onClick={triggerCreateTeam}
          className="mt-4 sm:mt-0 flex items-center justify-center space-x-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-indigo-600/15 cursor-pointer"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Form New Team</span>
        </button>
      </div>

      {/* SEARCH FIELD */}
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-gray-400" />
        <input
          id="input-team-search"
          type="text"
          placeholder="Search teams by project name, hackathon target, descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* TEAMS GRID LAYOUT */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-900">
          <Layers className="h-10 w-10 text-gray-300 dark:text-zinc-700 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">No Recruiting Teams Found</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-500 max-w-sm mx-auto mt-2">
            Be the first in your campus to register a project squad under the whitelists. Click 'Form New Team' above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white dark:bg-zinc-900 border border-gray-250 dark:border-zinc-900 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition"
              id={`team-card-${team.id}`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {team.name}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                      Targeting: {team.hackathonTitle}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-3 py-1 rounded-full">
                    {team.members.length} / {team.maxSize} Members
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-gray-650 dark:text-zinc-400 mt-4 leading-relaxed line-clamp-3">
                  {team.description}
                </p>

                {/* Open roles highlight badge */}
                {team.openPositions.length > 0 && (
                  <div className="mt-5 bg-red-50/50 border border-red-100 dark:bg-red-950/10 dark:border-red-950/50 p-4 rounded-2xl">
                    <span className="block text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 font-bold mb-2">
                      Immediate Slots Hiring:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {team.openPositions.map((p, pIdx) => (
                        <span key={pIdx} className="bg-white border border-red-200 text-red-700 dark:bg-zinc-900 dark:border-red-900/60 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing members */}
                <div className="mt-5">
                  <span className="block text-[10px] uppercase text-gray-400 dark:text-zinc-500 font-bold mb-2">
                    Current Crew:
                  </span>
                  <div className="flex items-center space-x-2">
                    {team.members.map((m: TeamMember, mIdx) => (
                      <div key={mIdx} className="flex items-center space-x-1 bg-gray-50 dark:bg-zinc-950/60 border border-gray-150/40 dark:border-zinc-900 py-1 px-2.5 rounded-lg text-xs font-medium">
                        <img src={m.photoUrl} alt={m.name} className="h-5.5 w-5.5 rounded-full object-cover" />
                        <span className="text-gray-700 dark:text-zinc-300 truncate max-w-[100px]">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team required skills tag list */}
                <div className="flex flex-wrap gap-1 mt-5">
                  {team.requiredSkills.map((sk, skIdx) => (
                    <span key={skIdx} className="bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-md font-medium">
                      Requires: {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium font-mono">
                  Origin: {team.college}
                </div>
                {userProfile && team.creatorId === userProfile.uid ? (
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Your Roster
                  </span>
                ) : (
                  <button
                    id={`btn-apply-team-${team.id}`}
                    onClick={() => {
                      if (!userProfile) {
                        onOpenAuth();
                        return;
                      }
                      setApplyingTeam(team);
                    }}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    <span>Apply to Team</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TEAM DIALOG MODAL */}
      {showCreateModal && (
        <div id="create-team-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Form Your Hackathon Team</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">Create a project recruitment board locked under your university verified whitelist.</p>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Team Name</label>
                <input
                  id="txt-new-team-name"
                  type="text"
                  required
                  placeholder="e.g., Quantum Coders SKCET"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Associated Target Event</label>
                <select
                  id="sel-new-team-hack"
                  required
                  value={tHackId}
                  onChange={(e) => setTHackId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Target Hackathon</option>
                  {hackathons.map((h) => (
                    <option key={h.id} value={h.id}>{h.title}</option>
                  ))}
                  <option value="general">Internal Campus Coding Sprint 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Roster Description</label>
                <textarea
                  id="txt-new-team-desc"
                  required
                  rows={3}
                  placeholder="Summarize your project vision, technology parameters, structure, and meeting schedules..."
                  value={tDesc}
                  onChange={(e) => setTDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Max Team Size</label>
                  <input
                    id="num-new-team-size"
                    type="number"
                    min={2}
                    max={10}
                    value={tMaxSize}
                    onChange={(e) => setTMaxSize(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Hiring Slots (comma split)</label>
                  <input
                    id="txt-new-team-positions"
                    type="text"
                    placeholder="e.g., UI/UX Designer, Go developer"
                    value={tOpenPositions}
                    onChange={(e) => TOpenPositions(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Keywords required skills (comma split)</label>
                <input
                  id="txt-new-team-skills"
                  type="text"
                  placeholder="e.g., React, Go, Figma, Node.js"
                  value={tSkills}
                  onChange={(e) => setTSkills(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-zinc-850">
                <button
                  type="button"
                  id="btn-cancel-new-team"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-3 rounded-xl border border-gray-200 text-gray-655 font-bold hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 text-xs sm:text-sm cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  id="btn-confirm-new-team"
                  className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs sm:text-sm shadow-md cursor-pointer"
                >
                  Publish Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLY TO TEAM DRAWER DIALOG */}
      {applyingTeam && (
        <div id="apply-team-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Apply to {applyingTeam.name}</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">Submit a formal request. Roster administrators will receive your credentials.</p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Select Target Position</label>
                <select
                  id="sel-apply-position"
                  required
                  value={applyRole}
                  onChange={(e) => setApplyRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Which slot are you targeting?</option>
                  {applyingTeam.openPositions.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                  <option value="collaborator">General Engineering Collaborator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase">Cover Statement</label>
                <textarea
                  id="txt-apply-statement"
                  required
                  rows={4}
                  placeholder="Introduce yourself! List your relevant experience, stack specialties, why you fit this project team..."
                  value={applyCoverLetter}
                  onChange={(e) => setApplyCoverLetter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {applySuccessAlert ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-3 px-4 rounded-xl text-center font-bold flex items-center justify-center space-x-1.5 animate-bounce">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Join Application Logged Successfully!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    navigator-close="true"
                    onClick={() => setApplyingTeam(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    id="btn-confirm-apply"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs shadow-md cursor-pointer"
                  >
                    Submit Application
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
