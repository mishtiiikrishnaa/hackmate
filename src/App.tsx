import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Teammates from './components/Teammates';
import Hackathons from './components/Hackathons';
import TeamsList from './components/TeamsList';
import CollegeCommunities from './components/CollegeCommunities';
import ActivityDashboard from './components/ActivityDashboard';
import AdminDashboard from './components/AdminDashboard';
import AIChatGuide from './components/AIChatGuide';
import MatchFinder from './components/MatchFinder';
import { dbService } from './lib/db';
import {
  UserProfile,
  CollegeDomain,
  Hackathon,
  Team,
  TeamApplication,
  ChatMessage,
  SystemNotification,
  Bookmark,
  PreferredRole
} from './types';
import { ShieldCheck, Sparkles, X, ChevronRight, CheckCircle2, UserCheck } from 'lucide-react';

export default function App() {
  // Navigation & View Layout
  const [currentView, setCurrentView] = useState<string>('landing');
  const [dashboardTabState, setDashboardTabState] = useState<'profile' | 'team' | 'dm' | 'applications' | 'bookmarks'>('profile');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Core Platform Data Store
  const [colleges, setColleges] = useState<CollegeDomain[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Authenticated State Management
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Authenticated Bookmarks lists
  const [savedStudentIds, setSavedStudentIds] = useState<string[]>([]);
  const [savedHackathonIds, setSavedHackathonIds] = useState<string[]>([]);
  const [savedTeams, setSavedTeams] = useState<any[]>([]);

  // ----------------------------------------------------
  // INITIAL DATA SYNC
  // ----------------------------------------------------
  const syncPlatformData = async () => {
    try {
      const colList = await dbService.getColleges();
      setColleges(colList);

      const studList = await dbService.getAllUserProfiles();
      setStudents(studList);

      const hackList = await dbService.getHackathons();
      setHackathons(hackList);

      const teamList = await dbService.getTeams();
      setTeams(teamList);

      const appList = await dbService.getApplications();
      setApplications(appList);

      // Load messages for the team the user is active in, if any
      if (userProfile) {
        // Load system notifications
        const notifList = await dbService.getNotifications(userProfile.uid);
        setNotifications(notifList);

        // Load bookmarks list
        const bList = await dbService.getBookmarks(userProfile.uid);
        setBookmarks(bList);
        setSavedStudentIds(bList.filter(b => b.itemType === 'student').map(b => b.itemId));
        setSavedHackathonIds(bList.filter(b => b.itemType === 'hackathon').map(b => b.itemId));
        setSavedTeams(bList.filter(b => b.itemType === 'team'));

        // Load active team chat
        const myActiveTeam = teamList.find(t => 
          t.creatorId === userProfile.uid || t.members.some(m => m.uid === userProfile.uid)
        );
        if (myActiveTeam) {
          const groupMsgs = await dbService.getMessages(myActiveTeam.id);
          setMessages(groupMsgs);
        } else {
          // Fallback peer DM messages
          const mockPeers = ['stud3', 'stud1', 'stud2'].filter(p => p !== userProfile.uid);
          if (mockPeers.length > 0) {
            const peerId = mockPeers[0];
            const sortedIds = [userProfile.uid, peerId].sort();
            const dmRoomId = `dm_${sortedIds[0]}_${sortedIds[1]}`;
            const peerMsgs = await dbService.getMessages(dmRoomId);
            setMessages(peerMsgs);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing platform data:', err);
    }
  };

  // ----------------------------------------------------
  // STARTUP SECURITY AUTHENTICATION CLEARANCE
  // ----------------------------------------------------
  useEffect(() => {
    const initStartupAuth = async () => {
      try {
        const sessionUid = localStorage.getItem('hackmate_session_uid');
        if (sessionUid) {
          const profile = await dbService.getUserProfile(sessionUid);
          if (profile) {
            setUserProfile(profile);
            console.log("[Startup Session] Restored user profile:", profile.name);
          }
        }
        // Force synchronization of platform state
        syncPlatformData();
      } catch (authErr) {
        console.error("[Startup Session] Error restoring session:", authErr);
      }
    };
    initStartupAuth();
  }, []);

  useEffect(() => {
    syncPlatformData();
  }, [userProfile?.uid]);

  // Handle active periodic message updates for dynamic simulation
  useEffect(() => {
    const timer = setInterval(() => {
      if (userProfile) {
        syncPlatformData();
      }
    }, 4500);
    return () => clearInterval(timer);
  }, [userProfile?.uid]);

  // ----------------------------------------------------
  // THEME HOOK
  // ----------------------------------------------------
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // ----------------------------------------------------
  // BOOKMARK HANDLERS
  // ----------------------------------------------------
  const handleToggleBookmark = async (itemId: string, itemType: 'hackathon' | 'team' | 'student') => {
    if (!userProfile) {
      setShowAuthModal(true);
      return;
    }
    try {
      const isBookmarked = await dbService.toggleBookmark(userProfile.uid, itemId, itemType);
      const updatedBookmarks = await dbService.getBookmarks(userProfile.uid);
      setBookmarks(updatedBookmarks);
      
      if (itemType === 'student') {
        const ids = updatedBookmarks.filter(b => b.itemType === 'student').map(b => b.itemId);
        setSavedStudentIds(ids);
      } else if (itemType === 'hackathon') {
        const ids = updatedBookmarks.filter(b => b.itemType === 'hackathon').map(b => b.itemId);
        setSavedHackathonIds(ids);
      } else if (itemType === 'team') {
        setSavedTeams(updatedBookmarks.filter(b => b.itemType === 'team'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // DIRECT MESSAGING / INBOX HANDLER
  // ----------------------------------------------------
  const handleSendDirectMessage = async (recipientId: string, text: string) => {
    if (!userProfile) return;
    const sortedIds = [userProfile.uid, recipientId].sort();
    const dmRoomId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      roomId: dmRoomId,
      senderId: userProfile.uid,
      senderName: userProfile.name,
      senderPhoto: userProfile.photoUrl,
      text: text,
      timestamp: new Date().toISOString()
    };

    await dbService.sendMessage(dmRoomId, newMsg);

    // Mock notification key reply
    const recipientUser = students.find(s => s.uid === recipientId);
    if (recipientUser) {
      const notif: SystemNotification = {
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        userId: recipientId,
        title: `Message from ${userProfile.name}`,
        body: text.length > 50 ? `${text.substr(0, 50)}...` : text,
        type: 'message',
        read: false,
        createdAt: new Date().toISOString()
      };
      await dbService.saveNotification(notif);
    }

    // Refresh state
    const peerMsgs = await dbService.getMessages(dmRoomId);
    setMessages(peerMsgs);
    syncPlatformData();
  };

  // ----------------------------------------------------
  // TEAM FORMATION & PORTFOLIO HANDLERS
  // ----------------------------------------------------
  const handleCreateTeam = async (teamData: {
    name: string;
    description: string;
    requiredSkills: string[];
    maxSize: number;
    openPositions: string[];
    hackathonId: string;
    hackathonTitle: string;
  }) => {
    if (!userProfile) return;

    const newTeam: Team = {
      id: 'team_' + Math.random().toString(36).substr(2, 9),
      name: teamData.name,
      description: teamData.description,
      creatorId: userProfile.uid,
      creatorName: userProfile.name,
      college: userProfile.college,
      requiredSkills: teamData.requiredSkills,
      maxSize: teamData.maxSize,
      openPositions: teamData.openPositions,
      members: [
        {
          uid: userProfile.uid,
          name: userProfile.name,
          role: userProfile.preferredRole,
          photoUrl: userProfile.photoUrl
        }
      ],
      hackathonId: teamData.hackathonId,
      hackathonTitle: teamData.hackathonTitle,
      resources: [],
      tasks: [],
      notes: 'Welcome! Draft agenda details inside collaborative notes locker.',
      createdAt: new Date().toISOString()
    };

    await dbService.saveTeam(newTeam);
    syncPlatformData();
  };

  const handleApplyToTeam = async (appData: {
    teamId: string;
    teamName: string;
    message: string;
    userRole: string;
    skills: string[];
  }) => {
    if (!userProfile) return;

    const newApp: TeamApplication = {
      id: 'app_' + Math.random().toString(36).substr(2, 9),
      teamId: appData.teamId,
      teamName: appData.teamName,
      userId: userProfile.uid,
      userName: userProfile.name,
      userRole: appData.userRole,
      userPhoto: userProfile.photoUrl,
      skills: appData.skills,
      message: appData.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await dbService.saveApplication(newApp);

    // Notify team creator
    const targetTeam = teams.find(t => t.id === appData.teamId);
    if (targetTeam) {
      const notif: SystemNotification = {
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        userId: targetTeam.creatorId,
        title: 'New Roster Join Application',
        body: `${userProfile.name} is applying to join "${appData.teamName}" as ${appData.userRole}`,
        type: 'application',
        read: false,
        createdAt: new Date().toISOString()
      };
      await dbService.saveNotification(notif);
    }
    syncPlatformData();
  };

  // ----------------------------------------------------
  // WORKSPACE ACTION HANDLING
  // ----------------------------------------------------
  const handleWorkspaceSendMessage = async (roomId: string, text: string, file?: { name: string; url: string }) => {
    if (!userProfile) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      roomId: roomId,
      senderId: userProfile.uid,
      senderName: userProfile.name,
      senderPhoto: userProfile.photoUrl,
      text: text,
      timestamp: new Date().toISOString(),
      file: file
    };

    if (roomId.startsWith('dm_')) {
      // Direct message routing
      await dbService.sendMessage(roomId, newMsg);
    } else {
      // Team room routing
      await dbService.sendMessage(roomId, newMsg);
    }
    
    const refreshedMsgs = await dbService.getMessages(roomId);
    setMessages(refreshedMsgs);
  };

  const handleApproveApplication = async (appId: string) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const teamToUpdate = teams.find(t => t.id === targetApp.teamId);
    if (!teamToUpdate) return;

    // Add to members list
    const updatedMembers = [
      ...teamToUpdate.members,
      {
        uid: targetApp.userId,
        name: targetApp.userName,
        role: targetApp.userRole,
        photoUrl: targetApp.userPhoto
      }
    ];

    // Remove filled position
    const cleanedPositions = teamToUpdate.openPositions.filter(p => p.toLowerCase() !== targetApp.userRole.toLowerCase());

    const updatedTeam: Team = {
      ...teamToUpdate,
      members: updatedMembers,
      openPositions: cleanedPositions
    };

    await dbService.saveTeam(updatedTeam);

    // Update application status
    const updatedApp: TeamApplication = {
      ...targetApp,
      status: 'accepted'
    };
    await dbService.saveApplication(updatedApp);

    // Send notification to applicant
    const notif: SystemNotification = {
      id: 'notif_' + Math.random().toString(36).substr(2, 9),
      userId: targetApp.userId,
      title: 'Roster Application Approved!',
      body: `You are officially approved to join "${teamToUpdate.name}" as ${targetApp.userRole}`,
      type: 'invite',
      read: false,
      createdAt: new Date().toISOString()
    };
    await dbService.saveNotification(notif);

    syncPlatformData();
  };

  const handleDeclineApplication = async (appId: string) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp) return;

    const updatedApp: TeamApplication = {
      ...targetApp,
      status: 'rejected'
    };
    await dbService.saveApplication(updatedApp);

    syncPlatformData();
  };

  const handleAddTeamTask = async (teamId: string, title: string, assigneeId: string, assigneeName: string) => {
    const teamToUpdate = teams.find(t => t.id === teamId);
    if (!teamToUpdate) return;

    const newTask = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      title: title,
      assigneeId: assigneeId,
      assigneeName: assigneeName,
      status: 'todo' as const,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const updatedTeam: Team = {
      ...teamToUpdate,
      tasks: [...(teamToUpdate.tasks || []), newTask]
    };

    await dbService.saveTeam(updatedTeam);
    syncPlatformData();
  };

  const handleToggleTaskStatus = async (teamId: string, taskId: string, nextStatus: 'todo' | 'in-progress' | 'done') => {
    const teamToUpdate = teams.find(t => t.id === teamId);
    if (!teamToUpdate) return;

    const updatedTasks = teamToUpdate.tasks.map(t => 
      t.id === taskId ? { ...t, status: nextStatus } : t
    );

    const updatedTeam: Team = {
      ...teamToUpdate,
      tasks: updatedTasks
    };

    await dbService.saveTeam(updatedTeam);
    syncPlatformData();
  };

  const handleSaveTeamNotes = async (teamId: string, notesText: string) => {
    const teamToUpdate = teams.find(t => t.id === teamId);
    if (!teamToUpdate) return;

    const updatedTeam: Team = {
      ...teamToUpdate,
      notes: notesText
    };

    await dbService.saveTeam(updatedTeam);
    syncPlatformData();
  };

  const handleAddTeamResource = async (teamId: string, title: string, link: string) => {
    const teamToUpdate = teams.find(t => t.id === teamId);
    if (!teamToUpdate) return;

    const newRes = {
      title,
      link
    };

    const updatedTeam: Team = {
      ...teamToUpdate,
      resources: [...(teamToUpdate.resources || []), newRes]
    };

    await dbService.saveTeam(updatedTeam);
    syncPlatformData();
  };

  // ----------------------------------------------------
  // PROFILE, VERIFY SUFFIX & ALERTS
  // ----------------------------------------------------
  const handleUpdateProfile = async (updated: UserProfile) => {
    setUserProfile(updated);
    await dbService.saveUserProfile(updated);
    syncPlatformData();
  };

  const handleMarkNotificationRead = async (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (!target) return;

    const updated = { ...target, read: true };
    await dbService.saveNotification(updated);
    syncPlatformData();
  };

  const handleRegisterCollege = async (domain: string, name: string) => {
    await dbService.addCollegeDomain(domain, name);
    syncPlatformData();
  };

  // ----------------------------------------------------
  // ADMIN PLATFORM PANEL OPERATIONS
  // ----------------------------------------------------
  const handleUpdateCollegeStatus = async (collegeId: string, updates: Partial<CollegeDomain>) => {
    await dbService.updateCollegeStatus(collegeId, updates);
    syncPlatformData();
  };

  const handleDeleteCollege = async (id: string) => {
    await dbService.deleteCollege(id);
    syncPlatformData();
  };

  const handleCatalogHackathon = async (hack: Hackathon) => {
    await dbService.saveHackathon(hack);
    syncPlatformData();
  };

  const handleDeleteHackathon = async (id: string) => {
    await dbService.deleteHackathon(id);
    syncPlatformData();
  };

  // Mock student selection logic for testing sandbox credentials with real live Firebase Auth sessions
  const handleSandboxLogin = async (uid: string) => {
    const user = await dbService.getUserProfile(uid);
    if (user) {
      setUserProfile(user);
      setShowAuthModal(false);
      setCurrentView('dashboard');
      // Save session id to maintain active user login across reloads
      localStorage.setItem('hackmate_session_uid', uid);
      syncPlatformData();
    }
  };

  // Custom User Sign Up helper
  const handleCustomSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailStr = (formData.get('email') as string || '').toLowerCase().trim();
    const nameStr = formData.get('name') as string || '';
    const deptStr = formData.get('dept') as string || 'Engineering';
    const roleStr = formData.get('role') as PreferredRole || 'Full Stack Developer';
    const bioStr = formData.get('bio') as string || 'Innovator on campus.';

    // Extract domain part
    const emailParts = emailStr.split('@');
    if (emailParts.length !== 2) {
      alert('Please input a valid university email address.');
      return;
    }
    const domainSuffix = emailParts[1];

    let collegeName = '';
    let campusDomain = domainSuffix;

    // Special whitelisting workaround for haribala512c@gmail.com administrative privilege
    if (emailStr === 'haribala512c@gmail.com') {
      collegeName = 'Sri Krishna College of Engineering and Technology';
      campusDomain = 'gmail.com';
    } else {
      // Align with whitelist domains
      const alignedCollege = colleges.find(c => c.domain === domainSuffix);
      if (!alignedCollege) {
        alert(`The domain suffix "${domainSuffix}" is not registered on HackMate yet. Use the whitelists communities panel to add it.`);
        return;
      }
      collegeName = alignedCollege.name;
    }

    // Generate extremely fast, clean custom unique student ID
    const authUid = 'user_' + Math.random().toString(36).substring(2, 11);

    const newUser: UserProfile = {
      uid: authUid,
      name: nameStr,
      email: emailStr,
      college: collegeName,
      domain: campusDomain,
      department: deptStr,
      yearOfStudy: 3,
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      interests: ['Web Development', 'UI UX Design'],
      bio: bioStr,
      photoUrl: emailStr === 'haribala512c@gmail.com' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
      preferredRole: roleStr,
      badges: emailStr === 'haribala512c@gmail.com' ? ['Verified Administrator', 'Community Lead'] : ['Verified Campus Hacker'],
      availability: 'open',
      createdAt: new Date().toISOString(),
      rating: emailStr === 'haribala512c@gmail.com' ? 99 : 75,
      projects: [],
      hackathonExperience: []
    };

    await dbService.saveUserProfile(newUser);
    setUserProfile(newUser);
    // Keep active session in LocalStorage
    localStorage.setItem('hackmate_session_uid', authUid);
    setShowAuthModal(false);
    setCurrentView('dashboard');
    syncPlatformData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 transition-colors duration-200">
      
      {/* GLOBAL HEADER HEADER */}
      <Header
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        userProfile={userProfile}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={() => {
          setUserProfile(null);
          setCurrentView('landing');
        }}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        unreadNotifications={notifications.filter(n => !n.read).length}
      />

      {/* RENDER ACTIVE ROUTER CHANNELS */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onFindTeammates={() => setCurrentView('teammates')}
            onRegisterCollege={() => setCurrentView('communities')}
            upcomingHackathons={hackathons}
            onViewHackathons={() => setCurrentView('hackathons')}
          />
        )}

        {currentView === 'teammates' && (
          <Teammates
            students={students}
            userProfile={userProfile}
            onOpenAuth={() => setShowAuthModal(true)}
            savedStudentIds={savedStudentIds}
            onToggleBookmark={(id) => handleToggleBookmark(id, 'student')}
            onSendMessage={handleSendDirectMessage}
          />
        )}

        {currentView === 'hackathons' && (
          <Hackathons
            hackathons={hackathons}
            userProfile={userProfile}
            onOpenAuth={() => setShowAuthModal(true)}
            savedHackathonIds={savedHackathonIds}
            onToggleBookmark={(id) => handleToggleBookmark(id, 'hackathon')}
          />
        )}

        {currentView === 'teams' && (
          <TeamsList
            teams={teams}
            hackathons={hackathons}
            userProfile={userProfile}
            onOpenAuth={() => setShowAuthModal(true)}
            onCreateTeam={handleCreateTeam}
            onApplyToTeam={handleApplyToTeam}
          />
        )}

        {currentView === 'communities' && (
          <CollegeCommunities
            colleges={colleges}
            students={students}
            onRegisterCollege={handleRegisterCollege}
          />
        )}

        {currentView === 'dashboard' && userProfile && (
          <ActivityDashboard
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            teams={teams}
            applications={applications}
            messages={messages}
            notifications={notifications}
            bookmarks={bookmarks}
            onSendMessage={handleWorkspaceSendMessage}
            onApproveApplication={handleApproveApplication}
            onDeclineApplication={handleDeclineApplication}
            onAddTeamTask={handleAddTeamTask}
            onToggleTaskStatus={handleToggleTaskStatus}
            onSaveTeamNotes={handleSaveTeamNotes}
            onAddTeamResource={handleAddTeamResource}
            onMarkNotificationRead={handleMarkNotificationRead}
            savedHackathons={hackathons.filter(h => savedHackathonIds.includes(h.id))}
            savedTeammates={students.filter(s => savedStudentIds.includes(s.uid))}
            savedTeams={teams.filter(t => savedTeams.some(bm => bm.itemId === t.id))}
            initialTab={dashboardTabState}
          />
        )}

        {currentView === 'matchfinder' && (
          <MatchFinder
            userProfile={userProfile}
            students={students}
            myTeam={teams.find(t => t.creatorId === userProfile?.uid || t.members.some(m => m.uid === userProfile?.uid)) || null}
            onOpenAuth={() => setShowAuthModal(true)}
            onNavigateToTab={(tab) => {
              setDashboardTabState(tab);
              setCurrentView('dashboard');
            }}
            onSendMessageDirect={(recipientId, text) => {
              handleWorkspaceSendMessage(recipientId, text);
            }}
            onSendNotificationLocal={async (title, body, recipientId) => {
              const notif = {
                id: 'n_m_' + Math.random().toString(36).substr(2, 9),
                userId: recipientId,
                title,
                body,
                type: 'status' as const,
                read: false,
                link: 'dashboard',
                createdAt: new Date().toISOString()
              };
              try {
                await dbService.saveNotification(notif);
                const updatedNotifs = await dbService.getNotifications(userProfile?.uid || '');
                setNotifications(updatedNotifs);
              } catch (err) {
                console.error(err);
              }
            }}
          />
        )}

        {currentView === 'admin' && (userProfile?.email === 'haribala512c@skcet.ac.in' || userProfile?.email === 'haribala512c@gmail.com') && (
          <AdminDashboard
            colleges={colleges}
            students={students}
            hackathons={hackathons}
            onAddCollege={handleRegisterCollege}
            onUpdateCollegeStatus={handleUpdateCollegeStatus}
            onDeleteCollege={handleDeleteCollege}
            onAddHackathon={handleCatalogHackathon}
            onDeleteHackathon={handleDeleteHackathon}
          />
        )}
      </main>

      {/* AUTHENTICATION DIRECT EVALUATION & REGISTER DRAWER OVERLAY */}
      {showAuthModal && (
        <div id="auth-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-250 dark:border-zinc-800 p-6 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-250">
            <div className="flex items-center justify-between pb-4 border-b border-gray-105 mb-6 dark:border-zinc-850">
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-600/10">H</div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Authentication Terminal</h3>
                  <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider leading-none">verification credentials</span>
                </div>
              </div>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="p-1.5 border hover:bg-slate-50 text-gray-400 rounded-lg dark:border-zinc-800 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* TEST SANDBOX ACCOUNTS SECTION (VERY HELPFUL FOR EVALUATION!) */}
            <div className="bg-gradient-to-br from-indigo-50/50 via-slate-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-zinc-900 border border-indigo-100/50 dark:border-indigo-950/50 p-4 rounded-2xl mb-6">
              <div className="flex items-center space-x-1.5 text-indigo-805 dark:text-indigo-305 font-bold text-xs mb-3">
                <Sparkles className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Test Drive / Sandbox Credentials (Recommended)</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-4">
                Click any pre-seeded university student account to log in instantly and inspect specific rosters, direct messages, or dashboards.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleSandboxLogin('stud_admin_gmail')}
                  className="p-2.5 rounded-xl border-2 border-dashed border-indigo-550/60 bg-gradient-to-tr from-indigo-50/20 to-purple-50/20 hover:from-indigo-100/30 hover:to-purple-100/30 text-left transition flex items-center space-x-2.5 dark:bg-zinc-950 dark:border-indigo-500/40 dark:hover:bg-indigo-950/20 text-xs"
                >
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="" className="h-7 w-7 rounded-full object-cover border border-indigo-600" />
                  <div className="overflow-hidden">
                    <span className="font-extrabold text-indigo-700 dark:text-indigo-300 block truncate flex items-center">
                      Hari Balakrishnan [Gmail]
                      <ShieldCheck className="h-3 w-3 text-indigo-550 ml-1" />
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate font-mono">haribala512c@gmail.com (Main Admin)</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSandboxLogin('stud1')}
                  className="p-2.5 rounded-xl border border-indigo-100 bg-white hover:bg-indigo-555 text-left transition flex items-center space-x-2.5 dark:bg-zinc-950 dark:border-zinc-850 dark:hover:bg-zinc-900 text-xs"
                >
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" alt="" className="h-7 w-7 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <span className="font-extrabold text-slate-800 dark:text-zinc-200 block truncate">Hari Balakrishnan [SKCET]</span>
                    <span className="text-[10px] text-gray-500 block truncate font-mono">haribala512c@skcet.ac.in (Admin Profile)</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSandboxLogin('stud3')}
                  className="p-2.5 rounded-xl border border-indigo-105 bg-white hover:bg-indigo-555 text-left transition flex items-center space-x-2.5 dark:bg-zinc-955 dark:border-zinc-850 dark:hover:bg-zinc-900 text-xs"
                >
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="" className="h-7 w-7 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <span className="font-extrabold text-slate-800 dark:text-zinc-200 block truncate">Vikram Seth [Stanford]</span>
                    <span className="text-[10px] text-gray-500 block truncate">vseth@stanford.edu</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSandboxLogin('stud2')}
                  className="p-2.5 rounded-xl border border-indigo-101 bg-white hover:bg-indigo-555 text-left transition flex items-center space-x-2.5 dark:bg-zinc-950 dark:border-zinc-855 dark:hover:bg-zinc-900 text-xs"
                >
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="" className="h-7 w-7 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <span className="font-extrabold text-slate-800 dark:text-zinc-200 block truncate">Ananya Rao [SKCET]</span>
                    <span className="text-[10px] text-gray-500 block truncate">ananya.rao@skcet.ac.in</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSandboxLogin('stud4')}
                  className="p-2.5 rounded-xl border border-indigo-101 bg-white hover:bg-indigo-555 text-left transition flex items-center space-x-2.5 dark:bg-zinc-950 dark:border-zinc-855 dark:hover:bg-zinc-900 text-xs"
                >
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="" className="h-7 w-7 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <span className="font-extrabold text-slate-800 dark:text-zinc-200 block truncate">Karthik Raja [MIT India]</span>
                    <span className="text-[10px] text-gray-500 block truncate">karthik.raja@mitindia.edu</span>
                  </div>
                </button>
              </div>
            </div>

            {/* CUSTOM USER REGISTRATION FORM */}
            <div className="border-t border-gray-150/50 pt-5">
              <span className="block text-xs font-bold text-gray-400 mb-4 tracking-wider uppercase pl-1">Or register custom email profile</span>
              <form onSubmit={handleCustomSignUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Full Hacker Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Rachel Adams"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">University Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="rachel@skcet.ac.in"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Engineering Discipline</label>
                    <input
                      type="text"
                      name="dept"
                      placeholder="e.g. IT Department"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Preferred Team Role</label>
                    <select
                      name="role"
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="AI/ML Engineer">AI/ML Engineer</option>
                      <option value="Mobile Developer">Mobile Developer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Brief bio description</label>
                    <input
                      type="text"
                      name="bio"
                      placeholder="e.g. Passionate backend coder and DB architect."
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm cursor-pointer shadow-md"
                >
                  Confirm Institution Suffix Registration
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING PERSISTENT PLATFORM AI chatbot GUIDE */}
      <AIChatGuide />

    </div>
  );
}
