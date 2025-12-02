"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Pencil,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/app/actions/resume";
import { EntryForm } from "./entry-form";
import TemplateSelector from "./template-selector";
import TemplatePreview from "./template-preview";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

// Dynamically import MDEditor to avoid server-side issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function ResumeBuilder({ initialContent, initialTemplate = "modern-clean" }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  // Build template data from form values - only update when specific fields change
  const templateData = useMemo(() => {
    const { contactInfo, summary, skills, experience, education } = formValues;
    return {
      fullName: user?.fullName || "Your Name",
      email: contactInfo?.email || "",
      phone: contactInfo?.mobile || "",
      linkedin: contactInfo?.linkedin || "",
      website: contactInfo?.twitter || "",
      summary: summary || "",
      skills: skills || "",
      experience: experience || [],
      education: education || [],
    };
  }, [
    formValues.contactInfo?.email,
    formValues.contactInfo?.mobile,
    formValues.contactInfo?.linkedin,
    formValues.contactInfo?.twitter,
    formValues.summary,
    formValues.skills,
    formValues.experience,
    formValues.education,
    user?.fullName,
  ]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Suppress html2canvas color function warnings
      const originalError = console.error;
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
        // Use template preview for PDF if template is selected
        const element = document.getElementById("template-preview") || document.getElementById("resume-pdf");
        if (!element) {
          toast.error("Preview not available");
          return;
        }

        const opt = {
          margin: [15, 15],
          filename: `resume-${selectedTemplate}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        // Dynamically import html2pdf only on the client side
        const html2pdf = (await import("html2pdf.js/dist/html2pdf.min.js")).default;
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
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();

      await saveResumeFn(previewContent, selectedTemplate);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-slate-800 to-slate-900/50 p-4 rounded-lg">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">Resume Status</p>
          <p className="text-sm text-gray-100">
            {previewContent ? "Draft saved" : "No content yet"} • Template: {selectedTemplate}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TemplateSelector 
            onSelectTemplate={setSelectedTemplate}
            selectedTemplate={selectedTemplate}
          />
          <Button
            variant="outline"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="bg-white/10 hover:bg-white/20 border-white/20 transition-all duration-300 ease-in-out hover:scale-105"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Resume
              </>
            )}
          </Button>
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-white/20 hover:bg-white/30 border-white/20 text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-white/10"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger
            value="edit"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex items-center">
              <Pencil className="h-4 w-4 mr-2" />
              Resume Form
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="markdown"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit Text
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <div className="flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Template Preview
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <div className="space-y-8 bg-card/30 border border-white/10 rounded-lg p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-background/50 border border-white/10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input
                      {...register("contactInfo.email")}
                      type="email"
                      className="bg-transparent border-white/20"
                      placeholder="your@email.com"
                      error={errors.contactInfo?.email}
                    />
                    {errors.contactInfo?.email && (
                      <p className="text-sm text-red-500">
                        {errors.contactInfo.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Mobile Number
                    </label>
                    <Input
                      {...register("contactInfo.mobile")}
                      type="tel"
                      className="bg-transparent border-white/20"
                      placeholder="+1 234 567 8900"
                    />
                    {errors.contactInfo?.mobile && (
                      <p className="text-sm text-red-500">
                        {errors.contactInfo.mobile.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      LinkedIn URL
                    </label>
                    <Input
                      {...register("contactInfo.linkedin")}
                      type="url"
                      className="bg-transparent border-white/20"
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                    {errors.contactInfo?.linkedin && (
                      <p className="text-sm text-red-500">
                        {errors.contactInfo.linkedin.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Twitter/X Profile
                    </label>
                    <Input
                      {...register("contactInfo.twitter")}
                      type="url"
                      className="bg-transparent border-white/20"
                      placeholder="https://twitter.com/your-handle"
                    />
                    {errors.contactInfo?.twitter && (
                      <p className="text-sm text-red-500">
                        {errors.contactInfo.twitter.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
                  Professional Summary
                </h3>
                <Controller
                  name="summary"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="h-32 bg-transparent border-white/20"
                      placeholder="Write a compelling professional summary..."
                      error={errors.summary}
                    />
                  )}
                />
                {errors.summary && (
                  <p className="text-sm text-red-500">{errors.summary.message}</p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
                  Skills
                </h3>
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      className="h-32 bg-transparent border-white/20"
                      placeholder="List your key skills..."
                      error={errors.skills}
                    />
                  )}
                />
                {errors.skills && (
                  <p className="text-sm text-red-500">{errors.skills.message}</p>
                )}
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
                  Work Experience
                </h3>
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Experience"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.experience && (
                  <p className="text-sm text-red-500">
                    {errors.experience.message}
                  </p>
                )}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
                  Education
                </h3>
                <Controller
                  name="education"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Education"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.education && (
                  <p className="text-sm text-red-500">
                    {errors.education.message}
                  </p>
                )}
              </div>

              {/* Projects */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
                  Projects
                </h3>
                <Controller
                  name="projects"
                  control={control}
                  render={({ field }) => (
                    <EntryForm
                      type="Project"
                      entries={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.projects && (
                  <p className="text-sm text-red-500">
                    {errors.projects.message}
                  </p>
                )}
              </div>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="markdown">
          {activeTab === "markdown" && (
            <Button
              variant="outline"
              type="button"
              className="mb-4 bg-white/10 hover:bg-white/20 border-white/20 transition-all duration-300 ease-in-out hover:scale-105"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "markdown" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center bg-yellow-950/50 border border-yellow-600/50 text-yellow-600 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border border-white/10 rounded-lg shadow-sm bg-background/50">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
              className="bg-background"
              previewOptions={{
                className: "prose prose-slate max-w-none p-8 bg-background",
              }}
            />
          </div>
          <div className="hidden">
            <div id="resume-pdf">
              <div
                style={{
                  background: "white",
                  color: "black",
                  padding: "20px",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {previewContent}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <TemplatePreview 
            resumeData={templateData} 
            templateId={selectedTemplate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}