"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Swords,
  Code2,
  Cpu,
  Trophy,
  Route,
  Network,
  ChevronDown,
  GraduationCap,
  Building2,
  FolderGit2,
} from "lucide-react";

import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  className?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    items: [
      { name: "Academy", href: "/academy/tracks", icon: GraduationCap },
    ],
  },
  {
    title: "DSA",
    items: [
      { name: "Roadmap", href: "/roadmap", icon: Route },
      { name: "Problems", href: "/problems", icon: Code2 },
      { name: "Arena", href: "/arena", icon: Swords },
    ],
  },
  {
    title: "Resources",
    items: [
      { name: "Roadmaps", href: "/resources", icon: Building2 },
      { name: "Projects", href: "/projects", icon: FolderGit2 },
    ],
  },
  {
    items: [
      { name: "System Design", href: "/systemdesign", icon: Network },
    ],
  },
  {
    title: "More",
    items: [
      { name: "Companies", href: "/companies", icon: Building2 },
      { name: "Compilers", href: "/compilers", icon: Cpu },
      { name: "Contests", href: "/contests", icon: Trophy },
    ],
  },
];

// Flat direct links preserved for backward compatibility
export const navItems = navSections.flatMap((s) => s.items);

const dsaItems = navSections.find((s) => s.title === "DSA")?.items || [];
const resourceItems = navSections.find((s) => s.title === "Resources")?.items || [];
const moreItems = navSections.find((s) => s.title === "More")?.items || [];

const NavDropdownMenu = ({
  name,
  items,
  pathname,
  align = "start",
}: {
  name: string;
  items: { name: string; href: string; className?: string }[];
  pathname: string;
  align?: "start" | "end" | "center";
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const isGroupActive = items.some((item) => pathname.startsWith(item.href));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          variant="ghost"
          className={cn(
            "relative h-9 px-3 2xl:px-4 py-2 flex items-center gap-1 bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none shadow-none text-sm font-semibold",
            (open || isGroupActive) && "text-primary font-semibold",
          )}
        >
          {name}
          <ChevronDown
            className={cn(
              "size-4 opacity-70 transition-transform",
              open && "rotate-180",
            )}
          />
          {isGroupActive && (
            <motion.div
              layoutId="navbar-active-border"
              className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary rounded-t-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        align={align}
        sideOffset={20}
        className="p-1 w-48 border-border bg-background"
      >
        <Command className="bg-transparent">
          <CommandList className="p-0">
            <CommandGroup>
              {items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <CommandItem
                    key={item.href}
                    onSelect={() => {
                      router.push(item.href);
                      setOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer px-3 py-3 text-sm font-semibold transition-colors",
                      "bg-transparent! hover:bg-transparent! data-[selected=true]:bg-transparent!",
                      isActive
                        ? "text-primary!"
                        : "text-muted-foreground! hover:text-foreground!",
                      item.className,
                    )}
                  >
                    {item.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const NavLinkItem = ({
  href,
  name,
  pathname,
  className,
}: {
  href: string;
  name: string;
  pathname: string;
  className?: string;
}) => {
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "relative px-3 2xl:px-4 py-2 flex items-center gap-2 text-sm font-semibold transition-colors rounded-md",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {name}
      {isActive && (
        <motion.div
          layoutId="navbar-active-border"
          className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary rounded-t-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
};

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="flex items-center">
      {/* 1. Academy */}
      <NavLinkItem href="/academy/tracks" name="Academy" pathname={pathname} />

      {/* 2. DSA */}
      <NavDropdownMenu name="DSA" items={dsaItems} pathname={pathname} align="start" />

      {/* 3. Resources */}
      <NavDropdownMenu name="Resources" items={resourceItems} pathname={pathname} align="start" />

      {/* 4. System Design */}
      <NavLinkItem href="/systemdesign" name="System Design" pathname={pathname} />

      {/* 5. More */}
      <NavDropdownMenu name="More" items={moreItems} pathname={pathname} align="end" />
    </div>
  );
};
