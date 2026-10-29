import { useState, useEffect, useRef } from "react";
import { useSubmitReportBugMutation } from "./mutations/use-report-bug.mutations";
import { useUploadMedia } from "./mutations/use-upload.mutations";
import { toast } from "sonner";

export interface PreviewFile {
  id: string;
  file: File;
  preview: string;
}

export function useReportBugForm() {
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: uploadMediaAsync } = useUploadMedia();
  const {
    mutateAsync: submitReport,
    isPending: isSubmittingReport,
    isError,
    error,
    isSuccess,
    reset,
  } = useSubmitReportBugMutation();

  const isPending = isUploading || isSubmittingReport;

  // Cleanup object URLs when component unmounts
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = (newFilesList: FileList | File[]) => {
    const rawFiles = Array.from(newFilesList);
    const validFiles = rawFiles.filter((f) => f.type.startsWith("image/"));

    // Check 10MB limit (Cloudinary max limit)
    const oversizedFiles = validFiles.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const names = oversizedFiles
        .map((f) => `"${f.name}" (${(f.size / (1024 * 1024)).toFixed(1)}MB)`)
        .join(", ");
      toast.error(`File size too large: ${names}. Maximum allowed size is 10MB.`);
      return;
    }
    
    setFiles((prev) => {
      if (prev.length >= 5) return prev;
      
      const toAdd = validFiles.slice(0, 5 - prev.length);
      const newPreviewFiles = toAdd.map((f) => ({
        id: Math.random().toString(36).substring(7),
        file: f,
        preview: URL.createObjectURL(f),
      }));
      
      return [...prev, ...newPreviewFiles];
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!title || !description || !type || isPending) return;

    setIsUploading(true);
    try {
      let imageUrls: string[] = [];

      // 1st call: If images are attached, upload them to Cloudinary first
      if (files.length > 0) {
        const rawFiles = files.map((f) => f.file);
        const uploadResult = await uploadMediaAsync({
          files: rawFiles,
          folder: "slavecode/bug_reports",
        });
        imageUrls = uploadResult.urls;
      }

      setIsUploading(false);

      // 2nd call: Submit bug report with Cloudinary image URLs
      await submitReport({
        title,
        description,
        type,
        images: imageUrls,
      });

      // Reset form on success
      setTitle("");
      setDescription("");
      setType("bug");
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);

      toast.success("Bug report submitted successfully!");
    } catch (err: any) {
      setIsUploading(false);
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit bug report";
      toast.error(errorMessage);
    }
  };

  return {
    type,
    setType,
    title,
    setTitle,
    description,
    setDescription,
    dragActive,
    files,
    isPending,
    isError,
    error,
    isSuccess,
    resetMutation: reset,
    handleDrag,
    handleDrop,
    handleChange,
    removeFile,
    handleSubmit,
  };
}
