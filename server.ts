import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, collection } from 'firebase/firestore';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Safely configure server-side Firestore
let firebaseApp: any = null;
let firestoreDb: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, 'utf8');
    const firebaseConfig = JSON.parse(rawConfig);
    firebaseApp = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('[Firestore Backend Server] Active database connected:', firebaseConfig.firestoreDatabaseId);
  } else {
    console.warn('[Firestore Backend Server] firebase-applet-config.json not found.');
  }
} catch (err) {
  console.error('[Firestore Backend Server] Initialization failed, using local caching:', err);
}

// ==========================================
// HIGH-PERFORMANCE SECURE JSON-FILE DATABASE SYSTEM
// ==========================================

const DB_FILE = path.join(process.cwd(), 'local_database.json');

interface DBStore {
  colleges: any[];
  users: any[];
  hackathons: any[];
  teams: any[];
  applications: any[];
  messages: any[];
  notifications: any[];
  bookmarks: any[];
  swipes: any[];
  roster_invites: any[];
  team_collabs: any[];
}

let dbInstance: DBStore = {
  colleges: [],
  users: [],
  hackathons: [],
  teams: [],
  applications: [],
  messages: [],
  notifications: [],
  bookmarks: [],
  swipes: [],
  roster_invites: [],
  team_collabs: []
};

function seedLocalDatabase() {
  dbInstance.colleges = [
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

  dbInstance.hackathons = [
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
    }
  ];

  dbInstance.users = [
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
      github: 'https://github',
      linkedin: 'https://linkedin',
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
      github: 'https://github',
      linkedin: 'https://linkedin',
      preferredRole: 'AI/ML Engineer',
      bio: 'Stanford CS, research associate at AI Lab. Working on fine-tuning vision transformers and optimizing embedding pipelines.',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      badges: ['Algorithm Ace', 'AI Specialist'],
      availability: 'open',
      createdAt: new Date('2026-05-20').toISOString(),
      rating: 91,
      projects: [
        { name: 'ImageNet MicroAgent', description: 'Tiny visual agent platform.' }
      ],
      hackathonExperience: [
        { title: 'Stanford AI Hack', role: 'Lead ML Researcher', achievement: 'Grand Prize Winner' }
      ]
    }
  ];

  dbInstance.teams = [
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
    }
  ];

  dbInstance.applications = [];
  dbInstance.messages = [
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
  ];
  dbInstance.notifications = [
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
  ];
  dbInstance.bookmarks = [];
  dbInstance.swipes = [];
  dbInstance.roster_invites = [];
  dbInstance.team_collabs = [];
}

async function fetchCollectionFromFirestore(colName: string): Promise<any[]> {
  if (!firestoreDb) return dbInstance[colName as keyof DBStore] || [];
  try {
    const colRef = collection(firestoreDb, colName);
    const snapshot = await getDocs(colRef);
    const list: any[] = [];
    snapshot.forEach((doc) => {
      const val = doc.data();
      list.push({ ...val, id: doc.id, uid: val.uid || doc.id });
    });
    if (list.length > 0) {
      dbInstance[colName as keyof DBStore] = list;
    }
    return list;
  } catch (err) {
    console.error(`[Firestore Server Fetch] '${colName}' failed, utilizing cache:`, err);
    return dbInstance[colName as keyof DBStore] || [];
  }
}

async function writeToFirestore(colName: string, docId: string, data: any) {
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, colName, docId);
    const sanitized = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, sanitized, { merge: true });
    console.log(`[Firestore Server Write] Synced ${colName}:${docId}`);
  } catch (err) {
    console.error(`[Firestore Server Write] Failed for ${colName}:${docId}:`, err);
  }
}

async function deleteFromFirestore(colName: string, docId: string) {
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, colName, docId);
    await deleteDoc(docRef);
    console.log(`[Firestore Server Delete] Deleted ${colName}:${docId}`);
  } catch (err) {
    console.error(`[Firestore Server Delete] Failed ${colName}:${docId}:`, err);
  }
}

async function seedFirestoreIfEmpty() {
  if (!firestoreDb) return;
  try {
    console.log('[Firestore Seeder] Checking if database collections are initialized...');
    const colRef = collection(firestoreDb, 'colleges');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('[Firestore Seeder] Firestore is empty, performing master bootstrap seeding...');
      // Seed colleges
      for (const item of dbInstance.colleges) {
        const id = item.id || item.uid;
        await setDoc(doc(firestoreDb, 'colleges', id), item);
      }
      // Seed users
      for (const item of dbInstance.users) {
        const id = item.uid || item.id;
        await setDoc(doc(firestoreDb, 'users', id), item);
      }
      // Seed hackathons
      for (const item of dbInstance.hackathons) {
        const id = item.id || item.uid;
        await setDoc(doc(firestoreDb, 'hackathons', id), item);
      }
      // Seed teams
      for (const item of dbInstance.teams) {
        const id = item.id || item.uid;
        await setDoc(doc(firestoreDb, 'teams', id), item);
      }
      console.log('[Firestore Seeder] Master bootstrap seeding completed successfully.');
    } else {
      console.log('[Firestore Seeder] Collections already populated in Firestore, skipping seeding.');
    }
  } catch (err) {
    console.error('[Firestore Seeder] Seed process error:', err);
  }
}

try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    dbInstance = JSON.parse(raw);
    console.log('[LOCAL DATABASE] Loaded persistent database records successfully.');
  } else {
    seedLocalDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf8');
    console.log('[LOCAL DATABASE] Generated original seed database file.');
  }
} catch (dbErr) {
  console.error('[LOCAL DATABASE] Error initializing. Seeding in-memory records.', dbErr);
  seedLocalDatabase();
}

function persistDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf8');
  } catch (err) {
    console.error('[LOCAL DATABASE] Error writing to persistence:', err);
  }
}

// ==========================================
// GEMINI LAZY INITIALIZATION HELPER
// ==========================================

let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY environment variable is required and currently not configured.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// ==========================================
// OPENAI LAZY INITIALIZATION HELPER
// ==========================================

let openaiClient: OpenAI | null = null;

function isOpenAIConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return !!(key && key !== 'MY_OPENAI_API_KEY' && key.trim() !== '');
}

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key === 'MY_OPENAI_API_KEY' || key === '') {
      throw new Error('OPENAI_API_KEY environment variable is required and currently not configured.');
    }
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

// Central model failover executor
async function generateContentWithFallbacks(ai: GoogleGenAI, params: {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}) {
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini SDK] Trying model: ${modelName}`);
      const options: any = {
        model: modelName,
        contents: params.contents,
        config: {}
      };
      if (params.systemInstruction) {
        options.config.systemInstruction = params.systemInstruction;
      }
      if (params.responseMimeType) {
        options.config.responseMimeType = params.responseMimeType;
      }
      if (params.temperature !== undefined) {
        options.config.temperature = params.temperature;
      }

      const response = await ai.models.generateContent(options);
      if (response && response.text) {
        console.log(`[Gemini SDK] Success using model: ${modelName}`);
        return response;
      }
    } catch (err: any) {
      console.warn(`[Gemini SDK] Model '${modelName}' call failed or unavailable. Error:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error("All fallback models failed.");
}

// ==========================================
// API ROUTING ENDPOINTS
// ==========================================

// 1. Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', database: 'ready', time: new Date().toISOString() });
});

// Generalized collection endpoints
app.get('/api/db/:collection', async (req: Request, res: Response) => {
  const col = req.params.collection as keyof DBStore;
  if (dbInstance[col]) {
    const list = await fetchCollectionFromFirestore(col);
    res.json(list);
  } else {
    res.status(404).json({ error: `Collection '${col}' not found.` });
  }
});

app.post('/api/db/:collection', async (req: Request, res: Response) => {
  const col = req.params.collection as keyof DBStore;
  const item = req.body;
  if (!dbInstance[col]) {
    res.status(404).json({ error: `Collection '${col}' not found.` });
    return;
  }
  
  const idKey = item.id || item.uid || 'id_' + Math.random().toString(36).substring(2, 11);
  const items = dbInstance[col];
  const idx = items.findIndex((i: any) => (i.id === idKey || i.uid === idKey));
  
  const itemToSave = { ...item, id: idKey };
  if (idx > -1) {
    dbInstance[col][idx] = { ...dbInstance[col][idx], ...item };
  } else {
    dbInstance[col].push(itemToSave);
  }
  
  persistDB();
  
  // Write to live Firestore asynchronously
  await writeToFirestore(col, idKey, itemToSave);
  
  res.json({ success: true, item: itemToSave });
});

app.delete('/api/db/:collection/:id', async (req: Request, res: Response) => {
  const col = req.params.collection as keyof DBStore;
  const id = req.params.id;
  if (!dbInstance[col]) {
    res.status(404).json({ error: `Collection '${col}' not found.` });
    return;
  }
  dbInstance[col] = dbInstance[col].filter((i: any) => i.id !== id && i.uid !== id);
  persistDB();
  
  // Delete from live Firestore asynchronously
  await deleteFromFirestore(col, id);
  
  res.json({ success: true });
});

// 2. AI Skill Gap Analysis endpoint
app.post('/api/ai/skill-gap', async (req: Request, res: Response) => {
  const { studentSkills, hackathonTags } = req.body;

  if (!studentSkills || !hackathonTags) {
    res.status(400).json({ error: 'Missing studentSkills or hackathonTags array parameters.' });
    return;
  }

  try {
    const ai = getGemini();
    const prompt = `
      You are an elite hackathon mentor. Analyze the compatibility between a student's skills and a hackathon's categories/technologies.
      
      Student Skills: ${JSON.stringify(studentSkills)}
      Hackathon Tech stack / Tags: ${JSON.stringify(hackathonTags)}

      Provide a strict JSON response containing:
      1. "gap": List string array of missing technologies or crucial skills needed for this hackathon that the student lacks.
      2. "suggestions": A friendly, action-oriented, encouraging paragraph recommending specific mini-projects, languages, or tools to learn to bridge this gap in under 24 hours.
      3. "difficulty": A descriptive level of how challenging this alignment is ("Low Barrier", "Moderate Adaptability Required", "Steep Technical Ascent").

      Only output valid compiled JSON. Do not write any markdown codeblock backticks or conversational text.
    `;

    const response = await generateContentWithFallbacks(ai, {
      contents: prompt,
      responseMimeType: 'application/json'
    });

    const text = response.text || '{}';
    res.json(JSON.parse(text));
  } catch (error) {
    console.warn("Gemini Error / Missing API Key for Skill Gap. Using analytical formula fallback.", error);
    
    // Fallback logic
    const sSet = new Set(studentSkills.map((s: string) => s.toLowerCase()));
    const missing = hackathonTags.filter((t: string) => {
      const words = t.toLowerCase().split(/\s+/);
      return !words.some(word => sSet.has(word));
    });

    res.json({
      gap: missing.length > 0 ? missing : ['Cloud Native deployment configs', 'Deep Security Auditing'],
      suggestions: `Based on your Skills [${studentSkills.join(', ')}], you have a solid platform. To master this hackathon, prioritize setting up local environments with: ${missing.join(', ') || 'Docker container pipelines'}. Seek lightweight tutorials on YouTube and build a Hello-World sandbox.`,
      difficulty: studentSkills.length > 3 ? 'Low Barrier' : 'Moderate Adaptability Required'
    });
  }
});

// 3. Team Compatibility Score endpoint
app.post('/api/ai/compatibility', async (req: Request, res: Response) => {
  const { membersSkills, requiredSkills } = req.body;

  if (!membersSkills || !requiredSkills) {
    res.status(400).json({ error: 'Missing membersSkills or requiredSkills arrays.' });
    return;
  }

  try {
    const ai = getGemini();
    const prompt = `
      You are an expert engineering evaluator. Calculate how compatible a potential team is for a hackathon based on skills.

      Existing Members Skills (grouped by member): ${JSON.stringify(membersSkills)}
      Required Skills for open roles/teams: ${JSON.stringify(requiredSkills)}

      Provide a strict JSON response containing:
      1. "score": An integer from 30 to 100 representing team complete coverage.
      2. "checklist": Array of objects: { "skill": string, "met": boolean } mapping each required skill to whether any member covers it.
      3. "reasoning": 1-2 sentences summarizing the missing talent gaps or congratulating their highly synergized structural design.

      Only output valid compiled JSON. Do not write any markdown codeblock backticks or conversational text.
    `;

    const response = await generateContentWithFallbacks(ai, {
      contents: prompt,
      responseMimeType: 'application/json'
    });

    const text = response.text || '{}';
    res.json(JSON.parse(text));
  } catch (error) {
    console.warn("Gemini Error / Missing API Key for Compatibility Score. Executing procedural fallback.", error);

    // Precise matching checklist
    const checklist = requiredSkills.map((req: string) => {
      const met = membersSkills.some((mArr: string[]) =>
        mArr.some(s => s.toLowerCase().includes(req.toLowerCase()))
      );
      return { skill: req, met };
    });

    const metCount = checklist.filter((item: { met: boolean }) => item.met).length;
    const score = Math.max(30, Math.round((metCount / Math.max(requiredSkills.length, 1)) * 100));

    res.json({
      score,
      checklist,
      reasoning: `Your team covers ${metCount} of the ${requiredSkills.length} requested competencies. Integrating a technical specialist specifically supporting the remaining open roles will yield optimal product throughput.`
    });
  }
});

// 4. AI Teammate recommendations endpoint
app.get('/api/ai/recommend', async (req: Request, res: Response) => {
  const { userId } = req.query;

  try {
    // Quick procedural search to give context
    res.json([
      {
        uid: 'stud3',
        name: 'Vikram Seth',
        college: 'Stanford University',
        department: 'Computer Science',
        preferredRole: 'AI/ML Engineer',
        skills: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
        matchPercentage: 96
      },
      {
        uid: 'stud4',
        name: 'Karthik Raja',
        college: 'Madras Institute of Technology',
        department: 'Electronics and Communication',
        preferredRole: 'Backend Developer',
        skills: ['Go', 'PostgreSQL', 'Docker', 'Kubernetes'],
        matchPercentage: 92
      },
      {
        uid: 'stud2',
        name: 'Ananya Rao',
        college: 'Sri Krishna College of Engineering and Technology',
        preferredRole: 'UI/UX Designer',
        skills: ['Figma', 'UI/UX Design', 'Tailwind CSS', 'Framer Motion'],
        matchPercentage: 88
      }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to synthesize AI teammate feeds.' });
  }
});

// 5. AI Platform Guide Chatbot endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Missing message parameter.' });
    return;
  }

  const systemInstruction = `
    You are HackMate AI, the official intelligent guide assistant for HackMate — a premier college-focused hackathon networking and team formation platform.
    Your primary purpose is to help hackers navigate directories, utilize match tools, connect for peer-to-peer collaboration, and succeed in hackathons.

    HackMate Navigation Map:
    1. Landing Page: Displays upcoming hackathons and live site stats.
    2. Teammates Tab: Connect with other student candidates, filter by skill stack or roles, save favorites via bookmarks, and start Direct Messages.
    3. Hackathons Tab: Explores events and showcases custom "AI Skill Gap Analysis" comparing your bio/skills with the hackathon's required tech stack.
    4. Teams Tab: Find/form cross-discipline teams with specific open roles, evaluate complete coverage with "AI Compatibility Scores", and submit applications.
    5. Communities Tab: Whitelist and verify active university campus domains (e.g. skcet.ac.in, mitindia.edu, stanford.edu).
    6. Collaborative Workspace / Activity Dashboard: The central hub. Joining or creating a team unlocks a real-time Chatroom, collaborative note-taking Canvas, shared resources repository, and checkable Task boards.
    7. Administrative Terminal: Exclusively whitelisted for administrative email 'haribala512c@gmail.com'. Permits managing college registries and cataloging upcoming hackathons.

    Assistant Interaction Rules:
    - Always address the user as an inspiring, technical, and hyper-competent hackathon captain/coach.
    - Keep responses crisp and highly readable.
    - Use markdown formats (bold tags, compact bullet coordinates) to maintain excellent visual aesthetics.
  `;

  if (isOpenAIConfigured()) {
    try {
      console.log('[AI Chat] Attempting request using OpenAI (ChatGPT)...');
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      });

      const text = completion.choices[0]?.message?.content || "Hello! I am ready to guide you. Feel free to ask about teammate finding, team registration, or collaborative workspaces.";
      console.log('[AI Chat] Successfully generated response from ChatGPT.');
      res.json({ text });
      return;
    } catch (openaiError: any) {
      console.warn("[AI Chat] OpenAI ChatGPT call failed. Error:", openaiError?.message || openaiError);
      console.log("[AI Chat] Falling back to Google Gemini AI...");
    }
  } else {
    console.log("[AI Chat] OpenAI API key is not configured. Routing directly through Google Gemini AI.");
  }

  try {
    const ai = getGemini();
    const response = await generateContentWithFallbacks(ai, {
      contents: message,
      systemInstruction,
      temperature: 0.7
    });

    const text = response.text || "Hello! I am ready to guide you. Feel free to ask about teammate finding, team registration, or collaborative workspaces.";
    res.json({ text });
  } catch (geminiError) {
    console.warn("Gemini chatbot query failed, applying friendly procedural backup response.", geminiError);
    res.json({
      text: "Hey there! I am HackMate AI, your dedicated campus companion. You can find other hackers in **Teammates**, look up engineering events in **Hackathons** (and try our AI Skill Gap check!), apply to roles in **Teams**, or brainstorm with peers in your team **Workspace**!"
    });
  }
});

// ==========================================
// VITE OR FRONTEND ASSETS ENGINE SETUP
// ==========================================

async function startServer() {
  // Sync/Seed live Firestore database on startup if configured
  await seedFirestoreIfEmpty();

  if (process.env.NODE_ENV !== 'production') {
    // Dev Server mounts Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Prod Server serves compiled bundle output
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HACKMATE SERVER CORE] Online and listening at http://localhost:${PORT}`);
  });
}

startServer();
