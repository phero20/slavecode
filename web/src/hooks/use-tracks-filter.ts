import { useMemo } from "react";
import type { Track } from "@/types/academy";
import { useAcademyStore } from "@/store/use-academy-store";

export function useTracksFilter(tracks: Track[]) {
  const searchQuery = useAcademyStore((s) => s.searchQuery);
  const setSearchQuery = useAcademyStore((s) => s.setSearchQuery);
  const sortBy = useAcademyStore((s) => s.sortBy);
  const setSortBy = useAcademyStore((s) => s.setSortBy);
  const selectedTags = useAcademyStore((s) => s.selectedTags);
  const setSelectedTags = useAcademyStore((s) => s.setSelectedTags);

  // Compute all unique tags from tracks
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tracks.forEach((track) => track.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tracks]);

  // Memoize filtered tracks
  const filteredTracks = useMemo(() => {
    let result = [...tracks];

    // Apply Search Filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((track) =>
        track.title.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply Tags Filter (AND logic)
    if (selectedTags.length > 0) {
      result = result.filter((track) =>
        selectedTags.every((tag) => track.tags.includes(tag))
      );
    }

    // Apply Sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "exercises") {
      result.sort((a, b) => b.num_exercises - a.num_exercises);
    } else if (sortBy === "exercises-asc") {
      result.sort((a, b) => a.num_exercises - b.num_exercises);
    }
    // Default to 'popular' (keep original array order from API)

    return result;
  }, [tracks, searchQuery, sortBy, selectedTags]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedTags,
    setSelectedTags,
    allTags,
    filteredTracks,
  };
}
