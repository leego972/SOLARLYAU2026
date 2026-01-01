import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen, ChevronRight } from "lucide-react";
import { APP_LOGO } from "@/const";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug });
  const { data: relatedPosts } = trpc.blog.getRelated.useQuery(
    { slug, category: post?.category || "", limit: 3 },
    { enabled: !!post?.category }
  );

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container py-4 flex items-center justify-between">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
          </div>
        </header>
        <div className="container py-12 max-w-4xl">
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container py-4 flex items-center justify-between">
            <Link href="/blog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
          </div>
        </header>
        <div className="container py-16 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <Button>Browse All Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
        </div>
      </header>

      {/* Article Header */}
      <section className="bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-12">
        <div className="container max-w-4xl">
          <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-700">
            {post.category}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.authorName}</span>
              {post.authorRole && (
                <span className="text-slate-400">• {post.authorRole}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min read</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="container max-w-4xl py-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="container max-w-4xl py-8">
        <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-orange-600 prose-strong:text-slate-900">
          <Streamdown>{post.content}</Streamdown>
        </div>
      </article>

      {/* Tags */}
      {post.tags && (
        <section className="container max-w-4xl py-8 border-t">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">TAGS</h3>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(post.tags).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-slate-600">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="bg-slate-50 py-12 mt-8">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="h-32 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center rounded-t-lg">
                      {relatedPost.featuredImage ? (
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <BookOpen className="w-10 h-10 text-orange-300" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center text-xs text-slate-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {relatedPost.readingTime} min read
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="container text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Go Solar?</h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            Get free quotes from verified local installers and start saving on your electricity bills today.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              Get Free Solar Quotes
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} SolarlyAU. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
