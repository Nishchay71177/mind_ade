import { useState } from "react";
import ChatInterface from "@/components/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Sparkles } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">MoodWise</h1>
                <p className="text-sm text-slate-600">AI Mood Tracking Companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Anonymous Mode
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Banner */}
        <div className="mb-6 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 mb-2">Welcome to MoodWise</h2>
              <p className="text-slate-700 mb-3">
                Start chatting with your AI mood companion. Your conversations are temporary and not saved - 
                perfect for private, judgment-free emotional support.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="flex items-center space-x-1">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-powered mood analysis</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>Compassionate responses</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Brain className="h-4 w-4" />
                  <span>Real-time sentiment tracking</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
            <TabsTrigger 
              value="chat" 
              className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-primary-500 data-[state=active]:text-white"
              data-testid="tab-chat"
            >
              <span>💬</span>
              <span>AI Chat Companion</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <ChatInterface />
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span>Smart Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time mood scoring (1-10 scale) and sentiment analysis powered by advanced AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span>Compassionate Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Empathetic responses and gentle guidance for emotional wellness and self-reflection.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span>Anonymous & Safe</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your conversations are temporary and private. No account required - just start chatting.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}