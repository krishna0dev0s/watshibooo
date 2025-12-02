"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RoadmapGenerator from "./_components/roadmap-generator";

const EnhancedRoadmapTracker = dynamic(
  () => import("@/components/enhanced-roadmap-tracker"),
  { ssr: false }
);

export default function RoadmapPage() {
  const [roadmapData, setRoadmapData] = useState(null);

  const handleRoadmapGenerated = (data) => {
    setRoadmapData(data);
  };

  return (
    <div className="w-full min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {roadmapData ? (
          <EnhancedRoadmapTracker initialRoadmap={roadmapData} />
        ) : (
          <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />
        )}
      </div>
    </div>
  );
}
