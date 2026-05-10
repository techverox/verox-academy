import React from 'react';

/**
 * SchemaOrg Component
 * ====================
 * Injects JSON-LD structured data into the page for SEO.
 * This helps search engines understand the content (Course, Organization, etc.)
 * and enables rich snippets in search results.
 */
interface SchemaOrgProps {
  data: Record<string, any>;
}

const SchemaOrg: React.FC<SchemaOrgProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default SchemaOrg;
