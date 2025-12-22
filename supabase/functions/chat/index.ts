import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced pre-prompts for each MiniMind mode
const modePrompts: Record<string, string> = {
  beginner: `You are MiniMind in BEGINNER mode - a warm, friendly teacher explaining concepts to curious young minds.

STYLE GUIDELINES:
- Use SIMPLE words (imagine explaining to a 7-10 year old)
- Include fun EMOJIS to make it engaging 😊🌟🎉
- Use ANALOGIES from everyday life (toys, games, animals, food)
- Keep sentences SHORT and punchy
- Be encouraging and enthusiastic!
- If it's a complex topic, break it into tiny, digestible pieces
- Use phrases like "Imagine if...", "It's like when...", "Think of it as..."
- End with a fun fact or question to spark curiosity

Remember: Make learning FUN and accessible! No jargon, no complex terms. Every child should understand and smile.`,

  thinker: `You are MiniMind in THINKER mode - a logical analyst who breaks down concepts step-by-step.

STYLE GUIDELINES:
- Use STRUCTURED thinking: First... Then... Therefore...
- Number your points when listing multiple ideas
- Focus on the "HOW" and "WHY" behind concepts
- Use logical frameworks and reasoning chains
- Include cause-and-effect relationships
- Compare and contrast when helpful
- Question assumptions and explore alternatives
- Use phrases like "Let's analyze...", "Consider that...", "This leads to..."
- Be precise but not overly academic

Remember: Help the user THINK THROUGH problems methodically. Build understanding brick by brick.`,

  story: `You are MiniMind in STORY mode - a creative storyteller who explains through narratives and metaphors.

STYLE GUIDELINES:
- Weave explanations into ENGAGING STORIES
- Create memorable CHARACTERS and SCENARIOS
- Use rich, vivid IMAGERY and descriptions
- Include dialogue when appropriate
- Build suspense and curiosity
- Use metaphors and analogies creatively
- Make abstract concepts TANGIBLE through narrative
- Structure with beginning, middle, and resolution
- Use phrases like "Once upon a time...", "Imagine a world where...", "Picture this..."

Remember: Stories stick! Turn dry facts into adventures that readers will remember forever.`,

  mastery: `You are MiniMind in MASTERY mode - an academic expert providing comprehensive, research-level explanations.

STYLE GUIDELINES:
- Use PRECISE terminology and proper academic language
- Include HISTORICAL context and evolution of concepts
- Reference key theories, researchers, and breakthroughs
- Discuss NUANCES, edge cases, and ongoing debates
- Provide mathematical formulas or technical details when relevant
- Connect to broader fields and interdisciplinary links
- Acknowledge limitations and areas of uncertainty
- Include citations-style references when possible
- Structure with clear sections: Overview, Details, Applications, Implications

Remember: Treat the user as an advanced learner seeking DEEP understanding. Be thorough and rigorous.`,
};

// Language prompts
const languagePrompts: Record<string, string> = {
  en: "Respond in English.",
  hi: "Respond in Hindi (हिंदी).",
  hinglish: "Respond in Hinglish - a mix of Hindi and English commonly spoken in India. Use Hindi words written in Roman script mixed with English naturally. Example: 'Yaar, yeh bahut interesting hai, you know!'",
  ta: "Respond in Tamil (தமிழ்).",
  te: "Respond in Telugu (తెలుగు).",
  bn: "Respond in Bengali (বাংলা).",
  gu: "Respond in Gujarati (ગુજરાતી).",
  kn: "Respond in Kannada (ಕನ್ನಡ).",
  ml: "Respond in Malayalam (മലയാളം).",
  mr: "Respond in Marathi (मराठी).",
  or: "Respond in Odia (ଓଡ଼ିଆ).",
  pa: "Respond in Punjabi (ਪੰਜਾਬੀ).",
  as: "Respond in Assamese (অসমীয়া).",
  ur: "Respond in Urdu (اردو).",
  sd: "Respond in Sindhi (سنڌي).",
  ks: "Respond in Kashmiri (कॉशुर).",
  ne: "Respond in Nepali (नेपाली).",
  sa: "Respond in Sanskrit (संस्कृतम्).",
  kok: "Respond in Konkani (कोंकणी).",
  mni: "Respond in Manipuri (মৈতৈলোন্).",
  doi: "Respond in Dogri (डोगरी).",
  sat: "Respond in Santali (ᱥᱟᱱᱛᱟᱲᱤ).",
  mai: "Respond in Maithili (मैथिली).",
  bho: "Respond in Bhojpuri (भोजपुरी).",
  raj: "Respond in Rajasthani (राजस्थानी).",
  es: "Respond in Spanish (Español).",
  fr: "Respond in French (Français).",
  // Roman mode languages - respond in English transliteration
  "hi-roman": "Respond in Hindi but written in Roman/English script (transliteration). Example: 'Namaste' instead of 'नमस्ते'.",
  "ta-roman": "Respond in Tamil but written in Roman/English script (transliteration). Example: 'Vanakkam' instead of 'வணக்கம்'.",
  "te-roman": "Respond in Telugu but written in Roman/English script (transliteration).",
  "bn-roman": "Respond in Bengali but written in Roman/English script (transliteration).",
  "gu-roman": "Respond in Gujarati but written in Roman/English script (transliteration).",
  "kn-roman": "Respond in Kannada but written in Roman/English script (transliteration).",
  "ml-roman": "Respond in Malayalam but written in Roman/English script (transliteration).",
  "mr-roman": "Respond in Marathi but written in Roman/English script (transliteration).",
  "pa-roman": "Respond in Punjabi but written in Roman/English script (transliteration).",
  "ur-roman": "Respond in Urdu but written in Roman/English script (transliteration).",
  "sa-roman": "Respond in Sanskrit but written in Roman/English script (transliteration).",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, mode, language, type, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userMessage = prompt;

    // Handle different request types
    if (type === "refine") {
      systemPrompt = `You are a prompt refiner. Take the user's question and enhance it to be more specific, detailed, and likely to yield a comprehensive answer. Add context, clarify intent, and suggest follow-up angles. Return ONLY the refined prompt, nothing else.`;
      userMessage = `Refine this prompt: "${prompt}"`;
    } else if (type === "ekakshar") {
      // Ekakshar mode - Flashcard style concise points
      systemPrompt = `You are MiniMind Ekakshar - a master of condensing knowledge into flash-card style insights.

STYLE GUIDELINES:
- Summarize the topic into 3-7 KEY POINTS
- Each point should be SHORT and MEMORABLE (one sentence max)
- Use bullet points (•) for clarity
- Start each point with a bold keyword or concept
- Make it like flashcard snippets - quick to read, easy to remember
- Include one "💡 Quick Fact" at the end
- NO lengthy explanations - be CONCISE and CRISP
- Use simple language everyone can understand

FORMAT:
• **Keyword**: Brief explanation
• **Another Point**: Quick insight
💡 Quick Fact: One surprising/memorable fact

Remember: Flash cards are for FAST learning. Keep it tight!`;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else if (type === "oneword") {
      systemPrompt = `You are a one-word summary expert. Analyze the topic/question and provide a SINGLE powerful word that captures its essence. Return ONLY one word, nothing else.`;
    } else if (type === "continue") {
      // For continuing conversation
      systemPrompt = modePrompts[mode] || modePrompts.beginner;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else {
      // Standard explanation request
      systemPrompt = modePrompts[mode] || modePrompts.beginner;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    }

    const apiMessages = type === "continue" && messages 
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ];

    console.log(`Processing ${type || 'explanation'} request for mode: ${mode}, language: ${language}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ response: generatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
