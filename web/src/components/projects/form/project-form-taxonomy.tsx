"use client";

import React, { useState } from "react";
import { Compass, Hash, Wrench, X, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useProjectCategoriesQuery } from "@/hooks/queries/use-project.queries";

interface ProjectFormTaxonomyProps {
  roadmapIds: string[];
  toggleRoadmapId: (id: string) => void;
  topics: string[];
  addTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  skills: string[];
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
}

export function ProjectFormTaxonomy({
  roadmapIds,
  toggleRoadmapId,
  topics,
  addTopic,
  removeTopic,
  skills,
  addSkill,
  removeSkill,
}: ProjectFormTaxonomyProps) {
  const { data: categories = [], isLoading: isLoadingCategories } =
    useProjectCategoriesQuery();

  const [open, setOpen] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const commitTopic = () => {
    if (topicInput.trim()) {
      const parts = topicInput.split(",").map((t) => t.trim()).filter(Boolean);
      parts.forEach((p) => addTopic(p));
      setTopicInput("");
    }
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTopic();
    }
  };

  const commitSkill = () => {
    if (skillInput.trim()) {
      const parts = skillInput.split(",").map((s) => s.trim()).filter(Boolean);
      parts.forEach((p) => addSkill(p));
      setSkillInput("");
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitSkill();
    }
  };

  const availableCategories = categories.filter((c) => c.id !== "all");

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-primary shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Taxonomy & Categorization
          </h2>
          <p className="text-xs text-muted-foreground">
            Tag with target career roadmaps, focus domains, and relevant skills.
          </p>
        </div>
      </div>

      {/* Roadmap Categories (Popover + Command) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm font-medium text-foreground/90">
            Target Roadmaps <span className="text-destructive">*</span>
          </Label>
          <span className="text-[11px] text-muted-foreground font-normal">
            {roadmapIds.length} selected
          </span>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="roadmap-categories-trigger-btn"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full sm:w-[320px] justify-between text-xs sm:text-sm font-normal h-10 px-3"
            >
              <div className="flex items-center gap-2 truncate">
                <Compass className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">
                  {isLoadingCategories
                    ? "Loading roadmaps..."
                    : roadmapIds.length === 0
                      ? "Select roadmaps..."
                      : `${roadmapIds.length} roadmap${roadmapIds.length > 1 ? "s" : ""} selected`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {roadmapIds.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px] rounded-sm font-semibold"
                  >
                    {roadmapIds.length}
                  </Badge>
                )}
                <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[320px] md:w-120 p-0"
            sideOffset={6}
          >
            <Command>
              <CommandInput placeholder="Search roadmaps (e.g. Frontend, Docker, AI)..." />
              <CommandList className="max-h-70">
                <CommandEmpty>No matching roadmap found.</CommandEmpty>
                <CommandGroup heading="Available Roadmaps">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1">
                    {availableCategories.map((cat) => {
                      const isSelected = roadmapIds.includes(cat.id);
                      return (
                        <CommandItem
                          key={cat.id}
                          value={cat.title}
                          onSelect={() => toggleRoadmapId(cat.id)}
                          className="cursor-pointer flex items-center justify-between text-sm py-2 px-2.5"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Checkbox
                              checked={isSelected}
                              className="pointer-events-none"
                            />
                            <span className="truncate">{cat.title}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
                {roadmapIds.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          [...roadmapIds].forEach((id) => toggleRoadmapId(id));
                        }}
                        className="justify-center text-xs text-muted-foreground cursor-pointer hover:text-destructive py-2"
                      >
                        Clear Selected ({roadmapIds.length})
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected Roadmap Badges */}
        {roadmapIds.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {roadmapIds.map((id) => {
              const cat = availableCategories.find((c) => c.id === id);
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="text-xs px-2.5 py-1 gap-1.5 font-normal bg-muted text-foreground border border-border"
                >
                  {cat?.title || id}
                  <button
                    id={`remove-roadmap-${id}-btn`}
                    type="button"
                    onClick={() => toggleRoadmapId(id)}
                    className="hover:text-destructive transition-colors cursor-pointer"
                    aria-label={`Remove roadmap ${id}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            Select at least one career roadmap category (e.g., Frontend, Full Stack).
          </p>
        )}
      </div>

      {/* Topics Tag Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="topics-tag-input"
            className="text-xs sm:text-sm font-medium text-foreground/90 flex items-center gap-1.5"
          >
            <Hash className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Topics (Optional)</span>
            <span className="text-[11px] text-muted-foreground font-normal">
              (comma-separated)
            </span>
          </Label>
          {topics.length > 0 && (
            <span className="text-[11px] text-muted-foreground font-normal">
              {topics.length} added
            </span>
          )}
        </div>
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {topics.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="text-xs px-2.5 py-1 gap-1.5 font-normal bg-muted text-foreground border border-border"
              >
                {t}
                <button
                  id={`remove-topic-${t}-btn`}
                  type="button"
                  onClick={() => removeTopic(t)}
                  className="hover:text-destructive transition-colors cursor-pointer"
                  aria-label={`Remove topic ${t}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input
          id="topics-tag-input"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          onKeyDown={handleTopicKeyDown}
          onBlur={commitTopic}
          placeholder="Type topics (e.g. auth, websockets, stripe) and press Enter or comma"
        />
      </div>

      {/* Skills Tag Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="skills-tag-input"
            className="text-xs sm:text-sm font-medium text-foreground/90 flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Key Skills & Libraries (Optional)</span>
            <span className="text-[11px] text-muted-foreground font-normal">
              (comma-separated)
            </span>
          </Label>
          {skills.length > 0 && (
            <span className="text-[11px] text-muted-foreground font-normal">
              {skills.length} added
            </span>
          )}
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {skills.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="text-xs px-2.5 py-1 gap-1.5 font-normal bg-muted text-foreground border border-border"
              >
                {s}
                <button
                  id={`remove-skill-${s}-btn`}
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="hover:text-destructive transition-colors cursor-pointer"
                  aria-label={`Remove skill ${s}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input
          id="skills-tag-input"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={handleSkillKeyDown}
          onBlur={commitSkill}
          placeholder="Type skills (e.g. React, Next.js, PostgreSQL, Docker) and press Enter or comma"
        />
      </div>
    </section>
  );
}
