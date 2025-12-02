"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments) {
      const formattedData = assessments.map((assessment) => ({
        date: format(new Date(assessment.createdAt), "MMM dd"),
        score: assessment.quizScore,
      }));
      setChartData(formattedData);
    }
  }, [assessments]);

  return (
    <Card className="relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
      <CardHeader className="relative pb-4">
        <CardTitle className="text-xl font-semibold text-white/90">
          Performance Analysis
        </CardTitle>
        <CardDescription className="text-white/50">
          Track your progress over time
        </CardDescription>
      </CardHeader>
      <CardContent className="relative pb-6">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="rgba(255,255,255,0.1)" 
              />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.5)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                dy={10}
              />
              <YAxis
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.5)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                dx={-10}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="rounded-lg bg-white/10 border border-white/20 px-4 py-2 shadow-xl backdrop-blur-md">
                        <p className="text-sm font-medium text-white/90">
                          {payload[0].value.toFixed(1)}%
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          {payload[0].payload.date}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ 
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                  r: 3,
                  fill: "hsl(var(--background))"
                }}
                activeDot={{
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                  r: 5,
                  fill: "hsl(var(--background))"
                }}
                fill="url(#scoreGradient)"
              />
              {/* Add trend area under the line */}
              <Area
                type="monotone"
                dataKey="score"
                stroke="none"
                fill="url(#scoreGradient)"
                fillOpacity={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
