import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  MessageSquare,
  ShieldCheck,
  Award,
  Zap,
  Globe,
  Bell,
  School,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Terminal,
  Cpu,
  ChevronRight,
  HelpCircle,
  HelpCircle as HelpIcon,
  CheckCircle2
} from 'lucide-react';
import { Hackathon } from '../types';

interface LandingPageProps {
  onFindTeammates: () => void;
  onRegisterCollege: () => void;
  upcomingHackathons: Hackathon[];
  onViewHackathons: () => void;
}

export default function LandingPage({
  onFindTeammates,
  onRegisterCollege,
  upcomingHackathons,
  onViewHackathons
}: LandingPageProps) {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const stats = [
    { label: 'Verified Campuses', value: '18+' },
    { label: 'Active Hackers', value: '4,840+' },
    { label: 'Teams Chartered', value: '1,250+' },
    { label: 'Prizes Secured', value: '₹45L+' }
  ];

  const features = [
    { title: 'Verified Students', desc: 'Secure community bound strictly by official university emails (@skcet.ac.in, @mitindia.edu).', icon: ShieldCheck, color: 'from-blue-500 to-indigo-600' },
    { title: 'Smart Team Matching', desc: 'Find teammates instantly using calculated multi-skill compatibility score models.', icon: Zap, color: 'from-amber-500 to-orange-600' },
    { title: 'Team Recruitment', desc: 'Publish open roles like "UI/UX Designer" or "Backend Developer" for other students to apply.', icon: Users, color: 'from-purple-500 to-pink-600' },
    { title: 'Real-Time Chat', desc: 'Integrated group and peer messaging channel styled with typing metrics and file shares.', icon: MessageSquare, color: 'from-indigo-500 to-cyan-600' },
    { title: 'Hackathon Discovery', desc: 'An curated aggregate index of leading online/offline hacks filtered by categories.', icon: Search, color: 'from-emerald-500 to-teal-600' },
    { title: 'Skill-Based Search', desc: 'Filter profiles dynamically by languages, frameworks, tech stack, and experience.', icon: Terminal, color: 'from-zinc-700 to-zinc-900' },
    { title: 'Portfolio Showcase', desc: 'Beautiful verified resume profile linking GitHub accounts and live hack records.', icon: BookOpen, color: 'from-pink-500 to-rose-600' },
    { title: 'Smart Notifications', desc: 'Instant system messages alerting you when someone views your portfolio or invites your team.', icon: Bell, color: 'from-red-500 to-rose-600' },
    { title: 'College Communities', desc: 'Interlinked student ecosystem with regional contribution leaders and colleges ranking boards.', icon: School, color: 'from-indigo-600 to-purple-600' },
    { title: 'Team Management', desc: 'Board trackers, team todo lists, resources locker, and scheduling calendars.', icon: Cpu, color: 'from-cyan-500 to-blue-600' },
  ];

  const steps = [
    { num: '01', title: 'Verify Email', desc: 'Register with your official .edu or .ac.in credentials to auto-verify your campus location.' },
    { num: '02', title: 'Flesh Out Stack', desc: 'Import your GitHub repos, select preferred engineering disciplines, and list technologies.' },
    { num: '03', title: 'Discover & Align', desc: 'Query active student projects, calculate skill gaps, and apply to roles with one click.' },
    { num: '04', title: 'Assemble & Win', desc: 'Synchronize strategies in team workspace chats and turn product ideas into prize victories.' }
  ];

  const testimonials = [
    {
      quote: "As a student at SKCET, finding UI design juniors for the Smart India Hackathon was nearly impossible on LinkedIn. Running the query on HackMate found me a highly aligned teammate within minutes. We ended up winning the track!",
      author: "Hari Balakrishnan",
      role: "Full Stack Lead, SKCET Graduate",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
    },
    {
      quote: "HackMate eliminated the barrier of team hunting. It brings our entire computer science club onto a single clean board, completely avoiding slack confusion.",
      author: "Vikram Seth",
      role: "CS Sophomore, Stanford University",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
    }
  ];

  const faqs = [
    { q: "How is college domain verification guarded?", a: "We maintain a database registry of approved university domains. When a student registers, they must enter their official university email. Our system validates the suffix, e.g. @skcet.ac.in, rejecting public accounts to preserve high professional community trust." },
    { q: "Is HackMate free for tech clubs?", a: "Absolutely! HackMate is designed by hackers, for hackers, built to fuel innovation in university campuses. We provide all tooling (chat, team boards, bookmarks) with zero paywalls." },
    { q: "How does the AI Teammate analysis calculate alignment?", a: "Our platform uses Google Gemini server proxy queries. The agent cross-references the candidate's skills database (e.g. React, Express) against the hackathon’s required categories to outline exact development skill gaps and estimate a matching percentage." },
    { q: "How do I add my college domain to the whitelist?", a: "Students, teachers, or administrators can click 'Register College' block in our menu. Our admin team will verify public accreditation database records and activate your suffix within 12 hours." }
  ];

  return (
    <div className="bg-slate-50 text-gray-800 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 bg-radial-[at_top_right] from-indigo-50/60 via-transparent to-transparent dark:from-indigo-950/20">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-indigo-500/5 to-purple-500/5 blur-3xl rounded-full"></div>
        <div className="pointer-events-none absolute left-0 top-32 h-64 w-64 bg-radial from-purple-500/10 to-transparent blur-2xl"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1 rounded-full border border-indigo-200 bg-indigo-50/60 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-400 mb-6"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Now Launching: Cross-Campus Developer Connect 2026</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white lg:leading-[1.1] max-w-4xl mx-auto"
          >
            Find Your Perfect <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Hackathon Team.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Connect with verified students from your college, build dream teams, and win hackathons together. Fully secured by university email verification networks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              id="cta-find-teammates"
              onClick={onFindTeammates}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-600/15 hover:shadow-indigo-600/25 transition duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Find Teammates</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <button
              id="cta-register-college"
              onClick={onRegisterCollege}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-2xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800/80 px-8 py-4 text-base font-bold text-gray-700 dark:text-zinc-200 transition duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <School className="h-4.5 w-4.5 text-indigo-500" />
              <span>Register College</span>
            </button>
          </motion.div>

          {/* STATISTICS SECTION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-4xl mx-auto rounded-3xl border border-gray-200/60 bg-white/60 backdrop-blur-sm p-6 sm:p-8 dark:border-zinc-900 dark:bg-zinc-900/40 shadow-xl shadow-gray-200/10 dark:shadow-none"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-150 dark:divide-zinc-800">
              {stats.map((stat, i) => (
                <div key={i} className="pt-4 md:pt-0 first:pt-0">
                  <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium mt-1 text-gray-600 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* COLLEGE PARTNERS LOGOS */}
      <section className="py-10 border-y border-gray-200/50 bg-gray-50/50 dark:border-zinc-900 dark:bg-zinc-950/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Approved University Ecosystem Partner Nodes
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-75 dark:opacity-60 saturate-50 dark:saturate-100 dark:contrast-125">
            <span className="font-sans text-lg font-black tracking-wider text-gray-600 dark:text-gray-300">
              🏫 SKCET Coimbatore
            </span>
            <span className="font-sans text-lg font-black tracking-wider text-gray-600 dark:text-gray-300">
              🏫 MIT Chennai
            </span>
            <span className="font-sans text-lg font-black tracking-wider text-gray-600 dark:text-gray-300">
              🌲 Stanford CS LAB
            </span>
            <span className="font-sans text-lg font-black tracking-wider text-gray-600 dark:text-gray-300">
              🏫 IIT BOMBAY
            </span>
            <span className="font-sans text-lg font-black tracking-wider text-gray-600 dark:text-gray-300">
              🎓 MIT CAMBRIDGE
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Innovative Utilities
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Designed Exclusively for College Hackers
          </p>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-zinc-400">
            From verified student-directories to AI-driven tech-gap recommendations, everything you need for the podium.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="group relative rounded-3xl border border-gray-200/80 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-900 w-full transition-all duration-300 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1.5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${feat.color} text-white shadow-md`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="mt-3 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-zinc-100 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Podium Blueprint
              </h2>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                How It Works
              </p>
              <p className="mt-4 text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                We simplify teammate collaboration into 4 highly fluid operational stages so you spend less energy scouting and more energy architecting.
              </p>
              <button
                id="btn-works-explore"
                onClick={onFindTeammates}
                className="mt-8 flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-500 font-bold text-sm transition"
              >
                <span>Scout and Match Now</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {steps.map((st, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-800 p-6 shadow-sm">
                  <div className="text-3xl font-black font-mono text-indigo-600/30 dark:text-indigo-500/20">
                    {st.num}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {st.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS & CASE STATS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Validated Success
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Student Testimonials
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-200/80 dark:border-zinc-900 dark:bg-zinc-900/60 p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition">
              <p className="text-sm sm:text-base leading-relaxed italic text-gray-600 dark:text-zinc-300">
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center space-x-3.5">
                <img src={t.avatar} alt={t.author} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.author}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING HACKATHONS */}
      <section className="py-20 bg-indigo-950 text-white rounded-t-[40px] overflow-hidden relative">
        <div className="absolute inset-0 bg-radial from-violet-800/10 to-transparent blur-3xl rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Podium Discoveries
              </h2>
              <p className="mt-2 text-3xl font-black tracking-tight">
                Featured Upcoming Hackathons
              </p>
            </div>
            <button
              id="btn-view-all-hacks"
              onClick={onViewHackathons}
              className="bg-indigo-600 hover:bg-indigo-500 text-sm font-bold px-6 py-3 rounded-2xl shadow-indigo-600/30 transition cursor-pointer"
            >
              Browse All Events
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingHackathons.slice(0, 3).map((hack) => (
              <div key={hack.id} className="bg-zinc-900/90 border border-zinc-805/80 rounded-3xl p-5 hover:border-indigo-500/50 transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-bold">
                    {hack.mode}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {hack.prizePool}
                  </span>
                </div>
                <h3 className="text-base font-bold line-clamp-1 text-white">
                  {hack.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {hack.description}
                </p>
                <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Deadline: {hack.deadline}</span>
                  <button 
                    onClick={onViewHackathons}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Got Questions?
          </h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Queries
          </p>
        </div>

        <div className="mt-16 space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-150 p-5 dark:border-zinc-900 dark:bg-zinc-900/45 transition"
              >
                <button
                  id={`btn-faq-trigger-${idx}`}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <HelpIcon className={`h-4.5 w-4.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                </button>
                {isOpen && (
                  <p className="mt-3.5 text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed pl-1 border-l-2 border-indigo-500">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA REGISTER BANNER */}
      <section className="py-20 bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Campus Ecosystem?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-indigo-100 max-w-xl mx-auto">
            Get whitelisted today. Approved college students can log in, form teams, and discover events instantly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="cta-bottom-find"
              onClick={onFindTeammates}
              className="w-full sm:w-auto bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl transition hover:-translate-y-0.5 shadow-xl cursor-pointer text-sm"
            >
              Start Scouting Teammates
            </button>
            <button
              id="cta-bottom-register"
              onClick={onRegisterCollege}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-2xl transition hover:-translate-y-0.5 shadow-xl cursor-pointer text-sm"
            >
              Whitelists My University
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">H</div>
            <span className="font-sans font-bold text-gray-900 dark:text-white">HackMate Verified Network</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-500">
            &copy; 2026 HackMate Inc. All rights reserved. Platform optimized with Google Gemini models.
          </p>
        </div>
      </footer>

    </div>
  );
}
