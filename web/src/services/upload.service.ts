import { apiClient } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { UploadMediaPayload, UploadMediaResponse } from "@/types/upload";

/**
 * Universal media uploader for 1 to N images.
 * Automatically handles Web File objects (via FormData) or Base64/URL strings (via JSON).
 */
export async function uploadMedia(
  payload: UploadMediaPayload
): Promise<UploadMediaResponse> {
  const { files, folder } = payload;

  const hasFileObject =
    files instanceof File ||
    (Array.isArray(files) && files.some((f) => typeof f === "object" && f instanceof File));

  try {
    let response;

    if (hasFileObject) {
      const formData = new FormData();
      const fileList = Array.isArray(files) ? files : [files];

      fileList.forEach((item) => {
        formData.append("files", item);
      });

      if (folder) {
        formData.append("folder", folder);
      }

      response = await apiClient.post<ApiResponse<UploadMediaResponse>>(
        "/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } else {
      const fileList = Array.isArray(files) ? files : [files];
      response = await apiClient.post<ApiResponse<UploadMediaResponse>>(
        "/upload",
        {
          images: fileList,
          folder,
        }
      );
    }

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Failed to upload image(s)");
    }

    return response.data.data;
  } catch (error: any) {
    const serverMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to upload image(s)";
    throw new Error(serverMessage);
  }
}

export class UploadService {
  static uploadMedia = uploadMedia;
}
