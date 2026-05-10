"use client";

import { useEffect, useState, use } from "react";
import { getCertificateById } from "@/lib/firestore";
import { Certificate } from "@/types/firestore";
import { CertificatePreview } from "@/components/CertificatePreview";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Download, ExternalLink, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { downloadCertificateAsPDF } from "@/lib/pdf-utils";

export default function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCert() {
      try {
        const data = await getCertificateById(id);
        if (data) {
          setCertificate(data);
        } else {
          setError("Certificate not found. It may be invalid or expired.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Unable to verify certificate at this time.");
      } finally {
        setLoading(false);
      }
    }
    fetchCert();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-secondary-text font-bold tracking-widest uppercase text-xs">Authenticating Certificate</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-8 p-10 rounded-[2.5rem] bg-muted/10 border border-border">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Verification Failed</h1>
            <p className="text-secondary-text font-medium">{error}</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="w-full h-12 rounded-xl">Back to Academy</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Verification Status Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-success/5 border border-success/20 p-8 rounded-[2.5rem] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-success text-white flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-success font-black text-xs uppercase tracking-[0.3em] mb-1">Authenticity Verified</div>
              <h1 className="text-2xl font-black text-white tracking-tight">Verified Digital Certificate</h1>
              <p className="text-sm text-secondary-text font-medium">This certificate is genuine and was issued by Verox Academy.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              onClick={() => downloadCertificateAsPDF("certificate-preview", `Verox-Certificate-${certificate.serialNumber}`)}
              className="rounded-xl h-12 gap-2 px-6"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Link href="/courses/">
              <Button variant="outline" className="rounded-xl h-12 gap-2 px-6">
                <ExternalLink className="w-4 h-4" />
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Certificate Display */}
        <div className="flex justify-center animate-in fade-in zoom-in-95 duration-1000 delay-200 overflow-x-auto pb-10">
          <div className="min-w-[800px] shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <CertificatePreview certificate={certificate} id="certificate-preview" />
          </div>
        </div>

        {/* Detailed Info */}
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="p-8 rounded-3xl bg-muted/5 border border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-2">Student</p>
            <p className="text-xl font-bold text-white tracking-tight">{certificate.studentName}</p>
          </div>
          <div className="p-8 rounded-3xl bg-muted/5 border border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-2">Course</p>
            <p className="text-xl font-bold text-white tracking-tight">{certificate.courseTitle}</p>
          </div>
          <div className="p-8 rounded-3xl bg-muted/5 border border-border/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-2">Issued By</p>
            <p className="text-xl font-bold text-white tracking-tight">{certificate.creatorName}</p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-secondary-text hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Return to Verox Academy
          </Link>
        </div>
      </div>
    </div>
  );
}
