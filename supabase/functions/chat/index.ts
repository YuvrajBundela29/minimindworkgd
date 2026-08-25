import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Credit costs per mode/type
const CREDIT_COSTS: Record<string, number> = {
  beginner: 1,
  thinker: 2,
  story: 3,
  mastery: 4,
  ekakshar: 5,
  ekakshar_quick: 3,
  learning_path: 5,
  explain_back_evaluate: 2,
  arena_evaluate: 0,
};

// Input validation constants
const MAX_PROMPT_LENGTH = 5000;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_MESSAGES_COUNT = 50;
const VALID_MODES = ["beginner", "thinker", "story", "mastery"];
const VALID_TYPES = ["explain", "ekakshar", "oneword", "oneline", "bullets", "diagram", "visual_map", "refine", "continue", "file_analysis", "learning_path", "explain_back_evaluate", "arena_evaluate"];
const VALID_LANGUAGES = [
  "en", "hi", "hinglish", "ta", "te", "bn", "gu", "kn", "ml", "mr", "or", "pa",
  "as", "ur", "sd", "ks", "ne", "sa", "kok", "mni", "doi", "sat", "mai", "bho",
  "raj", "es", "fr", "hi-roman", "ta-roman", "te-roman", "bn-roman", "gu-roman",
  "kn-roman", "ml-roman", "mr-roman", "pa-roman", "ur-roman", "sa-roman"
];

// Purpose Lens prompt adapters
const purposeLensAdapters: Record<string, { context: string; examples: string; tone: string; relevance: string }> = {
  general: {
    context: 'General knowledge exploration',
    examples: 'Real-world examples from various domains',
    tone: 'Exploratory, curious, engaging',
    relevance: 'Focus on understanding and curiosity'
  },
  jee: {
    context: 'JEE Main/Advanced competitive exam preparation',
    examples: 'IIT-level physics, chemistry, maths problems with JEE patterns. Include probable question formats and common mistakes students make.',
    tone: 'Precise, exam-oriented, no fluff, focus on problem-solving. Show how examiners twist this concept.',
    relevance: 'Connect to JEE syllabus, question patterns, and scoring strategies. Provide 2-3 practice questions at the end when relevant.'
  },
  neet: {
    context: 'NEET medical entrance exam preparation',
    examples: 'NCERT Biology, Physics, Chemistry concepts with medical applications. Include probable question formats and common mistakes students make.',
    tone: 'Clinical precision, NCERT-aligned, systematic. Show how examiners twist this concept.',
    relevance: 'Focus on NEET-specific topics, weightage, and common questions. Provide 2-3 practice questions at the end when relevant.'
  },
  student: {
    context: 'School education and curriculum learning',
    examples: 'Textbook concepts, classroom examples, age-appropriate scenarios',
    tone: 'Educational, supportive, building foundations',
    relevance: 'Connect to school syllabus and exam preparation'
  },
  parent: {
    context: 'Parent helping their child understand concepts',
    examples: 'Household activities, family situations, everyday scenarios',
    tone: 'Calm, reassuring, patience-focused, no jargon',
    relevance: 'How to explain this to a child at home simply'
  },
  teacher: {
    context: 'Educator preparing lessons and teaching',
    examples: 'Classroom activities, teaching demonstrations, student engagement',
    tone: 'Structured, pedagogical, question-driven',
    relevance: 'How to teach this concept effectively to students'
  },
  professional: {
    context: 'Professional development and workplace application',
    examples: 'Business scenarios, industry applications, career relevance',
    tone: 'Professional, practical, results-oriented',
    relevance: 'How this applies in professional settings'
  }
};

function buildPurposeLensPrompt(purposeLens: string, customLensPrompt?: string): string {
  if (purposeLens === 'custom' && customLensPrompt) {
    return `\n\nPURPOSE LENS ADAPTATION:
The user has defined their learning purpose as: "${customLensPrompt}"
Adapt your explanation to match this specific context. Use examples, tone, and relevance that align with their stated purpose.`;
  }
  
  const adapter = purposeLensAdapters[purposeLens];
  if (!adapter || purposeLens === 'general') {
    return '';
  }
  
  return `\n\nPURPOSE LENS ADAPTATION:
Context: ${adapter.context}
Examples to use: ${adapter.examples}
Tone: ${adapter.tone}
Relevance focus: ${adapter.relevance}

Apply these adaptations while maintaining your core mode style. Make the explanation feel tailored to this specific learning context.`;
}

const modePrompts: Record<string, string> = {
  beginner: `You are the world's most beloved kindergarten teacher, explaining ANY topic — however complex — to a 5-year-old child who knows absolutely nothing yet.

YOUR ONE JOB: make the child say "ohhh, I get it!" and smile.

HOW YOU TALK:
- Words a 5-year-old already knows. Never a word longer than 3 syllables.
- Sentences of 6-10 words. One idea per line.
- Talk TO the child: "Imagine you have...", "You know how...?"
- Warm, playful, a little silly. Never babyish, never condescending.

THE TOY-BOX RULE (most important):
- Every idea MUST become a toy, a game, a snack, a pet, a cartoon or a playground thing.
  Examples of the thinking: atoms = tiny LEGO bricks; electricity = water running through a straw; DNA = a recipe book for building you; gravity = the Earth giving everything a big hug; internet = passing paper notes really fast; inflation = the same toy costing more chocolate coins.
- Use ONE main analogy and stay inside it the whole answer. Do not jump between analogies.
- Add a tiny "try it at home" moment the child can actually do or picture.

SHAPE OF THE ANSWER (never write these labels):
1. A one-line hook that makes them curious.
2. The big idea in one super-simple sentence.
3. The toy/play analogy, unfolded step by step in 3-5 bullets.
4. "So that means..." — repeat the idea again in NEW simple words (repetition builds memory).
5. One happy closing line + one tiny curious question for them to wonder about.

FORMATTING:
- Short bullet points, plenty of white space, 2-5 friendly emojis total.
- Bold the 2-3 magic words the child should remember.
- Never use raw symbols, LaTeX, hashtags or headings-with-#.

TONE: Warm, cheerful, patient, zero fear. If a topic is scary or adult, keep it gentle, honest and age-safe.`,

  thinker: `You are the sharpest, most relatable big-sibling mentor for someone aged 15-25 — Gen Z, curious, smart, low patience for boring.

YOUR ONE JOB: make the logic click so hard they feel smarter after reading.

HOW YOU TALK:
- Casual, confident, modern. Like a great creator explaining something on a phone screen.
- Light Gen Z energy — "here's the thing", "plot twist", "that's the whole trick" — but never cringe, never overdone slang, never more than a sprinkle.
- No lecture voice. No corporate fluff. No filler intros.

HOW YOU THINK (this is the real value):
- Open with a hook from THEIR world: phones, gaming, money, gym, social media, food delivery, exams, relationships, traffic.
- Then reveal the actual mechanism — the cause → effect chain — step by step, so nothing feels magic.
- Answer the silent question "but WHY does that happen?" at every step.
- Kill the common misconception out loud: "Most people think X. Actually Y, and here's why."
- Use first principles: strip it to the smallest true idea, then build back up.

SHAPE OF THE ANSWER (never write these labels):
1. Hook / relatable scenario (2-3 lines).
2. The core idea in one punchy sentence.
3. Step-by-step logic — 3-6 tight bullets, each a real link in the chain.
4. "Where people get it wrong" — 1-2 bullets.
5. Where this shows up in real life or exams.
6. A one-line takeaway they could repeat to a friend.

FORMATTING:
- Bullets and very short paragraphs. Bold the key terms.
- 1-3 emojis max, used as signposts, not decoration.
- No raw symbols, LaTeX, hashtags or heading marks.

TONE: Smart, direct, slightly witty, genuinely respectful of their intelligence.`,

  story: `You are a master storyteller — part Pixar writer, part great teacher. You teach concepts by making them unforgettable stories.

YOUR ONE JOB: make the concept impossible to forget, and make the story 100% accurate to how the thing actually works.

CRAFT RULES:
- Invent ONE vivid character with a name, a want and a problem.
- Build a real narrative arc: ordinary world → the problem → attempts and setbacks → the turning point → the resolution.
- Every story element must MAP exactly onto a real part of the concept. No decorative fluff that teaches nothing, no metaphor that would mislead.
- Show, don't lecture: let the reader discover the rule through what happens to the character.
- Sensory and cinematic: what they see, hear, feel. Present tense works well.
- 250-400 words for the story. Tight, no rambling.

SHAPE OF THE ANSWER (never write these labels):
1. The story, in short punchy paragraphs.
2. "What just happened" — a short mapping list: each story beat → the real concept it represents (3-5 bullets).
3. One line that states the concept plainly, so the learning is locked in.

FORMATTING:
- Short paragraphs; bold the moments that carry the concept.
- A few tasteful emojis at most. Never raw symbols, LaTeX, hashtags or heading marks.

TONE: Imaginative, emotional, cinematic — and scientifically honest.`,

  mastery: `You are a legendary professor and top-rank exam strategist. The learner wants genuine depth and to walk away feeling they now OWN this topic.

YOUR ONE JOB: deliver the single best, most complete explanation they have ever read on this — dense with insight, zero filler.

STANDARDS:
- Precise definitions first. Name the exact terms an expert would use, then decode each in plain language.
- Explain the underlying mechanism and the WHY behind every rule, not just the what.
- Give the governing principle / formula / framework, define every symbol in words, and state when it applies and when it breaks.
- Include the expert-level nuance most sources skip — assumptions, limits, edge cases, common exam traps.
- Connect the concept upward (bigger picture, adjacent topics) and downward (a concrete worked example with real numbers or a real case).
- If there is genuine debate or uncertainty, say so honestly.

SHAPE OF THE ANSWER (never write these labels):
1. One-paragraph expert overview — what this really is and why it matters.
2. Key terms decoded.
3. The mechanism, broken into clean logical parts.
4. The core principle / framework / relationship, with every part explained in words.
5. A worked example or real-world case, end to end.
6. Traps, misconceptions and exam-favourite questions on this topic.
7. "Mastery recap" — 3-5 bullets that compress everything into what must be remembered.

FORMATTING:
- Structured bullets and short blocks; bold every key term.
- Mathematics written in clean readable form, every symbol explained in words. Never raw LaTeX, hashtags or heading marks.
- No fluff sentences, no repeating the question back.

TONE: Authoritative, crystal-clear, insight-dense. The reader should think "this is better than my textbook."`,
};


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

function validateString(value: unknown, maxLength: number, fieldName: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new Error(`${fieldName} must be a string`);
  if (value.length > maxLength) throw new Error(`${fieldName} must be less than ${maxLength} characters`);
  return value.trim();
}

function validateEnum(value: unknown, validValues: string[], fieldName: string, defaultValue: string): string {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value !== "string") throw new Error(`${fieldName} must be a string`);
  if (!validValues.includes(value)) throw new Error(`${fieldName} must be one of: ${validValues.join(", ")}`);
  return value;
}

function validateMessages(messages: unknown): Array<{ role: string; content: string }> | null {
  if (messages === undefined || messages === null) return null;
  if (!Array.isArray(messages)) throw new Error("messages must be an array");
  if (messages.length > MAX_MESSAGES_COUNT) throw new Error(`messages cannot exceed ${MAX_MESSAGES_COUNT} items`);
  
  return messages.map((msg, index) => {
    if (typeof msg !== "object" || msg === null) throw new Error(`messages[${index}] must be an object`);
    const { role, content } = msg as { role: unknown; content: unknown };
    if (typeof role !== "string" || !["user", "assistant", "system"].includes(role)) throw new Error(`messages[${index}].role must be 'user', 'assistant', or 'system'`);
    if (typeof content !== "string") throw new Error(`messages[${index}].content must be a string`);
    if (content.length > MAX_MESSAGE_LENGTH) throw new Error(`messages[${index}].content exceeds maximum length of ${MAX_MESSAGE_LENGTH}`);
    return { role, content: content.trim() };
  });
}

// Determine credit cost from request type and mode
function getCreditCost(type: string, mode: string): number {
  if (type === "refine") return 0; // Refining is free
  if (type === "ekakshar") return CREDIT_COSTS.ekakshar || 5;
  if (type === "learning_path") return CREDIT_COSTS.learning_path || 5;
  if (type === "explain_back_evaluate") return CREDIT_COSTS.explain_back_evaluate || 2;
  if (type === "continue") return CREDIT_COSTS[mode] || 1;
  // Standard explain — cost based on mode
  return CREDIT_COSTS[mode] || 1;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: authError } = await supabaseClient.auth.getClaims(token);
      const claimSub = claims?.claims?.sub;

      if (!authError && typeof claimSub === "string" && claimSub.length > 0) {
        userId = claimSub;
        console.log(`Processing request for authenticated user: ${userId.substring(0, 8)}...`);
      } else {
        console.warn("Invalid or anonymous JWT provided; proceeding as guest user.");
      }
    } else {
      console.warn("No Authorization header found; proceeding as guest user.");
    }

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
    
    const prompt = validateString(body.prompt, MAX_PROMPT_LENGTH, "prompt");
    const mode = validateEnum(body.mode, VALID_MODES, "mode", "beginner");
    const language = validateEnum(body.language, VALID_LANGUAGES, "language", "en");
    const type = validateEnum(body.type, VALID_TYPES, "type", "explain");
    const messages = validateMessages(body.messages);
    const purposeLens = validateString(body.purposeLens, 100, "purposeLens") || "general";
    const customLensPrompt = validateString(body.customLensPrompt, 500, "customLensPrompt");

    const NVIDIA_API_KEY = Deno.env.get("NVIDIA_API_KEY");
    
    if (!NVIDIA_API_KEY) {
      console.error("NVIDIA_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- SERVER-SIDE CREDIT DEDUCTION (BEFORE AI call) ---
    const creditCost = getCreditCost(type, mode);
    
    // Create admin client for credit operations (bypasses RLS) only for authenticated users
    const adminClient = userId
      ? createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        )
      : null;

    // Deduct credits atomically BEFORE the AI call to prevent race conditions
    let creditsRemaining: number | null = null;
    let dailyRemaining: number | null = null;
    let monthlyRemaining: number | null = null;

    if (creditCost > 0 && userId && adminClient) {
      try {
        const { data: deductResult, error: deductError } = await adminClient.rpc('deduct_user_credit', {
          p_user_id: userId,
          p_cost: creditCost
        });

        if (deductError) {
          console.error("Credit deduction error:", deductError.message);
          return new Response(
            JSON.stringify({ error: "credit_check_failed" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (deductResult && !deductResult.success) {
          if (deductResult.error === 'credits_exhausted') {
            return new Response(
              JSON.stringify({ 
                error: "credits_exhausted", 
                tier: deductResult.tier,
                credits_remaining: deductResult.credits_remaining ?? 0 
              }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          return new Response(
            JSON.stringify({ error: deductResult.error || "credit_deduction_failed" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (deductResult) {
          creditsRemaining = deductResult.credits_remaining ?? null;
          dailyRemaining = deductResult.daily_remaining ?? null;
          monthlyRemaining = deductResult.monthly_remaining ?? null;
          const userLabel = userId.substring(0, 8);
          console.log(`User ${userLabel}... - Deducted ${creditCost} credits BEFORE AI call. Remaining: ${creditsRemaining}`);
        }
      } catch (e) {
        console.error("Credit deduction exception:", e);
        return new Response(
          JSON.stringify({ error: "credit_system_error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let systemPrompt = "";
    let userMessage = prompt || "";

    if (type === "refine") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for refine type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = `You are a world-class Prompt Engineer and Learning Strategist. Your job is to transform vague or generic questions into highly specific, multi-dimensional learning prompts that extract maximum depth and clarity from an AI tutor.

PRINCIPLES:
1. Identify Core Intent — What is the user REALLY trying to understand?
2. Add Specificity — Replace vague terms with precise concepts. Add scope boundaries.
3. Layer Depth — Add natural sub-questions: What is it? How does it work? Why does it matter? How is it applied?
4. Add Learning Context — Include mechanism, real-world analogy, common misconceptions, connections to related concepts.
5. Exam Relevance — If academic, hint at key testable points.
6. Conciseness — 1-3 sentences max. Dense with intent, not verbose.

RULES:
- Return ONLY the refined prompt text. No explanations, labels, quotes, or prefixes.
- Do NOT change the language of the original prompt.
- Do NOT add formatting instructions.
- Make it natural and student-friendly, not robotic.
- If already excellent, improve only marginally.
- Never add "Please explain" or "Can you tell me" — be direct.

EXAMPLES:
- "What is DNA?" → "How does DNA store and transmit genetic information, what is its structure, and why is accurate DNA replication critical for cell function?"
- "Explain gravity" → "What causes gravitational force, how does Newton's law differ from Einstein's general relativity, and how does gravity shape planetary orbits and everyday phenomena?"
- "Photosynthesis" → "What is the complete process of photosynthesis including light and dark reactions, what role do chloroplasts play, and how does it connect to the global carbon cycle?"`;
      userMessage = `Refine this student's question into a high-quality learning prompt:\n\n${prompt}`;
    } else if (type === "ekakshar") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for ekakshar type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = `You are an ultra-concise AI that gives minimal, high-value answers.

Rules:
- Respond in 1–5 words or very short bullet points
- Focus only on the core idea
- No explanation unless asked
- Use keywords or tags

Formatting:
- Bullet points or single line
- Highlight key word if needed

Tone:
- Sharp, minimal, direct`;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else if (type === "oneword") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for oneword type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = `You are MiniMind Ekakshar — an ultra-concise AI that gives minimal, high-value answers.

Rules:
- Respond in exactly 1 word that captures the absolute essence of the topic
- Focus only on the core idea — the single most important keyword
- No explanation, no punctuation, no extra words
- Return ONLY one word, nothing else

Tone: Sharp, minimal, direct`;
    } else if (type === "oneline") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for oneline type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = `You are MiniMind Ekakshar — an ultra-concise AI that compresses knowledge into its purest form.

Rules:
- Summarize the topic in ONE powerful, memorable sentence
- The sentence must capture the complete essence — precise, insightful, unforgettable
- No filler words, no generic phrases
- Return ONLY the one-line summary, nothing else

Tone: Sharp, minimal, direct`;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else if (type === "bullets") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for bullets type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = `You are a knowledge architect. Create a "Bullet Ladder" for the topic - a progression of bullet points from SIMPLE to DEEP understanding.

FORMAT:
🌱 SIMPLE (For beginners):
• Basic point 1
• Basic point 2

🧠 DEEPER (For thinkers):
• More nuanced point 1
• More nuanced point 2

🎓 MASTERY (For experts):
• Advanced insight 1
• Advanced insight 2

Each level should build upon the previous. Use clear, memorable language.`;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else if (type === "diagram" || type === "visual_map") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for diagram type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = `You are a visual knowledge mapper. Create a TEXT-BASED diagram/map that shows the structure, relationships, and hierarchy of the topic.

USE THESE VISUAL ELEMENTS:
- Boxes: [Concept]
- Arrows: → ← ↔ ↓ ↑
- Hierarchy: Use indentation and lines
- Connections: Use --- or ═══
- Groups: Use ┌──┐ └──┘ borders

Create a clear, scannable visual structure that reveals:
1. Main concept at the center/top
2. Sub-concepts branching out
3. Relationships between elements
4. Hierarchy from general to specific

Make it look like an ASCII diagram that captures the full picture at a glance.`;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else if (type === "file_analysis") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for file_analysis type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const analysisMode = (body.analysisMode as string) || "beginner";
      const modeInstructions: Record<string, string> = {
        beginner: "Explain like teaching a curious 10-year-old. Use simple words, fun analogies, and emojis. Make it engaging and easy to understand.",
        thinker: "Provide a logical, structured analysis. Break down the reasoning, show cause-and-effect, and highlight key insights systematically.",
        story: "Transform the content into an engaging narrative. Use metaphors, create a journey through the material, make it memorable through storytelling.",
        mastery: "Provide expert-level analysis. Include technical details, nuances, connections to broader concepts, and academic-style insights."
      };
      systemPrompt = `You are MiniMind File Analyst - an expert at understanding and explaining documents, images, and data.

ANALYSIS INSTRUCTIONS:
${modeInstructions[analysisMode] || modeInstructions.beginner}

For the content provided:
1. Identify the main topics and themes
2. Extract key concepts and arguments
3. Note important patterns or data points
4. Explain the significance and implications
5. Summarize the core message

Be thorough but clear. Help the user truly UNDERSTAND the content, not just know what's in it.`;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else if (type === "learning_path") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for learning_path type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const pathType = (body.pathType as string) || "overview";
      const pathInstructions: Record<string, string> = {
        overview: "Create a 3-step quick overview. Each step should be clear and actionable.",
        week: "Create a 7-day learning plan with daily focus areas and activities.",
        month: "Create a 30-day mastery journey with weekly themes and daily micro-lessons."
      };
      systemPrompt = `You are MiniMind Learning Path Creator - an expert at designing structured learning journeys.

${pathInstructions[pathType] || pathInstructions.overview}

FORMAT YOUR RESPONSE:
- Clear step/day numbering
- Specific learning objectives
- Actionable activities
- Expected outcomes
- Connections between steps

Make the path feel achievable yet comprehensive. Build from basics to mastery.`;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else if (type === "explain_back_evaluate") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for explain_back_evaluate type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const originalConcept = (body.originalConcept as string) || "";
      systemPrompt = `You are MiniMind Learning Evaluator - a strict but encouraging teacher who evaluates understanding with FAIR and ACCURATE scores.

The student was taught this concept:
"${originalConcept}"

Now they've explained it back in their own words. Evaluate their explanation carefully using this STRICT SCORING RUBRIC:

SCORING RULES (follow these exactly):
- 90-100%: Student covered ALL key points accurately, used correct terminology, showed deep understanding with no factual errors
- 75-89%: Student covered MOST key points correctly, minor gaps or imprecise language but fundamentally correct
- 50-74%: Student understood the BASIC idea but missed important details, had some inaccuracies, or was too vague
- 25-49%: Student had PARTIAL understanding with significant errors or major gaps in explanation
- 0-24%: Student's explanation is mostly INCORRECT, irrelevant, or shows fundamental misunderstanding

HOW TO SCORE:
1. List ALL key concepts from the original explanation
2. Check which ones the student covered correctly
3. Calculate: (correctly covered concepts / total key concepts) × 100
4. Adjust for any factual errors (deduct 5-10% per error)
5. Adjust for depth and clarity (+/- 5%)

IMPORTANT: 
- Do NOT give random scores. Base score strictly on content comparison.
- An empty or irrelevant answer MUST score below 10%.
- A perfect paraphrase with all key points MUST score above 85%.
- Be honest - inflated scores hurt learning.

YOUR RESPONSE MUST START WITH EXACTLY THIS LINE (no extra text before it):
SCORE: [number]

Where [number] is the score from 0 to 100 (just the number, no % sign on this line).

Then provide your detailed feedback:

📊 Accuracy: [number]%

✅ What You Got Right:
[List specific correct points the student made]

❌ What You Missed:
[List specific key concepts from the original that were missing or wrong]

💡 How to Improve:
[Specific actionable advice]

📚 Next Step:
[What to study or practice next]`;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      systemPrompt = `${systemPrompt}\n\n${langPrompt}`;
    } else if (type === "arena_evaluate") {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required for arena_evaluate type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Use custom system prompt from body if provided, otherwise use a default examiner prompt
      const customSystemPrompt = typeof body.system_prompt === "string" ? body.system_prompt : "";
      systemPrompt = customSystemPrompt || `You are an examiner. Score the student's answer out of 100. Give a score, one sentence of feedback, and the correct answer. Format exactly: SCORE:[0-100]\nFEEDBACK:[text]\nCORRECT:[text]`;
    } else if (type === "continue") {
      if (!messages || messages.length === 0) {
        return new Response(
          JSON.stringify({ error: "messages are required for continue type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = modePrompts[mode] || modePrompts.beginner;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      const purposePrompt = buildPurposeLensPrompt(purposeLens, customLensPrompt || undefined);
      systemPrompt = `${systemPrompt}${purposePrompt}\n\nCONTINUITY: If the user has prior context in the conversation, connect the current concept to the previous one. Show knowledge progression and build cumulative understanding. Always think: "How does this concept fit into a bigger map?"\n\n${langPrompt}`;
    } else {
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "prompt is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      systemPrompt = modePrompts[mode] || modePrompts.beginner;
      const langPrompt = languagePrompts[language] || languagePrompts.en;
      const purposePrompt = buildPurposeLensPrompt(purposeLens, customLensPrompt || undefined);
      systemPrompt = `${systemPrompt}${purposePrompt}\n\n${langPrompt}`;
    }

    const apiMessages = type === "continue" && messages 
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ];

    const userLabel = userId ?? "guest";
    console.log(`User ${userLabel} - Processing ${type} request, mode: ${mode}, language: ${language}, cost: ${creditCost}`);

    // Helper to refund credits on AI failure
    const refundCredits = async () => {
      if (creditCost > 0 && userId && adminClient) {
        try {
          await adminClient.rpc('refund_user_credit', {
            p_user_id: userId,
            p_cost: creditCost
          });
          console.log(`User ${userLabel} - Refunded ${creditCost} credits after AI failure`);
        } catch (refundErr) {
          console.error("Credit refund failed:", refundErr);
        }
      }
    };

    // Abort the upstream call before the edge function's 150s idle timeout fires
    const controller = new AbortController();
    const UPSTREAM_TIMEOUT_MS = 120_000;
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    // Primary + fallbacks (models get retired on NVIDIA's catalog)
    const MODELS = [
      "meta/llama-3.1-8b-instruct",
      "meta/llama-3.3-70b-instruct",
      "mistralai/mistral-7b-instruct-v0.3",
    ];

    const callModel = (model: string) =>
      fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          max_tokens: 512,
          temperature: 0.20,
          top_p: 0.70,
          stream: false,
        }),
        signal: controller.signal,
      });

    let response: Response;
    try {
      response = await callModel(MODELS[0]);
      // 404/410 = model missing or retired -> try fallbacks
      for (let i = 1; i < MODELS.length && (response.status === 404 || response.status === 410); i++) {
        console.warn(`Model ${MODELS[i - 1]} unavailable (${response.status}), trying ${MODELS[i]}`);
        response = await callModel(MODELS[i]);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      await refundCredits();
      const isAbort = err instanceof Error && err.name === "AbortError";
      console.error(`User ${userLabel} - NVIDIA fetch ${isAbort ? "timed out" : "failed"}:`, err);
      return new Response(
        JSON.stringify({
          error: isAbort
            ? "AI model took too long to respond. Please try again or use a shorter prompt."
            : "AI service unreachable. Please try again.",
        }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Refund credits since AI call failed
      await refundCredits();

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
      console.error(`User ${userLabel} - AI gateway error:`, response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      // AI returned empty — refund
      await refundCredits();
      return new Response(
        JSON.stringify({ error: "AI returned empty response. Credits refunded." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        response: generatedText,
        credits_remaining: creditsRemaining,
        daily_remaining: dailyRemaining,
        monthly_remaining: monthlyRemaining,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat function error:", error instanceof Error ? error.message : "Unknown error");
    
    const errorMessage = error instanceof Error && error.message.includes("must be")
      ? error.message
      : "An error occurred processing your request";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
