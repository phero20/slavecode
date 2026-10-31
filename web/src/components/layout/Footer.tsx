"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "../shared/Container";
import Image from "next/image";
import { shouldHide, shouldHidefooter } from "./shouldHide";
import { Bug, Download, Github, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FooterLinkItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface FooterSection {
  title: string;
  links: FooterLinkItem[];
}

const footerLinks: FooterSection[] = [
  {
    title: "DSA & Practice",
    links: [
      { label: "Problems", href: "/problems" },
      { label: "DSA Roadmap", href: "/roadmap" },
      { label: "Arena", href: "/arena" },
      { label: "Company Questions", href: "/companies" },
    ],
  },
  {
    title: "Resources & Learn",
    links: [
      { label: "Developer Roadmaps", href: "/resources" },
      { label: "Developer Projects", href: "/projects" },
      { label: "Academy", href: "/academy/tracks" },
      { label: "System Design", href: "/systemdesign" },
    ],
  },
  {
    title: "Compete & Tools",
    links: [
      { label: "Contests", href: "/contests" },
      { label: "Compilers", href: "/compilers" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Legal & Support",
    links: [
      {
        label: "Report an Issue",
        href: "/report-bug",
        icon: <Bug className="w-4 h-4 text-difficulty-medium" />,
      },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact Us", href: "mailto:slavecode.codes@gmail.com" },
    ],
  },
];

export const Footer = () => {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      if (typeof window !== "undefined") {
        (window as any).deferredPrompt = e;
      }
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    if (typeof window !== "undefined") {
      (window as any).deferredPrompt = null;
    }
    setDeferredPrompt(null);
  };

  if (shouldHide(pathname) || shouldHidefooter(pathname)) return null;

  return (
    <footer className="w-full border-t border-border bg-background py-10 md:py-16">
      <Container className="">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand & Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-3.5">
            <Link id="footer-logo-link" href="/" className="flex items-center group w-fit">
              <Image
                src="/logos/logo.png"
                alt="SlaveCode Logo"
                width={50}
                height={40}
                className="object-contain -mr-1"
              />
              <span className="text-xl font-bold tracking-tight">
                SlaveCode<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-sm">
              Standardize your coding journey. From interactive academy courses,
              guided roadmaps, and developer projects to advanced system design,
              company interview prep, and real-time coding arenas.
            </p>
            <Button
              id="footer-judge0-btn"
              variant="outline"
              className="transition-colors text-xs sm:text-sm h-9"
              asChild
            >
              <Link 
                href="https://github.com/judge0/judge0#showcase" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-primary" />
                <span>
                  Officially Featured by <span className="font-bold text-primary">Judge0</span>
                </span>
              </Link>
            </Button>
          </div>

          {/* Navigation Section Columns */}
          {footerLinks.map((section) => (
            <div key={section.title} className="col-span-1">
              <h4 className="font-semibold mb-4 text-sm tracking-tight text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      id={`footer-link-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      href={link.href}
                      title={link.label}
                      className={`hover:text-primary transition-colors ${
                        link.icon ? "flex items-center gap-1.5" : ""
                      }`}
                    >
                      {link.icon && link.icon}
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SlaveCode. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {deferredPrompt && (
              <Button
                id="footer-install-app-btn"
                size="lg"
                variant="default"
                onClick={handleInstallClick}
                className="font-semibold gap-2"
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    id="footer-github-btn"
                    href="https://github.com/phero20/slavecode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors p-2"
                    aria-label="GitHub Repository"
                  >
                    <Github className="w-6 h-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Please give SlaveCode repository a star</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Container>
    </footer>
  );
};
