"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { uploadMedia } from "@/services/upload.service";
import type { UploadMediaPayload, UploadMediaResponse } from "@/types/upload";

/**
 * React Query mutation hook for uploading 1 to N images to Cloudinary.
 * Supports File objects, Base64 strings, or URLs.
 */
export function useUploadMediaMutation(
  options?: UseMutationOptions<UploadMediaResponse, Error, UploadMediaPayload>
) {
  return useMutation<UploadMediaResponse, Error, UploadMediaPayload>({
    mutationFn: (payload: UploadMediaPayload) => uploadMedia(payload),
    ...options,
  });
}

/**
 * Convenient alias for useUploadMediaMutation.
 */
export const useUploadMedia = useUploadMediaMutation;
