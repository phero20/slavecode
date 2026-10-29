"use client";

import React, { useState } from "react";
import { ListChecks, CheckCircle2, Plus, X, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ProjectFormRequirementsProps {
  requirements: string[];
  addRequirement: (req: string) => void;
  removeRequirement: (idx: number) => void;
  checklist: string[];
  addChecklistItem: (item: string) => void;
  removeChecklistItem: (idx: number) => void;
  suggestedTechStack: string[];
  addSuggestedTech: (tech: string) => void;
  removeSuggestedTech: (tech: string) => void;
}

export function ProjectFormRequirements({
  requirements,
  addRequirement,
  removeRequirement,
  checklist,
  addChecklistItem,
  removeChecklistItem,
  suggestedTechStack,
  addSuggestedTech,
  removeSuggestedTech,
}: ProjectFormRequirementsProps) {
  const [requirementInput, setRequirementInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [techInput, setTechInput] = useState("");

  const handleRequirementAdd = () => {
    if (requirementInput.trim()) {
      addRequirement(requirementInput.trim());
      setRequirementInput("");
    }
  };

  const handleChecklistAdd = () => {
    if (checklistInput.trim()) {
      addChecklistItem(checklistInput.trim());
      setChecklistInput("");
    }
  };

  const handleTechAdd = () => {
    if (techInput.trim()) {
      const parts = techInput.split(",").map((t) => t.trim()).filter(Boolean);
      parts.forEach((p) => addSuggestedTech(p));
      setTechInput("");
    }
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleTechAdd();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <ListChecks className="w-4 h-4 text-primary shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Requirements & Milestones
          </h2>
          <p className="text-xs text-muted-foreground">
            Define concrete functionality, milestone tasks, and recommended stack.
          </p>
        </div>
      </div>

      {/* Functional Requirements */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="new-requirement-input"
            className="text-xs sm:text-sm font-medium text-foreground/90"
          >
            Functional Requirements (Optional)
          </Label>
          <span className="text-[11px] text-muted-foreground font-normal">
            {requirements.length} added
          </span>
        </div>

        {requirements.length > 0 && (
          <div className="space-y-1.5">
            {requirements.map((req, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="flex items-center justify-between w-full py-2 px-3 text-xs sm:text-sm font-normal rounded-md"
              >
                <span className="flex-1 mr-2 ">• {req}</span>
                <Button
                  id={`remove-requirement-${idx}-btn`}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRequirement(idx)}
                  className="h-6 w-6 hover:text-destructive"
                  aria-label={`Remove requirement ${idx + 1}`}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            id="new-requirement-input"
            value={requirementInput}
            onChange={(e) => setRequirementInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleRequirementAdd();
              }
            }}
            placeholder="e.g. Implement JWT authentication with refresh token cookies"
          />
          <Button
            id="add-requirement-btn"
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRequirementAdd}
            disabled={!requirementInput.trim()}
            className="shrink-0 gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label
            htmlFor="new-checklist-input"
            className="text-xs sm:text-sm font-medium text-foreground/90"
          >
            Step-by-Step Milestone Checklist (Optional)
          </Label>
          <span className="text-[11px] text-muted-foreground font-normal">
            {checklist.length} milestones
          </span>
        </div>

        {checklist.length > 0 && (
          <div className="space-y-1.5">
            {checklist.map((item, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="flex items-center justify-between w-full py-2 px-3 text-xs sm:text-sm font-normal rounded-md"
              >
                <span className="flex items-center gap-2.5 flex-1 mr-2">
                  {/* <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> */}
                  <span>• {item}</span>
                </span>
                <Button
                  id={`remove-checklist-${idx}-btn`}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeChecklistItem(idx)}
                  className="h-6 w-6 hover:text-destructive"
                  aria-label={`Remove checklist item ${idx + 1}`}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            id="new-checklist-input"
            value={checklistInput}
            onChange={(e) => setChecklistInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleChecklistAdd();
              }
            }}
            placeholder="e.g. Setup PostgreSQL schema & run initial migration"
          />
          <Button
            id="add-checklist-btn"
            type="button"
            variant="outline"
            size="sm"
            onClick={handleChecklistAdd}
            disabled={!checklistInput.trim()}
            className="shrink-0 gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Suggested Tech Stack */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="suggested-tech-input"
            className="text-xs sm:text-sm font-medium text-foreground/90 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Suggested Tech Stack (Optional)</span>
            <span className="text-[11px] text-muted-foreground font-normal">
              (comma-separated)
            </span>
          </Label>
          {suggestedTechStack.length > 0 && (
            <span className="text-[11px] text-muted-foreground font-normal">
              {suggestedTechStack.length} added
            </span>
          )}
        </div>
        {suggestedTechStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {suggestedTechStack.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-xs px-2.5 py-1 gap-1.5 font-normal bg-muted text-foreground border border-border"
              >
                {tech}
                <button
                  id={`remove-tech-${tech}-btn`}
                  type="button"
                  onClick={() => removeSuggestedTech(tech)}
                  className="hover:text-destructive transition-colors cursor-pointer"
                  aria-label={`Remove tech ${tech}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            id="suggested-tech-input"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleTechKeyDown}
            onBlur={handleTechAdd}
            placeholder="Type technology (e.g. Prisma, Tailwind CSS, Redis) and press Enter or comma"
          />
          <Button
            id="add-tech-btn"
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTechAdd}
            disabled={!techInput.trim()}
            className="shrink-0 gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </div>
    </section>
  );
}
