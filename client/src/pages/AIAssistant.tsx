import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Send, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AIAssistant() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [inputValue, setInputValue] = useState("");

  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    chatMutation.mutate(
      {
        messages: [...messages, { role: "user", content: userMessage }],
      },
      {
        onSuccess: (response) => {
          const assistantMessage = typeof response.message === "string" ? response.message : JSON.stringify(response.message);
          setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h1 className="text-3xl font-bold">INQAR AI</h1>
        </div>
        <p className="text-muted-foreground">Get personalized recommendations and answers</p>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 p-4 mb-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Start a conversation with INQAR AI</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.role === "user" ? "bg-blue-500 text-white" : "bg-muted"
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-lg">
              <Spinner className="w-4 h-4" />
            </div>
          </div>
        )}
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        <Button onClick={handleSendMessage} disabled={!inputValue.trim() || chatMutation.isPending}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
