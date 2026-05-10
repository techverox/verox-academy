import { Metadata } from "next";
import { getCertificateByIdServer } from "@/lib/firestore-server";
import VerificationClient from "./VerificationClient";
import SchemaOrg from "@/components/SEO/SchemaOrg";
import { APP_URL } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Dynamic Metadata for Certificates
 * =================================
 * Provides verifiable metadata for certificates, making them
 * more professional when shared on LinkedIn or other platforms.
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const certificate = await getCertificateByIdServer(params.id);
  
  if (!certificate) return { title: "Certificate Not Found" };

  const title = `Verified Certificate: ${certificate.studentName} | Verox Academy`;
  const description = `This certificate verifies that ${certificate.studentName} has successfully completed the course "${certificate.courseTitle}" on Verox Academy.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${APP_URL}/verify-certificate/${params.id}`,
    },
  };
}

export default async function VerificationPage(props: Props) {
  const params = await props.params;
  const certificate = await getCertificateByIdServer(params.id);

  const schema = certificate ? {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    "name": `Certificate of Completion: ${certificate.courseTitle}`,
    "description": `Verified completion of ${certificate.courseTitle} by ${certificate.studentName}`,
    "credentialCategory": "Certificate",
    "recognizingOrganization": {
      "@type": "Organization",
      "name": "Verox Academy",
      "sameAs": APP_URL
    },
    "abstract": `This digital certificate verifies the successful completion of an online course on Verox Academy. Serial Number: ${certificate.serialNumber}`,
    "identifier": certificate.serialNumber,
    "dateCreated": (certificate.issuedAt as any)?.toDate?.()?.toISOString() || new Date().toISOString(),
  } : null;

  return (
    <>
      {schema && <SchemaOrg data={schema} />}
      <VerificationClient initialCertificate={certificate} id={params.id} />
    </>
  );
}
