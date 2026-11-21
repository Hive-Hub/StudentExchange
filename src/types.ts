export interface PlatformStat {
  id: number;
  stat_key: string;
  label: string;
  value: string;
  note: string;
  updated_at: string;
}

export interface LearningResource {
  id: number;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  is_free: number;
  price_label: string;
  provider: string;
  duration: string;
  resource_url: string;
  image_url: string;
  is_featured: number;
  is_demo: number;
  created_at: string;
}

export interface StudentProject {
  id: number;
  title: string;
  category: 'AI/ML' | 'IoT' | 'Web Development' | 'Mobile Apps' | 'Cloud';
  description: string;
  tech_stack: string;
  author_name: string;
  university: string;
  github_url: string;
  demo_url: string;
  image_url: string;
  status: 'approved' | 'pending' | 'rejected';
  is_featured: number;
  is_demo: number;
  created_at: string;
}

export interface Competition {
  id: number;
  title: string;
  type:
    | 'Hackathons'
    | 'AWS challenges'
    | 'Coding contests'
    | 'Student innovation programs'
    | 'Internships'
    | 'Workshops';
  organizer: string;
  description: string;
  deadline: string;
  eligibility: string;
  prize_or_benefit: string;
  registration_url: string;
  location: string;
  is_demo: number;
  created_at: string;
}

export interface CommunityEvent {
  id: number;
  title: string;
  community_group: string;
  event_type: string;
  event_status: 'upcoming' | 'past';
  event_date: string;
  location: string;
  description: string;
  highlight_note: string;
  image_url: string;
  registration_url: string;
  is_aws_initiative: number;
  is_demo: number;
  created_at: string;
}

export interface AWSLearningResource {
  id: number;
  title: string;
  service_focus: string;
  level: 'Foundational' | 'Associate' | 'Builder Lab';
  format: string;
  description: string;
  duration: string;
  resource_url: string;
  is_student_led: number;
  is_demo: number;
  created_at: string;
}

export interface ContactSubmission {
  id: number;
  submission_type: 'general' | 'community_join';
  reference_id: number | null;
  reference_title: string;
  sender_name: string;
  sender_email: string;
  institution: string;
  subject: string;
  message: string;
  status: 'new' | 'reviewed';
  created_at: string;
}
