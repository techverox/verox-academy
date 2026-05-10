"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates a high-quality PDF certificate from a DOM element.
 * @param elementId - The ID of the HTML element to capture.
 * @param fileName - The name of the downloaded file.
 */
export const downloadCertificateAsPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: null,
    });

    const imgData = canvas.toDataURL("image/png");
    
    // Landscape orientation
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
  }
};
