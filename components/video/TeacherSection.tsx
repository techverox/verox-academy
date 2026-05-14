"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface TeacherSectionProps {
  id?: string;
  name: string;
  bio: string;
  avatarUrl?: string;
}

export function TeacherSection({ id, name, bio, avatarUrl }: TeacherSectionProps) {
  const router = useRouter();

  const handleBestTeacherClick = () => {
    if (id) {
      router.push(`/courses?teacher=${id}`);
    } else {
      router.push(`/courses`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-b border-border/40">
      <div className="flex items-center gap-5 w-full">
        <Avatar className="h-14 w-14 rounded-2xl border-2 border-background shadow-xl ring-1 ring-border/40">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} className="object-cover" />}
          <AvatarFallback className="bg-accent text-white font-bold text-xl rounded-2xl">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-bold tracking-tight text-foreground">{name}</h3>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-xl">
            {bio}
          </p>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={handleBestTeacherClick}
        className="h-12 px-6 rounded-2xl border-border/40 font-bold uppercase tracking-widest text-[10px] gap-2 hover:bg-accent/5 hover:text-accent hover:border-accent/40 transition-all shrink-0 w-full md:w-auto"
      >
        <Sparkles className="w-4 h-4" />
        Best Teacher
      </Button>
    </div>
  );
}
