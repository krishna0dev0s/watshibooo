import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        resumes: true,
        coverLetters: true,
        assessments: true,
      },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate analytics from database
    const resumeStats = {
      total: user.resumes ? 1 : 0,
      created: user.resumes?.createdAt ? true : false,
      atsScore: user.resumes?.atsScore || 0,
    };

    const coverLetterStats = {
      total: user.coverLetters?.length || 0,
      draft: user.coverLetters?.filter(cl => cl.status === "draft").length || 0,
      completed: user.coverLetters?.filter(cl => cl.status === "completed").length || 0,
    };

    const assessmentStats = {
      total: user.assessments?.length || 0,
      avgScore: user.assessments?.length > 0
        ? (user.assessments.reduce((sum, a) => sum + a.quizScore, 0) / user.assessments.length).toFixed(1)
        : 0,
      byCategory: user.assessments?.reduce((acc, a) => {
        if (!acc[a.category]) acc[a.category] = 0;
        acc[a.category]++;
        return acc;
      }, {}) || {},
    };

    // Get localStorage-based stats from client
    const stats = {
      user: {
        name: user.name,
        email: user.email,
        industry: user.industry,
      },
      resume: resumeStats,
      coverLetters: coverLetterStats,
      assessments: assessmentStats,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Analytics API error:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
