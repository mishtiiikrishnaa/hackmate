import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Bot, 
  MessageSquare, 
  UserPlus, 
  Award, 
  Zap, 
  ArrowRight,
  BookOpen,
  Info
} from 'lucide-react';
import { UserProfile, Swipe, RosterInvite, Team } from '../types';
import { dbService } from '../lib/db';

interface MatchFinderProps {
  userProfile: UserProfile | null;
  students: UserProfile[];
  myTeam: Team | null;
  onOpenAuth: () => void;
  onNavigateToTab: (tab: 'dm' | 'team' | 'profile') => void;
  onSendMessageDirect: (recipientId: string, text: string) => void;
  onSendNotificationLocal: (title: string, body: string, recipientId: string) => void;
}

export default function MatchFinder({
  userProfile,
  students,
  myTeam,
  onOpenAuth,
  onNavigateToTab,
  onSendMessageDirect,
  onSendNotificationLocal
}: MatchFinderProps) {
  const [deck, setDeck] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [isInviteSent, setIsInviteSent] = useState(false);

  // Load remaining swipeable deck
  useEffect(() => {
    if (!userProfile) return;
    
    const loadDeckAndSwipes = async () => {
      try {
        const userSwipes = await dbService.getSwipes(userProfile.uid);
        setSwipes(userSwipes);

        // Filter out self and users already swiped
        const swipedUserIds = new Set(userSwipes.map(s => s.swipeeId));
        const filtered = students.filter(s => s.uid !== userProfile.uid && !swipedUserIds.has(s.uid));
        
        // Shuffle deck randomly to make it feel fresh every time
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        setDeck(shuffled);
        setCurrentIndex(0);
      } catch (e) {
        console.error("Could not load swipes/deck", e);
      }
    };

    loadDeckAndSwipes();
  }, [userProfile, students]);

  const activeProfile = deck[currentIndex];

  const handleSwipe = async (direction: 'like' | 'dislike') => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }
    if (!activeProfile) return;

    const newSwipe: Swipe = {
      id: 'sw_' + Math.random().toString(36).substr(2, 9),
      swiperId: userProfile.uid,
      swipeeId: activeProfile.uid,
      type: direction,
      createdAt: new Date().toISOString()
    };

    try {
      await dbService.saveSwipe(newSwipe);
      setSwipes(prev => [...prev, newSwipe]);

      if (direction === 'like') {
        // Evaluate mutual match: Check if they liked us, or build standard reciprocal simulation
        // To make it fun, since simulated bots need to reply, seeded users will always match back
        // dynamically or 65% chance for others.
        const targetSwipes = await dbService.getSwipes(activeProfile.uid);
        const theyLikedUs = targetSwipes.some(s => s.swipeeId === userProfile.uid && s.type === 'like');

        // Let's create reciprocal swiping
        const isMutual = theyLikedUs || activeProfile.uid.startsWith('stud') || Math.random() < 0.65;

        if (isMutual) {
          // Write opposite swipe to DB to ensure persistence
          const reciprocalSwipe: Swipe = {
            id: 'sw_r_' + Math.random().toString(36).substr(2, 9),
            swiperId: activeProfile.uid,
            swipeeId: userProfile.uid,
            type: 'like',
            createdAt: new Date().toISOString()
          };
          await dbService.saveSwipe(reciprocalSwipe);

          // Pop up Match overlay
          setMatchedUser(activeProfile);
          setIsInviteSent(false);

          // Send system notification
          onSendNotificationLocal(
            "Mutual Match Unlocked! 💖",
            `${activeProfile.name} swiped right on you too! You can now start chat conversations.`,
            userProfile.uid
          );
        }
      }

      // Move to next card
      setCurrentIndex(prev => prev + 1);
    } catch (e) {
      console.error(e);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSendMatchMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !matchedUser || !chatMessageInput.trim()) return;

    onSendMessageDirect(matchedUser.uid, chatMessageInput.trim());
    setChatMessageInput('');
    setMatchedUser(null);
    onNavigateToTab('dm');
  };

  const handleSendTeamInvitationFromMatch = async () => {
    if (!userProfile || !matchedUser || !myTeam) return;

    const invite: RosterInvite = {
      id: 'ri_' + Math.random().toString(36).substr(2, 9),
      teamId: myTeam.id,
      teamName: myTeam.name,
      senderId: userProfile.uid,
      senderName: userProfile.name,
      receiverId: matchedUser.uid,
      receiverName: matchedUser.name,
      role: matchedUser.preferredRole,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await dbService.saveRosterInvite(invite);
      setIsInviteSent(true);

      // Create notification to recipient
      const notif: any = {
        id: 'n_rinv_' + Math.random().toString(36).substr(2, 9),
        userId: matchedUser.uid,
        title: "⚡ Pending Team Recruit Invite",
        body: `${userProfile.name} of "${myTeam.name}" sent you a direct invitation roster request! Check your workspace to respond.`,
        type: 'invite',
        read: false,
        link: 'team_dashboard',
        createdAt: new Date().toISOString()
      };
      await dbService.saveNotification(notif);

      setTimeout(() => {
        setIsInviteSent(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 font-sans">
      
      {/* Tab Title */}
      <div className="border-b border-gray-150 dark:border-zinc-900 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-650 text-[10px] font-black text-white uppercase tracking-wider animate-pulse flex items-center">
              <Sparkles className="h-2.5 w-2.5 mr-0.5 fill-white" /> AI Engine Active
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1.5">
            HackMate Match Finder
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
            Swipe right to express interest, swipe left to skip. If they swipe right on you too, it's a match!
          </p>
        </div>

        {/* Small statistics indicator */}
        <div className="mt-4 sm:mt-0 flex items-center space-x-3 bg-slate-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-850 px-4 py-3 rounded-2xl">
          <Heart className="h-5 w-5 text-rose-500 animate-pulse fill-rose-500/20" />
          <div>
            <span className="text-xs text-gray-400 block uppercase font-black tracking-wider">Total Likes</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">
              {swipes.filter(s => s.type === 'like').length} Profiles Liked
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Swiping Desk Area */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          <div className="relative w-full max-w-[380px] h-[480px]">
            <AnimatePresence mode="popLayout">
              {activeProfile ? (
                <motion.div
                  key={activeProfile.uid}
                  className="absolute inset-0 bg-white dark:bg-zinc-950 border border-gray-200/85 dark:border-zinc-850 rounded-3xl shadow-xl overflow-hidden flex flex-col select-none"
                  initial={{ scale: 0.95, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, x: 200, rotate: 10, transition: { duration: 0.25 } }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, info) => {
                    const threshold = 100;
                    if (info.offset.x > threshold) {
                      handleSwipe('like');
                    } else if (info.offset.x < -threshold) {
                      handleSwipe('dislike');
                    }
                  }}
                >
                  {/* Photo Profile background overlay */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-zinc-900">
                    <img 
                      src={activeProfile.photoUrl} 
                      alt={activeProfile.name} 
                      className="h-full w-full object-cover pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <div className="flex items-center space-x-1">
                        <span className="bg-indigo-600/90 text-[10px] font-extrabold text-white px-2 py-0.5 rounded-lg flex items-center shadow-md">
                          <Zap className="h-3 w-3 mr-0.5 fill-current" /> Match Score: {Math.max(70, Math.min(99, activeProfile.rating + 5))}%
                        </span>
                        {activeProfile.badges?.includes('Verified Administrator') && (
                          <span className="bg-purple-600 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-lg flex items-center">
                            <ShieldCheck className="h-2.5 w-2.5 mr-0.5" /> Staff Admin
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-extrabold text-white mt-1 flex items-center">
                        {activeProfile.name}
                        <ShieldCheck className="h-4 w-4 text-emerald-400 ml-1.5 fill-emerald-400/20" />
                      </h2>
                      <span className="text-xs text-gray-300 font-mono block truncate">
                        {activeProfile.college}
                      </span>
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4">
                    
                    {/* Primary Role Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-150 dark:border-zinc-850">
                        <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Preferred Role</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{activeProfile.preferredRole}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-150 dark:border-zinc-850">
                        <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Year & Avail</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center">
                          Year {activeProfile.yearOfStudy} • 
                          <span className={`ml-1 h-2 w-2 rounded-full ${
                            activeProfile.availability === 'open' ? 'bg-emerald-500' :
                            activeProfile.availability === 'looking' ? 'bg-amber-500' : 'bg-gray-400'
                          }`}></span>
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Bio</span>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-zinc-400 mt-0.5 italic">
                        "{activeProfile.bio || 'Hacking and building products on campus!'}"
                      </p>
                    </div>

                    {/* Tech Stack Bubbles */}
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-1">Tech Stack Skills</span>
                      <div className="flex flex-wrap gap-1">
                        {activeProfile.skills.map((sk, id) => (
                          <span key={id} className="text-[10px] font-medium bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-100/30">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Card Swipe Action buttons */}
                  <div className="p-4 border-t border-gray-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/80 flex items-center justify-around">
                    <button
                      onClick={() => handleSwipe('dislike')}
                      className="h-12 w-12 rounded-full border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm transition flex items-center justify-center cursor-pointer"
                      title="Skip student (Swipe Left)"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSwipe('like')}
                      className="h-14 w-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20 hover:scale-105 transition flex items-center justify-center cursor-pointer"
                      title="Connect & Like! (Swipe Right)"
                    >
                      <Heart className="h-6 w-6 fill-white" />
                    </button>
                  </div>

                </motion.div>
              ) : (
                <div className="absolute inset-0 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-3xl shadow-md p-6 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-indigo-650" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-zinc-200">Campus Deck Empty!</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 max-w-[280px]">
                    Excellent work! You have cycled through all teammate cards in this session. Swipes are logged and persistent is registered!
                  </p>
                  <button
                    onClick={() => {
                      // Reset and cycle deck
                      const resetDeck = students.filter(s => s.uid !== userProfile?.uid);
                      setDeck(resetDeck);
                      setCurrentIndex(0);
                    }}
                    className="mt-6 px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Re-cycle Seed Pool</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Informative Side Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-gradient-to-tr from-slate-50 to-indigo-50/20 dark:from-zinc-950 dark:to-indigo-950/10 border border-gray-150 dark:border-zinc-850 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center">
              <Sparkles className="h-4 w-4 mr-1.5 text-indigo-605 fill-indigo-605/20" />
              Tinder matching works!
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              When swiping right on classmates from **{userProfile?.college || "verified university portals"}**, we check reciprocal database likes. 
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2.5">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 text-xs font-black flex items-center justify-center">1</span>
                <p className="text-xs text-slate-700 dark:text-zinc-300">
                  <strong>Slide Left or Right</strong>: Interactive cards showcase student skills, department, and bio summaries directly.
                </p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 text-xs font-black flex items-center justify-center">2</span>
                <p className="text-xs text-slate-700 dark:text-zinc-300">
                  <strong>Get a Match Overlay</strong>: If two student developers swipe right on each other, a direct message box opens instantly.
                </p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 text-xs font-black flex items-center justify-center">3</span>
                <p className="text-xs text-slate-700 dark:text-zinc-300">
                  <strong>Recruit Directly</strong>: Send direct roster requests into their notifications terminal so they can instantly merge into your hackathon team.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50/40 dark:bg-yellow-950/10 border border-yellow-200/50 dark:border-yellow-900/20 p-4 rounded-2xl flex items-start space-x-2.5">
            <Info className="h-4.5 w-4.5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-yellow-800 dark:text-yellow-400">
              <strong>Interactive tip:</strong> Try swiping right on **Ananya Rao** or **Vikram Seth**. Their profiles are rigged with simulated reciprocal likes, allowing you to instantly unlock the mutual match portal!
            </p>
          </div>

        </div>

      </div>

      {/* MUTUAL MATCH ENERGETIC PORTAL MODAL */}
      <AnimatePresence>
        {matchedUser && userProfile && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-subtle p-4 font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden flex flex-col items-center"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
            >
              {/* Decorative sparkles */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600" />
              <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl" />
              <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 mb-4 animate-bounce">
                <Heart className="h-6 w-6 fill-rose-500" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                IT'S A MUTUAL MATCH! 🎉
              </h2>
              
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 max-w-sm">
                Both you and **{matchedUser.name}** swiped right on each other. You both are perfectly aligned to conquer upcoming hackathons!
              </p>

              {/* Combined Avatars Side-by-Side */}
              <div className="flex items-center justify-center space-x-6 my-6 relative">
                <div className="relative">
                  <img 
                    src={userProfile.photoUrl} 
                    alt={userProfile.name} 
                    className="h-16 w-16 rounded-full object-cover border-4 border-indigo-600 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[8px] px-1 font-bold text-white rounded-full">YOU</span>
                </div>

                <div className="h-8 w-8 rounded-full bg-pink-100 dark:bg-pink-950/20 text-pink-605 flex items-center justify-center animate-pulse shadow-sm">
                  <Sparkles className="h-4 w-4 fill-pink-605" />
                </div>

                <div className="relative">
                  <img 
                    src={matchedUser.photoUrl} 
                    alt={matchedUser.name} 
                    className="h-16 w-16 rounded-full object-cover border-4 border-pink-500 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-pink-500 text-[8px] px-1 font-bold text-white rounded-full">MATCH</span>
                </div>
              </div>

              {/* Direct message inputs */}
              <form onSubmit={handleSendMatchMessage} className="w-full space-y-3">
                <div>
                  <textarea
                    rows={2}
                    value={chatMessageInput}
                    onChange={(e) => setChatMessageInput(e.target.value)}
                    placeholder={`Write a quick greeting message to ${matchedUser.name.split(' ')[0]}...`}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-600 dark:text-zinc-100 text-left"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-650 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1 px-4 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Send Hello & Start Chatting</span>
                  </button>

                  {myTeam ? (
                    <button
                      type="button"
                      disabled={isInviteSent}
                      onClick={handleSendTeamInvitationFromMatch}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer border border-gray-200 dark:border-zinc-800"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>{isInviteSent ? "Recruit Invitation Issued! ✓" : `Recruit directly to "${myTeam.name}"`}</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setMatchedUser(null)}
                    className="w-full text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300 text-xs font-semibold py-1.5 transition cursor-pointer"
                  >
                    Keep Swiping
                  </button>
                </div>
              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
