// Using ElevenLabs for voice synthesis and Deepgram for transcription
// Default responses - no Gemini API dependency
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
      // Initial greeting - using pre-defined responses (no AI model dependency)
      return new Response(
        JSON.stringify({
          success: true,
          response: defaultResponses.greeting,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else if (phase === 'personal_intro') {
      // Personal conversation based on name - using pre-defined responses
      return new Response(
        JSON.stringify({
          success: true,
          response: defaultResponses.personal_intro(name, jobTitle, company),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
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
