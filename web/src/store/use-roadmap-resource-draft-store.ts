import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RoadmapResourceDraftState {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string | null;
  type: string;
  author: string;
  roadmapIds: string[];

  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setUrl: (url: string) => void;
  setThumbnailUrl: (url: string | null) => void;
  setType: (type: string) => void;
  setAuthor: (author: string) => void;
  setRoadmapIds: (ids: string[]) => void;
  toggleRoadmapId: (id: string) => void;

  updateDraft: (data: Partial<RoadmapResourceDraftState>) => void;
  resetDraft: () => void;
}

const initialDraftState = {
  title: "",
  description: "",
  url: "",
  thumbnailUrl: null as string | null,
  type: "",
  author: "",
  roadmapIds: [] as string[],
};

export const useRoadmapResourceDraftStore = create<RoadmapResourceDraftState>()(
  persist(
    (set) => ({
      ...initialDraftState,

      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),
      setUrl: (url) => set({ url }),
      setThumbnailUrl: (thumbnailUrl) => set({ thumbnailUrl }),
      setType: (type) => set({ type }),
      setAuthor: (author) => set({ author }),
      setRoadmapIds: (roadmapIds) => set({ roadmapIds }),
      toggleRoadmapId: (id) =>
        set((state) => {
          const exists = state.roadmapIds.includes(id);
          return {
            roadmapIds: exists
              ? state.roadmapIds.filter((item) => item !== id)
              : [...state.roadmapIds, id],
          };
        }),

      updateDraft: (data) => set((state) => ({ ...state, ...data })),
      resetDraft: () => set(initialDraftState),
    }),
    {
      name: "slavecode-resource-draft",
    }
  )
);
