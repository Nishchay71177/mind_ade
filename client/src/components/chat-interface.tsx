import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Send, Trash2, Bot, User, Heart, BarChart3, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  moodScore?: number;
}

interface SessionStats {
  messageCount: number;
  currentMoodScore: number;
  sessionDuration: string;
  sentiment: string;
}

export default function ChatInterface() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm MoodWise, your AI companion for mood tracking and emotional wellness. How are you feeling today? Feel free to share what's on your mind.",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    messageCount: 0,
    currentMoodScore: 5.0,
    sessionDuration: "0 min",
    sentiment: "Neutral"
  });
  const [sessionStart] = useState(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - sessionStart.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      setSessionStats(prev => ({
        ...prev,
        sessionDuration: `${diffMins} min`
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, [sessionStart]);

  // Create session for anonymous chat
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create session");
      return response.json();
    },
    onSuccess: (session) => {
      setSessionId(session.id);
    },
    onError: (error) => {
      console.error("Failed to create session:", error);
      toast({
        title: "Session Error",
        description: "Failed to create chat session. Please refresh the page.",
        variant: "destructive",
      });
    }
  });

  // Initialize session for anonymous users
  useEffect(() => {
    if (!sessionId) {
      createSessionMutation.mutate();
    }
  }, []);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: (data) => {
      const { aiMessage, userMessage, moodAnalysis } = data;
      
      // Update mood score and sentiment
      if (moodAnalysis) {
        const sentiment = getSentimentLabel(moodAnalysis.sentiment);
        setSessionStats(prev => ({
          ...prev,
          currentMoodScore: moodAnalysis.score,
          sentiment,
          messageCount: prev.messageCount + 1
        }));
      }

      // Add AI response to messages
      const aiMsg: Message = {
        id: aiMessage?.id || `ai-${Date.now()}`,
        content: aiMessage?.content || "I'm here to help. Could you share more about how you're feeling?",
        sender: 'ai',
        timestamp: new Date(),
        moodScore: moodAnalysis?.score,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Show mood score if significant change
      if (moodAnalysis && moodAnalysis.score < 4) {
        toast({
          title: "Mood Alert",
          description: `Detected lower mood (${moodAnalysis.score.toFixed(1)}/10). Take care of yourself!`,
          variant: "default",
        });
      }
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(input.trim());
    setInput("");
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      content: "Hello! I'm MoodWise, your AI companion for mood tracking and emotional wellness. How are you feeling today? Feel free to share what's on your mind.",
      sender: 'ai',
      timestamp: new Date(),
    }]);
    setSessionStats({
      messageCount: 0,
      currentMoodScore: 5.0,
      sessionDuration: "0 min",
      sentiment: "Neutral"
    });
    if (isAuthenticated) {
      createSessionMutation.mutate();
    }
  };

  const getSentimentLabel = (sentiment: string): string => {
    const labels: Record<string, string> = {
      very_positive: "Very Happy",
      positive: "Happy",
      slightly_positive: "Good",
      neutral: "Neutral",
      slightly_negative: "Concerned",
      negative: "Worried",
      very_negative: "Distressed"
    };
    return labels[sentiment] || "Neutral";
  };

  const getMoodColor = (score: number): string => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-500";
  };

  const getMoodBarColor = (score: number): string => {
    if (score >= 8) return "from-green-400 to-green-500";
    if (score >= 6) return "from-blue-400 to-blue-500";
    if (score >= 4) return "from-yellow-400 to-yellow-500";
    return "from-red-400 to-red-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Area */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">MoodWise AI</h3>
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearChat}
              className="text-slate-400 hover:text-slate-600"
              data-testid="button-clear-chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.sender === 'user' ? "justify-end" : ""
                )}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white text-sm w-4 h-4" />
                  </div>
                )}
                
                <div className={cn(
                  "rounded-xl p-3 max-w-md",
                  message.sender === 'user'
                    ? "bg-primary-500 text-white rounded-tr-sm"
                    : "bg-slate-100 rounded-tl-sm"
                )}>
                  <p className={cn(
                    message.sender === 'user' ? "text-white" : "text-slate-800"
                  )}>
                    {message.content}
                  </p>
                  <div className={cn(
                    "mt-2 text-xs",
                    message.sender === 'user' ? "text-primary-200" : "text-slate-500"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-slate-600 text-sm w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white text-sm w-4 h-4" />
                </div>
                <div className="bg-slate-100 rounded-xl rounded-tl-sm p-3 max-w-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share how you're feeling..."
                className="flex-1 bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || sendMessageMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-xl"
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Session Sidebar */}
      <div className="space-y-4">
        {/* Current Mood */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <Heart className="mr-2 text-red-400 w-4 h-4" />
              Current Session
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Mood Score</span>
                <span 
                  className={cn("font-semibold text-lg", getMoodColor(sessionStats.currentMoodScore))}
                  data-testid="text-mood-score"
                >
                  {sessionStats.currentMoodScore.toFixed(1)}/10
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={cn("bg-gradient-to-r h-2 rounded-full transition-all duration-500", getMoodBarColor(sessionStats.currentMoodScore))}
                  style={{ width: `${(sessionStats.currentMoodScore / 10) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-slate-600">
                <span data-testid="text-session-duration">Session: {sessionStats.sessionDuration}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
              <BarChart3 className="mr-2 text-blue-400 w-4 h-4" />
              Session Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Messages</span>
                <span className="font-medium" data-testid="text-message-count">{sessionStats.messageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Response</span>
                <span className="font-medium">2.1s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sentiment</span>
                <span className="font-medium text-slate-700" data-testid="text-sentiment">{sessionStats.sentiment}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wellness Tip */}
        <Card className="bg-gradient-to-br from-secondary-50 to-primary-50 border-secondary-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center">
              <Lightbulb className="mr-2 text-yellow-500 w-4 h-4" />
              Wellness Tip
            </h3>
            <p className="text-sm text-slate-700">
              Try the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8. This can help reduce stress and anxiety.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
