export type PreferredRole =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Mobile Developer'
  | 'UI/UX Designer'
  | 'AI/ML Engineer'
  | 'Data Scientist'
  | 'Product Manager'
  | 'Marketing'
  | 'Other';

export interface Project {
  name: string;
  description: string;
  github?: string;
  liveLink?: string;
}

export interface HackathonExperience {
  title: string;
  role: string;
  achievement?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  college: string;
  domain: string;
  department: string;
  yearOfStudy: number;
  skills: string[];
  interests: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  preferredRole: PreferredRole;
  bio: string;
  photoUrl: string;
  projects?: Project[];
  hackathonExperience?: HackathonExperience[];
  badges: string[];
  availability: 'open' | 'busy' | 'looking';
  createdAt: string;
  rating: number; // For leaderboard ranking
}

export interface CollegeDomain {
  id: string;
  domain: string; // e.g., "skcet.ac.in"
  name: string;   // e.g., "Sri Krishna College of Engineering and Technology"
  approved: boolean;
  suspended: boolean;
  studentCount: number;
  createdAt: string;
}

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  deadline: string;
  prizePool: string;
  mode: 'online' | 'offline';
  teamSize: string;
  eligibility: string;
  tags: string[];
  description: string;
  image?: string;
  createdAt: string;
}

export interface TeamMember {
  uid: string;
  name: string;
  role: string;
  photoUrl: string;
}

export interface TeamResource {
  title: string;
  link: string;
}

export interface TeamTask {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  college: string;
  requiredSkills: string[];
  maxSize: number;
  openPositions: string[];
  members: TeamMember[];
  hackathonId: string;
  hackathonTitle: string;
  resources: TeamResource[];
  tasks: TeamTask[];
  notes: string;
  createdAt: string;
}

export interface TeamApplication {
  id: string;
  teamId: string;
  teamName: string;
  userId: string;
  userName: string;
  userRole: string;
  userPhoto: string;
  skills: string[];
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string; // Team ID or direct peer roomId: user1_user2
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  timestamp: string;
  file?: {
    name: string;
    url: string;
  };
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'invite' | 'message' | 'application' | 'status' | 'hackathon';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'hackathon' | 'team' | 'student';
  createdAt: string;
}

export interface Swipe {
  id: string;
  swiperId: string;
  swipeeId: string;
  type: 'like' | 'dislike';
  createdAt: string;
}

export interface RosterInvite {
  id: string;
  teamId: string;
  teamName: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface TeamToTeamCollab {
  id: string;
  proposingTeamId: string;
  proposingTeamName: string;
  receivingTeamId: string;
  receivingTeamName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

