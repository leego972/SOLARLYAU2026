import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight,
  Sun, 
  Calendar,
  Clock,
  User,
  Search,
  BookOpen,
  Loader2
} from "lucide-react";
import { APP_LOGO } from "@/const";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

// Blog post type
type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  publishedAt: Date | string | null;
  readingTime: number;
  featuredImage: string | null;
};

// Static fallback posts for when database is empty
const staticBlogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "solar-rebates-2025",
    title: "Complete Guide to Solar Rebates in Australia 2025",
    excerpt: "Everything you need to know about federal STCs, state rebates, and how to maximize your solar savings in 2025.",
    category: "Rebates & Incentives",
    authorName: "SolarlyAU Team",
    publishedAt: new Date("2024-12-15"),
    readingTime: 8,
    featuredImage: null,
  },
  {
    id: 2,
    slug: "battery-storage-guide",
    title: "Is a Solar Battery Worth It in 2025? Complete ROI Analysis",
    excerpt: "We crunch the numbers on solar battery storage. Find out if adding a battery makes financial sense for your home.",
    category: "Batteries",
    authorName: "SolarlyAU Team",
    publishedAt: new Date("2024-12-05"),
    readingTime: 10,
    featuredImage: null,
  },
];

const categories = ["All", "Rebates & Incentives", "Technology", "Batteries", "Planning", "Savings", "Installation", "Education", "Electric Vehicles"];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch posts from database
  const { data: dbPosts, isLoading } = trpc.blog.getAll.useQuery({ limit: 50 });
  
  // Use database posts if available, otherwise use static fallback
  const blogPosts: BlogPost[] = dbPosts && dbPosts.length > 0 
    ? dbPosts.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        authorName: p.authorName,
        publishedAt: p.publishedAt,
        readingTime: p.readingTime,
        featuredImage: p.featuredImage,
      }))
    : staticBlogPosts;

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts: BlogPost[] = blogPosts.slice(0, 2); // First 2 posts are featured
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Solar Education Hub
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Solar Energy Blog
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Expert guides, industry insights, and practical tips to help you make 
              the most of solar energy in Australia.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 bg-white border-b">
        <div className="container">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map((post, index) => (
              <Link key={post.slug || index} href={`/blog/${post.slug}`}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer">
                  <div className="flex">
                    <div className="w-24 md:w-32 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                      {post.featuredImage ? (
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-10 h-10 text-orange-300" />
                      )}
                    </div>
                    <CardContent className="flex-1 p-4 md:p-6">
                      <Badge variant="secondary" className="mb-2 text-xs">{post.category}</Badge>
                      <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readingTime} min read
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-slate-50 border-b sticky top-[73px] z-40">
        <div className="container">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedCategory === "All" ? "All Articles" : selectedCategory}
            </h2>
            <span className="text-sm text-slate-500">{filteredPosts.length} articles</span>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-slate-500">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <Link key={post.slug || index} href={`/blog/${post.slug}`}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer h-full">
                    <div className="h-32 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                      {post.featuredImage ? (
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-orange-300" />
                      )}
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-2 text-xs">{post.category}</Badge>
                      <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readingTime} min read
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Stay Updated on Solar News
            </h2>
            <p className="text-white/90 mb-6">
              Get the latest solar tips, rebate updates, and industry news delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Start Your Solar Journey?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Get free quotes from verified installers in your area.
            </p>
            <Link href="/get-quote">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                <Sun className="w-5 h-5 mr-2" />
                Get Free Solar Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} SolarlyAU. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-orange-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-orange-600">Terms & Conditions</Link>
            <Link href="/about" className="hover:text-orange-600">About Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
