"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle, Sparkles, FileText, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [resumeText, setResumeText] = useState(null);
  const [improving, setImproving] = useState(false);
  const [improvedResume, setImprovedResume] = useState(null);
  const [preview, setPreview] = useState("analysis");

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    // Validate file type
    if (!uploadedFile.type.includes("pdf") && !uploadedFile.type.includes("document")) {
      toast.error("Please upload a PDF or document file");
      return;
    }

    setFile(uploadedFile);
    await analyzeResume(uploadedFile);
  };

  const analyzeResume = async (resumeFile) => {
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to analyze resume");

      const data = await res.json();
      setAnalysis(data.analysis);
      setResumeText(data.resumeText);
      toast.success("Resume analyzed successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to analyze resume");
      setFile(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const improveResume = async () => {
    if (!analysis || !resumeText) return;

    setImproving(true);
    try {
      const res = await fetch("/api/improve-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, resumeText }),
      });

      if (!res.ok) throw new Error("Failed to improve resume");

      const data = await res.json();
      setImprovedResume(data.improvedResume);
      setPreview("improved");
      toast.success("Resume improved successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to improve resume");
    } finally {
      setImproving(false);
    }
  };

  const downloadImprovedResume = () => {
    if (!improvedResume) return;

    const element = document.createElement("a");
    const file = new Blob([improvedResume], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "improved-resume.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-500/20";
    if (score >= 60) return "bg-yellow-500/20";
    return "bg-red-500/20";
  };

  if (!file) {
    return (
      <div className="space-y-6">
        <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Upload & Analysis
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
                      Drag and drop or click to select (PDF, DOC, DOCX)
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Our AI will analyze your resume and provide detailed feedback
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
                setAnalysis(null);
                setResumeText(null);
                setImprovedResume(null);
              }}
            >
              Upload Different File
            </Button>
          </div>
        </CardContent>
      </Card>

      {analyzing && (
        <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p>Analyzing your resume with AI...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && !analyzing && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setPreview("analysis")}
              className={`px-4 py-2 font-medium transition-colors ${
                preview === "analysis"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Analysis & Score
            </button>
            {improvedResume && (
              <button
                onClick={() => setPreview("improved")}
                className={`px-4 py-2 font-medium transition-colors ${
                  preview === "improved"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                AI Improved Version
              </button>
            )}
          </div>

          {preview === "analysis" && (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Overall Resume Score</span>
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)} ${getScoreBgColor(analysis.overallScore)} px-6 py-4 rounded-lg`}>
                      {analysis.overallScore}/100
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Section Scores */}
              <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Section Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analysis.sectionScores || {}).map(([section, score]) => (
                    <div key={section} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{section}</span>
                        <span className={`font-bold ${getScoreColor(score)}`}>{score}/100</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            score >= 80
                              ? "bg-green-500"
                              : score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strengths */}
              {analysis.strengths?.length > 0 && (
                <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      Your Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="flex gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Areas to Improve */}
              {analysis.improvements?.length > 0 && (
                <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-500">
                      <AlertCircle className="h-5 w-5" />
                      Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">{improvement.area}</p>
                            <p className="text-sm text-muted-foreground">{improvement.suggestion}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Key Metrics */}
              <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Resume Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analysis.metrics && Object.entries(analysis.metrics).map(([metric, value]) => (
                      <div key={metric} className="bg-muted/50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {metric.replace(/_/g, " ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Improve Button */}
              <Button
                onClick={improveResume}
                disabled={improving}
                className="w-full gap-2 bg-primary hover:bg-primary/90 h-12 text-base"
              >
                {improving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Improving Resume with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Let AI Improve This Resume
                  </>
                )}
              </Button>
            </div>
          )}

          {preview === "improved" && improvedResume && (
            <div className="space-y-6">
              <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI-Improved Resume
                    </span>
                    <Button
                      onClick={downloadImprovedResume}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border border-border bg-card/80 backdrop-blur-md shadow-md">
                <CardContent className="pt-6">
                  <div className="bg-background/50 p-6 rounded-lg max-h-[600px] overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                      {improvedResume}
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
