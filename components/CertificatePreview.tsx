"use client";

import Image from "next/image";
import { Certificate } from "@/types/firestore";
import { BadgeCheck, ShieldCheck } from "lucide-react";

interface CertificatePreviewProps {
  certificate: Certificate;
  id?: string;
}

export function CertificatePreview({ certificate, id = "certificate-content" }: CertificatePreviewProps) {
  const issueDate = certificate.issuedAt 
    ? new Date((certificate.issuedAt as any).seconds * 1000).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) 
    : "Recently";

  return (
    <div 
      id={id}
      className="relative w-full max-w-[1000px] aspect-[1.414/1] bg-[#0B0F19] overflow-hidden shadow-2xl rounded-sm mx-auto"
      style={{ minWidth: "800px" }} // Ensure quality on capture
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/cert-bg.png" 
          alt="Background" 
          fill 
          className="object-cover opacity-90"
          priority
        />
      </div>

      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-transparent z-1" />

      {/* Content Content Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-20 py-16 text-center">
        
        {/* Logo/Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tighter uppercase">Verox Academy</span>
        </div>

        <div className="space-y-4 mb-10">
          <h2 className="text-primary font-bold text-xs uppercase tracking-[0.5em]">Certificate of Completion</h2>
          <div className="h-0.5 w-24 bg-primary/40 mx-auto" />
        </div>

        <p className="text-secondary-text font-medium text-lg italic mb-6">This is to certify that</p>
        
        <h1 className="text-5xl font-bold text-white mb-10 tracking-tight drop-shadow-lg">
          {certificate.studentName}
        </h1>

        <p className="text-secondary-text font-medium text-lg italic mb-6">has successfully completed the course</p>

        <h3 className="text-3xl font-bold text-white mb-12 tracking-tight max-w-2xl leading-tight">
          {certificate.courseTitle}
        </h3>

        <div className="grid grid-cols-2 gap-20 w-full mt-auto pt-10 border-t border-white/5">
          {/* Instructor Side */}
          <div className="text-left flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-text">Instructor</p>
            <p className="text-lg font-bold text-white tracking-tight">{certificate.creatorName}</p>
            <div className="h-px w-32 bg-primary/20 mt-2" />
          </div>

          {/* Validation Side */}
          <div className="text-right flex flex-col items-end gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-text">Issue Date</p>
            <p className="text-lg font-bold text-white tracking-tight">{issueDate}</p>
            <div className="h-px w-32 bg-primary/20 mt-2" />
          </div>
        </div>

        {/* Verification Info */}
        <div className="absolute bottom-8 left-0 right-0 px-20 flex justify-between items-end">
           <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
              <BadgeCheck className="w-3 h-3 text-primary" />
              VERIFIED AUTHENTIC: {certificate.serialNumber}
           </div>
           <p className="text-[10px] font-bold text-zinc-600 italic">verox-academy.com/verify-certificate/{certificate.id}</p>
        </div>
      </div>
    </div>
  );
}
