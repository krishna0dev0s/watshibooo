"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Download, Loader2, Zap, BookOpen, Target, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateRoadmapContent } from "@/app/actions/roadmap";
import { Globe } from "@/icons/Globe";
import { SmartphoneNfc } from "@/icons/SmartphoneNfc";
import { ChartColumn } from "@/icons/ChartColumn";
import { Cpu } from "@/icons/Cpu";
import { PackageOpen } from "@/icons/PackageOpen";
import { SlidersVertical } from "@/icons/SlidersVertical";
import { ToggleLeft } from "@/icons/ToggleLeft";
import { Sparkles } from "@/icons/Sparkles";

const RoadmapXyflow = dynamic(() => import("./roadmap-xyflow"), { ssr: false });
const RoadmapPreview = dynamic(() => import("./roadmap-preview"), { ssr: false });

const POPULAR_DOMAINS = [
  { name: "Web Development", Icon: Globe, color: "from-blue-500 to-cyan-500" },
  { name: "Mobile Development", Icon: SmartphoneNfc, color: "from-purple-500 to-pink-500" },
  { name: "Data Science", Icon: ChartColumn, color: "from-orange-500 to-red-500" },
  { name: "Machine Learning", Icon: Cpu, color: "from-green-500 to-emerald-500" },
  { name: "Cloud Computing", Icon: PackageOpen, color: "from-indigo-500 to-blue-500" },
  { name: "DevOps", Icon: SlidersVertical, color: "from-rose-500 to-pink-500" },
  { name: "Cybersecurity", Icon: ToggleLeft, color: "from-red-500 to-orange-500" },
  { name: "AI/LLMs", Icon: Sparkles, color: "from-yellow-500 to-orange-500" },
];

export default function RoadmapGenerator({ onRoadmapGenerated }) {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [skills, setSkills] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [timelineMonths, setTimelineMonths] = useState(3);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const generateRoadmap = async () => {
    if (!selectedDomain || !skills.trim()) {
      toast.error("Please select a domain and enter skills");
      return;
    }

    setLoading(true);
    try {
      const result = await generateRoadmapContent({
        domain: selectedDomain,
        skills: skills,
        level: currentLevel,
        months: timelineMonths,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to generate roadmap");
        return;
      }

      setRoadmap({
        domain: selectedDomain,
        skills: skills,
        level: currentLevel,
        months: timelineMonths,
        data: result.data,
        generatedAt: new Date().toLocaleDateString(),
      });
      
      // Call parent callback to update roadmap in page state
      if (onRoadmapGenerated) {
        onRoadmapGenerated({
          domain: selectedDomain,
          skills: skills,
          level: currentLevel,
          months: timelineMonths,
          phases: result.data?.phases || [],
          data: result.data,
          generatedAt: new Date().toLocaleDateString(),
        });
      }
      
      setShowPreview(true);
      toast.success("Roadmap generated successfully!");
    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast.error("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showPreview && roadmap) {
    return (
      <div className="w-full h-screen flex flex-col">
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={() => setShowPreview(false)}
            variant="outline"
            className="border-white/10 hover:bg-white/10 text-white"
          >
            ← Back to Generator
          </Button>
        </div>
        <RoadmapXyflow roadmap={roadmap} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Domain Selection */}
      <Card className="border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-8 backdrop-blur-xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-white">Select Learning Domain</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" suppressHydrationWarning>
            {POPULAR_DOMAINS.map((domain) => (
              <button
                key={domain.name}
                onClick={() => setSelectedDomain(domain.name)}
                suppressHydrationWarning
                className={`group relative overflow-hidden rounded-lg p-4 transition-all duration-300 ${
                  selectedDomain === domain.name
                    ? `bg-gradient-to-br ${domain.color} ring-2 ring-offset-2 ring-offset-black ring-white`
                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 text-center space-y-2">
                  <div className="flex justify-center">
                    <domain.Icon width={40} height={40} stroke={selectedDomain === domain.name ? "#000" : "#fff"} />
                  </div>
                  <p className="font-semibold text-white text-sm">{domain.name}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Domain Input */}
          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-gray-300">Or Enter Custom Domain</label>
            <Input
              placeholder="e.g., Blockchain Development, Game Development..."
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </Card>

      {/* Skills and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Skills */}
        <Card className="border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-8 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-white">Target Skills</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Enter the specific skills you want to learn (comma-separated)</p>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g., React, Node.js, MongoDB, Express.js..."
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </Card>

        {/* Learning Settings */}
        <Card className="border border-white/10 bg-gradient-to-br from-black/40 to-black/20 p-8 backdrop-blur-xl">
          <div className="space-y-6">
            {/* Current Level */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Current Level
              </label>
              <div className="grid grid-cols-3 gap-3" suppressHydrationWarning>
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setCurrentLevel(level)}
                    suppressHydrationWarning
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${
                      currentLevel === level
                        ? "bg-primary text-black"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Learning Timeline
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={timelineMonths}
                  onChange={(e) => setTimelineMonths(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-lg font-bold text-primary min-w-[80px]">{timelineMonths} months</span>
              </div>
              <p className="text-xs text-gray-400">Adjust the expected timeline for learning</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generateRoadmap}
        disabled={loading || !selectedDomain || !skills.trim()}
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-black font-bold py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Your Roadmap...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-5 w-5" />
            Generate Personalized Roadmap
          </>
        )}
      </Button>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: <ChartColumn width={32} height={32} stroke="#60a5fa" />,
            title: "Structured Learning",
            desc: "Break down complex skills into manageable phases",
          },
          {
            icon: <Target className="h-8 w-8 text-blue-400" />,
            title: "Tailored Content",
            desc: "Get recommendations based on your experience level",
          },
          {
            icon: <Download className="h-8 w-8 text-blue-400" />,
            title: "Downloadable",
            desc: "Save your roadmap as a beautiful PDF document",
          },
        ].map((card, idx) => (
          <Card
            key={idx}
            className="border border-white/10 bg-white/5 p-6 text-center hover:bg-white/10 transition-colors"
          >
            <div className="flex justify-center mb-3">{card.icon}</div>
            <h4 className="font-bold text-white mb-2">{card.title}</h4>
            <p className="text-sm text-gray-400">{card.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
