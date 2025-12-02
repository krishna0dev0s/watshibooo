"use client";

import { useState, useEffect } from "react";
import { templateHTML, getTemplateConfig } from "@/data/resumeTemplates";
import { Button } from "@/components/ui/button";
import { Download, Eye, Code } from "lucide-react";
import { toast } from "sonner";

export default function TemplatePreview({ resumeData, templateId = "modern-clean" }) {
  const [htmlContent, setHtmlContent] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  const template = getTemplateConfig(templateId);
  const templateHtml = templateHTML[templateId] || templateHTML["modern-clean"];

  useEffect(() => {
    if (resumeData) {
      renderTemplate(resumeData);
    }
  }, [resumeData, templateId]);

  const renderTemplate = (data) => {
    setIsRendering(true);
    try {
      let html = templateHtml;

      // Replace placeholders with actual data
      html = html.replace(/\{\{FULL_NAME\}\}/g, data.fullName || "Your Name");
      html = html.replace(/\{\{JOB_TITLE\}\}/g, data.jobTitle || "Professional");
      html = html.replace(/\{\{EMAIL\}\}/g, data.email || "email@example.com");
      html = html.replace(/\{\{PHONE\}\}/g, data.phone || "");
      html = html.replace(/\{\{LOCATION\}\}/g, data.location || "City, State");
      html = html.replace(/\{\{LINKEDIN\}\}/g, data.linkedin || "");
      html = html.replace(/\{\{WEBSITE\}\}/g, data.website || "");
      html = html.replace(/\{\{SUMMARY\}\}/g, data.summary || "");
      html = html.replace(/\{\{SKILLS\}\}/g, data.skills || "");

      // Experience section
      let experienceHtml = "";
      if (data.experience && data.experience.length > 0) {
        experienceHtml = data.experience
          .map((exp) => {
            return `<div style="margin-bottom: 0.2in;">
          <p style="margin: 0.05in 0 0 0; font-weight: bold; font-size: 11px; color: #1f2937;">${exp.jobTitle}</p>
          <p style="margin: 0.02in 0 0 0; font-size: 10px; color: #6b7280;">${exp.company} | ${exp.duration || ''}</p>
          <ul style="margin: 0.05in 0 0 0.2in; padding: 0; font-size: 10px; color: #374151; line-height: 1.4;">
            ${(exp.description || "")
              .split("\n")
              .filter((line) => line.trim())
              .map((line) => `<li>${line.trim()}</li>`)
              .join("")}
          </ul>
        </div>`;
          })
          .join("");
      }
      html = html.replace(/\{\{EXPERIENCE\}\}/g, experienceHtml || "");

      // Education section
      let educationHtml = "";
      if (data.education && data.education.length > 0) {
        educationHtml = data.education
          .map((edu) => {
            return `<p style="margin: 0.05in 0 0 0; font-size: 10px; color: #374151; line-height: 1.4;">
          <strong>${edu.degree}</strong> from ${edu.school}${edu.graduationDate ? ` (${edu.graduationDate})` : ""}
        </p>`;
          })
          .join("");
      }
      html = html.replace(/\{\{EDUCATION\}\}/g, educationHtml || "");

      // Certifications section
      let certificationsHtml = data.certifications || "";
      html = html.replace(/\{\{CERTIFICATIONS\}\}/g, certificationsHtml);

      setHtmlContent(html);
    } catch (error) {
      console.error("Error rendering template:", error);
      toast.error("Failed to render template");
    } finally {
      setIsRendering(false);
    }
  };

  const downloadHTML = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([htmlContent], { type: "text/html" });
      element.href = URL.createObjectURL(file);
      element.download = `resume-${templateId}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("HTML file downloaded!");
    } catch (error) {
      toast.error("Failed to download HTML");
    }
  };

  const downloadPDF = async () => {
    if (!htmlContent) {
      toast.error("Template not ready. Please wait...");
      return;
    }

    try {
      // Suppress html2canvas color function warnings
      const originalError = console.error;
      let isDownloading = true;

      console.error = (...args) => {
        // Suppress html2canvas color parsing warnings
        if (
          typeof args[0] === "string" &&
          (args[0].includes("oklab") ||
            args[0].includes("color function") ||
            args[0].includes("Attempting to parse"))
        ) {
          return;
        }
        originalError(...args);
      };

      try {
        // Dynamic import of html2pdf
        const html2pdf = (await import("html2pdf.js/dist/html2pdf.min.js")).default;
        const opt = {
          margin: [15, 15],
          filename: `resume-${templateId}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        const element = document.getElementById("template-preview");
        if (!element) {
          toast.error("Template element not found");
          return;
        }

        await html2pdf().set(opt).from(element).save();
        toast.success("PDF generated successfully!");
      } finally {
        // Restore original console.error
        console.error = originalError;
      }
    } catch (error) {
      // Only show actual errors, not html2canvas warnings
      if (
        error &&
        !String(error).includes("oklab") &&
        !String(error).includes("color function")
      ) {
        console.error("PDF generation error:", error);
        toast.error("Failed to generate PDF");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={downloadPDF}
          size="sm"
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button
          onClick={downloadHTML}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Code className="h-4 w-4" />
          Download HTML
        </Button>
      </div>

      <div
        id="template-preview"
        className="border border-white/10 rounded-lg p-8 bg-white text-black overflow-auto max-h-96"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{
          fontFamily: "Arial, sans-serif",
        }}
      />
    </div>
  );
}
