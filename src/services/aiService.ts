// Mock AI Service for MiniMind
// In production, this would connect to a real AI backend

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const modePrompts: Record<string, string> = {
  beginner: "You are a friendly teacher explaining concepts to a curious child. Use simple words, fun analogies, and emojis. Keep explanations short and engaging.",
  thinker: "You are a logical analyst. Break down concepts step by step with clear reasoning. Focus on the 'how' and 'why' behind things.",
  story: "You are a storyteller. Explain concepts through engaging narratives, metaphors, and creative scenarios that make learning memorable.",
  mastery: "You are an academic expert. Provide comprehensive, research-level explanations with proper terminology and in-depth analysis.",
};

const mockResponses: Record<string, Record<string, string>> = {
  beginner: {
    default: "Hi there! 😊 How are you today? Do you want to learn something fun? I'm here to help explain things in a simple, easy way! Just ask me anything and I'll break it down for you step by step. 🌟"
  },
  thinker: {
    default: "Hey there! What's up? Need help with something specific, or just hanging out? Let's dive into whatever's on your mind! 📚 ✨ I'm here to help you think through problems logically."
  },
  story: {
    default: "Once upon a time, in a cozy little town, there had lived a cheerful cat named Whiskers. Whiskers loved to play with his best friend, a fluffy mouse named Nibbles. One sunny day, they found a shiny red ball in the garden..."
  },
  mastery: {
    default: "Hello! How can I assist you today? If you have a specific topic or question in mind, feel free to share, and I'll provide a comprehensive, research-level explanation."
  },
};

export class AIService {
  static async getExplanation(prompt: string, mode: string, language: string): Promise<string> {
    await delay(1000 + Math.random() * 1500);
    
    // Return mock response based on mode
    const modeResponses = mockResponses[mode] || mockResponses.beginner;
    const response = modeResponses.default;
    
    // Add some variation based on the prompt
    if (prompt.toLowerCase().includes('quantum')) {
      return mode === 'beginner' 
        ? "Imagine tiny, tiny particles that can be in two places at once! 🌟 It's like magic, but it's real science called quantum physics! These particles are so small that they follow special rules different from everything we can see."
        : mode === 'story'
        ? "In a world smaller than a grain of sand, where the rules of our everyday life no longer apply, particles dance in a mysterious ballet. They exist everywhere and nowhere, spinning in superposition until observed..."
        : "Quantum mechanics is a fundamental theory describing physical properties at atomic and subatomic scales. It introduces concepts like wave-particle duality, superposition, and entanglement.";
    }
    
    if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('artificial intelligence')) {
      return mode === 'beginner'
        ? "AI is like teaching a computer to think! 🤖 We give it lots of examples and it learns patterns, just like you learn to recognize your friends' faces. Pretty cool, right?"
        : mode === 'thinker'
        ? "AI systems process information through neural networks, mimicking biological brain structures. They learn by adjusting weights through backpropagation, optimizing for specific objectives."
        : "Artificial Intelligence represents humanity's quest to create thinking machines. From the dreams of Turing to today's transformers, we've built systems that can see, speak, and create.";
    }
    
    return response;
  }
  
  static async getOneWordAnswer(prompt: string, language: string): Promise<string> {
    await delay(800);
    
    // Simple one-word responses
    const words = ['Fascinating', 'Quantum', 'Evolution', 'Innovation', 'Discovery', 'Curiosity'];
    return words[Math.floor(Math.random() * words.length)];
  }
  
  static async refinePrompt(prompt: string, language: string): Promise<string> {
    await delay(600);
    return `${prompt} - Could you explain this in detail with examples and practical applications?`;
  }
  
  static async continueConversation(messages: Array<{type: string, content: string}>, mode: string, language: string): Promise<string> {
    await delay(1200);
    return "That's a great follow-up question! Let me expand on that point...";
  }
}

export default AIService;
