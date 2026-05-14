"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import CourseCard from "@/components/CourseCard";
import { getCourses } from "@/lib/firestore";
import { Course } from "@/types/firestore";
import { 
  Search, 
  RefreshCcw, 
  SlidersHorizontal, 
  Filter, 
  X, 
  ChevronDown, 
  Star, 
  Clock, 
  Trophy, 
  Command, 
  Check, 
  RotateCcw, 
  LayoutGrid,
  BookOpen,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";

const CATEGORIES = ["All", "Development", "Design", "Business", "Marketing", "AI & Data"];
const LEVELS = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const RATINGS = [4, 3, 2];

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest Releases", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      setError("Unable to load the course catalog. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => {
    let result = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || (course as any).category === activeCategory;
      const matchesLevel = activeLevel === "All Levels" || (course as any).level === activeLevel;
      const matchesRating = !minRating || (course.averageRating || 5) >= minRating;
      return matchesSearch && matchesCategory && matchesLevel && matchesRating;
    });

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)); break;
      case "newest":
      case "recommended":
      default: break;
    }

    return result;
  }, [courses, searchQuery, activeCategory, activeLevel, minRating, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setActiveLevel("All Levels");
    setMinRating(null);
  };

  return (
    <div className="min-h-screen pb-32 selection:bg-accent/10 selection:text-accent">
      {/* Premium Hero Section - Responsive Spacing */}
      <SectionWrapper className="relative overflow-hidden border-b border-border/40 py-12 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.04),transparent_60%)] pointer-events-none" />
        <ContentContainer>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 lg:gap-16">
            <div className="space-y-4 md:space-y-6 flex-1">
               <Badge variant="outline" className="h-6 md:h-7 px-3 md:px-4 rounded-full border-accent/20 bg-accent/5 text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Course Marketplace</Badge>
               <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground leading-[0.95] md:leading-[0.9]">
                  Expand your <br className="hidden sm:block" /> <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">craft.</span>
               </h1>
               <p className="text-base md:text-lg lg:text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                  Browse premium masterclasses built by industry leaders to accelerate your professional journey.
               </p>
            </div>
            
            <div className="flex items-center gap-6 pb-2 shrink-0">
               <div className="flex flex-col items-start md:items-end">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">Platform Status</span>
                  <div className="flex items-center gap-2 mt-1">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">Live Marketplace</span>
                  </div>
               </div>
            </div>
          </div>
        </ContentContainer>
      </SectionWrapper>

      <ContentContainer className="pt-8 md:pt-16 lg:pt-20">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16">
          {/* Desktop Filter Sidebar: Hardened Architecture */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-12 sticky top-32 h-fit">
            {/* Search Block */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">Search Masterclasses</h3>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-accent transition-colors" />
                <Input
                  type="text"
                  placeholder="Skill or creator..."
                  className="pl-11 h-12 bg-surface border-border/40 rounded-2xl focus:ring-accent/5 transition-all text-sm font-semibold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Matrix */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">Industry Category</h3>
              <div className="flex flex-col gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all group",
                      activeCategory === cat 
                        ? "bg-accent/10 text-accent border border-accent/20" 
                        : "text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {cat}
                    {activeCategory === cat ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">SELECT</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Levels */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">Difficulty Level</h3>
              <div className="flex flex-col gap-1.5">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all group",
                      activeLevel === level 
                        ? "bg-accent/10 text-accent border border-accent/20" 
                        : "text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {level}
                    {activeLevel === level ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">SET</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Utility */}
            {(activeCategory !== "All" || activeLevel !== "All Levels" || searchQuery !== "" || minRating !== null) && (
              <Button 
                variant="ghost" 
                className="w-full h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent group border border-dashed border-border/40"
                onClick={clearFilters}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-rotate-90" />
                Reset Parameters
              </Button>
            )}
          </aside>

          {/* Main Marketplace Grid */}
          <div className="flex-1 space-y-8 md:space-y-12">
            {/* Control Interface - Optimized for Mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 p-4 md:p-5 rounded-4xl md:rounded-5xl bg-surface border border-border/40 shadow-sm relative z-20">
               <div className="flex items-center gap-4 md:gap-5 px-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-[11px] font-bold text-foreground tracking-tight">
                      {loading ? "Scanning..." : `${filteredCourses.length} Masterclasses`}
                    </span>
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Verified Catalog</span>
                  </div>
                  <div className="h-6 w-px bg-border/40" />
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[8px] md:text-[9px] font-bold px-2 md:px-3 py-1">
                    LIVE
                  </Badge>
               </div>

               <div className="flex items-center gap-3">
                  <div className="relative group flex-1 sm:flex-initial">
                     <select 
                       className="w-full sm:w-auto appearance-none bg-background border border-border/40 h-11 md:h-12 pl-4 md:pl-5 pr-10 md:pr-12 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest outline-none hover:border-accent/40 cursor-pointer shadow-sm"
                       value={sortBy}
                       onChange={(e) => setSortBy(e.target.value)}
                     >
                        {SORT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                     </select>
                     <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                  <Button 
                    variant="outline" 
                    className="lg:hidden h-11 md:h-12 rounded-xl md:rounded-2xl px-4 md:px-5 font-bold uppercase tracking-widest text-[9px] md:text-[10px] border-border/40 shrink-0"
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-2 md:mr-3" /> Filters
                  </Button>
               </div>
            </div>

            {/* Results Canvas - Adaptive Grid */}
            {loading ? (
              <div className="grid gap-6 md:gap-10 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-6">
                    <div className="aspect-video w-full bg-surface rounded-4xl md:rounded-5xl animate-pulse border border-border/40" />
                    <div className="space-y-3 px-2">
                      <div className="h-5 bg-muted rounded-full animate-pulse w-3/4" />
                      <div className="flex gap-4">
                         <div className="h-3 bg-muted rounded-full animate-pulse w-1/4" />
                         <div className="h-3 bg-muted rounded-full animate-pulse w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <EmptyState 
                icon={RefreshCcw}
                title="Catalog Synchronicity Failure"
                description={error}
              >
                <Button variant="primary" className="h-14 rounded-2xl px-10 font-bold uppercase tracking-widest text-[10px]" onClick={() => fetchCourses()}>Refresh Interface</Button>
              </EmptyState>
            ) : filteredCourses.length > 0 ? (
              <motion.div 
                layout
                className="grid gap-6 md:gap-10 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <CourseCard course={course} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="py-20 md:py-32 border-2 border-dashed border-border/40 rounded-4xl md:rounded-6xl flex flex-col items-center text-center space-y-8 bg-surface/30">
                 <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl md:rounded-4xl bg-muted/40 flex items-center justify-center text-muted-foreground/30">
                    <Search className="w-8 h-8 md:w-10 md:h-10" />
                 </div>
                 <div className="space-y-3 px-6">
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">No matches identified.</h3>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">Your current filter protocol yielded zero results. Broaden your search parameters.</p>
                 </div>
                 <Button 
                   variant="outline" 
                   className="h-12 rounded-xl px-8 font-bold uppercase tracking-widest text-[10px] border-border/40 bg-background"
                   onClick={clearFilters}
                 >
                   Reset Protocols
                 </Button>
              </div>
            )}
          </div>
        </div>
      </ContentContainer>

      {/* Mobile Filter Drawer - Hardened Touch Experience */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-100"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-background border-l border-border/40 z-110 p-6 sm:p-10 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tighter">Marketplace Filters</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Adjust search parameters</p>
                 </div>
                 <button onClick={() => setIsFilterOpen(false)} className="h-11 w-11 flex items-center justify-center bg-surface border border-border/40 rounded-xl text-foreground">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Search Catalog</h3>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <Input
                      placeholder="Title or Creator..."
                      className="pl-12 h-14 rounded-2xl bg-surface border-border/40 font-bold"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Industry Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                          activeCategory === cat ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" : "bg-surface border-border/40 text-muted-foreground/60"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Difficulty Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setActiveLevel(level)}
                        className={cn(
                          "px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                          activeLevel === level ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" : "bg-surface border-border/40 text-muted-foreground/60"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-10 border-t border-border/40 mt-10">
                   <Button 
                     className="w-full h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-accent/20"
                     onClick={() => setIsFilterOpen(false)}
                   >
                     Apply Parameters
                   </Button>
                   <button 
                     onClick={clearFilters}
                     className="w-full mt-4 h-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
                   >
                      Reset All Filters
                   </button>
                </div>
              </div>

              {/* Safe Area Padding */}
              <div className="h-[env(safe-area-inset-bottom)]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
