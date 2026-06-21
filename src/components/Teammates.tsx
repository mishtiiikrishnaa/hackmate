import React from 'react';
import {
  Users,
  Search,
  Filter,
  Github,
  Linkedin,
  Cpu,
  Mail,
  Zap,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  ShieldCheck,
  Award,
  Globe,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { UserProfile, PreferredRole } from '../types';
import { dbService } from '../lib/db';

interface TeammatesProps {
  students: UserProfile[];
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  savedStudentIds: string[];
  onToggleBookmark: (id: string) => void;
  onSendMessage: (recipientId: string, txt: string) => void;
}

export default function Teammates({
  students,
  userProfile,
  onOpenAuth,
  savedStudentIds,
  onToggleBookmark,
  onSendMessage
}: TeammatesProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [selectedSkill, setSelectedSkill] = React.useState<string>('all');

  // Contact / Message Dialog State
  const [contactingStudent, setContactingStudent] = React.useState<UserProfile | null>(null);
  const [messageText, setMessageText] = React.useState('');
  const [sentSuccessId, setSentSuccessId] = React.useState<string | null>(null);

  const rolesList = [
    'all',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'UI/UX Designer',
    'AI/ML Engineer',
    'Data Scientist',
    'Product Manager',
    'Marketing'
  ];

  const allMainSkills = ['all', 'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Figma', 'PyTorch', 'Docker', 'NoSQL', 'Flutter'];

  // Match calculations
  const calculateMatchScore = (targetStudent: UserProfile): number => {
    if (!userProfile) return 85; // Static estimation for guests
    const userSkills = userProfile.skills || [];
    const targetSkills = targetStudent.skills || [];
    
    // Complementary intersection: If they are different roles, they match better!
    let rolesMultiplier = 1.0;
    if (userProfile.preferredRole !== targetStudent.preferredRole) {
      rolesMultiplier = 1.15; // Higher score for diverse talent
    } else {
      rolesMultiplier = 0.85; // Slightly lower if competing for same slot
    }

    // Common interest match
    const commonInterests = (userProfile.interests || []).filter(i => (targetStudent.interests || []).includes(i));
    const sameCollege = userProfile.college === targetStudent.college ? 15 : 0;

    const skillDiff = targetSkills.filter(s => !userSkills.includes(s)); // Complementary skills they have that user lacks
    
    const rawScore = 65 + (skillDiff.length * 5) + (commonInterests.length * 4) + sameCollege;
    return Math.min(100, Math.round(rawScore * rolesMultiplier));
  };

  const filteredStudents = students.filter(student => {
    // Hide self from feed
    if (userProfile && student.uid === userProfile.uid) return false;

    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (student.bio || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || student.preferredRole === roleFilter;
    const matchesSkill = selectedSkill === 'all' || student.skills.some(s => s.toLowerCase() === selectedSkill.toLowerCase());

    return matchesSearch && matchesRole && matchesSkill;
  });

  const triggerContactMessage = (student: UserProfile) => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }
    setContactingStudent(student);
    setMessageText(`Hi ${student.name.split(' ')[0]}, I saw your ${student.preferredRole} profile on HackMate. I would love to connect and build a team for the upcoming hackathons!`);
    setSentSuccessId(null);
  };

  const handleSendInvitation = async () => {
    if (!contactingStudent) return;
    try {
      await onSendMessage(contactingStudent.uid, messageText);
      setSentSuccessId(contactingStudent.uid);
      setTimeout(() => {
        setContactingStudent(null);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* SECTION HEADER */}
      <div className="border-b border-gray-150 dark:border-zinc-900 pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Scout Campmates & Teammates
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
          Find matching college scholars to complete your roster. Backed by verified institutional whitelists.
        </p>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
        <div className="lg:col-span-5 relative">
          <Search className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-gray-400" />
          <input
            id="input-teammate-search"
            type="text"
            placeholder="Search student names, universities, departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Selected Preferred Role filter */}
        <div className="lg:col-span-4">
          <select
            id="sel-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 capitalize cursor-pointer"
          >
            {rolesList.map((role) => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles & Subdivisions' : role}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Skills Filter */}
        <div className="lg:col-span-3">
          <select
            id="sel-skill-filter"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-indigo-500 capitalize cursor-pointer"
          >
            {allMainSkills.map((sk) => (
              <option key={sk} value={sk}>
                {sk === 'all' ? 'All Engineering Skills' : `Requires: ${sk}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDER GRID */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-900">
          <Users className="h-10 w-10 text-gray-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">No Students Found</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-500 max-w-sm mx-auto mt-2">
            Try adjusting your engineering filter parameters or clearing keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStudents.map((stud) => {
            const isBookmarked = savedStudentIds.includes(stud.uid);
            const score = calculateMatchScore(stud);

            return (
              <div
                key={stud.uid}
                className="bg-white dark:bg-zinc-900 border border-gray-200/85 dark:border-zinc-900 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition relative"
                id={`student-card-${stud.uid}`}
              >
                
                {/* Bookmarking Action */}
                <button
                  id={`btn-bookmark-stud-${stud.uid}`}
                  onClick={() => {
                    if (!userProfile) {
                      onOpenAuth();
                      return;
                    }
                    onToggleBookmark(stud.uid);
                  }}
                  className="absolute top-5 right-5 p-2 rounded-xl border border-gray-150 dark:border-zinc-800 text-gray-400 hover:text-indigo-600 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                  ) : (
                    <Bookmark className="h-4.5 w-4.5" />
                  )}
                </button>

                {/* Score compatibility badge */}
                <div className="absolute top-5 left-5 bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 px-2.5 py-1 rounded-full flex items-center space-x-1 font-mono text-[10px] font-bold">
                  <Zap className="h-3 w-3 fill-emerald-600" />
                  <span>{score}% Match</span>
                </div>

                <div className="mt-6 text-center">
                  <div className="relative inline-block">
                    <img
                      src={stud.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt={stud.name}
                      className="h-20 w-20 rounded-full mx-auto object-cover border-2 border-indigo-500/20 shadow-md"
                    />
                    <span className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                      stud.availability === 'open' ? 'bg-emerald-500' : stud.availability === 'looking' ? 'bg-amber-400' : 'bg-red-500'
                    }`} title={`Status: ${stud.availability}`} />
                  </div>

                  <h3 className="text-xl font-bold mt-4 text-slate-900 dark:text-white flex items-center justify-center space-x-1">
                    <span>{stud.name}</span>
                    {score >= 90 && <Award className="h-4 w-4 text-amber-500" title="Highly Recomended Match" />}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-purple-400 mt-1">
                    {stud.preferredRole}
                  </p>
                  
                  {/* College display with verify icon */}
                  <div className="flex items-center justify-center space-x-1 text-[10px] text-gray-500 dark:text-zinc-400 mt-2 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                    <span className="truncate max-w-[200px]">{stud.college}</span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-zinc-400 mt-4 line-clamp-2 leading-relaxed px-2">
                    {stud.bio}
                  </p>

                  {/* Skills lists */}
                  <div className="flex flex-wrap items-center justify-center gap-1 mt-4">
                    {stud.skills.slice(0, 4).map((sk, skIdx) => (
                      <span key={skIdx} className="bg-gray-50 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-md font-semibold font-sans">
                        {sk}
                      </span>
                    ))}
                    {stud.skills.length > 4 && (
                      <span className="text-[10px] text-indigo-600 font-bold">+{stud.skills.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* BOTTOM BUTTON LINKS & ACTION CONTROLS */}
                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {stud.github && (
                      <a href={stud.github} target="_blank" rel="noreferrer" className="p-2 border border-gray-150 rounded-xl text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition hover:bg-gray-50">
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {stud.linkedin && (
                      <a href={stud.linkedin} target="_blank" rel="noreferrer" className="p-2 border border-gray-150 rounded-xl text-gray-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-sky-400 transition hover:bg-gray-50">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <button
                    id={`btn-contact-stud-${stud.uid}`}
                    onClick={() => triggerContactMessage(stud)}
                    className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm scroll-smooth cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Send Invite</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CONTACT DRAWER MODAL */}
      {contactingStudent && (
        <div id="contact-dialog-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-850 p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Invite {contactingStudent.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Send a direct message proposal. This opens a private direct-chat thread whitelisted on their console.
            </p>

            <textarea
              id="txt-contact-message"
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 mb-4"
            />

            {sentSuccessId === contactingStudent.uid ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-3 px-4 rounded-xl text-center mb-4 font-semibold flex items-center justify-center space-x-1.5 animate-bounce">
                <HeartHandshake className="h-4 w-4" />
                <span>Roster Proposal Sent Successfully!</span>
              </div>
            ) : (
              <div className="flex items-center justify-end space-x-2">
                <button
                  id="btn-cancel-contact"
                  onClick={() => setContactingStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  id="btn-confirm-send-invite"
                  onClick={handleSendInvitation}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 text-xs shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Send Invitation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
