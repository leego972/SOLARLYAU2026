import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Send, Bot, User, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
// FAQ Chatbot uses pre-defined responses, no server calls needed

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Pre-defined FAQ responses for common questions
const FAQ_RESPONSES: Record<string, string> = {
  "how much does solar cost": `The cost of solar panels in Australia typically ranges from **$4,000 to $12,000** for a standard residential system (5-10kW), after government rebates.

**Factors affecting price:**
- System size (kW)
- Panel quality and brand
- Inverter type
- Installation complexity
- Your location

Get a free personalized quote by clicking "Get Free Quote" above!`,

  "how do solar rebates work": `Australia offers generous solar rebates through the **Small-scale Renewable Energy Scheme (SRES)**:

1. **STCs (Small-scale Technology Certificates)**: You receive certificates based on your system size and location
2. **Point of sale discount**: Most installers apply the rebate directly, reducing your upfront cost by $2,000-$4,000
3. **State rebates**: Some states offer additional incentives (e.g., VIC, NSW, SA)

The federal rebate is being phased out gradually until 2030, so acting sooner means bigger savings!`,

  "how long do solar panels last": `Solar panels are built to last! Here's what to expect:

- **Panel lifespan**: 25-30+ years
- **Performance warranty**: Most panels guarantee 80-90% output at 25 years
- **Inverter lifespan**: 10-15 years (may need replacement once)
- **Maintenance**: Minimal - occasional cleaning and annual inspection

Your investment will generate clean energy for decades!`,

  "how much can i save": `Solar savings depend on several factors, but typical Australian households save:

- **$1,000-$2,500 per year** on electricity bills
- **Payback period**: 3-7 years
- **Return on investment**: 15-25% annually

**Maximize savings by:**
- Using appliances during daylight hours
- Adding a battery for evening use
- Choosing the right system size for your usage

Request a quote for a personalized savings estimate!`,

  "what size system do i need": `System size depends on your electricity usage:

| Daily Usage | Recommended Size | Typical Home |
|-------------|------------------|--------------|
| 10-15 kWh | 3-5 kW | Small/apartment |
| 15-25 kWh | 5-7 kW | Average family |
| 25-40 kWh | 7-10 kW | Large family |
| 40+ kWh | 10+ kW | Large home/pool |

Check your electricity bill for daily usage, or get a free assessment from our installers!`,

  "do i need a battery": `Batteries can maximize your solar investment, but aren't essential for everyone:

**Consider a battery if:**
- You use most electricity in evenings
- You want backup power during outages
- Feed-in tariffs are low in your area
- You want energy independence

**Battery costs**: $8,000-$15,000 for 10-13kWh
**Payback**: 7-12 years

Many homeowners start with panels only and add a battery later!`,

  "how long does installation take": `Solar installation is quick and minimally disruptive:

- **Quote & assessment**: 1-2 days
- **Approval & paperwork**: 1-2 weeks
- **Installation**: 1 day for most homes
- **Grid connection**: 1-2 weeks

**Total timeline**: 2-4 weeks from quote to generating power

Our verified installers handle all paperwork and approvals for you!`,

  "what happens on cloudy days": `Solar panels still generate power on cloudy days, just less than on sunny days:

- **Cloudy day output**: 10-25% of peak capacity
- **Rainy day output**: 5-15% of peak capacity
- **Winter output**: Lower due to shorter days, not temperature

Your system is designed for annual production, accounting for weather variations. Grid connection ensures you always have power when needed!`,
};

// Keywords to match questions to FAQ responses
const FAQ_KEYWORDS: Record<string, string[]> = {
  "how much does solar cost": ["cost", "price", "expensive", "afford", "pay", "investment", "spend"],
  "how do solar rebates work": ["rebate", "incentive", "stc", "government", "subsidy", "discount", "scheme"],
  "how long do solar panels last": ["last", "lifespan", "durability", "warranty", "years", "lifetime"],
  "how much can i save": ["save", "savings", "bill", "payback", "roi", "return", "money"],
  "what size system do i need": ["size", "kwh", "kw", "capacity", "big", "small", "need"],
  "do i need a battery": ["battery", "storage", "powerwall", "backup", "store"],
  "how long does installation take": ["install", "time", "long", "process", "timeline", "quick"],
  "what happens on cloudy days": ["cloudy", "rain", "weather", "winter", "shade", "night"],
};

function findBestMatch(question: string): string | null {
  const lowerQuestion = question.toLowerCase();
  
  let bestMatch: string | null = null;
  let bestScore = 0;
  
  for (const [faqKey, keywords] of Object.entries(FAQ_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerQuestion.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faqKey;
    }
  }
  
  return bestScore > 0 ? bestMatch : null;
}

export default function FAQChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your solar energy assistant. Ask me anything about solar panels, costs, rebates, or installation. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    // Check for FAQ match first
    const faqMatch = findBestMatch(userMessage);
    
    if (faqMatch && FAQ_RESPONSES[faqMatch]) {
      // Simulate typing delay for natural feel
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: FAQ_RESPONSES[faqMatch] },
        ]);
        setIsTyping(false);
      }, 500 + Math.random() * 500);
    } else {
      // Fallback response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Great question! For detailed information about "${userMessage}", I'd recommend getting a free quote from one of our verified installers. They can provide personalized advice based on your specific situation.\n\nClick **"Get Free Quote"** above to get started, or ask me about:\n- Solar costs and pricing\n- Government rebates\n- System sizing\n- Installation process\n- Savings estimates`,
          },
        ]);
        setIsTyping(false);
      }, 500);
    }
  };

  const suggestedQuestions = [
    "How much does solar cost?",
    "How do rebates work?",
    "What size system do I need?",
    "How much can I save?",
  ];

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg",
          "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
          "transition-all duration-300",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      <Card
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] shadow-2xl border-0 overflow-hidden",
          "transition-all duration-300 transform",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Solar Assistant</h3>
              <p className="text-sm text-orange-100">Ask me anything about solar!</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-orange-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 max-w-[80%] text-sm",
                    message.role === "user"
                      ? "bg-orange-500 text-white rounded-br-md"
                      : "bg-slate-100 text-slate-700 rounded-bl-md"
                  )}
                >
                  <div className="prose prose-sm prose-slate max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>table]:text-xs">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-1">{line}</p>
                    ))}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-orange-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-slate-500 font-medium">Popular questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about solar..."
              className="flex-1 border-slate-200 focus:border-orange-500 focus:ring-orange-500"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </>
  );
}
