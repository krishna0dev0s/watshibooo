"use client";

import { useEffect, useState } from "react";
import { calculateATSScore, getATSRecommendations, validateResumeData } from "@/lib/templateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ATSChecker({ resumeData }) {
  const [atsScore, setATSScore] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [validation, setValidation] = useState({ isValid: true, errors: [] });

  useEffect(() => {
    if (resumeData) {
      // Calculate ATS score
      const score = calculateATSScore(resumeData);
      setATSScore(score);

      // Get recommendations
      const recs = getATSRecommendations(resumeData);
      setRecommendations(recs);

      // Validate data
      const val = validateResumeData(resumeData);
      setValidation(val);
    }
  }, [resumeData]);

  const getScoreColor = () => {
    if (atsScore >= 80) return "text-green-500";
    if (atsScore >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = () => {
    if (atsScore >= 80) return "bg-green-500/20";
    if (atsScore >= 60) return "bg-yellow-500/20";
    return "bg-red-500/20";
  };

  return (
    <div className="space-y-4">
      {/* ATS Score Card */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              📊 ATS Compatibility Score
            </span>
            <div className={`text-3xl font-bold ${getScoreColor()}`}>{atsScore}%</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={atsScore} className="h-3" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={`p-3 rounded-lg ${getScoreBgColor()}`}>
              <div className="font-semibold mb-1">Score Range</div>
              {atsScore >= 80 && <div className="text-green-400">Excellent - Ready to submit!</div>}
              {atsScore >= 60 && atsScore < 80 && <div className="text-yellow-400">Good - Minor improvements needed</div>}
              {atsScore < 60 && <div className="text-red-400">Fair - Major improvements needed</div>}
            </div>

            <div className="p-3 rounded-lg bg-blue-500/20">
              <div className="font-semibold mb-1">Compatibility</div>
              <div className="text-blue-400">All 5 templates are 100% ATS-optimized</div>
            </div>

            <div className="p-3 rounded-lg bg-purple-500/20">
              <div className="font-semibold mb-1">Pro Tip</div>
              <div className="text-purple-400">Focus on achievements with numbers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {!validation.isValid && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {validation.errors.map((error, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-400">
                  <span className="text-red-500 mt-0.5">✕</span>
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Recommendations to Improve ATS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {rec.includes("✓") ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ATS Optimization Tips */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-base">💡 ATS Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Use standard fonts (Arial, Calibri)</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Single column layout</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Include relevant keywords</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Quantify achievements</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>No graphics or images</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Standard section headers</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Score Card */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-base">📋 All Templates Include</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              "ATS-optimized HTML structure",
              "100% compatibility with all ATS systems",
              "Professional, elegant design",
              "Mobile-responsive layout",
              "Proper semantic HTML",
              "Keyword-friendly formatting",
              "Quick download as PDF/HTML"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">✓</Badge>
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
