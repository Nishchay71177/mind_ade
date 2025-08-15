interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface MoodAnalysis {
  score: number; // 1-10 scale
  sentiment: string;
  confidence: number;
}

export class GroqService {
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1";

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
  }

  async generateResponse(message: string, conversationHistory: string[] = []): Promise<string> {
    try {
      const systemPrompt = `You are MoodWise, a compassionate AI companion specialized in mood tracking and emotional wellness. 
      Your role is to:
      1. Listen empathetically to users' feelings and experiences
      2. Ask thoughtful follow-up questions to understand their emotional state
      3. Provide gentle support and wellness tips when appropriate
      4. Help users reflect on their emotions without being clinical or providing medical advice
      5. Keep responses conversational, warm, and supportive
      
      Always respond with empathy and understanding. Focus on emotional wellness and helping users process their feelings.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((msg, index) => ({
          role: index % 2 === 0 ? "user" : "assistant",
          content: msg
        })),
        { role: "user", content: message }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || "I'm having trouble responding right now. Could you try again?";
    } catch (error) {
      console.error("Error calling Groq API:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async analyzeMood(message: string): Promise<MoodAnalysis> {
    try {
      const systemPrompt = `You are an expert mood analyzer. Analyze the emotional content of the user's message and respond with a JSON object containing:
      {
        "score": number (1-10 scale where 1 is very negative, 5 is neutral, 10 is very positive),
        "sentiment": string (one of: "very_negative", "negative", "slightly_negative", "neutral", "slightly_positive", "positive", "very_positive"),
        "confidence": number (0-1 scale indicating confidence in the analysis)
      }
      
      Consider factors like:
      - Emotional words and phrases
      - Context and implications
      - Overall tone
      - Stress indicators
      - Positive or negative experiences mentioned
      
      Only respond with the JSON object, no other text.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data: GroqResponse = await response.json();
      const analysis = JSON.parse(data.choices[0]?.message?.content || "{}");
      
      // Validate and provide defaults
      return {
        score: Math.max(1, Math.min(10, analysis.score || 5)),
        sentiment: analysis.sentiment || "neutral",
        confidence: Math.max(0, Math.min(1, analysis.confidence || 0.5)),
      };
    } catch (error) {
      console.error("Error analyzing mood:", error);
      // Return neutral analysis as fallback
      return {
        score: 5,
        sentiment: "neutral",
        confidence: 0.1,
      };
    }
  }
  async analyzeMessageAndRespond(message: string): Promise<{
    response: string;
    moodScore: number;
    sentiment: string;
    summary: string;
  }> {
    try {
      // Get AI response and mood analysis in parallel
      const [response, moodAnalysis] = await Promise.all([
        this.generateResponse(message),
        this.analyzeMood(message)
      ]);

      return {
        response,
        moodScore: moodAnalysis.score,
        sentiment: moodAnalysis.sentiment,
        summary: `Mood: ${moodAnalysis.score}/10 (${moodAnalysis.sentiment})`
      };
    } catch (error) {
      console.error("Error in analyzeMessageAndRespond:", error);
      return {
        response: "I'm here to listen. Could you tell me a bit more about how you're feeling?",
        moodScore: 5.0,
        sentiment: "neutral",
        summary: "Mood: 5/10 (neutral)"
      };
    }
  }
}

export const groqService = new GroqService();
