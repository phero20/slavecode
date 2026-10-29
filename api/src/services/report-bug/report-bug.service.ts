import { type IReportBugRepository } from "../../repositories/report-bug/report-bug.repository";
import { type ICloudinaryService } from "../common/cloudinary.service";
import { type BugReport } from "../../db/schema";
import { AppError } from "../../utils/app-error";

export interface IReportBugService {
  submitReport(payload: {
    title: string;
    description: string;
    type: string;
    images?: (File | string)[] | File | string;
  }): Promise<BugReport>;
}

export class ReportBugService implements IReportBugService {
  private readonly reportBugRepository: IReportBugRepository;
  private readonly cloudinaryService: ICloudinaryService;

  constructor({
    reportBugRepository,
    cloudinaryService,
  }: {
    reportBugRepository: IReportBugRepository;
    cloudinaryService: ICloudinaryService;
  }) {
    this.reportBugRepository = reportBugRepository;
    this.cloudinaryService = cloudinaryService;
  }

  async submitReport(payload: {
    title: string;
    description: string;
    type: string;
    images?: (File | string)[] | File | string;
  }): Promise<BugReport> {
    const { title, description, type, images } = payload;
    
    if (!title || !description || !type) {
      throw AppError.badRequest("Missing required fields: title, description, and type are mandatory.");
    }

    // Upload images in parallel via universal uploadMedia service if provided
    let uploadedUrls: string[] = [];
    const hasImages = Array.isArray(images) ? images.length > 0 : Boolean(images);
    if (hasImages) {
      const uploadResult = await this.cloudinaryService.uploadMedia({
        files: images,
        folder: "slavecode/bug_reports",
      });
      uploadedUrls = uploadResult.urls;
    }

    return this.reportBugRepository.createReport({
      title,
      description,
      type,
      images: uploadedUrls,
    });
  }
}
