"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Search, X, SearchX } from "lucide-react";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { CategorySkeletonList } from "@/components/skeletons";

export { CategorySkeletonList };

export interface CategoryItem {
  id: string;
  title: string;
  count?: number;
}

export interface CategorySidebarProps<T extends CategoryItem = CategoryItem> {
  categories?: T[];
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  title?: string;
  allLabel?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  idPrefix?: string;
  skeletonCount?: number;
  isMobile?: boolean;
}

/**
 * Category Items List
 * Renders categorized buttons with active selection highlighting and counts.
 */
export function CategoryItemsList<T extends CategoryItem = CategoryItem>({
  categories = [],
  selectedCategory,
  onSelectCategory,
  idPrefix = "category",
  isMobile,
}: CategorySidebarProps<T>) {
  return (
    <div
      id={`${idPrefix}-category-list`}
      className={cn("flex flex-col gap-1", isMobile ? "p-2 py-3" : "p-2 py-3")}
    >
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        const button = (
          <Button
            key={cat.id}
            id={`${idPrefix}-category-btn-${cat.id}`}
            variant={isActive ? "secondary" : "ghost"}
            onClick={() => onSelectCategory?.(cat.id)}
            className={cn(
              "justify-between w-full font-normal shadow-none h-auto whitespace-normal text-left py-2 px-3 cursor-pointer",
              isActive && "font-medium text-primary bg-secondary"
            )}
          >
            <span className="truncate text-xs sm:text-sm">{cat.title}</span>
            {cat.count !== undefined && (
              <span
                className={cn(
                  "text-xs ml-2 tabular-nums shrink-0",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {cat.count}
              </span>
            )}
          </Button>
        );

        if (isMobile) {
          return (
            <SheetClose asChild key={cat.id}>
              {button}
            </SheetClose>
          );
        }

        return <React.Fragment key={cat.id}>{button}</React.Fragment>;
      })}
    </div>
  );
}

/**
 * Desktop Sticky Category Sidebar
 */
export function CategoryDesktopSidebar<T extends CategoryItem = CategoryItem>({
  categories = [],
  selectedCategory,
  onSelectCategory,
  title = "Categories",
  searchPlaceholder = "Search categories...",
  isLoading = false,
  error,
  onRetry,
  idPrefix = "category",
  skeletonCount = 16,
}: Omit<CategorySidebarProps<T>, "isMobile">) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [categories, search]);

  return (
    <aside
      id={`${idPrefix}-desktop-sidebar`}
      className="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-border/40 bg-card/30"
    >
      <div className="sticky top-20 overflow-hidden flex flex-col h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="px-3 pb-1 border-b border-border/40 flex items-center justify-between gap-2">
          <h3 className="font-bold text-sm tracking-tight text-foreground/80">
            {title}
          </h3>
        </div>

        {/* Category Search Bar */}
        <div className="p-2 border-b border-border/40">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              id={`sidebar-${idPrefix}-search-input`}
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg placeholder:text-muted-foreground/70"
            />
            {search && (
              <button
                id={`clear-sidebar-${idPrefix}-search-btn`}
                onClick={() => setSearch("")}
                className="absolute right-2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear category search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Category List with QueryGuard */}
        <div className="flex-1 overflow-y-auto">
          <QueryGuard
            loading={isLoading}
            error={error}
            data={filteredCategories}
            isEmpty={!isLoading && filteredCategories.length === 0}
            skeleton={<CategorySkeletonList count={skeletonCount} />}
            onRetry={onRetry}
            errorTitle={`${title} Error`}
            errorMessage={`Failed to load ${title.toLowerCase()}. Please check connection.`}
            errorClassName="h-auto py-8 p-3"
            emptyIcon={SearchX}
            emptyTitle={`No ${title.toLowerCase()} found`}
            emptyMessage={
              search
                ? `No ${title.toLowerCase()} match "${search}".`
                : `There are currently no ${title.toLowerCase()} available.`
            }
            emptyClassName="m-3 py-6 border-dashed"
            emptyAction={
              search ? (
                <Button
                  id={`clear-sidebar-${idPrefix}-empty-btn`}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="text-xs h-7 cursor-pointer"
                >
                  Clear Search
                </Button>
              ) : undefined
            }
          >
            <CategoryItemsList
              categories={filteredCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              idPrefix={idPrefix}
            />
          </QueryGuard>
        </div>
      </div>
    </aside>
  );
}

/**
 * Mobile Category Header & Drawer
 */
export function CategoryMobileHeader<T extends CategoryItem = CategoryItem>({
  categories = [],
  selectedCategory,
  onSelectCategory,
  title = "Categories",
  allLabel = "All Categories",
  searchPlaceholder = "Search categories...",
  isLoading = false,
  error,
  onRetry,
  idPrefix = "category",
  skeletonCount = 16,
}: Omit<CategorySidebarProps<T>, "isMobile">) {
  const [search, setSearch] = useState("");

  const activeLabel =
    categories.find((c) => c.id === selectedCategory)?.title || allLabel;

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [categories, search]);

  return (
    <div
      id={`${idPrefix}-mobile-header`}
      className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border/40 bg-background p-4 pt-20"
    >
      <div className="flex items-center gap-2 truncate">
        <span className="font-bold text-sm tracking-tight text-foreground truncate">
          {activeLabel}
        </span>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <div
            id={`${idPrefix}-mobile-drawer-trigger`}
            className="flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span className="font-bold text-sm tracking-tight">{title}</span>
            <Button
              variant="ghost"
              className="p-2 -mr-2 text-foreground"
              asChild
            >
              <div>
                <Menu className="h-5 w-5" />
              </div>
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full p-0 top-20! h-[calc(100vh-5rem)]!"
          overlayClass="!top-20"
        >
          <SheetHeader className="p-4 border-b border-border/40 bg-muted/20 text-left">
            <SheetTitle className="text-sm font-bold">{title}</SheetTitle>
          </SheetHeader>

          {/* Mobile Category Search Bar */}
          <div className="p-3 border-b border-border/40">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id={`mobile-${idPrefix}-search-input`}
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-7 text-xs bg-muted/40 border-border/50 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg placeholder:text-muted-foreground/70"
              />
              {search && (
                <button
                  id={`clear-mobile-${idPrefix}-search-btn`}
                  onClick={() => setSearch("")}
                  className="absolute right-2 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Clear category search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-80px-7rem)]">
            <QueryGuard
              loading={isLoading}
              error={error}
              data={filteredCategories}
              isEmpty={!isLoading && filteredCategories.length === 0}
              skeleton={<CategorySkeletonList count={skeletonCount} />}
              onRetry={onRetry}
              errorTitle={`${title} Error`}
              errorMessage={`Failed to load ${title.toLowerCase()}. Please check connection.`}
              errorClassName="h-auto py-8 p-3"
              emptyIcon={SearchX}
              emptyTitle={`No ${title.toLowerCase()} found`}
              emptyMessage={
                search
                  ? `No ${title.toLowerCase()} match "${search}".`
                  : `There are currently no ${title.toLowerCase()} available.`
              }
              emptyClassName="m-3 py-6 border-dashed"
              emptyAction={
                search ? (
                  <Button
                    id={`clear-mobile-${idPrefix}-empty-btn`}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearch("")}
                    className="text-xs h-7 cursor-pointer"
                  >
                    Clear Search
                  </Button>
                ) : undefined
              }
            >
              <CategoryItemsList
                categories={filteredCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
                idPrefix={idPrefix}
                isMobile
              />
            </QueryGuard>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
