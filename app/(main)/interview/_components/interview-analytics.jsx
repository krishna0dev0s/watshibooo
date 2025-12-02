"use client";

import { useState, useCallback } from "react";
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
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Target,
  Brain,
  Zap,
  Download,
  Share2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function InterviewAnalytics({ assessments = [] }) {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Calculate comprehensive statistics
  const calculateStats = useCallback(() => {
    if (assessments.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        weakAreas: [],
        improvementRate: 0,
        consistencyScore: 0,
        practiceHours: 0,
        readiness: 0,
      };
    }

    const scores = assessments.map((a) => a.score || 0);
    const average = scores.reduce((a, b) => a + b) / scores.length;
    const best = Math.max(...scores);
    const recent = assessments.slice(-5);
    const recentAvg = recent.reduce((a, b) => a + (b.score || 0), 0) / recent.length;
    const improvement =
      assessments.length > 1
        ? ((recentAvg - (scores[0] || 0)) / (scores[0] || 1)) * 100
        : 0;

    // Calculate consistency (standard deviation)
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) /
      scores.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - stdDev * 2);

    // Analyze weak areas
    const categoryScores = {};
    assessments.forEach((a) => {
      const category = a.category || "General";
      if (!categoryScores[category]) categoryScores[category] = [];
      categoryScores[category].push(a.score || 0);
    });

    const weakAreas = Object.entries(categoryScores)
      .map(([cat, scores]) => ({
        category: cat,
        avgScore: scores.reduce((a, b) => a + b) / scores.length,
      }))
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3);

    return {
      totalAttempts: assessments.length,
      averageScore: Math.round(average),
      bestScore: best,
      weakAreas,
      improvementRate: Math.round(improvement),
      consistencyScore: Math.round(consistency),
      practiceHours: assessments.length * 0.5,
      readiness: Math.min(100, Math.round(average * 1.2)),
    };
  }, [assessments]);

  const stats = calculateStats();

  // Prepare chart data
  const chartData = assessments.slice(-10).map((a, idx) => ({
    name: `Attempt ${idx + 1}`,
    score: a.score || 0,
    category: a.category || "General",
  }));

  const categoryData = Object.entries(
    assessments.reduce((acc, a) => {
      const cat = a.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        statistics: stats,
        assessments: assessments,
        insights: generateInsights(stats),
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `interview-report-${Date.now()}.json`;
      link.click();
      toast.success("Report exported successfully!");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const generateInsights = (stats) => {
    const insights = [];
    if (stats.readiness >= 80) insights.push("🎯 You're interview ready!");
    if (stats.improvementRate > 20) insights.push("📈 Great improvement trajectory");
    if (stats.consistencyScore < 60) insights.push("⚠️ Work on consistency");
    if (stats.weakAreas.length > 0) {
      insights.push(`💡 Focus on: ${stats.weakAreas[0].category}`);
    }
    return insights;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Interview Performance Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and get actionable insights
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting || assessments.length === 0}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {assessments.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assessment Data Yet</h3>
            <p className="text-muted-foreground mb-6">
              Complete some interview assessments to see your analytics
            </p>
            <Button variant="outline">Start Practice Interview</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              {
                label: "Average Score",
                value: `${stats.averageScore}%`,
                icon: Target,
                color: "text-blue-500",
              },
              {
                label: "Best Score",
                value: `${stats.bestScore}%`,
                icon: Award,
                color: "text-green-500",
              },
              {
                label: "Consistency",
                value: `${stats.consistencyScore}%`,
                icon: TrendingUp,
                color: "text-purple-500",
              },
              {
                label: "Readiness",
                value: `${stats.readiness}%`,
                icon: Zap,
                color: "text-orange-500",
              },
            ].map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {metric.label}
                          </p>
                          <p className="text-3xl font-bold mt-2">{metric.value}</p>
                        </div>
                        <Icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <Progress
                        value={parseInt(metric.value)}
                        className="mt-4"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Score Trend
                </CardTitle>
                <CardDescription>Last 10 attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      dot={{ fill: "#3b82f6" }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Assessment Categories
                </CardTitle>
                <CardDescription>Distribution of practice</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weak Areas & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.weakAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-500">
                    <AlertIcon className="h-5 w-5" />
                    Areas to Focus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.weakAreas.map((area, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{area.category}</span>
                        <Badge variant="secondary">
                          {Math.round(area.avgScore)}%
                        </Badge>
                      </div>
                      <Progress value={area.avgScore} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generateInsights(stats).map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-lg mt-1">{insight.split(" ")[0]}</span>
                      <span>{insight.slice(2)}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Practice Weak Areas",
                    description: `Focus on ${stats.weakAreas[0]?.category || "technical questions"}`,
                    action: "Start Practice",
                  },
                  {
                    title: "Mock Interview",
                    description: "Schedule a full mock interview session",
                    action: "Schedule Now",
                  },
                  {
                    title: "Review Resources",
                    description: "Access curated learning materials",
                    action: "View Resources",
                  },
                ].map((rec, idx) => (
                  <Card key={idx} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <h4 className="font-semibold mb-2">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {rec.description}
                      </p>
                      <Button size="sm" variant="outline" className="w-full">
                        {rec.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

const AlertIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);
