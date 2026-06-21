import {
  UserProfile,
  CollegeDomain,
  Hackathon,
  Team,
  TeamApplication,
  ChatMessage,
  SystemNotification,
  Bookmark,
  TeamTask,
  TeamResource,
  PreferredRole,
  Swipe,
  RosterInvite,
  TeamToTeamCollab
} from '../types';

// ==========================================
// SUPABASE CONFIG
// ==========================================
const SUPABASE_URL='https://mqqkffkodsiiabvhrlua.supabase.co';
const SUPABASE_ANON_KEY='sb_publishable_SSJzMoa2R9zvCE93HGRo1w_NOxROXsN';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[SUPABASE CONFIG] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Check your .env file, then FULLY reload the browser tab — Vite only reads env vars at startup, ' +
    'not on hot-reload.'
  );
}

const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

// ==========================================
// SEED DATA CONFIGURATION
// (unchanged — same fallback/demo data as before)
// ==========================================

const INITIAL_COLLEGES: CollegeDomain[] = [
  {
    id: 'col1',
    domain: 'skcet.ac.in',
    name: 'Sri Krishna College of Engineering and Technology',
    approved: true,
    suspended: false,
    studentCount: 142,
    createdAt: new Date('2026-01-10').toISOString()
  },
  {
    id: 'col2',
    domain: 'mitindia.edu',
    name: 'Madras Institute of Technology',
    approved: true,
    suspended: false,
    studentCount: 98,
    createdAt: new Date('2026-01-12').toISOString()
  },
  {
    id: 'col3',
    domain: 'stanford.edu',
    name: 'Stanford University',
    approved: true,
    suspended: false,
    studentCount: 76,
    createdAt: new Date('2026-02-01').toISOString()
  },
  {
    id: 'col4',
    domain: 'iitb.ac.in',
    name: 'Indian Institute of Technology, Bombay',
    approved: true,
    suspended: false,
    studentCount: 114,
    createdAt: new Date('2026-02-15').toISOString()
  },
  {
    id: 'col5',
    domain: 'mit.edu',
    name: 'Massachusetts Institute of Technology',
    approved: false,
    suspended: false,
    studentCount: 0,
    createdAt: new Date('2026-03-01').toISOString()
  }
];

const INITIAL_HACKATHONS: Hackathon[] = [
  {
    id: 'h1',
    title: 'Smart India Hackathon (SIH 2026)',
    organizer: 'AICTE & Ministry of Education',
    deadline: '2026-08-15',
    prizePool: '₹15,00,000 INR',
    mode: 'offline',
    teamSize: '6 Members',
    eligibility: 'All College Students',
    tags: ['Web Development', 'AI/ML', 'IoT', 'Hardware'],
    description: 'Nations largest digital product development hackathon seeking digital solutions to pressing social and industry problems in India.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'h2',
    title: 'Google Gemini Intelligence Build',
    organizer: 'Google Developer Groups',
    deadline: '2026-07-10',
    prizePool: '$25,000 USD',
    mode: 'online',
    teamSize: '2-4 Members',
    eligibility: 'Global Students',
    tags: ['AI/ML', 'Gemini SDK', 'NLP', 'Agentic Workflows'],
    description: 'Build the future of assistive software, agents, custom tools and visual canvas interfaces powered by the state-of-the-art Google Gemini models.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'h3',
    title: 'Vite Speed Hack 2026',
    organizer: 'Vite Core Team & Vercel',
    deadline: '2026-06-25',
    prizePool: '$10,000 USD',
    mode: 'online',
    teamSize: '1-3 Members',
    eligibility: 'Undergraduate Developers',
    tags: ['Web Development', 'React', 'Build Tooling', 'Rust'],
    description: 'Push the limits of front-end engineering. Build incredibly rapid, beautifully responsive React or Svelte components compile-optimized via Vite.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'h4',
    title: 'DeFi Global Core Summit',
    organizer: 'Ethereum Foundation',
    deadline: '2026-09-01',
    prizePool: '$50,000 USD',
    mode: 'offline',
    teamSize: '3-5 Members',
    eligibility: 'College Tech Clubs',
    tags: ['Blockchain', 'Solidity', 'Smart Contracts', 'Web3'],
    description: 'A deep challenge to construct cryptographic financial primitives, collateralized models, automated market makers (AMMs), or gas-optimized smart contracts.',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'h5',
    title: 'HealthTech Innovations Hack',
    organizer: 'Madras Medical Council & MIT',
    deadline: '2026-07-28',
    prizePool: '₹5,00,000 INR',
    mode: 'offline',
    teamSize: '2-4 Members',
    eligibility: 'Bio-tech & CS Students',
    tags: ['HealthCare', 'Bioinformatics', 'Mobile Developer', 'AI/ML'],
    description: 'Develop software that optimizes medical imaging routing, diagnoses diagnostic anomalies, assists mental health tracking, or provides emergency dispatch coordinates.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PROFILES: UserProfile[] = [
  {
    uid: 'stud_admin_gmail',
    name: 'Hari Balakrishnan',
    email: 'haribala512c@gmail.com',
    college: 'Sri Krishna College of Engineering and Technology',
    domain: 'gmail.com',
    department: 'Computer Science and Engineering',
    yearOfStudy: 3,
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Firebase', 'Tailwind CSS', 'AI Integrations'],
    interests: ['Web Development', 'Chatbots', 'Platform Engineering', 'Vector Embeddings'],
    github: 'https://github.com/haribala512',
    linkedin: 'https://linkedin.com/in/haribala',
    preferredRole: 'Full Stack Developer',
    bio: 'Passionate full-stack developer and HackMate administrator. Building intelligent university collaboration products.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    badges: ['Lead Architect', 'Verified Administrator'],
    availability: 'open',
    createdAt: new Date('2026-06-01').toISOString(),
    rating: 99,
    projects: [
      { name: 'Hackmate Assistant', description: 'Intelligent AI chatbot guiding campus hackathon squads.', github: 'https://github.com' }
    ],
    hackathonExperience: [
      { title: 'Global AI Summit', role: 'Team Captain', achievement: 'Grand Prize' }
    ]
  },
  {
    uid: 'stud1',
    name: 'Hari Balakrishnan [Campus]',
    email: 'haribala512c@skcet.ac.in',
    college: 'Sri Krishna College of Engineering and Technology',
    domain: 'skcet.ac.in',
    department: 'Computer Science and Engineering',
    yearOfStudy: 3,
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Firebase', 'Tailwind CSS'],
    interests: ['Web Development', 'Real-time Chats', 'Platform Engineering'],
    github: 'https://github.com/haribala512',
    linkedin: 'https://linkedin.com/in/haribala',
    preferredRole: 'Full Stack Developer',
    bio: 'Passionate full-stack hacker trying to build the next generation of social-tech utilities. Love working with React and TypeScript.',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    badges: ['Community Catalyst', 'Fast Learner'],
    availability: 'open',
    createdAt: new Date('2026-05-15').toISOString(),
    rating: 94,
    projects: [
      { name: 'Hackmate Base', description: 'Interactive college alignment portal.', github: 'https://github.com' }
    ],
    hackathonExperience: [
      { title: 'Smart India Hackathon', role: 'Full Stack Dev', achievement: '1st Place' }
    ]
  },
  {
    uid: 'stud2',
    name: 'Ananya Rao',
    email: 'ananya.rao@skcet.ac.in',
    college: 'Sri Krishna College of Engineering and Technology',
    domain: 'skcet.ac.in',
    department: 'Information Technology',
    yearOfStudy: 4,
    skills: ['Framer Motion', 'Figma', 'UI/UX Design', 'CSS Grid', 'Tailwind CSS', 'React'],
    interests: ['HCI', 'Creative Coding', 'Design Systems', 'AI/ML'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'UI/UX Designer',
    bio: 'Interaction designer based in Coimbatore. Focused on creating micro-interactions, responsive states, and accessible typography ratios.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    badges: ['Design Maestro', 'Pixel Perfect'],
    availability: 'looking',
    createdAt: new Date('2026-05-18').toISOString(),
    rating: 88,
    projects: [
      { name: 'Aura UI', description: 'Accessible Tailwind design repository.' }
    ],
    hackathonExperience: [
      { title: 'UI UX Design Sprint', role: 'Lead Designer', achievement: 'Top 3 Finalist' }
    ]
  },
  {
    uid: 'stud3',
    name: 'Vikram Seth',
    email: 'vseth@stanford.edu',
    college: 'Stanford University',
    domain: 'stanford.edu',
    department: 'Computer Science',
    yearOfStudy: 2,
    skills: ['Python', 'PyTorch', 'FastAPI', 'scikit-learn', 'Docker', 'React'],
    interests: ['AI/ML', 'Deep Learning', 'Neural Agents', 'NLP'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'AI/ML Engineer',
    bio: 'Stanford CS, research associate at AI Lab. Working on fine-tuning vision transformers and optimizing embedding pipelines.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    badges: ['Algorithmic Guru', 'NLP Innovator'],
    availability: 'open',
    createdAt: new Date('2026-05-20').toISOString(),
    rating: 96,
    projects: [
      { name: 'NLU Extract', description: 'Semantic retrieval utilizing custom sentence embeddings.' }
    ],
    hackathonExperience: [
      { title: 'Stanford TreeHacks', role: 'Machine Learning Lead', achievement: 'Best AI Track Winner' }
    ]
  },
  {
    uid: 'stud4',
    name: 'Karthik Raja',
    email: 'karthik.raja@mitindia.edu',
    college: 'Madras Institute of Technology',
    domain: 'mitindia.edu',
    department: 'Electronics and Communication',
    yearOfStudy: 3,
    skills: ['Go', 'RethinkDB', 'PostgreSQL', 'Docker', 'gRPC', 'Kubernetes', 'C++'],
    interests: ['Distributed Systems', 'Cloud Native', 'Cybersecurity'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'Backend Developer',
    bio: 'MIT Chennai undergrad. Love optimizing backend controllers, latency debugging, and structuring high-concurrency systems using Go channels.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    badges: ['Backend Titan', 'Cloud Architect'],
    availability: 'open',
    createdAt: new Date('2026-05-22').toISOString(),
    rating: 91,
    projects: [
      { name: 'KubeSync', description: 'Real-time cluster telemetry exporter in Go.' }
    ],
    hackathonExperience: [
      { title: 'Chennai HackFest', role: 'Backend Developer', achievement: 'Special Jury Mention' }
    ]
  },
  {
    uid: 'stud5',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@iitb.ac.in',
    college: 'Indian Institute of Technology, Bombay',
    domain: 'iitb.ac.in',
    department: 'Electrical Engineering',
    yearOfStudy: 4,
    skills: ['Flutter', 'Dart', 'Node.js', 'NoSQL', 'Figma', 'Firebase'],
    interests: ['Mobile Developer', 'UI/UX', 'Product Management'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'Mobile Developer',
    bio: 'Mobile systems enthusiast at IIT Bombay. Experienced in constructing seamless high-fps rendering apps via Dart and Flutter Web.',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    badges: ['Mobile Expert'],
    availability: 'open',
    createdAt: new Date('2026-05-25').toISOString(),
    rating: 86,
    projects: [
      { name: 'ScribeApp', description: 'Cross-platform localized transcription manager.' }
    ],
    hackathonExperience: [
      { title: 'Inter-IIT Tech Meet', role: 'App Dev Champion', achievement: 'Gold Medalist' }
    ]
  },
  {
    uid: 'stud6',
    name: 'Priya Patel',
    email: 'priya.patel@skcet.ac.in',
    college: 'Sri Krishna College of Engineering and Technology',
    domain: 'skcet.ac.in',
    department: 'Computer Science and Engineering',
    yearOfStudy: 3,
    skills: ['React', 'Tailwind CSS', 'Three.js', 'Framer Motion', 'Web Graphics'],
    interests: ['Creative Tech', 'HCI Design', 'Frontend Engine Optimization'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'Frontend Developer',
    bio: 'Creative frontend developer specializing in 3D physics engines, canvas styling art, and high-performance Framer animations.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    badges: ['3D Wizard', 'UI Architect'],
    availability: 'open',
    createdAt: new Date('2026-05-28').toISOString(),
    rating: 90,
    projects: [
      { name: 'Nebula.js', description: 'Interactive WebGL starfield simulator.' }
    ],
    hackathonExperience: [
      { title: 'SKCET Design Marathon', role: 'Creative Director', achievement: '1st Runner Up' }
    ]
  },
  {
    uid: 'stud7',
    name: 'Alex Mercer',
    email: 'amercer@stanford.edu',
    college: 'Stanford University',
    domain: 'stanford.edu',
    department: 'Computer Science',
    yearOfStudy: 3,
    skills: ['Solidity', 'Rust', 'Web3.js', 'Go', 'Cryptography', 'Node.js'],
    interests: ['Decentralized Systems', 'Zero Knowledge Proofs', 'Smart Contracts'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'Backend Developer',
    bio: 'Stanford CS major. Engineering optimized consensus clients and decentralized side-chains. Coffee enthusiast and hackathon veteran.',
    photoUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=400&q=80',
    badges: ['Security Veteran', 'Web3 Architect'],
    availability: 'looking',
    createdAt: new Date('2026-05-30').toISOString(),
    rating: 93,
    projects: [
      { name: 'CipherTrust', description: 'Multi-party threshold cryptosystem.' }
    ],
    hackathonExperience: [
      { title: 'ETHSanFrancisco', role: 'Smart Contract Dev', achievement: 'Best DeFi Hacks Award' }
    ]
  },
  {
    uid: 'stud8',
    name: 'Siddharth Roy',
    email: 'sid.roy@iitb.ac.in',
    college: 'Indian Institute of Technology, Bombay',
    domain: 'iitb.ac.in',
    department: 'Electrical Engineering',
    yearOfStudy: 4,
    skills: ['Next.js', 'Django', 'PostgreSQL', 'GraphQL', 'Docker', 'AWS'],
    interests: ['Serverless Computing', 'System Security', 'Full-stack Performance'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'Full Stack Developer',
    bio: 'Always tinkering with serverless Kubernetes setups. Passionate about query optimization and responsive server architectures.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    badges: ['Database Ninja', 'Serverless Guru'],
    availability: 'open',
    createdAt: new Date('2026-06-02').toISOString(),
    rating: 89,
    projects: [
      { name: 'FastAPI Boilerplate', description: 'Production-ready cloud deployment scaffold.' }
    ],
    hackathonExperience: [
      { title: 'TechFest Mumbai Hackathon', role: 'Full Stack Captain', achievement: 'Best Developer Experience' }
    ]
  },
  {
    uid: 'stud9',
    name: 'Emily Chen',
    email: 'emily.chen@mitindia.edu',
    college: 'Madras Institute of Technology',
    domain: 'mitindia.edu',
    department: 'Electronics and Communication',
    yearOfStudy: 3,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'HuggingFace', 'Computer Vision'],
    interests: ['Neural Networks', 'Embedded Vision', 'Reinforcement Learning'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'AI/ML Engineer',
    bio: 'Madras IT undergrad building computer vision pipelines, image segmenters, and generative models. Deep learning hobbyist.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    badges: ['Visionary', 'PyTorch Hacker'],
    availability: 'open',
    createdAt: new Date('2026-06-03').toISOString(),
    rating: 95,
    projects: [
      { name: 'SentiLens', description: 'Real-time video emotion classifier on edge devices.' }
    ],
    hackathonExperience: [
      { title: 'India DeepLearning Expo', role: 'Model Architect', achievement: 'Top 3 Machine Vision Track' }
    ]
  },
  {
    uid: 'stud10',
    name: 'Meera Iyer',
    email: 'm.iyer@skcet.ac.in',
    college: 'Sri Krishna College of Engineering and Technology',
    domain: 'skcet.ac.in',
    department: 'Information Technology',
    yearOfStudy: 4,
    skills: ['Python', 'NLP', 'Transformers', 'FastAPI', 'HuggingFace', 'ChromaDB'],
    interests: ['Linguistics', 'Vector Databases', 'Prompt Engineering'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'AI/ML Engineer',
    bio: 'NLP researcher focused on semantic parsing, dense passage retrieval, and aligning multi-turned conversations.',
    photoUrl: 'https://images.unsplash.com/photo-1534751516642-a131fed10495?auto=format&fit=crop&w=400&q=80',
    badges: ['RAG Expert', 'NLP Scholar'],
    availability: 'looking',
    createdAt: new Date('2026-06-05').toISOString(),
    rating: 92,
    projects: [
      { name: 'LexicaSearch', description: 'Semantic retrieval utilizing custom sentence embeddings.' }
    ],
    hackathonExperience: [
      { title: 'Global Agentic Hack', role: 'Data Engineer', achievement: 'Best Domain Grounding' }
    ]
  },
  {
    uid: 'stud11',
    name: 'Devon Miller',
    email: 'devon.miller@gmail.com',
    college: 'Massachusetts Institute of Technology',
    domain: 'gmail.com',
    department: 'Computer Science',
    yearOfStudy: 3,
    skills: ['Rust', 'Go', 'Redis', 'PostgreSQL', 'gRPC', 'Apache Kafka'],
    interests: ['High-performance Systems', 'Stream Engines', 'Databases'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    preferredRole: 'Backend Developer',
    bio: 'Low-latency backend hacker. Obsessed with thread pools, async runtime schedulers in Rust, and messaging architectures.',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80',
    badges: ['Concurrence King', 'Rustacean'],
    availability: 'open',
    createdAt: new Date('2026-06-07').toISOString(),
    rating: 97,
    projects: [
      { name: 'GripStream', description: 'High-throughput publish-subscribe memory bus.' }
    ],
    hackathonExperience: [
      { title: 'Boston Hackfest', role: 'Systems Lead', achievement: 'Technical Innovation Champion' }
    ]
  }
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 'team1',
    name: 'Agentic Automators',
    description: 'A stellar multidisciplinary team of Stanford coders constructing a context-aware developer agent platform for Google Gemini Build.',
    creatorId: 'stud3',
    creatorName: 'Vikram Seth',
    college: 'Stanford University',
    requiredSkills: ['Node.js', 'UI/UX Design', 'Figma', 'TypeScript'],
    maxSize: 4,
    openPositions: ['UI/UX Designer', 'Frontend Developer'],
    members: [
      { uid: 'stud3', name: 'Vikram Seth', role: 'AI/ML Engineer', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' }
    ],
    hackathonId: 'h2',
    hackathonTitle: 'Google Gemini Intelligence Build',
    resources: [{ title: 'Google GenAI SDK docs', link: 'https://github.com/google/generative-ai-js' }],
    tasks: [
      { id: 'task1', title: 'Scaffold Express server', assigneeId: 'stud3', assigneeName: 'Vikram Seth', status: 'done', dueDate: '2026-06-21' },
      { id: 'task2', title: 'Complete Gemini 2.5 flash logic', assigneeId: 'stud3', assigneeName: 'Vikram Seth', status: 'in-progress', dueDate: '2026-06-25' }
    ],
    notes: 'Primary meeting planned for Tuesday. Bring your UI proposals.',
    createdAt: new Date('2026-06-12').toISOString()
  },
  {
    id: 'team2',
    name: 'ByteCrafters SKCET',
    description: 'Developing a remote rural healthcare consultation app equipped with low-bandwidth offline message buffers.',
    creatorId: 'stud1',
    creatorName: 'Hari Balakrishnan',
    college: 'Sri Krishna College of Engineering and Technology',
    requiredSkills: ['Backend Developer', 'Go', 'PostgreSQL', 'UI/UX Design', 'Figma'],
    maxSize: 3,
    openPositions: ['Backend Developer', 'UI/UX Designer'],
    members: [
      { uid: 'stud1', name: 'Hari Balakrishnan', role: 'Full Stack Developer', photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80' }
    ],
    hackathonId: 'h5',
    hackathonTitle: 'HealthTech Innovations Hack',
    resources: [],
    tasks: [],
    notes: 'Seeding health index schemas.',
    createdAt: new Date('2026-06-15').toISOString()
  }
];

// ==========================================
// UNIVERSAL DATA ADAPTER
// Talks to Supabase's `collections` table.
// LocalStorage is kept as an offline cache/fallback.
//
// FIXED IN THIS VERSION:
// - every fetch() now checks res.ok before assuming success,
//   instead of only catching network-level failures
// - failed reads/writes/deletes now log a real status code +
//   response body via console.error instead of going silent
// - missing env vars are flagged loudly on load
// ==========================================

class DataAdapter {
  private localKey(collection: string) {
    return `hackmate_cache_${collection}`;
  }

  private getCache<T>(col: string, fallback: T[]): T[] {
    const data = localStorage.getItem(this.localKey(col));
    if (!data) {
      localStorage.setItem(this.localKey(col), JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  }

  private setCache<T>(col: string, data: T[]) {
    localStorage.setItem(this.localKey(col), JSON.stringify(data));
  }

  init() {
    this.getCache<CollegeDomain>('colleges', INITIAL_COLLEGES);
    this.getCache<Hackathon>('hackathons', INITIAL_HACKATHONS);
    this.getCache<UserProfile>('users', INITIAL_PROFILES);
    this.getCache<Team>('teams', INITIAL_TEAMS);
    this.getCache<TeamApplication>('applications', []);
    this.getCache<ChatMessage>('messages', [
      {
        id: 'seed-m1',
        roomId: 'team1',
        senderId: 'stud3',
        senderName: 'Vikram Seth',
        senderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        text: 'Hello guys! Welcome to the Gemini Intelligence Team Chat.',
        timestamp: new Date('2026-06-17T12:00:00Z').toISOString()
      },
      {
        id: 'seed-m2',
        roomId: 'team1',
        senderId: 'stud1',
        senderName: 'Hari Balakrishnan',
        senderPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        text: 'Excited to hack here! Let us build some amazing agent UI workflow.',
        timestamp: new Date('2026-06-17T12:05:00Z').toISOString()
      }
    ]);
    this.getCache<SystemNotification>('notifications', [
      {
        id: 'n-seed-1',
        userId: 'stud1',
        title: 'Team Application Approved',
        body: 'Your application to join "Agentic Automators" was approved by Vikram!',
        type: 'invite',
        read: false,
        link: 'team_dashboard',
        createdAt: new Date().toISOString()
      }
    ]);
    this.getCache<Bookmark>('bookmarks', []);
  }

  // Generic write -> upserts into Supabase's `collections` table
  // (collection, id) is the primary key, so this overwrites cleanly
  // on conflict instead of duplicating rows.
  // NOTE: requires a UNIQUE constraint on (collection, id) in the actual
  // table, or PostgREST will reject the on_conflict and you'll see a 400
  // here now instead of silence.
  async syncWrite<T extends { id?: string; uid?: string }>(col: string, docId: string, data: T) {
    const idKey = data.id || data.uid || docId;

    // local cache stays exactly as before
    const items = this.getCache<T>(col, []);
    const idx = items.findIndex((i: any) => (i.id || i.uid) === idKey);
    if (idx > -1) {
      items[idx] = { ...items[idx], ...data };
    } else {
      items.push({ ...data, id: idKey } as any);
    }
    this.setCache(col, items);

    // sync to Supabase
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/collections?on_conflict=collection,id`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({ collection: col, id: idKey, data }),
      });
      if (!res.ok) {
        console.error(
          `[SUPABASE WRITE FAILED] ${col}:${idKey} — status ${res.status} — ${await res.text()}`
        );
      }
    } catch (err) {
      console.error(`[SUPABASE WRITE NETWORK ERROR] ${col}:${idKey}, using local replica state.`, err);
    }
  }

  // Generic read -> pulls everything tagged with this collection name
  private async fetchCollection<T>(col: string, fallback: T[]): Promise<T[]> {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/collections?collection=eq.${col}&select=data`,
        { headers: supabaseHeaders }
      );
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const serverData = rows.map((r: any) => r.data);
          this.setCache(col, serverData);
          return serverData;
        }
      } else {
        console.error(
          `[SUPABASE READ FAILED] ${col} — status ${res.status} — ${await res.text()}`
        );
      }
    } catch (err) {
      console.error(`[SUPABASE READ NETWORK ERROR] ${col}. Serving offline local replica state.`, err);
    }
    return this.getCache<T>(col, fallback);
  }

  // Generic delete -> removes the one row matching collection+id
  private async syncDelete(col: string, id: string) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/collections?collection=eq.${col}&id=eq.${id}`,
        { method: 'DELETE', headers: supabaseHeaders }
      );
      if (!res.ok) {
        console.error(
          `[SUPABASE DELETE FAILED] ${col}:${id} — status ${res.status} — ${await res.text()}`
        );
      }
    } catch (err) {
      console.error(`[SUPABASE DELETE NETWORK ERROR] ${col}:${id}`, err);
    }
  }

  // ==========================================
  // COLLEGES
  // ==========================================
  async getColleges(): Promise<CollegeDomain[]> {
    return this.fetchCollection<CollegeDomain>('colleges', INITIAL_COLLEGES);
  }

  async addCollegeDomain(domain: string, name: string): Promise<CollegeDomain> {
    const col: CollegeDomain = {
      id: 'col_' + Math.random().toString(36).substr(2, 9),
      domain: domain.toLowerCase().trim(),
      name: name.trim(),
      approved: true,
      suspended: false,
      studentCount: 0,
      createdAt: new Date().toISOString()
    };
    await this.syncWrite('colleges', col.id, col);
    return col;
  }

  async updateCollegeStatus(collegeId: string, updates: Partial<CollegeDomain>): Promise<void> {
    const cols = await this.getColleges();
    const idx = cols.findIndex(c => c.id === collegeId);
    if (idx > -1) {
      const updated = { ...cols[idx], ...updates };
      await this.syncWrite('colleges', collegeId, updated);
    }
  }

  async deleteCollege(collegeId: string): Promise<void> {
    await this.syncDelete('colleges', collegeId);
    const cols = this.getCache<CollegeDomain>('colleges', INITIAL_COLLEGES);
    const updated = cols.filter(c => c.id !== collegeId);
    this.setCache('colleges', updated);
  }

  // ==========================================
  // USER PROFILES
  // ==========================================
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const profiles = await this.getAllUserProfiles();
    return profiles.find(u => u.uid === uid) || null;
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await this.syncWrite('users', profile.uid, profile);
  }

  async getAllUserProfiles(): Promise<UserProfile[]> {
    return this.fetchCollection<UserProfile>('users', INITIAL_PROFILES);
  }

  // ==========================================
  // HACKATHONS
  // ==========================================
  async getHackathons(): Promise<Hackathon[]> {
    return this.fetchCollection<Hackathon>('hackathons', INITIAL_HACKATHONS);
  }

  async saveHackathon(hack: Hackathon): Promise<void> {
    await this.syncWrite('hackathons', hack.id, hack);
  }

  async deleteHackathon(id: string): Promise<void> {
    await this.syncDelete('hackathons', id);
    const items = this.getCache<Hackathon>('hackathons', INITIAL_HACKATHONS).filter(h => h.id !== id);
    this.setCache('hackathons', items);
  }

  // ==========================================
  // TEAMS
  // ==========================================
  async getTeams(): Promise<Team[]> {
    return this.fetchCollection<Team>('teams', INITIAL_TEAMS);
  }

  async saveTeam(team: Team): Promise<void> {
    await this.syncWrite('teams', team.id, team);
  }

  async deleteTeam(id: string): Promise<void> {
    await this.syncDelete('teams', id);
    const items = this.getCache<Team>('teams', INITIAL_TEAMS).filter(t => t.id !== id);
    this.setCache('teams', items);
  }

  // ==========================================
  // APPLICATIONS
  // ==========================================
  async getApplications(): Promise<TeamApplication[]> {
    return this.fetchCollection<TeamApplication>('applications', []);
  }

  async saveApplication(app: TeamApplication): Promise<void> {
    await this.syncWrite('applications', app.id, app);
  }

  // ==========================================
  // MESSAGES
  // ==========================================
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    const list = await this.fetchCollection<ChatMessage>('messages', []);
    return list
      .filter(m => m.roomId === roomId)
      .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async sendMessage(roomId: string, message: ChatMessage): Promise<void> {
    await this.syncWrite('messages', message.id, message);
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(userId: string): Promise<SystemNotification[]> {
    const list = await this.fetchCollection<SystemNotification>('notifications', []);
    return list
      .filter(n => n.userId === userId)
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async saveNotification(notif: SystemNotification): Promise<void> {
    await this.syncWrite('notifications', notif.id, notif);
  }

  // ==========================================
  // BOOKMARKS
  // ==========================================
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    const all = await this.fetchCollection<Bookmark>('bookmarks', []);
    return all.filter(b => b.userId === userId);
  }

  async toggleBookmark(userId: string, itemId: string, itemType: 'hackathon' | 'team' | 'student'): Promise<boolean> {
    const list = await this.fetchCollection<Bookmark>('bookmarks', []);
    const idx = list.findIndex(b => b.userId === userId && b.itemId === itemId && b.itemType === itemType);
    let isBookmarked = false;
    if (idx > -1) {
      const bookmarkId = list[idx].id;
      await this.syncDelete('bookmarks', bookmarkId);
      list.splice(idx, 1);
    } else {
      const newB: Bookmark = {
        id: 'bm_' + Math.random().toString(36).substr(2, 9),
        userId,
        itemId,
        itemType,
        createdAt: new Date().toISOString()
      };
      await this.syncWrite('bookmarks', newB.id, newB);
      list.push(newB);
      isBookmarked = true;
    }
    this.setCache('bookmarks', list);
    return isBookmarked;
  }

  // ==========================================
  // MATCH FINDER / SWIPING
  // ==========================================
  async getSwipes(swiperId: string): Promise<Swipe[]> {
    const list = await this.fetchCollection<Swipe>('swipes', []);
    return list.filter(s => s.swiperId === swiperId);
  }

  async saveSwipe(swipe: Swipe): Promise<void> {
    await this.syncWrite('swipes', swipe.id, swipe);
  }

  async checkMutualMatch(userA: string, userB: string): Promise<boolean> {
    const swipesA = await this.getSwipes(userA);
    const swipesB = await this.getSwipes(userB);
    const rightA = swipesA.some(s => s.swipeeId === userB && s.type === 'like');
    const rightB = swipesB.some(s => s.swipeeId === userA && s.type === 'like');
    return rightA && rightB;
  }

  // ==========================================
  // ROSTER / JOINS DIRECT TEAM INVITATIONS
  // ==========================================
  async getRosterInvites(receiverId: string): Promise<RosterInvite[]> {
    const list = await this.fetchCollection<RosterInvite>('roster_invites', []);
    return list.filter(r => r.receiverId === receiverId);
  }

  async saveRosterInvite(invite: RosterInvite): Promise<void> {
    await this.syncWrite('roster_invites', invite.id, invite);
  }

  // ==========================================
  // TEAM TO TEAM COLLABORATION CHAT CHANNELS
  // ==========================================
  async getTeamToTeamCollabs(teamId: string): Promise<TeamToTeamCollab[]> {
    const list = await this.fetchCollection<TeamToTeamCollab>('team_collabs', []);
    return list.filter(c => c.proposingTeamId === teamId || c.receivingTeamId === teamId);
  }

  async saveTeamToTeamCollab(collab: TeamToTeamCollab): Promise<void> {
    await this.syncWrite('team_collabs', collab.id, collab);
  }

  // ==========================================
  // GEMINI AI INTEGRATION PROXIES
  // (left untouched — these hit /api/ai/* which is a
  // separate concern from the database and already has
  // a working local fallback heuristic baked in below)
  // ==========================================
  async analyzeSkillGap(studentSkills: string[], hackathonTags: string[]): Promise<{ gap: string[]; suggestions: string; difficulty: string }> {
    try {
      const res = await fetch('/api/ai/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentSkills, hackathonTags })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("AI Skill Gap service error, loading local analysis model", e);
    }
    const missing = hackathonTags.filter(t => !studentSkills.some(s => s.toLowerCase().includes(t.toLowerCase().split(' ')[0])));
    return {
      gap: missing.length > 0 ? missing : ['Advanced system deployments', 'Cloud security audits'],
      suggestions: `Based on your skillset [${studentSkills.join(', ')}], you're outstanding! To reach standard alignment for this hackathon, we suggest learning: ${missing.join(', ') || 'gRPC architecture structure'}. Consider taking a 1-hour workshop on building with generative SDKs.`,
      difficulty: studentSkills.length > 3 ? 'Beginner-Friendly Alignments' : 'Steep Learning Curve'
    };
  }

  async calculateTeamCompatibility(membersSkills: string[][], requiredSkills: string[]): Promise<{ score: number; checklist: { skill: string; met: boolean }[]; reasoning: string }> {
    try {
      const res = await fetch('/api/ai/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membersSkills, requiredSkills })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    const metSkills = requiredSkills.map(req => {
      const met = membersSkills.some(m => m.some(s => s.toLowerCase().includes(req.toLowerCase())));
      return { skill: req, met };
    });
    const countMet = metSkills.filter(v => v.met).length;
    const score = Math.round((countMet / Math.max(requiredSkills.length, 1)) * 100);
    return {
      score: score === 0 ? 35 : score,
      checklist: metSkills,
      reasoning: `Your team hits ${countMet} out of ${requiredSkills.length} required parameters directly. We suggest incorporating a developer with missing specializations to hit 100% operational throughput.`
    };
  }

  async recommendTeammates(userId: string): Promise<UserProfile[]> {
    try {
      const res = await fetch(`/api/ai/recommend?userId=${userId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}
    const profiles = await this.getAllUserProfiles();
    return profiles.filter(p => p.uid !== userId).slice(0, 3);
  }
}

export const dbService = new DataAdapter();
dbService.init();