import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function VideoTestimonials() {
  const { data: testimonials, isLoading } = trpc.videoTestimonials.featured.useQuery();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        {/* Fallback placeholders */}
        {[
          {
            name: "Michael Chen",
            company: "SunPower Solutions QLD",
            quote: "Tripled my close rate in 3 months",
            seed: "Michael",
          },
          {
            name: "Sarah Williams",
            company: "Green Energy NSW",
            quote: "Best investment for my solar business",
            seed: "Sarah",
          },
          {
            name: "David Thompson",
            company: "Aussie Solar WA",
            quote: "From struggling to thriving",
            seed: "David",
          },
        ].map((placeholder) => (
          <Card key={placeholder.name} className="overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-sm opacity-75">Video testimonial coming soon</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${placeholder.seed}`}
                  alt={placeholder.name}
                  className="w-16 h-16 rounded-full border-2 border-blue-100"
                />
                <div>
                  <h4 className="font-bold text-lg">{placeholder.name}</h4>
                  <p className="text-sm text-gray-600">{placeholder.company}</p>
                  <p className="text-sm text-gray-500 mt-2">"{placeholder.quote}"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {testimonials.slice(0, 3).map((testimonial: any) => (
        <Card key={testimonial.id} className="overflow-hidden">
          <div className="relative aspect-video bg-gray-900">
            {testimonial.videoUrl ? (
              <video
                src={testimonial.videoUrl}
                poster={testimonial.thumbnailUrl || undefined}
                controls
                className="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <p className="text-sm opacity-75">Video testimonial coming soon</p>
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.installerName}`}
                alt={testimonial.installerName}
                className="w-16 h-16 rounded-full border-2 border-blue-100"
              />
              <div className="flex-1">
                <h4 className="font-bold text-lg">{testimonial.installerName}</h4>
                <p className="text-sm text-gray-600">{testimonial.companyName}</p>
                <p className="text-sm font-semibold text-blue-600 mt-1">{testimonial.title}</p>
                <p className="text-sm text-gray-500 mt-2">"{testimonial.quote}"</p>
                
                {testimonial.revenueBefore && testimonial.revenueAfter && (
                  <div className="mt-3 flex gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Revenue: </span>
                      <span className="font-semibold text-green-600">
                        ${(testimonial.revenueBefore / 1000).toFixed(0)}K → ${(testimonial.revenueAfter / 1000).toFixed(0)}K
                      </span>
                    </div>
                    {testimonial.closeRateBefore && testimonial.closeRateAfter && (
                      <div>
                        <span className="text-gray-500">Close Rate: </span>
                        <span className="font-semibold text-blue-600">
                          {testimonial.closeRateBefore}% → {testimonial.closeRateAfter}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
