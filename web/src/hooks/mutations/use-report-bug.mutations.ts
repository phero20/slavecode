import { useMutation } from "@tanstack/react-query";
import { ReportBugService } from "@/services/report-bug.service";
import type { ReportBugPayload, BugReport } from "@/types/report-bug";

export function useSubmitReportBugMutation() {
  return useMutation<BugReport, Error, ReportBugPayload>({
    mutationFn: (payload: ReportBugPayload) => ReportBugService.submitReportBug(payload),
  });
}
