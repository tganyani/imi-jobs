export type JobInputs = {
  companyName: string;
  city: string;
  country: string;
  title: string;
  description: string;
  salary: string;
  type: string;
  sector: string;
};

export type Job = JobInputs & {
  id: string;
  updatedAt: string;
  applications: {
    userId: string;
  }[];
  likes: {
    userId: string;
  }[];
  views: {
    userId: string;
  }[];
  user: {
    email: string;
    id: string;
  };
};

export type Application = {
  id: string;
  letter: string;
  createdAt: string;
  status: string;
  nApplications: number;
  nViews: number;
  jobTitle: string;
  roomId: string;
  jobId: string;
};

export type Applicant = {
  id: string;
  coverLetter: string;
  updatedAt: string;
  status: string;
  candidateName: string;
  userId: string;
  roomId: string;
  roomName: string;
  companyName: string;
};

export type ViewJob = JobInputs & {
  nApplications: number;
  nViews: number;
  views: number;
  updatedAt: string;
  id: string;
  active: boolean;
  applications: {
    userId: string;
  }[];
  likes: {
    userId: string;
  }[];
  user: {
    email: string;
    id: string;
    companyInfo: string;
  };
};
export type Edu = {
  id: string;
  institution: string;
  startAt: string;
  endAt: string;
  archievement: string;
};
export type Employ = {
  position: string;
  startAt: string;
  endAt: string;
  location: string;
  roles: string;
  company: string;
  id: string;
};
export type Skill = {
  id: string;
  title: string;
  level: string;
};
export type ProjectImage = {
  publicId: string;
  url: string;
};

export type Project = {
  id: string;
  description: string;
  title: string;
  images: ProjectImage[];
};

export type Candidate = {
  name: string;
  email: string;
  position: string;
  bio: string;
  country: string;
  city: string;
  active: boolean;
  image: string;
  imagePublicId: string;
  phone: string;
  linkedInn: string;
  faceBook: string;
  website: string;
  telegram: string;
  whatsapp: string;
  companyName: string;
  companyInfo: string;
  address: string;
  cvUrl: string;
  cvPublicId: string;
  eduction: Edu[];
  skills: Skill[];
  languages: Language[];
  employmentHistory: Employ[];
  projects: Project[];
  jobsApplied: Applicant[];
  jobsProposed: {
    vaccancyId: string;
  }[];
  postedId: string;
};

export type Chat = {
  message: string;
  userId: string;
  dateCreated: string;
  delivered: boolean;
  read: boolean;
  id: string;
  sending: boolean | null;
  media: {
    publicId: string;
    url: string;
    originalName: string;
  }[];
};

export type RoomType = {
  id: string;
  name: string;
  dateCreated: string;
  dateUpdated: string;
  chats: Chat[];
  lastSeen: true;
  isOnline: true;
  nUnread: number;
  users: {
    name: string;
    image: string;
    lastSeen: string;
    isOnline: boolean;
    id: string;
  };
};

export type SearchUser = {
  id: string;
  name: string;
  position: string;
  image: string;
};

export type Language = {
  id: string;
  name: string;
  level: string;
};

export type NotificationTyped = {
  fromName: string;
  targetId: string;
  toId: string;
  isCandidate: boolean;
  read: boolean;
  type: string;
  id: string;
  createdAt: string;
};
