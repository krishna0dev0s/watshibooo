"use client";

import { useState } from "react";
import { resumeTemplates, getTemplateConfig } from "@/data/resumeTemplates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, Layout } from "lucide-react";

export default function TemplateSelector({ onSelectTemplate, selectedTemplate }) {
  const [open, setOpen] = useState(false);
  const currentTemplate = getTemplateConfig(selectedTemplate || "modern-clean");

  const handleSelectTemplate = (templateId) => {
    onSelectTemplate(templateId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-white/10 hover:bg-white/20 border-white/20 transition-all duration-300 ease-in-out hover:scale-105"
        >
          <Layout className="h-4 w-4" />
          <span className="hidden sm:inline">Change Template</span>
          <span className="sm:hidden">Template</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Layout className="h-6 w-6" />
            Select Resume Template
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Choose a professional ATS-optimized template that matches your career level and industry. All templates are designed for maximum compatibility with Applicant Tracking Systems.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
          {resumeTemplates.map((template) => (
            <Card
              key={template.id}
              className={`relative p-6 cursor-pointer transition-all duration-300 ${
                selectedTemplate === template.id
                  ? "ring-2 ring-blue-500 bg-blue-500/10 border-blue-500"
                  : "hover:border-white/20 border-white/10 bg-white/5"
              }`}
              onClick={() => handleSelectTemplate(template.id)}
            >
              {/* Template Preview */}
              <div
                className="h-32 mb-4 rounded border border-white/10 bg-white/5 overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, ${template.colors.accent} 0%, ${template.colors.accent} 100%)`,
                }}
              >
                {/* Header Section Preview */}
                <div
                  style={{
                    backgroundColor: template.colors.primary,
                    height: "40%",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "8px",
                  }}
                >
                  <div className="text-white">
                    <div className="text-xs font-bold">Name</div>
                    <div className="text-xs opacity-80">Email • Phone</div>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="p-2 text-xs text-gray-600 space-y-1">
                  <div
                    style={{ color: template.colors.primary }}
                    className="font-bold"
                  >
                    Summary
                  </div>
                  <div className="text-gray-500">Content section...</div>
                </div>
              </div>

              {/* Template Info */}
              <h3 className="font-bold text-white mb-2 flex items-center justify-between">
                {template.name}
                {selectedTemplate === template.id && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                )}
              </h3>

              <p className="text-sm text-gray-300 mb-3">{template.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${template.colors.primary}20`,
                      color: template.colors.primary,
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Select Button */}
              {selectedTemplate !== template.id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-4 bg-white/10 hover:bg-white/20 border-white/20"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  Select Template
                </Button>
              )}

              {selectedTemplate === template.id && (
                <Button
                  size="sm"
                  disabled
                  className="w-full mt-4 bg-blue-500 text-white"
                >
                  ✓ Selected
                </Button>
              )}
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-gray-300">
          <p className="font-semibold text-blue-400 mb-2">💡 Template Features:</p>
          <ul className="space-y-1 text-xs">
            <li>✓ All templates optimized for 100% ATS compatibility</li>
            <li>✓ Elegant, professional design suitable for any industry</li>
            <li>✓ Clean formatting with proper section hierarchy</li>
            <li>✓ Maintains readability in all ATS systems</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
