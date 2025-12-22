import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_PROMPT_LENGTH = 5000;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES_COUNT = 50;
const VALID_MODES = ["beginner", "thinker", "story", "mastery"];
const VALID_TYPES = ["explain", "ekakshar", "oneword", "refine", "continue"];
const VALID_LANGUAGES = [
  "en", "hi", "hinglish", "ta", "te", "bn", "gu", "kn", "ml", "mr", "or", "pa",
  "as", "ur", "sd", "ks", "ne", "sa", "kok", "mni", "doi", "sat", "mai", "bho",
  "raj", "es", "fr", "hi-roman", "ta-roman", "te-roman", "bn-roman", "gu-roman",
  "kn-roman", "ml-roman", "mr-roman", "pa-roman", "ur-roman", "sa-roman"
];

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

// Input validation functions
function validateString(value: unknown, maxLength: number, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  if (value.length > maxLength) {
    throw new Error(`${fieldName} must be less than ${maxLength} characters`);
  }
  return value.trim();
}

function validateEnum(value: unknown, validValues: string[], fieldName: string, defaultValue: string): string {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  if (!validValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${validValues.join(", ")}`);
  }
  return value;
}

function validateMessages(messages: unknown): Array<{ role: string; content: string }> | null {
  if (messages === undefined || messages === null) {
    return null;
  }
  if (!Array.isArray(messages)) {
    throw new Error("messages must be an array");
  }
  if (messages.length > MAX_MESSAGES_COUNT) {
    throw new Error(`messages cannot exceed ${MAX_MESSAGES_COUNT} items`);
  }
  
  return messages.map((msg, index) => {
    if (typeof msg !== "object" || msg === null) {
      throw new Error(`messages[${index}] must be an object`);
    }
    const { role, content } = msg as { role: unknown; content: unknown };
    
    if (typeof role !== "string" || !["user", "assistant", "system"].includes(role)) {
      throw new Error(`messages[${index}].role must be 'user', 'assistant', or 'system'`);
    }
    if (typeof content !== "string") {
      throw new Error(`messages[${index}].content must be a string`);
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`messages[${index}].content exceeds maximum length of ${MAX_MESSAGE_LENGTH}`);
    }
    
    return { role, content: content.trim() };
  });
}

// Extract user ID from JWT token
function getUserIdFromAuthHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  try {
    const token = authHeader.substring(7);
    // Decode JWT payload (second part)
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    
    const payload = JSON.parse(atob(payloadBase64));
    return payload.sub || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user ID from auth header (optional - app supports unauthenticated users)
    const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromAuthHeader(authHeader) || "anonymous";

    // Parse and validate input
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof requestBody !== "object" || requestBody === null) {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = requestBody as Record<string, unknown>;
    
    // Validate all inputs
    const prompt = validateString(body.prompt, MAX_PROMPT_LENGTH, "prompt");
    const mode = validateEnum(body.mode, VALID_MODES, "mode", "beginner");
    const language = validateEnum(body.language, VALID_LANGUAGES, "language", "en");
    const type = validateEnum(body.type, VALID_TYPES, "type", "explain");
    const messages = validateMessages(body.messages);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userMessage = prompt || "";

    // Handle different request types
    if (type === "refine") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for refine type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = `You are a prompt refiner. Take the user's question and enhance it to be more specific, detailed, and likely to yield a comprehensive answer. Add context, clarify intent, and suggest follow-up angles. Return ONLY the refined prompt, nothing else.`;
      userMessage = `Refine this prompt: "${prompt}"`;
    } else if (type === "ekakshar") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for ekakshar type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for oneword type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = `You are a one-word summary expert. Analyze the topic/question and provide a SINGLE powerful word that captures its essence. Return ONLY one word, nothing else.`;
    } else if (type === "continue") {
      if (!messages || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "messages are required for continue type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = modePrompts[mode] || modePrompts.beginner;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else {
      // Standard explanation request
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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

    console.log(`User ${userId} - Processing ${type} request, mode: ${mode}, language: ${language}`);

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
      console.error(`User ${userId} - AI gateway error:`, response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ response: generatedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Log error details server-side only
    console.error("Chat function error:", error instanceof Error ? error.message : "Unknown error");
    
    // Return generic error to client
    const errorMessage = error instanceof Error && error.message.includes("must be")
      ? error.message  // Validation errors are safe to show
      : "An error occurred processing your request";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
