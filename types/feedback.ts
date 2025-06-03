// Feedback type for storing user feedback submissions
export interface Feedback {
  id: string;
  issue_type: string;
  description: string;
  email: string;
  file_url?: string | null;
  created_at: string;
}
