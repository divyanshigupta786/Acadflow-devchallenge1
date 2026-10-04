export type UrgencyLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user_id: string;
  full_name: string;
  email: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code: string;
  instructor?: string;
  color: string;
  semester: string;
  credits: number;
  progress: number;
  syllabus_topics: string[];
  strong_areas: string[];
  weak_areas: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  course_id?: string;
  course_name?: string;
  course_color?: string;
  title: string;
  description?: string;
  task_type: string;
  deadline?: string;
  estimated_minutes: number;
  remaining_minutes: number;
  actual_minutes: number;
  confidence_score: number;
  priority: UrgencyLevel;
  priority_score: number;
  priority_explanation?: string;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "deferred";
  difficulty: "easy" | "medium" | "hard";
  is_inferred: boolean;
  topics: string[];
  requirements: string[];
  created_at: string;
  updated_at: string;
}

export interface ExtractedTaskItem {
  title: string;
  subject_name?: string;
  course_id?: string;
  task_type: string;
  deadline?: string;
  deadline_raw_text?: string;
  is_deadline_ambiguous: boolean;
  ambiguity_explanation?: string;
  topics: string[];
  requirements: string[];
  estimated_minutes: number;
  is_workload_inferred: boolean;
  priority: UrgencyLevel;
  confidence_score: number;
  notes?: string;
}

export interface InboxExtractResponse {
  extracted_tasks: ExtractedTaskItem[];
  raw_input: string;
  source_type: string;
  ai_provider: string;
  ai_model: string;
  processing_time_ms: number;
  confidence_summary: string;
}

export interface ScheduleBlock {
  id: string;
  user_id: string;
  task_id?: string;
  title: string;
  subject_name?: string;
  plan_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  priority: UrgencyLevel;
  is_completed: boolean;
  is_break: boolean;
  plan_version: string;
  original_start_time?: string;
  revised_reason?: string;
}

export interface ScheduleResponse {
  plan_date: string;
  available_hours: number;
  total_study_minutes: number;
  blocks: ScheduleBlock[];
  ai_explanation: string;
  preserved_tasks: string[];
  moved_tasks: string[];
  is_replanned: boolean;
}

export interface DocumentChunk {
  id: string;
  chunk_index: number;
  content: string;
  page_number: number;
}

export interface Document {
  id: string;
  user_id: string;
  course_id?: string;
  title: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  summary?: string;
  chunk_count: number;
  created_at: string;
}

export interface SourceCitation {
  document_title: string;
  document_id: string;
  page_number: number;
  excerpt: string;
  similarity_score: number;
}

export interface RAGQueryResponse {
  query: string;
  answer: string;
  citations: SourceCitation[];
  is_grounded: boolean;
  ai_provider: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  target_date?: string;
  progress: number;
  milestones: { id: number; title: string; completed: boolean }[];
  created_at: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  assignee_name?: string;
  status: string;
  deadline?: string;
  is_blocked: boolean;
  blocker_reason?: string;
  blocked_by_task_title?: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  deadline?: string;
  status: string;
  members: ProjectMember[];
  project_tasks: ProjectTask[];
  active_blockers_count: number;
  created_at: string;
}

export interface WorkloadDay {
  day: string;
  estimated_hours: number;
  actual_hours: number;
}

export interface SubjectAnalytics {
  course_name: string;
  course_code: string;
  color: string;
  completed_tasks: number;
  pending_tasks: number;
  progress_percentage: number;
  total_hours_spent: number;
}

export interface AccuracyMetric {
  category: string;
  estimated_avg_mins: number;
  actual_avg_mins: number;
  ratio: number;
}

export interface AIInsightItem {
  id: string;
  type: string;
  title: string;
  description: string;
  evidence: string;
}

export interface AnalyticsData {
  completion_rate_percentage: number;
  total_tasks_completed: number;
  total_tasks_pending: number;
  total_tasks_overdue: number;
  total_study_hours: number;
  weekly_workload: WorkloadDay[];
  subject_distribution: SubjectAnalytics[];
  estimation_accuracy: AccuracyMetric[];
  ai_insights: AIInsightItem[];
  most_productive_time_window: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  urgency: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface StudentPreferences {
  preferred_study_duration: number;
  break_duration: number;
  preferred_study_time: string;
  available_daily_hours: number;
  strong_subjects: string[];
  weak_subjects: string[];
  programming_task_multiplier: number;
  reading_task_multiplier: number;
}

export interface LLMConfig {
  provider: string;
  model: string;
  ollama_base_url: string;
  status: string;
  active_model_details?: string;
}
