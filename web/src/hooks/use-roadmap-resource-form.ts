"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRoadmapResourceDraftStore } from "@/store/use-roadmap-resource-draft-store";
import { useUploadMedia } from "@/hooks/mutations/use-upload.mutations";
import type { CreateRoadmapResourcePayload } from "@/types/roadmap-resource";
import { toast } from "sonner";
import { useAuth, useClerk } from "@clerk/nextjs";

export interface UseRoadmapResourceFormOptions {
  mode: "create" | "edit";
  initialData?: Partial<CreateRoadmapResourcePayload>;
  initialRoadmapIds?: string[];
  onSubmit: (data: CreateRoadmapResourcePayload) => Promise<void>;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function useRoadmapResourceForm({
  mode,
  initialData,
  initialRoadmapIds,
  onSubmit,
}: UseRoadmapResourceFormOptions) {
  const isCreate = mode === "create";
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const draft = useRoadmapResourceDraftStore();

  const [localData, setLocalData] = useState<CreateRoadmapResourcePayload>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    url: initialData?.url || "",
    thumbnailUrl: initialData?.thumbnailUrl || null,
    type: initialData?.type || "",
    author: initialData?.author || "",
    roadmapIds: initialData?.roadmapIds || [],
  });

  useEffect(() => {
    if (!isCreate && initialData) {
      setLocalData({
        title: initialData.title || "",
        description: initialData.description || "",
        url: initialData.url || "",
        thumbnailUrl: initialData.thumbnailUrl || null,
        type: initialData.type || "",
        author: initialData.author || "",
        roadmapIds: initialData.roadmapIds || [],
      });
    }
  }, [isCreate, initialData]);

  useEffect(() => {
    if (!isCreate) return;
    if (!initialRoadmapIds || initialRoadmapIds.length === 0) return;
    if (draft.roadmapIds.length > 0) return;
    draft.setRoadmapIds(initialRoadmapIds);
    // Seed current roadmap only when the draft has none selected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreate]);

  const title = isCreate ? draft.title : localData.title;
  const description = isCreate ? draft.description : localData.description || "";
  const url = isCreate ? draft.url : localData.url;
  const type = isCreate ? draft.type : localData.type;
  const author = isCreate ? draft.author : localData.author || "";
  const roadmapIds = isCreate ? draft.roadmapIds : localData.roadmapIds;
  const thumbnailUrl = isCreate
    ? draft.thumbnailUrl
    : localData.thumbnailUrl || null;

  const setTitle = (val: string) =>
    isCreate
      ? draft.setTitle(val)
      : setLocalData((prev) => ({ ...prev, title: val }));
  const setDescription = (val: string) =>
    isCreate
      ? draft.setDescription(val)
      : setLocalData((prev) => ({ ...prev, description: val }));
  const setUrl = (val: string) =>
    isCreate
      ? draft.setUrl(val)
      : setLocalData((prev) => ({ ...prev, url: val }));
  const setType = (val: string) =>
    isCreate
      ? draft.setType(val)
      : setLocalData((prev) => ({ ...prev, type: val }));
  const setAuthor = (val: string) =>
    isCreate
      ? draft.setAuthor(val)
      : setLocalData((prev) => ({ ...prev, author: val }));
  const toggleRoadmapId = (id: string) =>
    isCreate
      ? draft.toggleRoadmapId(id)
      : setLocalData((prev) => ({
          ...prev,
          roadmapIds: prev.roadmapIds.includes(id)
            ? prev.roadmapIds.filter((item) => item !== id)
            : [...prev.roadmapIds, id],
        }));

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    thumbnailUrl
  );
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (!bannerFile && thumbnailUrl) {
      setBannerPreview(thumbnailUrl);
    }
  }, [thumbnailUrl, bannerFile]);

  const bannerPreviewRef = useRef(bannerPreview);
  useEffect(() => {
    bannerPreviewRef.current = bannerPreview;
  }, [bannerPreview]);

  useEffect(() => {
    return () => {
      if (
        bannerPreviewRef.current &&
        bannerPreviewRef.current.startsWith("blob:")
      ) {
        URL.revokeObjectURL(bannerPreviewRef.current);
      }
    };
  }, []);

  const handleBannerFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed size is 10MB.`
      );
      return;
    }

    if (bannerPreview && bannerPreview.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setBannerFile(file);
    setBannerPreview(objectUrl);
  };

  const handleBannerDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBannerFile(e.dataTransfer.files[0]);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleBannerFile(e.target.files[0]);
    }
  };

  const clearBanner = () => {
    if (bannerPreview && bannerPreview.startsWith("blob:")) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview(null);
    if (isCreate) {
      draft.setThumbnailUrl(null);
    } else {
      setLocalData((prev) => ({ ...prev, thumbnailUrl: null }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: uploadMediaAsync } = useUploadMedia();

  const isValid = useMemo(() => {
    const cleanTitle = title.trim();
    const cleanUrl = url.trim();
    const cleanType = type.trim();
    return (
      cleanTitle.length >= 3 &&
      cleanTitle.length <= 120 &&
      description.trim().length <= 500 &&
      isValidHttpUrl(cleanUrl) &&
      cleanType.length >= 1 &&
      cleanType.length <= 80 &&
      roadmapIds.length >= 1
    );
  }, [title, description, url, type, roadmapIds]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      toast.error("Resource title must be at least 3 characters");
      return;
    }

    if (title.trim().length > 120) {
      toast.error("Resource title cannot exceed 120 characters");
      return;
    }

    if (!isValidHttpUrl(url.trim())) {
      toast.error("Please enter a valid resource URL");
      return;
    }

    if (!type.trim()) {
      toast.error("Resource type is required");
      return;
    }

    if (roadmapIds.length === 0) {
      toast.error("Please select at least one roadmap category");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = thumbnailUrl;

      if (bannerFile) {
        const uploadResult = await uploadMediaAsync({
          files: [bannerFile],
          folder: "slavecode/resources",
        });
        finalImageUrl = uploadResult.urls[0] || uploadResult.url || null;
      }

      const payload: CreateRoadmapResourcePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
        thumbnailUrl: finalImageUrl || null,
        type: type.trim(),
        author: author.trim() || undefined,
        roadmapIds,
      };

      await onSubmit(payload);

      if (isCreate) {
        draft.resetDraft();
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save resource";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    url,
    setUrl,
    type,
    setType,
    author,
    setAuthor,
    roadmapIds,
    toggleRoadmapId,

    bannerPreview,
    isDragActive,
    handleBannerDrag,
    handleBannerDrop,
    handleBannerChange,
    clearBanner,

    isSubmitting,
    isValid,
    handleSubmit,
    resetDraft: draft.resetDraft,
    isCreate,
  };
}
