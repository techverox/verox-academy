"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Globe, ShieldCheck, Zap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  const isDashboard = pathname?.startsWith("/dashboard") || 
                      pathname?.startsWith("/admin") || 
                      pathname?.startsWith("/creator") ||
                      pathname?.startsWith("/learn") || 
                      pathname?.startsWith("/settings") || 
                      pathname?.startsWith("/certificates") || 
                      pathname?.startsWith("/wishlist");

  if (isDashboard) return null;

  return (
    <footer className="border-t border-border bg-background transition-colors duration-500 overflow-hidden relative">
      {/* Structural Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container mx-auto px-8 py-32 max-w-7xl relative z-10">
        <div className="grid gap-20 lg:grid-cols-12">
          {/* Elite Brand Hub */}
          <div className="lg:col-span-5 space-y-10">
            <Link href="/" className="group flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-2xl shadow-2xl transition-transform group-hover:scale-110">
                V
              </div>
              <span className="text-3xl font-black tracking-tight text-foreground">
                Verox<span className="text-primary">.</span>
              </span>
            </Link>
            
            <p className="text-xl font-medium text-muted-foreground leading-relaxed max-w-md">
              The premier ecosystem for intellectual mastery. Architecting the future of education through cinematic experience and neural synthesis.
            </p>

            <div className="flex flex-wrap gap-8 items-center pt-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                  <Globe className="w-4 h-4 text-primary" />
                  Global Access
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Verified Credentials
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  Real-time Synthesis
               </div>
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence</h4>
              <ul className="space-y-5 text-sm font-bold text-muted-foreground">
                <li><Link href="/courses" className="hover:text-foreground transition-all flex items-center gap-2 group">Curriculum <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /></Link></li>
                <li><Link href="/top-creators" className="hover:text-foreground transition-all flex items-center gap-2 group">The Masters <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /></Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-all flex items-center gap-2 group">Research <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /></Link></li>
                <li><Link href="/enterprise" className="hover:text-foreground transition-all flex items-center gap-2 group">Enterprise <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /></Link></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Architecture</h4>
              <ul className="space-y-5 text-sm font-bold text-muted-foreground">
                <li><Link href="/creator/onboarding" className="hover:text-foreground transition-all">Join The Faculty</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-all">Our Thesis</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-all">Direct Contact</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-all">Careers</Link></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Legal Ops</h4>
              <ul className="space-y-5 text-sm font-bold text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-all">Privacy Protocol</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-all">Service Terms</Link></li>
                <li><Link href="/security" className="hover:text-foreground transition-all">Security Audit</Link></li>
                <li><Link href="/compliance" className="hover:text-foreground transition-all">Compliance</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Global Footer Terminal */}
        <div className="mt-32 pt-12 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            <span>© {currentYear} VEROX ACADEMY GLOBAL</span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-border" />
            <span className="hidden md:block">ALL SYSTEMS OPERATIONAL</span>
          </div>
          
          <div className="flex items-center gap-10">
             <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">X (Twitter)</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
             </a>
             <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
             </a>
          </div>
        </div>
      </div>

      {/* Atmospheric Background Element */}
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
    </footer>
  );
}
