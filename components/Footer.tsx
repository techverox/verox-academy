"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe, ShieldCheck, Award, Code, Command, Zap, Shield, Sparkles, Server, Cpu, Database, Share2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentContainer } from "@/components/layout/ContentContainer";

const footerLinks = {
  platform: {
    label: "Platform Matrix",
    links: [
      { name: "Browse Catalog", href: "/courses" },
      { name: "Creator Portfolio", href: "/top-creators" },
      { name: "Learning Path", href: "/dashboard" },
      { name: "Verify Hub", href: "/verify-certificate" },
    ],
  },
  division: {
    label: "Ecosystem Division",
    links: [
      { name: "Techverox Home", href: "https://techverox.com" },
      { name: "Become a Creator", href: "/become-creator" },
      { name: "Enterprise Sync", href: "/enterprise" },
      { name: "Engineering Hub", href: "/blog" },
    ],
  },
  systems: {
    label: "Core Systems",
    links: [
      { name: "Help Protocol", href: "/contact" },
      { name: "Community Sync", href: "/community" },
      { name: "Security Audit", href: "/security" },
      { name: "System Status", href: "/status" },
    ],
  },
  legal: {
    label: "Governance",
    links: [
      { name: "Privacy Protocol", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Matrix", href: "/cookies" },
      { name: "Data Protection", href: "/security" },
    ],
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  return (
    <footer className="bg-background border-t border-border/40 pt-20 md:pt-28 pb-12 transition-colors duration-500 overflow-hidden relative">
      {/* Cinematic Grid Underlay - Hardened Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.05),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-size-[40px_40px] md:bg-size-[60px_60px] pointer-events-none" />
      
      <ContentContainer>
        <div className="grid gap-16 md:gap-20 lg:grid-cols-12 mb-16 md:mb-28">
          {/* Brand Identity Cluster - Adaptive Padding */}
          <div className="lg:col-span-4 space-y-10 md:space-y-12">
            <Link href="/" className="flex flex-col gap-4 group">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="relative h-12 w-12 md:h-14 md:w-14 flex items-center justify-center bg-primary rounded-xl md:rounded-[1.5rem] transition-all duration-700 group-hover:scale-105 shadow-2xl shadow-primary/30 shrink-0">
                  <span className="text-primary-foreground font-bold text-2xl md:text-3xl">V</span>
                  <div className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-accent border-2 md:border-4 border-background flex items-center justify-center">
                     <Zap className="w-2 md:w-2.5 h-2 md:h-2.5 text-white fill-current" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                   <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-bold tracking-tighter text-foreground">Verox</span>
                      <span className="text-xl md:text-2xl font-bold tracking-tighter text-muted-foreground/50">Academy</span>
                   </div>
                   <span className="text-[9px] md:text-[11px] uppercase tracking-[0.4em] font-bold text-accent mt-1 md:mt-2 truncate">
                     Techverox Product Division
                   </span>
                </div>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm font-medium">
              The premier learning ecosystem for modern creators. 
              Architected on the Techverox high-performance culture to deliver cinematic learning sequences at scale.
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {[
                { icon: Share2, href: "#" },
                { icon: MessageCircle, href: "#" },
                { icon: Globe, href: "#" },
                { icon: Code, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center bg-muted/30 border border-border/40 rounded-xl md:rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted hover:border-accent/40 transition-all duration-500 shadow-sm"
                  aria-label={`Social link ${i}`}
                >
                  <social.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </a>
              ))}
              <Link href="/verify-certificate" className="h-10 md:h-11 px-4 md:px-5 flex items-center gap-2.5 md:gap-3 bg-accent/5 border border-accent/20 rounded-xl md:rounded-2xl group hover:bg-accent/10 transition-colors">
                 <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                 <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-accent">Verify Credentials</span>
              </Link>
            </div>
          </div>

          {/* Links Matrix - Hardened Grid for Small Screens */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            {Object.entries(footerLinks).map(([key, section]) => (
              <div key={key} className="space-y-6 md:space-y-8">
                <h4 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-foreground/30 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-accent" />
                  {section.label}
                </h4>
                <ul className="space-y-3 md:space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[12.5px] md:text-[13.5px] font-bold text-muted-foreground/80 hover:text-foreground transition-all duration-300 flex items-center group leading-tight"
                      >
                        <div className="w-0 group-hover:w-3 md:group-hover:w-4 h-px bg-accent mr-0 group-hover:mr-2 md:group-hover:mr-3 transition-all duration-500" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Infrastructure Bar - Optimized for Mobile Wrapping */}
        <div className="pt-10 md:pt-14 border-t border-border/40 flex flex-col xl:flex-row justify-between items-center gap-8 md:gap-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-10 gap-y-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40 text-center sm:text-left">
            <p>© {currentYear} Techverox Inc.</p>
            <div className="flex items-center gap-8 md:gap-10">
              <span className="flex items-center gap-2 md:gap-2.5 cursor-default hover:text-foreground transition-colors">
                <Server className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent/60" /> Mumbai-01
              </span>
              <span className="flex items-center gap-2 md:gap-2.5 cursor-default hover:text-foreground transition-colors">
                <Cpu className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent/60" /> SSR-High
              </span>
              <span className="hidden xs:flex items-center gap-2 md:gap-2.5 cursor-default hover:text-foreground transition-colors">
                <Database className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent/60" /> Sync: OK
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2.5 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-surface-elevated/40 border border-border/40 shadow-sm">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">Status: 100%</span>
            </div>
            <div className="flex items-center gap-2.5 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl bg-accent text-white shadow-xl shadow-accent/20">
              <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current shrink-0" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-none">Premium Node</span>
            </div>
          </div>
        </div>
      </ContentContainer>
    </footer>
  );
}
