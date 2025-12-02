import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Default responses in case of any issues - with more emotional tone
const defaultResponses = {
  greeting: "Hey! Thanks so much for making the time to chat with me today. I'm really excited to get to know you. What's your name?",
  personal_intro: (name, jobTitle, company) => `That's such a great name! So ${name || 'there'}, tell me... what really drew you to this ${jobTitle || 'position'} at ${company || 'our company'}? I'm genuinely curious about your story!`,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { phase, name, company, jobTitle } = body;

    console.log('[Interview Init] Phase:', phase);

    if (!phase) {
      return new Response(
        JSON.stringify({
          success: true,
          response: defaultResponses.greeting,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (phase === 'greeting') {
      // Initial greeting
      if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({
            success: true,
            response: defaultResponses.greeting,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const greetingPrompt = `You are a warm, genuine recruiter starting an interview with a candidate. 
Greet them enthusiastically and ask for their name. 
Show genuine excitement about meeting them - use conversational language with personality.
Be authentic, not robotic. Use emotional expressions like "I'm really excited", "thanks for making the time", "looking forward to".
Keep it to 1-2 sentences max.
Examples: "Hey! Thanks so much for making the time to chat with me today. I'm genuinely excited to learn more about you. What's your name?"
Sound warm, approachable, and like a real person, not an AI.`;

        const result = await model.generateContent(greetingPrompt);
        const responseText = result.response.text().trim();

        return new Response(
          JSON.stringify({
            success: true,
            response: responseText || defaultResponses.greeting,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error('[Interview Init] Greeting error:', error.message);
        return new Response(
          JSON.stringify({
            success: true,
            response: defaultResponses.greeting,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    } else if (phase === 'personal_intro') {
      // Personal conversation based on name
      if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({
            success: true,
            response: defaultResponses.personal_intro(name, jobTitle, company),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const introPrompt = `You are a warm, personable recruiter having a real conversation with ${name || 'a candidate'} who is interviewing for a ${jobTitle || 'position'} at ${company || 'a company'}.
Start a genuine personal conversation that shows you care. Ask something meaningful - maybe about their background journey, what attracted them to this role, or their passion for the industry.
Use emotional language and show genuine interest: "I'm curious", "tell me about", "that's interesting", "I love hearing about".
Use contractions and casual language to sound natural: "I'm", "What's", "that's", not formal.
Keep it to 1-2 sentences max, conversational like a peer talking to a peer.
Example: "So ${name}, tell me... what really drew you to this ${jobTitle || 'role'} at ${company || 'company'}? I'm genuinely curious about your journey here!"
Never sound robotic or scripted. Sound like you actually care about their answer.`;

        const result = await model.generateContent(introPrompt);
        const responseText = result.response.text().trim();

        return new Response(
          JSON.stringify({
            success: true,
            response: responseText || defaultResponses.personal_intro(name, jobTitle, company),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error('[Interview Init] Personal intro error:', error.message);
        return new Response(
          JSON.stringify({
            success: true,
            response: defaultResponses.personal_intro(name, jobTitle, company),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Fallback response
    return new Response(
      JSON.stringify({
        success: true,
        response: defaultResponses.greeting,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Interview Init] Error:", error.message);
    
    return new Response(
      JSON.stringify({
        success: true,
        response: defaultResponses.greeting,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
