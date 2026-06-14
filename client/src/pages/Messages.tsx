import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Send, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: conversations, isLoading: conversationsLoading } = trpc.conversations.getUserConversations.useQuery(
    {},
    { enabled: !!user }
  );

  const { data: messages, isLoading: messagesLoading } = trpc.messages.getMessages.useQuery(
    { conversationId: selectedConversationId || 0 },
    { enabled: !!selectedConversationId }
  );

  const sendMessageMutation = trpc.messages.sendMessage.useMutation();

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: messageText,
    });
    setMessageText("");
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Conversations List */}
        <Card className="p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {conversationsLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conv: any) => (
                <Button
                  key={conv.id}
                  variant={selectedConversationId === conv.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedConversationId(conv.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-3" />
                  <div className="text-left flex-1 truncate">
                    <p className="font-semibold truncate">User {conv.participantId}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No conversations yet</p>
          )}
        </Card>

        {/* Chat Area */}
        {selectedConversationId ? (
          <Card className="md:col-span-2 p-4 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {messagesLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : messages && messages.length > 0 ? (
                messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === user?.id ? "bg-blue-500 text-white" : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No messages yet</p>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="md:col-span-2 flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </Card>
        )}
      </div>
    </div>
  );
}
