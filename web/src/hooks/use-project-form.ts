"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useProjectDraftStore } from "@/store/use-project-draft-store";
import { useUploadMedia } from "@/hooks/mutations/use-upload.mutations";
import type { CreateProjectPayload, ProjectDifficulty } from "@/types/project";
import { toast } from "sonner";
import { useAuth, useClerk } from "@clerk/nextjs";

export interface UseProjectFormOptions {
  mode: "create" | "edit";
  initialData?: Partial<CreateProjectPayload>;
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
}

export function useProjectForm({
  mode,
  initialData,
  onSubmit,
}: UseProjectFormOptions) {
  const isCreate = mode === "create";
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  // Persistent Zustand draft store for create mode
  const draft = useProjectDraftStore();

  // Local state for edit mode (does not overwrite create draft)
  const [localData, setLocalData] = useState<CreateProjectPayload>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    difficulty: initialData?.difficulty || "beginner",
    roadmapIds: initialData?.roadmapIds || [],
    topics: initialData?.topics || [],
    skills: initialData?.skills || [],
    content: {
      overview: initialData?.content?.overview || "",
      markdown: initialData?.content?.markdown || "",
      previewImage: initialData?.content?.previewImage || null,
      requirements: initialData?.content?.requirements || [],
      checklist: initialData?.content?.checklist || [],
      bonusChallenges: initialData?.content?.bonusChallenges || [],
      suggestedTechStack: initialData?.content?.suggestedTechStack || [],
    },
  });

  // Sync initialData when fetched asynchronously in edit mode
  useEffect(() => {
    if (!isCreate && initialData) {
      setLocalData({
        title: initialData.title || "",
        description: initialData.description || "",
        difficulty: initialData.difficulty || "beginner",
        roadmapIds: initialData.roadmapIds || [],
        topics: initialData.topics || [],
        skills: initialData.skills || [],
        content: {
          overview: initialData.content?.overview || "",
          markdown: initialData.content?.markdown || "",
          previewImage: initialData.content?.previewImage || null,
          requirements: initialData.content?.requirements || [],
          checklist: initialData.content?.checklist || [],
          bonusChallenges: initialData.content?.bonusChallenges || [],
          suggestedTechStack: initialData.content?.suggestedTechStack || [],
        },
      });
    }
  }, [isCreate, initialData]);

  // State values based on mode
  const title = isCreate ? draft.title : localData.title;
  const description = isCreate ? draft.description : localData.description;
  const difficulty = isCreate ? draft.difficulty : localData.difficulty;
  const roadmapIds = isCreate ? draft.roadmapIds : localData.roadmapIds;
  const topics = (isCreate ? draft.topics : localData.topics) || [];
  const skills = (isCreate ? draft.skills : localData.skills) || [];
  const overview = isCreate ? draft.overview : localData.content?.overview || "";
  const markdown = isCreate ? draft.markdown : localData.content?.markdown || "";
  const previewImage = isCreate
    ? draft.previewImage
    : localData.content?.previewImage || null;
  const requirements = isCreate
    ? draft.requirements
    : localData.content?.requirements || [];
  const checklist = isCreate
    ? draft.checklist
    : localData.content?.checklist || [];
  const bonusChallenges = isCreate
    ? draft.bonusChallenges
    : localData.content?.bonusChallenges || [];
  const suggestedTechStack = isCreate
    ? draft.suggestedTechStack
    : localData.content?.suggestedTechStack || [];

  // Update setters
  const setTitle = (val: string) =>
    isCreate
      ? draft.setTitle(val)
      : setLocalData((prev) => ({ ...prev, title: val }));
  const setDescription = (val: string) =>
    isCreate
      ? draft.setDescription(val)
      : setLocalData((prev) => ({ ...prev, description: val }));
  const setDifficulty = (val: ProjectDifficulty) =>
    isCreate
      ? draft.setDifficulty(val)
      : setLocalData((prev) => ({ ...prev, difficulty: val }));
  const toggleRoadmapId = (id: string) =>
    isCreate
      ? draft.toggleRoadmapId(id)
      : setLocalData((prev) => ({
          ...prev,
          roadmapIds: prev.roadmapIds.includes(id)
            ? prev.roadmapIds.filter((item) => item !== id)
            : [...prev.roadmapIds, id],
        }));

  const addTopic = (val: string) => {
    const clean = val.trim().toLowerCase();
    if (!clean) return;
    if (isCreate) {
      draft.addTopic(clean);
    } else {
      setLocalData((prev) => ({
        ...prev,
        topics: prev.topics?.includes(clean)
          ? prev.topics
          : [...(prev.topics || []), clean],
      }));
    }
  };
  const removeTopic = (val: string) =>
    isCreate
      ? draft.removeTopic(val)
      : setLocalData((prev) => ({
          ...prev,
          topics: (prev.topics || []).filter((t) => t !== val),
        }));

  const addSkill = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    if (isCreate) {
      draft.addSkill(clean);
    } else {
      setLocalData((prev) => ({
        ...prev,
        skills: prev.skills?.includes(clean)
          ? prev.skills
          : [...(prev.skills || []), clean],
      }));
    }
  };
  const removeSkill = (val: string) =>
    isCreate
      ? draft.removeSkill(val)
      : setLocalData((prev) => ({
          ...prev,
          skills: (prev.skills || []).filter((s) => s !== val),
        }));

  const setOverview = (val: string) =>
    isCreate
      ? draft.setOverview(val)
      : setLocalData((prev) => ({
          ...prev,
          content: { ...prev.content, overview: val },
        }));

  const setMarkdown = (val: string) =>
    isCreate
      ? draft.setMarkdown(val)
      : setLocalData((prev) => ({
          ...prev,
          content: { ...prev.content, markdown: val },
        }));

  // Requirements List
  const addRequirement = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    if (isCreate) {
      draft.addRequirement(clean);
    } else {
      setLocalData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          requirements: [...(prev.content?.requirements || []), clean],
        },
      }));
    }
  };
  const removeRequirement = (idx: number) =>
    isCreate
      ? draft.removeRequirement(idx)
      : setLocalData((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            requirements: (prev.content?.requirements || []).filter(
              (_, i) => i !== idx
            ),
          },
        }));

  // Checklist List
  const addChecklistItem = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    if (isCreate) {
      draft.addChecklistItem(clean);
    } else {
      setLocalData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          checklist: [...(prev.content?.checklist || []), clean],
        },
      }));
    }
  };
  const removeChecklistItem = (idx: number) =>
    isCreate
      ? draft.removeChecklistItem(idx)
      : setLocalData((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            checklist: (prev.content?.checklist || []).filter(
              (_, i) => i !== idx
            ),
          },
        }));

  // Suggested Tech Stack
  const addSuggestedTech = (val: string) => {
    const clean = val.trim();
    if (!clean) return;
    if (isCreate) {
      draft.addSuggestedTech(clean);
    } else {
      setLocalData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          suggestedTechStack: [
            ...(prev.content?.suggestedTechStack || []),
            clean,
          ],
        },
      }));
    }
  };
  const removeSuggestedTech = (val: string) =>
    isCreate
      ? draft.removeSuggestedTech(val)
      : setLocalData((prev) => ({
          ...prev,
          content: {
            ...prev.content,
            suggestedTechStack: (
              prev.content?.suggestedTechStack || []
            ).filter((t) => t !== val),
          },
        }));

  // Banner image handling (Local file state)
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(previewImage);
  const [isDragActive, setIsDragActive] = useState(false);

  // Sync bannerPreview with previewImage if initialData changes
  useEffect(() => {
    if (!bannerFile && previewImage) {
      setBannerPreview(previewImage);
    }
  }, [previewImage, bannerFile]);

  // Clean up object URL when component unmounts or file changes
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
      draft.setPreviewImage(null);
    } else {
      setLocalData((prev) => ({
        ...prev,
        content: { ...prev.content, previewImage: null },
      }));
    }
  };

  // Submission & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: uploadMediaAsync } = useUploadMedia();

  const isValid = useMemo(() => {
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    return (
      cleanTitle.length >= 3 &&
      cleanTitle.length <= 120 &&
      cleanDesc.length >= 10 &&
      cleanDesc.length <= 500 &&
      roadmapIds.length >= 1
    );
  }, [title, description, roadmapIds]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      toast.error("Project title must be at least 3 characters");
      return;
    }

    if (title.trim().length > 120) {
      toast.error("Project title cannot exceed 120 characters");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      toast.error("Project description must be at least 10 characters");
      return;
    }

    if (roadmapIds.length === 0) {
      toast.error("Please select at least one roadmap category");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = previewImage;

      // Step 1: Upload banner image to Cloudinary if a local file was chosen
      if (bannerFile) {
        const uploadResult = await uploadMediaAsync({
          files: [bannerFile],
          folder: "slavecode/projects",
        });
        finalImageUrl = uploadResult.urls[0] || uploadResult.url || null;
      }

      // Step 2: Build clean payload
      const payload: CreateProjectPayload = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        roadmapIds,
        topics: topics.filter(Boolean),
        skills: skills.filter(Boolean),
        content: {
          overview: overview.trim() || undefined,
          markdown: markdown.trim() || undefined,
          previewImage: finalImageUrl || null,
          requirements: requirements.filter(Boolean),
          checklist: checklist.filter(Boolean),
          bonusChallenges: bonusChallenges.filter(Boolean),
          suggestedTechStack: suggestedTechStack.filter(Boolean),
        },
      };

      await onSubmit(payload);

      // Reset draft in create mode
      if (isCreate) {
        draft.resetDraft();
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save project";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Form Values
    title,
    setTitle,
    description,
    setDescription,
    difficulty,
    setDifficulty,
    roadmapIds,
    toggleRoadmapId,
    topics,
    addTopic,
    removeTopic,
    skills,
    addSkill,
    removeSkill,
    overview,
    setOverview,
    markdown,
    setMarkdown,
    requirements,
    addRequirement,
    removeRequirement,
    checklist,
    addChecklistItem,
    removeChecklistItem,
    bonusChallenges,
    suggestedTechStack,
    addSuggestedTech,
    removeSuggestedTech,

    // Banner & Media
    bannerPreview,
    isDragActive,
    handleBannerDrag,
    handleBannerDrop,
    handleBannerChange,
    clearBanner,

    // Submission & State
    isSubmitting,
    isValid,
    handleSubmit,
    resetDraft: draft.resetDraft,
    isCreate,
  };
}
