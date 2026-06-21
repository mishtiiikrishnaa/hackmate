import React from 'react';
import {
  User,
  Users,
  MessageSquare,
  FileText,
  Bookmark,
  Bell,
  CheckCircle,
  Plus,
  Send,
  Loader2,
  Paperclip,
  Smile,
  Check,
  Circle,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Save,
  ShieldCheck,
  CornerDownRight,
  Sparkles,
  Handshake,
  Inbox
} from 'lucide-react';
import {
  UserProfile,
  Team,
  TeamApplication,
  ChatMessage,
  SystemNotification,
  TeamTask,
  TeamResource,
  PreferredRole,
  RosterInvite,
  TeamToTeamCollab
} from '../types';
import { dbService } from '../lib/db';

interface ActivityDashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  teams: Team[];
  applications: TeamApplication[];
  messages: ChatMessage[];
  notifications: SystemNotification[];
  bookmarks: any[];
  onSendMessage: (roomId: string, text: string, file?: { name: string; url: string }) => void;
  onApproveApplication: (applicationId: string) => void;
  onDeclineApplication: (applicationId: string) => void;
  onAddTeamTask: (teamId: string, taskTitle: string, assigneeId: string, assigneeName: string) => void;
  onToggleTaskStatus: (teamId: string, taskId: string, nextStatus: 'todo' | 'in-progress' | 'done') => void;
  onSaveTeamNotes: (teamId: string, notesText: string) => void;
  onAddTeamResource: (teamId: string, title: string, link: string) => void;
  onMarkNotificationRead: (id: string) => void;
  savedHackathons: any[];
  savedTeammates: any[];
  savedTeams: any[];
  initialTab?: 'profile' | 'team' | 'dm' | 'applications' | 'bookmarks';
}

export default function ActivityDashboard({
  userProfile,
  onUpdateProfile,
  teams,
  applications,
  messages,
  notifications,
  bookmarks,
  onSendMessage,
  onApproveApplication,
  onDeclineApplication,
  onAddTeamTask,
  onToggleTaskStatus,
  onSaveTeamNotes,
  onAddTeamResource,
  onMarkNotificationRead,
  savedHackathons,
  savedTeammates,
  savedTeams,
  initialTab
}: ActivityDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'team' | 'dm' | 'applications' | 'bookmarks'>(initialTab || 'profile');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Profile Editor state
  const [pBio, setPBio] = React.useState(userProfile.bio || '');
  const [pSkills, setPSkills] = React.useState((userProfile.skills || []).join(', '));
  const [pInterests, setPInterests] = React.useState((userProfile.interests || []).join(', '));
  const [pRole, setPRole] = React.useState<PreferredRole>(userProfile.preferredRole);
  const [pStatus, setPStatus] = React.useState<'open' | 'busy' | 'looking'>(userProfile.availability || 'open');
  const [pGithub, setPGithub] = React.useState(userProfile.github || '');
  const [pLinkedin, setPLinkedin] = React.useState(userProfile.linkedin || '');
  const [pDept, setPDept] = React.useState(userProfile.department || '');
  const [pYear, setPYear] = React.useState(userProfile.yearOfStudy || 3);
  const [saveSuccessMsg, setSaveSuccessMsg] = React.useState(false);

  // Active Team layout
  const myTeam = teams.find(t => t.creatorId === userProfile.uid || t.members.some(m => m.uid === userProfile.uid));

  // Shared resources form
  const [resTitle, setResTitle] = React.useState('');
  const [resLink, setResLink] = React.useState('');
  // Task board form
  const [taskName, setTaskName] = React.useState('');
  const [taskAssignee, setTaskAssignee] = React.useState('');
  // Shared notes state
  const [notesText, setNotesText] = React.useState(myTeam ? myTeam.notes || '' : '');

  // Direct Messaging Thread State
  const [selectedDmRoom, setSelectedDmRoom] = React.useState<string | null>(null);
  const [dmText, setDmText] = React.useState('');
  const [typingState, setTypingState] = React.useState(false);

  // ==========================================
  // INVITATIONS & INTER-TEAM COLLABORATION STATES
  // ==========================================
  const [rosterInvites, setRosterInvites] = React.useState<RosterInvite[]>([]);
  const [teamCollabs, setTeamCollabs] = React.useState<TeamToTeamCollab[]>([]);
  const [selectedCollabId, setSelectedCollabId] = React.useState<string | null>(null);
  const [collabChatText, setCollabChatText] = React.useState('');

  const fetchRosterData = async () => {
    try {
      const invites = await dbService.getRosterInvites(userProfile.uid);
      setRosterInvites(invites);

      if (myTeam) {
        const collabs = await dbService.getTeamToTeamCollabs(myTeam.id);
        setTeamCollabs(collabs);
        
        // Default select first accepted collab for inter-team chat
        const accepted = collabs.find(c => c.status === 'accepted');
        if (accepted && !selectedCollabId) {
          setSelectedCollabId(accepted.id);
        }
      }
    } catch (e) {
      console.error("MatchFinder states sync error:", e);
    }
  };

  React.useEffect(() => {
    fetchRosterData();
    const interval = setInterval(fetchRosterData, 4000);
    return () => clearInterval(interval);
  }, [userProfile, myTeam, activeTab]);

  const handleAcceptRosterInvite = async (invite: RosterInvite) => {
    try {
      const allTeams = await dbService.getTeams();
      const targetTeam = allTeams.find(t => t.id === invite.teamId);
      if (!targetTeam) {
        alert("The team was not found or has been disbanded.");
        return;
      }

      if (targetTeam.members.length >= targetTeam.maxSize) {
        alert("The roster for this team is already complete (Maximum size reached)!");
        return;
      }

      // Add user to the team roster
      const updatedMembers = [
        ...targetTeam.members,
        {
          uid: userProfile.uid,
          name: userProfile.name,
          role: userProfile.preferredRole || 'Developer',
          photoUrl: userProfile.photoUrl
        }
      ];

      const updatedTeam = {
        ...targetTeam,
        members: updatedMembers
      };

      await dbService.saveTeam(updatedTeam);

      // Save updated invite status
      const updatedInvite = {
        ...invite,
        status: 'accepted' as const
      };
      await dbService.saveRosterInvite(updatedInvite);

      alert(`Success! You have officially joined team "${targetTeam.name}"!`);
      fetchRosterData();
      
      // Reload page to re-initialize profile parameters correctly
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineRosterInvite = async (invite: RosterInvite) => {
    try {
      const updatedInvite = {
        ...invite,
        status: 'declined' as const
      };
      await dbService.saveRosterInvite(updatedInvite);
      alert("Teammate invite declined.");
      fetchRosterData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCollabInvite = async (targetTeamId: string, targetTeamName: string) => {
    if (!myTeam) return;
    
    // Prevent duplicate invite to same team
    const ex = teamCollabs.find(c => c.proposingTeamId === myTeam.id && c.receivingTeamId === targetTeamId);
    if (ex) {
      alert(`An active collaboration proposal exists or is already matched with "${targetTeamName}"!`);
      return;
    }

    const newCollab: TeamToTeamCollab = {
      id: 'coll_' + Math.random().toString(36).substr(2, 9),
      proposingTeamId: myTeam.id,
      proposingTeamName: myTeam.name,
      receivingTeamId: targetTeamId,
      receivingTeamName: targetTeamName,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await dbService.saveTeamToTeamCollab(newCollab);
      alert(`Collaboration invitation sent to "${targetTeamName}"! They can approve this in their Workspace.`);
      
      const allTeams = await dbService.getTeams();
      const target = allTeams.find(t => t.id === targetTeamId);
      if (target) {
        const notif: any = {
          id: 'n_collab_' + Math.random().toString(36).substr(2, 9),
          userId: target.creatorId,
          title: "🤝 Inter-Team Collaboration Proposal",
          body: `Team "${myTeam.name}" sent you a proposal to co-chat. Select 'Roster Team Workspace' to accept.`,
          type: 'invite',
          read: false,
          link: 'team_dashboard',
          createdAt: new Date().toISOString()
        };
        await dbService.saveNotification(notif);
      }
      fetchRosterData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptCollabInvite = async (collab: TeamToTeamCollab) => {
    try {
      const updated = {
        ...collab,
        status: 'accepted' as const
      };
      await dbService.saveTeamToTeamCollab(updated);
      setSelectedCollabId(collab.id);
      alert("Collaboration Accepted! Swapping into team-to-team chat session.");
      fetchRosterData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineCollabInvite = async (collab: TeamToTeamCollab) => {
    try {
      const updated = {
        ...collab,
        status: 'declined' as const
      };
      await dbService.saveTeamToTeamCollab(updated);
      alert("Collaboration proposal declined.");
      fetchRosterData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCollabChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !collabChatText.trim()) return;

    onSendMessage('collab_' + selectedCollabId, collabChatText.trim());
    setCollabChatText('');
  };

  // Filter messages for active rooms
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Initializing default DM room on load if empty
  React.useEffect(() => {
    if (activeTab === 'dm' && !selectedDmRoom) {
      // Find potential direct chat recipients (e.g. Vikram, Hari, or Ananya)
      const mockPeers = ['stud3', 'stud1', 'stud2'];
      const activePeer = mockPeers.find(p => p !== userProfile.uid);
      if (activePeer) {
        setSelectedDmRoom(activePeer);
      }
    }
  }, [activeTab]);

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedDmRoom, activeTab]);

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      bio: pBio,
      skills: pSkills.split(',').map(s => s.trim()).filter(Boolean),
      interests: pInterests.split(',').map(i => i.trim()).filter(Boolean),
      preferredRole: pRole,
      availability: pStatus,
      github: pGithub,
      linkedin: pLinkedin,
      department: pDept,
      yearOfStudy: Number(pYear)
    };
    onUpdateProfile(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
    }, 1500);
  };

  const handleSendChatSubmit = (e: React.FormEvent, roomId: string, isDm: boolean) => {
    e.preventDefault();
    const text = isDm ? dmText : notesText; // For chat inputs
    const cleanText = isDm ? dmText.trim() : '';

    if (isDm && cleanText) {
      onSendMessage(roomId, cleanText);
      setDmText('');
      
      // Simulate typing metrics reply
      setTypingState(true);
      setTimeout(() => {
        setTypingState(false);
        const autoReplies = [
          "Awesome! Let us hop on a quick call at 5:00 PM today.",
          "Perfect selection. Our skills align remarkably well. Let us build!",
          "That is great insight. I am checking the SIH project requirements now."
        ];
        const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        onSendMessage(roomId, randomReply); // Echo simulated reply
      }, 2000);
    }
  };

  const handleTeamNotesSave = () => {
    if (!myTeam) return;
    onSaveTeamNotes(myTeam.id, notesText);
    alert("Team workspace notes persisted successfully!");
  };

  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam || !resTitle || !resLink) return;
    onAddTeamResource(myTeam.id, resTitle, resLink);
    setResTitle('');
    setResLink('');
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myTeam || !taskName) return;

    // Pick assignee details
    let assignedUid = userProfile.uid;
    let assignedName = userProfile.name;
    if (taskAssignee) {
      const selectedMember = myTeam.members.find(m => m.uid === taskAssignee);
      if (selectedMember) {
        assignedUid = selectedMember.uid;
        assignedName = selectedMember.name;
      }
    }

    onAddTeamTask(myTeam.id, taskName, assignedUid, assignedName);
    setTaskName('');
    setTaskAssignee('');
  };

  // Applications targeting user owned teams
  const incomingApplications = applications.filter(app => {
    const matchedTeam = teams.find(t => t.id === app.teamId);
    return matchedTeam && matchedTeam.creatorId === userProfile.uid && app.status === 'pending';
  });

  // Calculate direct messages
  const getDmKey = (peerId: string) => {
    const ids = [userProfile.uid, peerId].sort();
    return `dm_${ids[0]}_${ids[1]}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* HEADER SECTION */}
      <div className="border-b border-gray-150 dark:border-zinc-900 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Student Dashboard</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400">
              Verified: {userProfile.college}
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Control center. Edit profiles, review inbox, synchronize tasks, and participate in direct messenger rooms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR NAVIGATION (LEFT 3 COLUMNS) */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-900 rounded-3xl p-5 shadow-sm text-center">
            <img src={userProfile.photoUrl} alt={userProfile.name} className="h-20 w-20 rounded-full mx-auto object-cover border-2 border-indigo-500/20 shadow-md" />
            <h3 className="text-lg font-bold mt-4 text-slate-950 dark:text-white leading-tight">{userProfile.name}</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mt-1">
              {userProfile.preferredRole}
            </span>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-205 dark:border-zinc-800 p-2.5 rounded-2xl flex flex-col space-y-1">
            <button
              id="sidebar-nav-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Bio & Stack Details</span>
            </button>

            <button
              id="sidebar-nav-team"
              onClick={() => setActiveTab('team')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'team'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="h-4 w-4" />
                <span>My Team Workspace</span>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold dark:bg-zinc-950 dark:text-indigo-300">
                {myTeam ? 'Active' : 'Unformed'}
              </span>
            </button>

            <button
              id="sidebar-nav-dm"
              onClick={() => setActiveTab('dm')}
              className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'dm'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Direct Messenger</span>
            </button>

            <button
              id="sidebar-nav-apps"
              onClick={() => setActiveTab('applications')}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'applications'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="h-4 w-4" />
                <span>Join Applications</span>
              </div>
              {incomingApplications.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-550 text-[10px] font-bold text-white leading-none">
                  {incomingApplications.length}
                </span>
              )}
            </button>

            <button
              id="sidebar-nav-bookmarks"
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center space-x-2.5 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'bookmarks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>Bookmarks Folder</span>
            </button>
          </div>

          {/* REAL TIME NOTIFICATION STREAM PANEL */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 p-5 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white mb-3">
              Incoming Alerts ({notifications.filter(n => !n.read).length})
            </h4>
            {notifications.length === 0 ? (
              <p className="text-[10px] text-gray-500">Inbox is empty.</p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-2.5 rounded-xl text-xs border relative transition ${
                      notif.read
                        ? 'border-gray-100 bg-gray-50/50 text-gray-500'
                        : 'border-indigo-100 bg-indigo-50/20 text-slate-800 dark:border-indigo-900/40'
                    }`}
                  >
                    {!notif.read && (
                      <button
                        onClick={() => onMarkNotificationRead(notif.id)}
                        className="absolute top-2 right-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold text-[10px]"
                        title="Mark read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    <span className="block font-bold">{notif.title}</span>
                    <span className="block text-[10px] mt-1 leading-relaxed">{notif.body}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ACTIVE CONSOLE STREAM (RIGHT 9 COLUMNS) */}
        <div className="lg:col-span-9 bg-white dark:bg-zinc-900/60 rounded-3xl border border-gray-200 dark:border-zinc-900 p-6 md:p-8 shadow-sm">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfileSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-850">
                Personal Credentials Editor
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">Department Name</label>
                  <input
                    type="text"
                    value={pDept}
                    onChange={(e) => setPDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Computer Science Engineering"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">Year of Study</label>
                  <select
                    value={pYear}
                    onChange={(e) => setPYear(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">Preferred Roster Designation</label>
                  <select
                    value={pRole}
                    onChange={(e) => setPRole(e.target.value as PreferredRole)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {[
                      'Frontend Developer',
                      'Backend Developer',
                      'Full Stack Developer',
                      'Mobile Developer',
                      'UI/UX Designer',
                      'AI/ML Engineer',
                      'Data Scientist',
                      'Product Manager',
                      'Marketing',
                      'Other'
                    ].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">Roster Availability Dot</label>
                  <select
                    value={pStatus}
                    onChange={(e) => setPStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="open">Open (Actively seeking invitations)</option>
                    <option value="looking">Looking (Completing active roster checks)</option>
                    <option value="busy">Busy (Roster full / event locked)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">Professional Biography</label>
                <textarea
                  rows={4}
                  value={pBio}
                  onChange={(e) => setPBio(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="Tell campus teammates what you specialize in..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">Engineering Skills (split by comma)</label>
                  <input
                    type="text"
                    value={pSkills}
                    onChange={(e) => setPSkills(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. React, Go, Docker, PyTorch"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">Focus Interests (split by comma)</label>
                  <input
                    type="text"
                    value={pInterests}
                    onChange={(e) => setPInterests(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. AI Agents, Web3 integrations"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">GitHub Profile Link</label>
                  <input
                    type="url"
                    value={pGithub}
                    onChange={(e) => setPGithub(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl px-4 py-3 text-sm"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase mb-1.5">LinkedIn Profile Link</label>
                  <input
                    type="url"
                    value={pLinkedin}
                    onChange={(e) => setPLinkedin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-205 dark:border-zinc-805 rounded-xl px-4 py-3 text-sm"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-3 rounded-xl text-center font-bold flex items-center justify-center space-x-1 animate-pulse">
                  <CheckCircle className="h-4 w-4" />
                  <span>College Profile Sync Completed! Saved in Firestore.</span>
                </div>
              )}

              <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-zinc-850">
                <button
                  type="submit"
                  id="btn-save-profile-console"
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          )}

          {/* BOOKMARKS TAB */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-850">
                Bookmarked Folder Repository
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] uppercase text-gray-400 font-bold mb-3 tracking-widest">Bookmarked Hackathons ({savedHackathons.length})</span>
                  {savedHackathons.length === 0 ? (
                    <p className="text-xs text-gray-500">No saved hackathons yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {savedHackathons.map((h, i) => (
                        <div key={i} className="p-3.5 border border-indigo-150 rounded-xl bg-indigo-50/10 dark:border-zinc-800">
                          <h4 className="font-bold text-xs sm:text-sm">{h.title}</h4>
                          <span className="text-[10px] text-gray-500 block">Due: {h.deadline}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <span className="block text-[10px] uppercase text-gray-400 font-bold mb-3 tracking-widest">Bookmarked Teammates ({savedTeammates.length})</span>
                  {savedTeammates.length === 0 ? (
                    <p className="text-xs text-gray-500">No saved teammate profiles yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {savedTeammates.map((s, i) => (
                        <div key={i} className="p-3.5 border border-gray-150 rounded-xl bg-gray-50/50 flex items-center space-x-3.5 dark:border-zinc-800 dark:bg-zinc-900/30">
                          <img src={s.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm">{s.name}</h4>
                            <span className="text-[10px] text-indigo-600 font-semibold">{s.preferredRole}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* APPLICATION APPROVAL CONSOLE */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-850">
                Join Applications Console
              </h2>

              {incomingApplications.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 mt-2">No pending student join applications targeting your team.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingApplications.map((app) => (
                    <div key={app.id} className="p-5 border border-gray-200 rounded-3xl bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/40">
                      <div className="flex items-center space-x-3 mb-4 bg-indigo-50/30 p-2.5 rounded-2xl dark:bg-zinc-950/40">
                        <img src={app.userPhoto} alt="" className="h-9 w-9 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm">{app.userName}</h4>
                          <span className="text-[10px] text-gray-500 dark:text-indigo-400 font-semibold">{app.userRole}</span>
                        </div>
                      </div>

                      <div className="pl-3 border-l-2 border-indigo-500">
                        <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Cover Motivation Statement:</span>
                        <p className="text-xs text-gray-650 dark:text-zinc-300 leading-relaxed italic">
                          "{app.message}"
                        </p>
                      </div>

                      {/* Applicant Skills */}
                      {app.skills && app.skills.length > 0 && (
                        <div className="mt-4">
                          <span className="block text-[10px] uppercase text-gray-400 font-bold mb-1.5">Applicant Stack:</span>
                          <div className="flex flex-wrap gap-1">
                            {app.skills.map((s, idx) => (
                              <span key={idx} className="bg-white border border-gray-200 text-gray-600 dark:bg-zinc-900 dark:border-zinc-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 pt-4 border-t border-gray-150/40 dark:border-zinc-800/40 flex items-center justify-end space-x-2">
                        <button
                          id={`btn-decline-app-${app.id}`}
                          onClick={() => onDeclineApplication(app.id)}
                          className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold dark:hover:bg-red-950/20 cursor-pointer"
                        >
                          Decline Request
                        </button>
                        <button
                          id={`btn-approve-app-${app.id}`}
                          onClick={() => onApproveApplication(app.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold shadow-md cursor-pointer"
                        >
                          Approve Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* DIRECT ROSTER RECRUITMENT INVITES */}
              <div className="pt-8 border-t border-gray-150 dark:border-zinc-850 mt-8 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <Inbox className="h-5 w-5 text-indigo-650 animate-pulse" />
                    <span>My Received Roster Recruitment Invites</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Incoming invitations to join teams from swiping matches or direct recruitment campaigns.
                  </p>
                </div>

                {rosterInvites.filter(i => i.status === 'pending').length === 0 ? (
                  <div className="p-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center bg-slate-50/50">
                    <span className="text-xs text-gray-400 font-semibold italic">No pending direct recruitment offers available.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rosterInvites.filter(i => i.status === 'pending').map((invite) => (
                      <div key={invite.id} className="p-5 bg-white dark:bg-zinc-950 border border-indigo-100 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-655 dark:text-indigo-400 tracking-wider uppercase">RECRUIT OFFER</span>
                          <span className="text-[9px] font-mono text-gray-400">Received {new Date(invite.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150">
                            Invitation to Join: <span className="text-indigo-600 dark:text-indigo-400">"{invite.teamName}"</span>
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Sent by {invite.senderName} • Assigned Role: <strong className="text-slate-700 dark:text-zinc-350">{invite.role}</strong>
                          </p>
                        </div>
                        <div className="pt-3 border-t border-gray-100 dark:border-zinc-900 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDeclineRosterInvite(invite)}
                            className="px-3.5 py-1.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptRosterInvite(invite)}
                            className="bg-indigo-650 hover:bg-indigo-550 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold shadow transition cursor-pointer"
                          >
                            Accept & Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TEAM WORKSPACE TAB */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-850 flex items-center justify-between">
                <span>Roster Team Workspace</span>
                {myTeam && (
                  <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full dark:bg-indigo-950/20 dark:text-indigo-400">
                    {myTeam.name}
                  </span>
                )}
              </h2>

              {!myTeam ? (
                <div className="text-center py-12">
                  <Users className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 mt-2">You are currently not affiliated with any active project roster.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Visit the 'Teams' page to apply to open slots or form a new team crew.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* WORKSPACE BOARD CONTROLS (LEFT 7 COLUMNS) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Collaborative Notes */}
                    <div className="p-5 border border-gray-150 dark:border-zinc-800 rounded-3xl bg-slate-50/40">
                      <div className="flex items-center justify-between mb-3">
                        <span className="block text-[10px] uppercase text-gray-400 font-bold">Collaborative Notes Locker:</span>
                        <button
                          onClick={handleTeamNotesSave}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center hover:underline"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          <span>Persist Notes</span>
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3 text-xs focus:outline-none"
                        placeholder="Draft ideas, meeting milestones, and code links here for the crew to see..."
                      />
                    </div>

                    {/* Shared Tasks Board */}
                    <div className="p-5 border border-gray-150 dark:border-zinc-800 rounded-3xl">
                      <span className="block text-[10px] uppercase text-gray-400 font-bold mb-3">Active Deliverables Tracker:</span>
                      
                      {myTeam.tasks && myTeam.tasks.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {myTeam.tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-xs dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-850">
                              <div className="flex items-center space-x-2.5">
                                <button
                                  onClick={() => onToggleTaskStatus(myTeam.id, task.id, task.status === 'done' ? 'todo' : 'done')}
                                  className="text-gray-400 hover:text-indigo-600"
                                >
                                  {task.status === 'done' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4" />}
                                </button>
                                <span className={task.status === 'done' ? 'line-through text-gray-400' : 'font-semibold'}>
                                  {task.title}
                                </span>
                              </div>
                              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-medium dark:bg-zinc-950">
                                @{task.assigneeName.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mb-4">No milestone tasks defined yet.</p>
                      )}

                      <form onSubmit={handleTaskSubmit} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={taskName}
                          onChange={(e) => setTaskName(e.target.value)}
                          placeholder="Quick Task: e.g. Design Landing..."
                          className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                        <select
                          value={taskAssignee}
                          onChange={(e) => setTaskAssignee(e.target.value)}
                          className="bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-2.5 py-2 text-xs cursor-pointer focus:outline-none"
                        >
                          <option value="">Assignee</option>
                          {myTeam.members.map(m => (
                            <option key={m.uid} value={m.uid}>{m.name.split(' ')[0]}</option>
                          ))}
                        </select>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2.5 rounded-xl text-xs flex items-center justify-center">
                          <Plus className="h-4 w-4" />
                        </button>
                      </form>
                    </div>

                    {/* Shared Resources */}
                    <div className="p-5 border border-gray-150 dark:border-zinc-800 rounded-3xl">
                      <span className="block text-[10px] uppercase text-gray-400 font-bold mb-3">Resources Locker:</span>
                      
                      {myTeam.resources && myTeam.resources.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {myTeam.resources.map((res, idx) => (
                            <a
                              key={idx}
                              href={res.link}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs dark:bg-zinc-900/50 dark:hover:bg-zinc-800 transition"
                            >
                              <span className="font-semibold">{res.title}</span>
                              <ExternalLink className="h-3.5 w-3.5 text-indigo-500" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mb-4">No shared resources listed.</p>
                      )}

                      <form onSubmit={handleResourceSubmit} className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          placeholder="Resource Title (e.g., GitHub Repo)"
                          className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                        />
                        <input
                          type="url"
                          required
                          value={resLink}
                          onChange={(e) => setResLink(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-400 text-white p-2.5 rounded-xl">
                          <Plus className="h-4 w-4" />
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* CHAT MESSAGING BOX (RIGHT 5 COLUMNS) */}
                  <div className="lg:col-span-5 flex flex-col h-[520px] border border-gray-150 dark:border-zinc-800 rounded-3xl overflow-hidden bg-slate-50/30">
                    <div className="bg-white border-b border-gray-150 p-4 dark:bg-zinc-950 dark:border-zinc-850">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Roster Group Chat</h4>
                      <span className="text-[10px] text-gray-500">Live conversation thread with teammates</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.filter(m => m.roomId === myTeam.id).map(msg => {
                        const isMe = msg.senderId === userProfile.uid;
                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-gray-400">
                              {!isMe && <img src={msg.senderPhoto} alt="" className="h-4 w-4 rounded-full object-cover" />}
                              <span>{msg.senderName.split(' ')[0]}</span>
                            </div>
                            <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                              isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={(e) => handleSendChatSubmit(e, myTeam.id, true)} className="p-3 border-t bg-white dark:bg-zinc-950 dark:border-zinc-800 flex gap-1.5">
                      <input
                        type="text"
                        value={dmText}
                        onChange={(e) => setDmText(e.target.value)}
                        placeholder="Write a message to crew..."
                        className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 text-xs focus:outline-none"
                      />
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl shadow">
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                  {/* CROSS-TEAM COLLABORATION & MULTI-TEAM CHATROOMS */}
                  <div className="lg:col-span-12 pt-8 border-t border-gray-150 dark:border-zinc-850 mt-4 space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                        <Handshake className="h-5 w-5 text-indigo-650" />
                        <span>AI Inter-Team Collaboration Center</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Form connections & direct chat pipelines with other teams on campus to exchange feedback, resources, or prepare to merge.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Discover and Propose collaborations (Left 6 Columns) */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="p-5 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-3">
                          <h4 className="text-xs font-black uppercase text-indigo-650 tracking-wider">
                            1. Propose Partnerships
                          </h4>
                          
                          {teams.filter(t => t.id !== myTeam.id).length === 0 ? (
                            <p className="text-xs text-gray-400">No other formed teams found in this hackathon yet.</p>
                          ) : (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                              {teams.filter(t => t.id !== myTeam.id).map(ot => {
                                const activeInList = teamCollabs.find(c => 
                                  (c.proposingTeamId === myTeam.id && c.receivingTeamId === ot.id) ||
                                  (c.proposingTeamId === ot.id && c.receivingTeamId === myTeam.id)
                                );
                                
                                return (
                                  <div key={ot.id} className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-gray-150 dark:border-zinc-850 flex items-center justify-between text-xs">
                                    <div>
                                      <span className="font-extrabold text-slate-800 dark:text-zinc-200 block">{ot.name}</span>
                                      <span className="text-[10px] text-gray-450 dark:text-zinc-400 font-mono">Members: {ot.members.length}/{ot.maxSize} • Hackathon: {ot.hackathonTitle || 'SIH Catalog'}</span>
                                    </div>
                                    
                                    {!activeInList ? (
                                      <button
                                        onClick={() => handleSendCollabInvite(ot.id, ot.name)}
                                        className="bg-indigo-650 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                                      >
                                        Propose
                                      </button>
                                    ) : (
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 ${
                                        activeInList.status === 'accepted' ? 'bg-emerald-100/85 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-extrabold' :
                                        activeInList.status === 'declined' ? 'bg-red-100 text-red-650 dark:bg-red-950/20' : 'bg-amber-100/85 text-amber-700 dark:bg-amber-950/20 animate-pulse'
                                      }`}>
                                        {activeInList.status === 'accepted' ? 'Merged Chat ✓' :
                                         activeInList.status === 'declined' ? 'Declined' : 'Proposed'}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Received Collab Proposals Checklist */}
                        <div className="p-5 border border-purple-100 dark:border-zinc-800 bg-purple-50/20 dark:bg-zinc-950/15 rounded-2xl space-y-3">
                          <h4 className="text-xs font-black uppercase text-purple-650 dark:text-purple-400 tracking-wider flex items-center space-x-1">
                            <Sparkles className="h-3 w-3 mr-1 fill-purple-655/10" />
                            <span>Collaboration Inboxes Received</span>
                          </h4>
                          
                          {teamCollabs.filter(c => c.receivingTeamId === myTeam.id && c.status === 'pending').length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No incoming co-chat partnership proposals.</p>
                          ) : (
                            <div className="space-y-2">
                              {teamCollabs.filter(c => c.receivingTeamId === myTeam.id && c.status === 'pending').map(collab => (
                                <div key={collab.id} className="p-3 bg-white dark:bg-zinc-900 border border-purple-150 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs shadow-sm">
                                  <div>
                                    <span className="font-extrabold text-purple-950 dark:text-purple-300">Invite from "{collab.proposingTeamName}"</span>
                                    <span className="block text-[9px] text-gray-400">Received {new Date(collab.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex space-x-1.5 shrink-0">
                                    <button
                                      onClick={() => handleDeclineCollabInvite(collab)}
                                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-[10px] font-black px-2 py-1 rounded-lg cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => handleAcceptCollabInvite(collab)}
                                      className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-sm cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Live multi-team co-chat box (Right 6 Columns) */}
                      <div className="lg:col-span-6">
                        <div className="p-5 border border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-4 h-[350px] flex flex-col justify-between">
                          <div className="border-b dark:border-zinc-900 pb-2 flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-black uppercase text-indigo-650 dark:text-indigo-400 tracking-wider">
                                2. Cross-Team Live Chat Room
                              </h4>
                              <span className="text-[10px] text-gray-400 block mt-0.5">Dual-channel pipeline between approved teams</span>
                            </div>
                            
                            {/* Selected Collaboration Selection */}
                            {teamCollabs.filter(c => c.status === 'accepted').length > 0 && (
                              <select
                                value={selectedCollabId || ''}
                                onChange={(e) => setSelectedCollabId(e.target.value)}
                                className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-bold cursor-pointer text-slate-800 dark:text-zinc-200"
                              >
                                {teamCollabs.filter(c => c.status === 'accepted').map(c => {
                                  const label = c.proposingTeamId === myTeam.id ? c.receivingTeamName : c.proposingTeamName;
                                  return (
                                    <option key={c.id} value={c.id}>Chat with {label}</option>
                                  );
                                })}
                              </select>
                            )}
                          </div>

                          {/* Chat messages viewport */}
                          <div className="flex-1 overflow-y-auto space-y-2 p-1 text-xs">
                            {!selectedCollabId ? (
                              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                <Users className="h-8 w-8 text-gray-300 mb-2" />
                                <p className="text-gray-400 text-[11px]">No mutual team collaborations active yet.</p>
                                <p className="text-gray-400 text-[9px] mt-1">Propose or accept a partnership proposal to unlock the cross-team co-chat window!</p>
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {messages.filter(m => m.roomId === 'collab_' + selectedCollabId).length === 0 ? (
                                  <div className="text-center text-gray-400 text-[10px] italic py-8">
                                    Connecting secure pipe... No inter-team messages recorded. Start collaborating!
                                  </div>
                                ) : (
                                  messages.filter(m => m.roomId === 'collab_' + selectedCollabId).map(msg => {
                                    const isMe = msg.senderId === userProfile.uid;
                                    return (
                                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="text-[9px] text-gray-400 mb-0.5">
                                          {msg.senderName.split(' ')[0]}
                                        </div>
                                        <div className={`p-2.5 rounded-xl leading-relaxed max-w-[85%] ${
                                          isMe ? 'bg-indigo-655 text-white rounded-tr-none shadow-sm' : 'bg-slate-100 text-slate-800 dark:bg-zinc-900 dark:text-zinc-200 rounded-tl-none border dark:border-zinc-800'
                                        }`}>
                                          {msg.text}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>

                          {/* Input trigger form */}
                          <form onSubmit={handleSendCollabChat} className="flex gap-2 border-t dark:border-zinc-900 pt-2 mt-auto">
                            <input
                              type="text"
                              disabled={!selectedCollabId}
                              value={collabChatText}
                              onChange={(e) => setCollabChatText(e.target.value)}
                              placeholder={selectedCollabId ? "Write a cross-team message..." : "Unlock collaboration to chat!"}
                              className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-655"
                            />
                            <button
                              type="submit"
                              disabled={!selectedCollabId}
                              className="bg-indigo-650 hover:bg-indigo-550 text-white p-2.5 rounded-xl disabled:bg-gray-150 dark:disabled:bg-zinc-900 cursor-pointer flex items-center justify-center shrink-0"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* DIRECT MESSAGING CHAT CENTER */}
          {activeTab === 'dm' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white pb-3 border-b border-gray-100 dark:border-zinc-850">
                Direct Messenger Contacts
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[480px]">
                
                {/* ACTIVE PEER CONTACTS (LEFT 4 COLUMNS) */}
                <div className="lg:col-span-4 border border-gray-150 dark:border-zinc-850 rounded-2xl overflow-hidden divide-y divide-gray-105 bg-gray-50/50">
                  <div className="p-3 bg-white dark:bg-zinc-950">
                    <span className="block text-[10px] uppercase text-gray-405 font-black tracking-widest pl-1">Inbox channels</span>
                  </div>
                  {[
                    { uid: 'stud3', name: 'Vikram Seth', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', role: 'AI/ML Engineer' },
                    { uid: 'stud1', name: 'Hari Balakrishnan', photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', role: 'Full Stack Dev' },
                    { uid: 'stud2', name: 'Ananya Rao', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', role: 'UI/UX Designer' }
                  ]
                  .filter(p => p.uid !== userProfile.uid)
                  .map(peer => {
                    const isSelected = selectedDmRoom === peer.uid;
                    return (
                      <div
                        key={peer.uid}
                        onClick={() => setSelectedDmRoom(peer.uid)}
                        className={`p-3 cursor-pointer flex items-center space-x-3 transition ${
                          isSelected ? 'bg-indigo-50/50 border-l-4 border-indigo-600 dark:bg-indigo-950/20' : 'hover:bg-gray-100/50'
                        }`}
                      >
                        <img src={peer.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-xs">{peer.name}</h4>
                          <span className="text-[10px] text-gray-500 block truncate">{peer.role}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ACTIVE CONVERSATION MESSAGES BUBBLES (RIGHT 8 COLUMNS) */}
                <div className="lg:col-span-8 flex flex-col h-full border border-gray-150 dark:border-zinc-800 rounded-2xl overflow-hidden bg-slate-50/20">
                  {selectedDmRoom ? (
                    <>
                      <div className="bg-white border-b border-gray-150 p-4 dark:bg-zinc-950 dark:border-zinc-850 flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-xs sm:text-sm">Peer Conversation</span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages
                          .filter(m => m.roomId === getDmKey(selectedDmRoom))
                          .map(msg => {
                            const isMe = msg.senderId === userProfile.uid;
                            return (
                              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                                  isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border text-gray-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 rounded-tl-none'
                                }`}>
                                  {msg.text}
                                </div>
                              </div>
                            );
                          })}
                        {typingState && (
                          <div className="flex items-center space-x-1.5 p-2 bg-gray-100 rounded-full text-zinc-500 dark:bg-zinc-900 text-[10px] max-w-[120px] justify-center animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin text-indigo-505" />
                            <span>Teammate typing...</span>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <form onSubmit={(e) => handleSendChatSubmit(e, getDmKey(selectedDmRoom), true)} className="p-3 border-t bg-white dark:bg-zinc-950 dark:border-zinc-800 flex gap-1.5">
                        <input
                          type="text"
                          value={dmText}
                          onChange={(e) => setDmText(e.target.value)}
                          placeholder="Type an instant message..."
                          className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow text-xs font-bold font-sans">
                          Send
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400">
                      <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-xs">Select any peer channel to start messaging immediately.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
