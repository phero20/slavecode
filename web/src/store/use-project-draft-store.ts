import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProjectDifficulty } from "@/types/project";

export interface ProjectDraftState {
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  roadmapIds: string[];
  topics: string[];
  skills: string[];
  overview: string;
  markdown: string;
  previewImage: string | null;
  requirements: string[];
  checklist: string[];
  bonusChallenges: string[];
  suggestedTechStack: string[];

  // Actions
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setDifficulty: (difficulty: ProjectDifficulty) => void;
  setRoadmapIds: (ids: string[]) => void;
  toggleRoadmapId: (id: string) => void;
  setTopics: (topics: string[]) => void;
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  setSkills: (skills: string[]) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  setOverview: (overview: string) => void;
  setMarkdown: (markdown: string) => void;
  setPreviewImage: (url: string | null) => void;

  // Dynamic Lists
  setRequirements: (reqs: string[]) => void;
  addRequirement: (req: string) => void;
  removeRequirement: (index: number) => void;

  setChecklist: (items: string[]) => void;
  addChecklistItem: (item: string) => void;
  removeChecklistItem: (index: number) => void;

  setBonusChallenges: (challenges: string[]) => void;
  addBonusChallenge: (challenge: string) => void;
  removeBonusChallenge: (index: number) => void;

  setSuggestedTechStack: (techs: string[]) => void;
  addSuggestedTech: (tech: string) => void;
  removeSuggestedTech: (tech: string) => void;

  // Bulk update & Reset
  updateDraft: (data: Partial<ProjectDraftState>) => void;
  resetDraft: () => void;
}

const initialDraftState = {
  title: "",
  description: "",
  difficulty: "beginner" as ProjectDifficulty,
  roadmapIds: [] as string[],
  topics: [] as string[],
  skills: [] as string[],
  overview: "",
  markdown: "",
  previewImage: null as string | null,
  requirements: [] as string[],
  checklist: [] as string[],
  bonusChallenges: [] as string[],
  suggestedTechStack: [] as string[],
};

export const useProjectDraftStore = create<ProjectDraftState>()(
  persist(
    (set) => ({
      ...initialDraftState,

      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),
      setDifficulty: (difficulty) => set({ difficulty }),
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

      setTopics: (topics) => set({ topics }),
      addTopic: (topic) =>
        set((state) => {
          const clean = topic.trim().toLowerCase();
          if (!clean || state.topics.includes(clean)) return state;
          return { topics: [...state.topics, clean] };
        }),
      removeTopic: (topic) =>
        set((state) => ({
          topics: state.topics.filter((t) => t !== topic),
        })),

      setSkills: (skills) => set({ skills }),
      addSkill: (skill) =>
        set((state) => {
          const clean = skill.trim();
          if (!clean || state.skills.includes(clean)) return state;
          return { skills: [...state.skills, clean] };
        }),
      removeSkill: (skill) =>
        set((state) => ({
          skills: state.skills.filter((s) => s !== skill),
        })),

      setOverview: (overview) => set({ overview }),
      setMarkdown: (markdown) => set({ markdown }),
      setPreviewImage: (previewImage) => set({ previewImage }),

      setRequirements: (requirements) => set({ requirements }),
      addRequirement: (req) =>
        set((state) => {
          const clean = req.trim();
          if (!clean) return state;
          return { requirements: [...state.requirements, clean] };
        }),
      removeRequirement: (index) =>
        set((state) => ({
          requirements: state.requirements.filter((_, i) => i !== index),
        })),

      setChecklist: (checklist) => set({ checklist }),
      addChecklistItem: (item) =>
        set((state) => {
          const clean = item.trim();
          if (!clean) return state;
          return { checklist: [...state.checklist, clean] };
        }),
      removeChecklistItem: (index) =>
        set((state) => ({
          checklist: state.checklist.filter((_, i) => i !== index),
        })),

      setBonusChallenges: (bonusChallenges) => set({ bonusChallenges }),
      addBonusChallenge: (challenge) =>
        set((state) => {
          const clean = challenge.trim();
          if (!clean) return state;
          return { bonusChallenges: [...state.bonusChallenges, clean] };
        }),
      removeBonusChallenge: (index) =>
        set((state) => ({
          bonusChallenges: state.bonusChallenges.filter((_, i) => i !== index),
        })),

      setSuggestedTechStack: (suggestedTechStack) => set({ suggestedTechStack }),
      addSuggestedTech: (tech) =>
        set((state) => {
          const clean = tech.trim();
          if (!clean || state.suggestedTechStack.includes(clean)) return state;
          return { suggestedTechStack: [...state.suggestedTechStack, clean] };
        }),
      removeSuggestedTech: (tech) =>
        set((state) => ({
          suggestedTechStack: state.suggestedTechStack.filter((t) => t !== tech),
        })),

      updateDraft: (data) => set((state) => ({ ...state, ...data })),
      resetDraft: () => set(initialDraftState),
    }),
    {
      name: "slavecode-project-draft",
    }
  )
);
