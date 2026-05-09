import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/learn/", "/api/"],
    },
    sitemap: "https://verox-academy.vercel.app/sitemap.xml",
  };
}
