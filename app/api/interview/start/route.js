import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const INTERVIEW_TEMPLATES = {
  "software-engineer": {
    name: "Software Engineer",
    questions: [
      "Tell me about your most challenging project. What was the problem and how did you solve it?",
      "Explain the difference between synchronous and asynchronous programming. When would you use each?",
      "How do you approach debugging a complex issue in production?",
      "What design patterns are you familiar with? Can you give an example of when you used one?",
      "Describe your experience with version control and how you handle merge conflicts.",
    ],
  },
  "product-manager": {
    name: "Product Manager",
    questions: [
      "Tell me about a product you love and why. How would you improve it?",
      "Walk me through your approach to identifying user needs.",
      "How do you prioritize features when you have limited resources?",
      "Describe a time you had to make a difficult trade-off decision.",
      "How do you measure the success of a product feature?",
    ],
  },
  "data-scientist": {
    name: "Data Scientist",
    questions: [
      "Walk me through your approach to a new data science problem.",
      "How do you handle imbalanced datasets in classification problems?",
      "Explain the bias-variance tradeoff and its implications.",
      "Tell me about a model you built. What metrics did you use to evaluate it?",
      "How do you ensure your machine learning models are ethical and fair?",
    ],
  },
  "ux-designer": {
    name: "UX Designer",
    questions: [
      "Walk me through your design process from discovery to delivery.",
      "Tell me about a design challenge you faced and how you solved it.",
      "How do you balance aesthetics with usability?",
      "How do you incorporate user feedback into your designs?",
      "Describe your experience with user research and testing.",
    ],
  },
  "marketing": {
    name: "Marketing Manager",
    questions: [
      "Tell me about a successful marketing campaign you led. What made it successful?",
      "How do you define and measure marketing ROI?",
      "Walk me through your approach to developing a go-to-market strategy.",
      "How do you stay updated with marketing trends and tools?",
      "Describe your experience with data analytics in marketing.",
    ],
  },
  "sales": {
    name: "Sales Executive",
    questions: [
      "Tell me about your biggest sale and what made you successful?",
      "How do you approach prospecting and building relationships?",
      "Walk me through your sales process from lead to close.",
      "How do you handle objections from prospects?",
      "What strategies do you use to exceed your sales targets?",
    ],
  },
  "finance": {
    name: "Financial Analyst",
    questions: [
      "Walk me through your experience with financial modeling.",
      "How do you approach valuing a company?",
      "Tell me about a financial analysis you conducted and its impact.",
      "How do you stay updated with market trends and economic indicators?",
      "Describe your experience with financial reporting and compliance.",
    ],
  },
  "hr": {
    name: "HR Manager",
    questions: [
      "Tell me about your experience with talent acquisition and retention.",
      "Walk me through your approach to employee engagement and development.",
      "How do you handle sensitive HR issues like conflicts and complaints?",
      "Describe your experience with organizational development and culture building.",
      "How do you ensure compliance with employment laws and regulations?",
    ],
  },
};

export async function POST(request) {
  try {
    const { roleId } = await request.json();

    if (!roleId || !INTERVIEW_TEMPLATES[roleId]) {
      return new Response(
        JSON.stringify({ error: "Invalid role ID" }),
        { status: 400 }
      );
    }

    const template = INTERVIEW_TEMPLATES[roleId];

    return new Response(
      JSON.stringify({
        success: true,
        roleName: template.name,
        questions: template.questions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Interview start error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start interview" }),
      { status: 500 }
    );
  }
}
