import { MessageCircle, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your SolarlyAU assistant. Ask me anything about our lead generation system, pricing, or getting started!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (in production, this would call your AI backend)
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();

    // Pricing questions
    if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
      return "Our leads start at $60 for standard residential leads. Premium enriched leads are $80, and commercial leads range from $200-500. We also offer bundle discounts:\n\n• Buy 5 Get 1 Free: $299\n• Weekly Bundle (10 leads): $540\n• Monthly Bundle (30 leads): $1,440\n\nNo monthly fees or subscriptions - you only pay for leads you purchase!";
    }

    // Quality questions
    if (q.includes("quality") || q.includes("good") || q.includes("conversion")) {
      return "Our AI-generated leads have an average conversion rate of 25-35% (1 in 3-4 leads becomes a customer), which is significantly higher than the industry average of 15-20%.\n\nEach lead is scored 0-100 for quality, and we only deliver leads scoring 70+. Plus, all leads are 100% exclusive - sold to only ONE installer in your area.";
    }

    // Getting started
    if (q.includes("start") || q.includes("sign up") || q.includes("begin")) {
      return "Getting started is easy!\n\n1. Click 'Sign Up' and create your free account\n2. Complete your installer profile (ABN, CEC accreditation)\n3. Specify your service areas\n4. Browse available leads in the marketplace\n5. Purchase your first lead with a credit card\n\nThe entire process takes under 10 minutes, and you'll receive your first lead instantly!";
    }

    // Refund questions
    if (q.includes("refund") || q.includes("guarantee") || q.includes("money back")) {
      return "Yes, we offer refunds! If a lead is invalid (wrong contact info, not interested, already installed solar), request a refund within 7 days.\n\nOur AI automatically approves valid refund requests. You can also choose a replacement lead instead of a refund. Our refund rate is under 3% because of our strict quality controls.";
    }

    // States/coverage
    if (q.includes("state") || q.includes("area") || q.includes("cover") || q.includes("location")) {
      return "We currently generate leads across 6 Australian states:\n\n• Queensland (QLD)\n• New South Wales (NSW)\n• Western Australia (WA)\n• South Australia (SA)\n• Victoria (VIC)\n• Tasmania (TAS)\n\nWe're expanding to ACT and NT in 2025. You can specify your exact service areas by postcode or radius during signup.";
    }

    // Training/certification
    if (q.includes("train") || q.includes("certif") || q.includes("learn")) {
      return "Our certification program helps you close more deals!\n\n• One-time Certification: $299 (5 modules, digital certificate)\n• Monthly Training: $99/month (includes webinars, new content, community)\n• 6-Month Bundle: $799 (save $95)\n\nCertified installers average 65% close rate vs 40% for non-certified. The program pays for itself in 2-3 leads!";
    }

    // How it works
    if (q.includes("how") || q.includes("work") || q.includes("autonomous")) {
      return "Our AI runs 24/7 generating leads automatically:\n\n1. AI analyzes property data across Australia every 4 hours\n2. Identifies homeowners likely to want solar (demographic, roof suitability, energy usage)\n3. Scores each lead 0-100 for quality\n4. Matches leads with nearby installers based on service area\n5. Delivers leads instantly to your dashboard\n\nZero manual work required - the entire system is autonomous!";
    }

    // Default response
    return "Great question! For detailed information, I recommend:\n\n• Check our FAQ page for common questions\n• View our Pricing page for all package options\n• Read Success Stories to see real installer results\n• Contact support@solarlyau.com for specific inquiries\n\nOr ask me something more specific about leads, pricing, or getting started!";
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">SolarlyAU Support</h3>
              <p className="text-xs opacity-90">Typically replies instantly</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
