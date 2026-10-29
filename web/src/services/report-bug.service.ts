import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { BugReport, ReportBugPayload } from "@/types/report-bug";

export class ReportBugService {
  static async submitReportBug(payload: ReportBugPayload): Promise<BugReport> {
    const response = await apiClient.post<ApiResponse<BugReport>>(
      "/report-bug",
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to submit bug report");
    }

    return response.data.data;
  }
}
