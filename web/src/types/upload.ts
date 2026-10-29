export interface UploadMediaPayload {
  /**
   * One or more File objects, Base64 strings, or image URLs
   */
  files: File | File[] | string | string[];
  /**
   * Optional destination folder in Cloudinary (e.g. 'slavecode/projects', 'slavecode/bug_reports')
   */
  folder?: string;
}

export interface UploadMediaResponse {
  /**
   * Array of all uploaded HTTPS Cloudinary URLs
   */
  urls: string[];
  /**
   * Primary uploaded URL (convenience accessor for single-file uploads)
   */
  url: string | null;
  /**
   * Total count of successfully uploaded images
   */
  count: number;
}
