"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Download,
  Share2,
  Target,
  Zap,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

export default function EnhancedRoadmapTracker({ roadmap, completedPhases = [], onPhaseComplete }) {
  const [view, setView] = useState("timeline");
  const [expandedPhase, setExpandedPhase] = useState(null);

  // Provide default roadmap if not passed
  const defaultRoadmap = {
    domain: "Learning Path",
    months: 12,
    phases: [
      { name: "Foundation", topics: ["Basics", "Core Concepts"], projects: [], resources: [] },
      { name: "Intermediate", topics: ["Advanced Topics", "Practice"], projects: [], resources: [] },
      { name: "Advanced", topics: ["Mastery", "Specialization"], projects: [], resources: [] },
      { name: "Expert", topics: ["Real-world Application"], projects: [], resources: [] },
    ],
  };

  const activeRoadmap = roadmap || defaultRoadmap;

  // Mock function - in production would track actual dates
  const calculateStreak = (phases) => {
    return Math.min(phases.length * 7, 42);
  };

  // Handle mark phase complete
  const markPhaseComplete = () => {
    if (progress.completed < progress.total) {
      const newCompleted = [...completedPhases, progress.completed];
      if (onPhaseComplete) {
        onPhaseComplete(newCompleted);
      }
      toast.success(`Phase ${progress.completed + 1} marked as complete! 🎉`);
    }
  };

  // Handle continue learning
  const continueLearning = () => {
    const currentPhaseIndex = completedPhases.length;
    setExpandedPhase(currentPhaseIndex);
    toast.info("Expand the phase above to see resources and start learning");
  };

  // Handle view resources
  const viewResources = () => {
    const currentPhaseIndex = completedPhases.length;
    setExpandedPhase(currentPhaseIndex);
    toast.info("Scroll down to view available resources");
  };

  // Handle share achievement
  const shareAchievement = () => {
    const achievementText = `I've completed the ${activeRoadmap.domain} roadmap! 🎉 Check out Watshibo to track your learning journey.`;
    if (navigator.share) {
      navigator.share({
        title: "Learning Achievement",
        text: achievementText,
      });
    } else {
      navigator.clipboard.writeText(achievementText);
      toast.success("Achievement copied to clipboard!");
    }
  };

  // Calculate comprehensive progress
  const progress = useMemo(() => {
    const totalPhases = activeRoadmap.phases?.length || 0;
    const completed = completedPhases.length;
    const percentage = totalPhases > 0 ? (completed / totalPhases) * 100 : 0;

    // Calculate time metrics
    const monthsPerPhase = (activeRoadmap.months || 12) / totalPhases;
    const monthsCompleted = completed * monthsPerPhase;
    const monthsRemaining = Math.ceil(activeRoadmap.months - monthsCompleted);
    const estimatedCompletion = new Date();
    estimatedCompletion.setMonth(estimatedCompletion.getMonth() + monthsRemaining);

    // Calculate learning velocity (phases per month)
    const velocity = totalPhases > 0 ? (completed / (activeRoadmap.months / 12)) : 0;

    return {
      percentage: Math.round(percentage),
      completed,
      total: totalPhases,
      monthsCompleted: Math.round(monthsCompleted),
      monthsRemaining,
      estimatedCompletion: estimatedCompletion.toLocaleDateString(),
      velocity: velocity.toFixed(1),
      streakDays: calculateStreak(completedPhases),
    };
  }, [activeRoadmap, completedPhases]);

  // Phase status indicators
  const getPhaseStatus = (phaseIndex) => {
    if (completedPhases.includes(phaseIndex)) return "completed";
    if (completedPhases.includes(phaseIndex - 1)) return "active";
    return "pending";
  };

  // Generate milestone achievements
  const milestones = [
    { phase: 0, label: "Journey Started", reward: "🎯" },
    { phase: Math.floor(progress.total / 4), label: "25% Complete", reward: "🌟" },
    { phase: Math.floor((progress.total / 4) * 2), label: "50% Milestone", reward: "⭐" },
    { phase: Math.floor((progress.total / 4) * 3), label: "75% Achievement", reward: "🏅" },
    { phase: progress.total - 1, label: "Master", reward: "🏆" },
  ];

  const unlockedMilestones = milestones.filter(
    (m) => completedPhases.length >= m.phase
  );

  // Export progress
  const exportProgress = () => {
    const reportData = {
      roadmap: activeRoadmap.domain,
      generatedAt: new Date().toISOString(),
      progress: progress,
      completedPhases: completedPhases,
      milestones: unlockedMilestones,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `roadmap-progress-${Date.now()}.json`;
    link.click();
    toast.success("Progress exported!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Roadmap Progress Tracker</h1>
            <p className="text-muted-foreground mt-1">
              {activeRoadmap.domain} • {activeRoadmap.level || "Intermediate"} Level
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportProgress} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Progress Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-l-4 border-l-primary overflow-hidden">
          <CardContent className="pt-8">
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold">{progress.percentage}%</span>
                  <span className="text-sm text-muted-foreground">
                    {progress.completed} of {progress.total} phases
                  </span>
                </div>
                <Progress value={progress.percentage} className="h-3" />
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Months Completed",
                    value: progress.monthsCompleted,
                    icon: "✅",
                  },
                  {
                    label: "Months Remaining",
                    value: progress.monthsRemaining,
                    icon: "⏳",
                  },
                  {
                    label: "Learning Velocity",
                    value: `${progress.velocity}x`,
                    icon: "⚡",
                  },
                  {
                    label: "Current Streak",
                    value: `${progress.streakDays}d`,
                    icon: "🔥",
                  },
                ].map((metric, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center p-3 rounded-lg bg-muted/50"
                  >
                    <div className="text-2xl mb-1">{metric.icon}</div>
                    <p className="text-lg font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Timeline Info */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Estimated Completion</p>
                    <p className="text-sm text-muted-foreground">
                      {progress.estimatedCompletion} • Stay consistent to maintain pace
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements & Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements Unlocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {unlockedMilestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border-2 border-yellow-500/30">
                  <span className="text-2xl">{milestone.reward}</span>
                </div>
                <p className="text-sm font-semibold text-center">
                  {milestone.label}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Phase Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeRoadmap.phases?.map((phase, idx) => {
              const status = getPhaseStatus(idx);
              const isExpanded = expandedPhase === idx;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <button
                    onClick={() =>
                      setExpandedPhase(isExpanded ? null : idx)
                    }
                    className="w-full text-left"
                  >
                    <div
                      className={`p-4 rounded-lg border-2 transition-all ${
                        status === "completed"
                          ? "bg-green-500/10 border-green-500/30"
                          : status === "active"
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-muted/50 border-muted"
                      } hover:shadow-lg`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {status === "completed" && (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            )}
                            {status === "active" && (
                              <Zap className="h-6 w-6 text-blue-500" />
                            )}
                            {status === "pending" && (
                              <AlertCircle className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {phase.name || `Phase ${phase.phaseNumber}`}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {phase.topics?.length || 0} topics • {phase.projects?.length || 0} projects
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            status === "completed"
                              ? "default"
                              : status === "active"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {status === "completed"
                            ? "✓ Done"
                            : status === "active"
                            ? "Current"
                            : "Upcoming"}
                        </Badge>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-muted/50 space-y-4"
                        >
                          {phase.topics?.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">Topics:</p>
                              <div className="flex flex-wrap gap-2">
                                {phase.topics?.slice(0, 5).map((topic, i) => (
                                  <Badge key={i} variant="outline">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {phase.projects?.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">
                                Projects:
                              </p>
                              <ul className="space-y-1">
                                {phase.projects?.slice(0, 3).map((project, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                    <span>•</span>
                                    <span>{project}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {phase.resources?.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2">
                                Resources:
                              </p>
                              <ul className="space-y-1">
                                {phase.resources?.slice(0, 3).map((resource, i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer flex gap-2"
                                  >
                                    <span>🔗</span>
                                    <span>{resource}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {progress.percentage < 100 && (
            <>
              <p className="text-sm text-muted-foreground">
                You're {progress.percentage}% through this roadmap. Keep up the momentum!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={continueLearning}
                >
                  Continue Learning
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={viewResources}
                >
                  View Resources
                </Button>
                <Button 
                  className="w-full"
                  onClick={markPhaseComplete}
                >
                  Mark Phase Complete
                </Button>
              </div>
            </>
          )}
          {progress.percentage === 100 && (
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold text-green-500">
                🎉 Congratulations! You've completed this roadmap!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={shareAchievement}
                >
                  Share Achievement
                </Button>
                <Button className="w-full">Start New Roadmap</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
