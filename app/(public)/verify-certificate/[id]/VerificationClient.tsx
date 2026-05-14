"use client";

import { useState } from "react";
import { Certificate } from "@/types/firestore";
import { CertificatePreview } from "@/components/CertificatePreview";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Download, ExternalLink, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { downloadCertificateAsPDF } from "@/lib/pdf-utils";
import { SectionWrapper } from "@/components/layout/SectionWrapper";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Badge } from "@/components/ui/Badge";

interface VerificationClientProps {
  initialCertificate: Certificate | null;
  id: string;
}

export default function VerificationClient({ initialCertificate, id }: VerificationClientProps) {
  const [certificate] = useState<Certificate | null>(initialCertificate);

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-border shadow-2xl shadow-black/5 dark:shadow-none p-12 rounded-5xl text-center space-y-8">
          <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Verification Failed</h1>
            <p className="text-muted-foreground font-medium">Certificate not found. It may be invalid or expired.</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-border/60">Back to Academy</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <SectionWrapper className="pt-24 pb-12">
        <ContentContainer className="max-w-6xl mx-auto space-y-16">
          
          {/* Verification Status Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-white dark:bg-zinc-900/50 border border-border/60 p-8 md:p-12 rounded-5xl shadow-2xl shadow-black/3 dark:shadow-none relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(37,99,235,0.03),transparent_50%)] pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
              <div className="h-20 w-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-center sm:text-left">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-bold text-[10px] uppercase tracking-widest px-3 py-1 mb-3">Authenticity Verified</Badge>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  Verified Digital <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">Certificate</span>
                </h1>
                <p className="text-sm text-muted-foreground font-medium mt-2">This certificate is genuine and was issued by Verox Academy.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10">
              <Button 
                onClick={() => downloadCertificateAsPDF("certificate-preview", `Verox-Certificate-${certificate.serialNumber}`)}
                className="h-14 rounded-2xl gap-3 px-8 bg-linear-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/20 border-none"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </Button>
              <Link href="/courses/">
                <Button variant="outline" className="h-14 rounded-2xl gap-3 px-8 font-bold border-border/60">
                  <ExternalLink className="w-5 h-5" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>

          {/* Certificate Display */}
          <div className="flex justify-center animate-in fade-in zoom-in-95 duration-1000 delay-200 overflow-x-auto pb-6">
            <div className="min-w-[800px] shadow-2xl shadow-black/10 rounded-lg overflow-hidden ring-1 ring-border/20">
              <CertificatePreview certificate={certificate} id="certificate-preview" />
            </div>
          </div>

          {/* Detailed Info */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Student", value: certificate.studentName },
              { label: "Course", value: certificate.courseTitle },
              { label: "Issued By", value: certificate.creatorName }
            ].map((info, i) => (
              <div key={i} className="p-8 rounded-4xl bg-white dark:bg-zinc-900/50 border border-border/60 shadow-sm text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">{info.label}</p>
                <p className="text-xl font-bold text-foreground tracking-tight leading-tight">{info.value}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Return to Verox Academy
            </Link>
          </div>
        </ContentContainer>
      </SectionWrapper>
    </div>
  );
}
