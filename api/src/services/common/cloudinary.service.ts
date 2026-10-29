import { v2 as cloudinary, type UploadApiResponse, type UploadApiErrorResponse } from 'cloudinary';
import { config } from '../../configs/env';
import { AppError } from '../../utils/app-error';

export interface UploadMediaResult {
  urls: string[];
  url: string | null;
  count: number;
}

export interface UploadMediaOptions {
  files?: unknown;
  folder?: string;
}

export interface ICloudinaryService {
  uploadImage(file: File | string, folder?: string): Promise<string>;
  uploadImages(files: (File | string)[], folder?: string): Promise<string[]>;
  uploadMedia(options: UploadMediaOptions): Promise<UploadMediaResult>;
  deleteImage(publicIdOrUrl: string): Promise<boolean>;
}

export class CloudinaryService implements ICloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
    });
  }

  /**
   * Uploads an image to Cloudinary.
   * Accepts either a base64 string, an existing HTTP(S) URL, or a native Web `File` object.
   * 
   * @param file - Base64 string, URL, or File object.
   * @param folder - The folder name in Cloudinary (e.g., 'slavecode/projects', 'slavecode/bug_reports').
   * @returns The secure URL of the uploaded image.
   */
  public async uploadImage(file: File | string, folder: string = 'slavecode/general'): Promise<string> {
    // If it's already a hosted URL, return it directly
    if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
      return file;
    }

    let fileData = file;

    // If it's a web File (e.g., from Hono multipart form data), convert it to Base64
    if (typeof file !== 'string' && file instanceof File) {
      // 10MB limit (Cloudinary maximum: 10485760 bytes)
      if (file.size > 10485760) {
        throw AppError.badRequest(
          `File "${file.name || 'image'}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 10MB.`
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = `data:${file.type || 'image/png'};base64,${buffer.toString('base64')}`;
      fileData = base64String;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        fileData as string,
        {
          folder,
          resource_type: 'image',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            const errorMsg = error?.message || 'Unknown error during Cloudinary upload';
            reject(AppError.badRequest(errorMsg));
          } else {
            resolve(result.secure_url);
          }
        }
      );
    });
  }

  /**
   * Uploads 1 to N images to Cloudinary in parallel.
   *
   * @param files - Array of File objects, base64 strings, or URLs.
   * @param folder - The folder name in Cloudinary.
   * @returns Array of secure URLs in the same order as the input.
   */
  public async uploadImages(
    files: (File | string)[],
    folder: string = 'slavecode/general'
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  }

  /**
   * Universal upload method for 1 to N images.
   * Handles validation, normalization, and parallel upload to Cloudinary.
   */
  public async uploadMedia(options: UploadMediaOptions): Promise<UploadMediaResult> {
    const { files, folder } = options;

    if (!files) {
      throw AppError.badRequest("No image files provided for upload");
    }

    const inputList = Array.isArray(files) ? files : [files];

    // Filter valid File objects, Base64 strings, or URLs
    const filesToUpload: (File | string)[] = inputList.filter(
      (item): item is File | string =>
        (typeof item === "object" && item !== null && item instanceof File) ||
        (typeof item === "string" && item.trim().length > 0)
    );

    if (filesToUpload.length === 0) {
      throw AppError.badRequest("No valid image files detected");
    }

    const targetFolder =
      typeof folder === "string" && folder.trim().length > 0
        ? folder.trim()
        : "slavecode/general";

    const urls = await this.uploadImages(filesToUpload, targetFolder);

    return {
      urls,
      url: urls[0] ?? null,
      count: urls.length,
    };
  }

  /**
   * Deletes an image from Cloudinary using its secure URL or public ID.
   * @param publicIdOrUrl - The public ID or the full secure URL of the image.
   * @returns Boolean indicating success.
   */
  public async deleteImage(publicIdOrUrl: string): Promise<boolean> {
    let publicId = publicIdOrUrl;

    // Extract public ID if a full Cloudinary URL is provided
    if (publicIdOrUrl.startsWith('http')) {
      const parts = publicIdOrUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const uploadIndex = parts.findIndex(p => p === 'upload');
      
      // Handle the folder path structure inside Cloudinary
      const folderPath = parts.slice(uploadIndex + 2, -1).join('/');
      const fileNameWithoutExt = lastPart.split('.')[0];
      publicId = folderPath ? `${folderPath}/${fileNameWithoutExt}` : fileNameWithoutExt;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        (error: UploadApiErrorResponse | undefined, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.result === 'ok');
          }
        }
      );
    });
  }
}
