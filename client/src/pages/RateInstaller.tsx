import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Star, Loader2, CheckCircle, AlertCircle, Sun } from "lucide-react";

// Star rating component
function StarRating({ 
  rating, 
  onRatingChange, 
  label 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-600">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RateInstaller() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewerLocation, setReviewerLocation] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [systemSize, setSystemSize] = useState("");

  // Get token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  // Validate token
  const { data: tokenData, isLoading: validating } = trpc.ratings.validateToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  // Submit mutation
  const submitMutation = trpc.ratings.submitWithToken.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || overallRating === 0) return;

    submitMutation.mutate({
      token,
      reviewerName,
      reviewerEmail: reviewerEmail || undefined,
      reviewerLocation: reviewerLocation || undefined,
      overallRating,
      communicationRating: communicationRating || undefined,
      qualityRating: qualityRating || undefined,
      valueRating: valueRating || undefined,
      timelinessRating: timelinessRating || undefined,
      title: title || undefined,
      comment,
      systemSize: systemSize || undefined,
    });
  };

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              This rating link is missing or invalid. Please use the link provided in your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full bg-orange-500 hover:bg-orange-600">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validating token
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Invalid or expired token
  if (tokenData && !tokenData.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle>Link Not Valid</CardTitle>
            <CardDescription>{tokenData.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full bg-orange-500 hover:bg-orange-600">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Successfully submitted
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription className="text-base">
              Your review has been submitted successfully. It will be published after moderation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Your feedback helps other homeowners make informed decisions about their solar installation.
            </p>
            <Button onClick={() => navigate("/")} className="w-full bg-orange-500 hover:bg-orange-600">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rating form
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sun className="w-10 h-10 text-orange-500" />
            <span className="text-2xl font-bold text-gray-800">SolarlyAU</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rate Your Solar Installation
          </h1>
          <p className="text-gray-600">
            Share your experience with <span className="font-semibold text-orange-600">{tokenData?.installerName}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
            <CardDescription>
              Help other homeowners by sharing your honest feedback about your solar installation experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Overall Rating - Required */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <StarRating
                  rating={overallRating}
                  onRatingChange={setOverallRating}
                  label="Overall Rating *"
                />
              </div>

              {/* Detailed Ratings */}
              <div className="grid grid-cols-2 gap-4">
                <StarRating
                  rating={communicationRating}
                  onRatingChange={setCommunicationRating}
                  label="Communication"
                />
                <StarRating
                  rating={qualityRating}
                  onRatingChange={setQualityRating}
                  label="Work Quality"
                />
                <StarRating
                  rating={valueRating}
                  onRatingChange={setValueRating}
                  label="Value for Money"
                />
                <StarRating
                  rating={timelinessRating}
                  onRatingChange={setTimelinessRating}
                  label="Timeliness"
                />
              </div>

              {/* Reviewer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input
                    id="location"
                    value={reviewerLocation}
                    onChange={(e) => setReviewerLocation(e.target.value)}
                    placeholder="Sydney, NSW"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemSize">System Size (optional)</Label>
                  <Input
                    id="systemSize"
                    value={systemSize}
                    onChange={(e) => setSystemSize(e.target.value)}
                    placeholder="6.6kW"
                  />
                </div>
              </div>

              {/* Review Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Review Title (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Great experience with professional team"
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">Your Review *</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience with this installer. What went well? What could be improved?"
                  rows={5}
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500">Minimum 10 characters</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6"
                disabled={submitMutation.isPending || overallRating === 0 || !reviewerName || comment.length < 10}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>

              {submitMutation.error && (
                <p className="text-red-500 text-center">
                  {submitMutation.error.message}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
