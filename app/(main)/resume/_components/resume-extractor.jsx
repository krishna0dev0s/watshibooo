"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle, Sparkles, FileText, Download, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ResumeExtractor() {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [finalResume, setFinalResume] = useState(null);
  const [preview, setPreview] = useState("extracted");

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    // Validate file type
    if (!uploadedFile.type.includes("pdf") && !uploadedFile.type.includes("document")) {
      toast.error("Please upload a PDF or document file");
      return;
    }

    setFile(uploadedFile);
    await extractResumeData(uploadedFile);
  };

  const extractResumeData = async (resumeFile) => {
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch("/api/extract-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to extract resume data");
      }

      const data = await res.json();
      setExtractedData(data.resumeData);
      toast.success("Resume data extracted successfully!");
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error(error.message || "Failed to extract resume data");
      setFile(null);
    } finally {
      setExtracting(false);
    }
  };

  const generateFinalResume = async () => {
    if (!extractedData) return;

    setGeneratingResume(true);
    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: extractedData }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate resume");
      }

      const data = await res.json();
      setFinalResume(data.resume);
      setPreview("final");
      toast.success("Resume generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to generate resume");
    } finally {
      setGeneratingResume(false);
    }
  };

  const downloadResume = (content, filename) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!file) {
    return (
      <div className="space-y-6">
        <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Extract & Build Professional Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-lg font-semibold">Upload Your Resume</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, DOC, or DOCX (We&apos;ll extract all details and create a polished version)
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Our AI will extract your resume data and generate a professionally formatted resume ready to use
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Info */}
      <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setExtractedData(null);
                setFinalResume(null);
              }}
            >
              Upload Different File
            </Button>
          </div>
        </CardContent>
      </Card>

      {extracting && (
        <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p>Extracting your resume details...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {extractedData && !extracting && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setPreview("extracted")}
              className={`px-4 py-2 font-medium transition-colors ${
                preview === "extracted"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Extracted Data
            </button>
            {finalResume && (
              <button
                onClick={() => setPreview("final")}
                className={`px-4 py-2 font-medium transition-colors ${
                  preview === "final"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                Final Resume
              </button>
            )}
          </div>

          {preview === "extracted" && (
            <div className="space-y-6">
              {/* Personal Info */}
              {extractedData.personalInfo && (
                <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {extractedData.personalInfo.fullName && (
                      <div><span className="font-semibold">Name:</span> {extractedData.personalInfo.fullName}</div>
                    )}
                    {extractedData.personalInfo.email && (
                      <div><span className="font-semibold">Email:</span> {extractedData.personalInfo.email}</div>
                    )}
                    {extractedData.personalInfo.phone && (
                      <div><span className="font-semibold">Phone:</span> {extractedData.personalInfo.phone}</div>
                    )}
                    {extractedData.personalInfo.location && (
                      <div><span className="font-semibold">Location:</span> {extractedData.personalInfo.location}</div>
                    )}
                    {extractedData.personalInfo.linkedIn && (
                      <div><span className="font-semibold">LinkedIn:</span> {extractedData.personalInfo.linkedIn}</div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Professional Summary */}
              {extractedData.summary && (
                <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Professional Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{extractedData.summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {extractedData.skills && extractedData.skills.length > 0 && (
                <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {extractedData.experience && extractedData.experience.length > 0 && (
                <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Work Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {extractedData.experience.map((exp, idx) => (
                      <div key={idx} className="pb-4 border-b border-border/50 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{exp.jobTitle}</p>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          </div>
                          {exp.duration && (
                            <span className="text-xs text-muted-foreground">{exp.duration}</span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="text-sm mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {extractedData.education && extractedData.education.length > 0 && (
                <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Education</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {extractedData.education.map((edu, idx) => (
                      <div key={idx} className="pb-4 border-b border-border/50 last:border-b-0 last:pb-0">
                        <p className="font-semibold">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.school}</p>
                        {edu.graduationDate && (
                          <p className="text-xs text-muted-foreground mt-1">{edu.graduationDate}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Generate Resume Button */}
              <Button
                onClick={generateFinalResume}
                disabled={generatingResume}
                className="w-full gap-2 bg-primary hover:bg-primary/90 h-12 text-base"
              >
                {generatingResume ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Professional Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Professional Resume
                  </>
                )}
              </Button>
            </div>
          )}

          {preview === "final" && finalResume && (
            <div className="space-y-6">
              <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Professional Resume (Ready to Use)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadResume(finalResume, "resume.txt")}
                        className="gap-2 bg-primary hover:bg-primary/90"
                      >
                        <Download className="h-4 w-4" />
                        Download TXT
                      </Button>
                      <Button
                        onClick={() => {
                          // Copy to clipboard
                          navigator.clipboard.writeText(finalResume);
                          toast.success("Copied to clipboard!");
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                <CardContent className="pt-6">
                  <div className="bg-background/50 p-6 rounded-lg max-h-[700px] overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono prose prose-invert max-w-none">
                      {finalResume}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
