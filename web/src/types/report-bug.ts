export interface ReportBugPayload {
  title: string;
  description: string;
  type: string;
  images?: string[];
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  type: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}
