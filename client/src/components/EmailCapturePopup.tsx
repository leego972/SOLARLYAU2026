import { X, Download, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { trackEmailCapture } from "./Analytics";

export default function EmailCapturePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [hasShown, setHasShown] = useState(false);

  const captureEmailMutation = trpc.marketing.captureEmail.useMutation({
    onSuccess: () => {
      trackEmailCapture(email, "popup");
      toast.success("Success! Check your email for the free guide.");
      setIsVisible(false);
      localStorage.setItem("emailCaptured", "true");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send guide. Please try again.");
    },
  });

  useEffect(() => {
    // Check if user has already provided email
    const emailCaptured = localStorage.getItem("emailCaptured");
    if (emailCaptured) return;

    // Exit-intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    // Scroll-based trigger (backup for mobile)
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    // Time-based trigger (backup)
    const timer = setTimeout(() => {
      if (!hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    }, 30000); // 30 seconds

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, [hasShown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    captureEmailMutation.mutate({ email, name });
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("emailPopupDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-300" onClick={handleClose} />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-lg bg-white shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-300">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Icon */}
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-orange-600" />
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-center mb-2">
              Wait! Get Your Free Guide
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Download our <strong>"Ultimate Solar Lead Generation Guide"</strong> and learn how top installers are closing 3x more deals with AI-powered leads.
            </p>

            {/* Benefits */}
            <div className="bg-orange-50 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>7 proven strategies</strong> to increase your close rate from 25% to 65%
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Real case studies</strong> from installers making $50K+/month
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Bonus templates</strong> for follow-up emails and sales scripts
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                required
              />
              <Input
                type="email"
                placeholder="Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6"
                disabled={captureEmailMutation.isPending}
              >
                {captureEmailMutation.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Send Me The Free Guide
                  </>
                )}
              </Button>
            </form>

            {/* Trust Badge */}
            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 We respect your privacy. Unsubscribe anytime. No spam, ever.
            </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Join 2,847+ installers already growing their business with SolarlyAU
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
