import React from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Award,
  Users,
  Cpu,
  Brain,
  Bookmark,
  Sparkles,
  BookmarkCheck,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Hackathon, UserProfile } from '../types';
import { dbService } from '../lib/db';

interface HackathonsProps {
  hackathons: Hackathon[];
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  savedHackathonIds: string[];
  onToggleBookmark: (id: string) => void;
}

export default function Hackathons({
  hackathons,
  userProfile,
  onOpenAuth,
  savedHackathonIds,
  onToggleBookmark
}: HackathonsProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [modeFilter, setModeFilter] = React.useState<'all' | 'online' | 'offline'>('all');
  const [selectedTag, setSelectedTag] = React.useState<string>('all');
  
  // AI State
  const [analyzingId, setAnalyzingId] = React.useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = React.useState<{
    [hackathonId: string]: {
      gap: string[];
      suggestions: string;
      difficulty: string;
    }
  }>({});

  const availableTags = ['all', 'AI/ML', 'Web Development', 'Blockchain', 'Cybersecurity', 'Web3', 'HealthCare', 'IoT'];

  const filteredHackathons = hackathons.filter(hack => {
    const matchesSearch = hack.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hack.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hack.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter === 'all' || hack.mode === modeFilter;
    const matchesTag = selectedTag === 'all' || hack.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
    return matchesSearch && matchesMode && matchesTag;
  });

  const runAiSkillGap = async (hack: Hackathon) => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }
    setAnalyzingId(hack.id);
    try {
      const skills = userProfile.skills || [];
      const result = await dbService.analyzeSkillGap(skills, hack.tags);
      setAiAnalysisResult(prev => ({
        ...prev,
        [hack.id]: result
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* HEADER SECTION */}
      <div className="md:flex md:items-center md:justify-between border-b border-gray-100 dark:border-zinc-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Hackathon Discovery
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Explore and bookmark premium student-friendly hackathons whitelisted for deployment.
          </p>
        </div>
        {userProfile && (
          <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">
              Double-click to invoke Gemini Skill Gap check
            </span>
          </div>
        )}
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
        <div className="lg:col-span-6 relative">
          <Search className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-gray-400" />
          <input
            id="input-hack-search"
            type="text"
            placeholder="Search events, organizers, technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Mode filter button group */}
        <div className="lg:col-span-3 flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl">
          {(['all', 'online', 'offline'] as const).map((mode) => (
            <button
              key={mode}
              id={`btn-mode-filter-${mode}`}
              onClick={() => setModeFilter(mode)}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                modeFilter === mode
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Tag select dropdown */}
        <div className="lg:col-span-3">
          <select
            id="sel-tag-filter"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 capitalize cursor-pointer"
          >
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag === 'all' ? 'All Tech Stacks' : tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDER LISTING */}
      {filteredHackathons.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 w-full rounded-3xl border border-gray-150 dark:border-zinc-900">
          <Clock className="h-10 w-10 text-gray-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">No Hackathons Filtered</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-500 max-w-sm mx-auto mt-2">
            Try adjusting your query keywords or changing the category filter dropdown.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredHackathons.map((hack) => {
            const isBookmarked = savedHackathonIds.includes(hack.id);
            const analysis = aiAnalysisResult[hack.id];

            return (
              <div
                key={hack.id}
                className="bg-white dark:bg-zinc-900/80 rounded-3xl border border-gray-200/80 dark:border-zinc-900 p-6 flex flex-col justify-between hover:shadow-xl transition relative"
                id={`hackathon-card-${hack.id}`}
              >
                
                {/* Bookmarking Star Button */}
                <button
                  id={`btn-bookmark-hack-${hack.id}`}
                  onClick={() => {
                    if (!userProfile) {
                      onOpenAuth();
                      return;
                    }
                    onToggleBookmark(hack.id);
                  }}
                  className="absolute top-5 right-5 p-2 rounded-xl border border-gray-155 dark:border-zinc-800 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                  ) : (
                    <Bookmark className="h-4.5 w-4.5" />
                  )}
                </button>

                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold mb-3">
                    <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {hack.mode}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {hack.prizePool}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {hack.title}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mt-1">
                    Hosted by {hack.organizer}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-4 leading-relaxed pr-6">
                    {hack.description}
                  </p>

                  {/* Badges tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {hack.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-md font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-zinc-950/40 p-3 rounded-2xl mt-6 border border-gray-150/40 dark:border-zinc-900/60 text-xs text-gray-600 dark:text-zinc-400">
                    <div>
                      <span className="block text-[10px] uppercase text-gray-400 dark:text-zinc-500 font-bold">Team Cap</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-200">{hack.teamSize}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-gray-400 dark:text-zinc-500 font-bold">Registry</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-200">{hack.eligibility}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-gray-400 dark:text-zinc-500 font-bold">Deadline</span>
                      <span className="font-semibold text-red-500 dark:text-rose-400">{hack.deadline}</span>
                    </div>
                  </div>
                </div>

                {/* AI SKILL GAP BUTTON / PANEL */}
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800">
                  {analysis ? (
                    <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs dark:bg-indigo-950/20 dark:border-indigo-900/40">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-indigo-400 font-bold">
                          <Brain className="h-4 w-4" />
                          <span>Gemini Skill Gap Analysis</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-700 px-2 py-0.5 rounded">
                          {analysis.difficulty}
                        </span>
                      </div>
                      
                      {/* Gap List */}
                      {analysis.gap.length > 0 && (
                        <div className="mb-2.5">
                          <span className="font-semibold text-slate-800 dark:text-white">Identified technology gaps:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysis.gap.map((g, gIdx) => (
                              <span key={gIdx} className="bg-white border border-indigo-200 text-indigo-700 dark:bg-zinc-900 dark:border-indigo-900 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-600 dark:text-zinc-300 leading-relaxed italic">
                        "{analysis.suggestions}"
                      </p>
                    </div>
                  ) : (
                    <button
                      id={`btn-ai-gap-${hack.id}`}
                      onClick={() => runAiSkillGap(hack)}
                      disabled={analyzingId !== null}
                      className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-indigo-50 via-gray-50 to-purple-50 hover:from-indigo-100/50 hover:to-purple-100/50 dark:from-zinc-900 dark:to-zinc-900 dark:hover:bg-zinc-800/80 border border-gray-200 dark:border-zinc-800 py-3 text-xs font-bold text-indigo-700 dark:text-indigo-400 transition"
                    >
                      <Brain className="h-4 w-4 animate-bounce" />
                      <span>{analyzingId === hack.id ? 'Analyzing with Google Gemini...' : 'Analyze Skill Gap with AI'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
