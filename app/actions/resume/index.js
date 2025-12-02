'use server';

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function saveResume(content, template = "modern-clean") {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId
        },
    });
    if (!user) throw new Error("User not found");
    try {
        const resume = await db.resume.upsert({
            where: {
                userId: user.id,
            },
            update: {
                content,
                template,
            },
            create: {
                userId: user.id,
                content,
                template,
            },
        });
        revalidatePath("/resume");
        return resume;
    } catch (error) {
        console.error("Error saving resume:", error.message);
        throw new Error("Failed to save resume");
    }
}

export async function getResume() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.resume.findUnique({
        where: {
            userId: user.id,
        },
    });
}

export async function improveWithAI({ current, type }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: {
            industryInsights: true,
        },
    });
    if (!user) throw new Error("User not found");

    const industryInsights = user.industryInsights;
    const prompt = `
    As an expert resume writer, enhance the following ${type} description for a ${user.industry || 'technology'} professional to reflect current industry standards and 2025 hiring trends. 
    
    Industry Context:
    - Growth Rate: ${industryInsights?.growthRate || 'High'}
    - Demand Level: ${industryInsights?.demandLevel || 'High'}
    - Market Outlook: ${industryInsights?.marketOutlook || 'Positive'}
    - Key Skills: ${(industryInsights?.topSkills || []).join(', ')}
    
Current content: "${current}"
Requirements:
- Use strong action verbs that reflect leadership, innovation, and execution
- Include quantifiable metrics, KPIs, or outcomes where applicable
- Highlight relevant technical tools, platforms, or methodologies used in 2025
- Keep it concise yet rich in detail (max 4–5 lines)
- Focus on accomplishments and measurable impact rather than duties
- Incorporate industry-specific keywords and terminology relevant to current roles and technologies
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const improvedContent = response.text().trim();
        return improvedContent;
    } catch (error) {
        console.error("Error improving content:", error);
        throw new Error("Failed to improve content");
    }
}