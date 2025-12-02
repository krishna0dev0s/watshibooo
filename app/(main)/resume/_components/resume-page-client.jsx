"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeBuilder from "./resume-builder";
import ResumeAnalyzer from "./resume-analyzer";
import ResumeExtractor from "./resume-extractor";

export default function ResumePageClient({ resume }) {
  return (
    <Tabs defaultValue="builder" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger 
          value="builder"
          className="data-[state=active]:text-primary-foreground"
        >
          Resume Builder
        </TabsTrigger>
        <TabsTrigger 
          value="extractor"
          className="data-[state=active]:text-primary-foreground"
        >
          Resume Extractor
        </TabsTrigger>
        <TabsTrigger 
          value="analyzer"
          className="data-[state=active]:text-primary-foreground"
        >
          Resume Analyzer
        </TabsTrigger>
      </TabsList>

      {/* Resume Builder Tab */}
      <TabsContent value="builder" className="border border-white/10 rounded-xl">
        <ResumeBuilder initialContent={resume?.content} initialTemplate={resume?.template} />
      </TabsContent>

      {/* Resume Extractor Tab */}
      <TabsContent value="extractor" className="border border-white/10 rounded-xl p-6">
        <ResumeExtractor />
      </TabsContent>

      {/* Resume Analyzer Tab */}
      <TabsContent value="analyzer" className="border border-white/10 rounded-xl p-6">
        <ResumeAnalyzer />
      </TabsContent>
    </Tabs>
  );
}
