import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  MessageSquare, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

// Blog Post Form
function BlogPostForm({ 
  post, 
  onSave, 
  onCancel 
}: { 
  post?: any; 
  onSave: () => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    slug: post?.slug || "",
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    authorName: post?.authorName || "SolarlyAU Team",
    authorRole: post?.authorRole || "Solar Experts",
    category: post?.category || "Solar Basics",
    featuredImage: post?.featuredImage || "",
    readingTime: post?.readingTime || 5,
    metaTitle: post?.metaTitle || "",
    metaDescription: post?.metaDescription || "",
    isPublished: post?.isPublished || false,
  });

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Blog post created!");
      onSave();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Blog post updated!");
      onSave();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (post?.id) {
      updateMutation.mutate({ id: post.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Slug (URL)</Label>
          <Input 
            value={formData.slug} 
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Excerpt</Label>
        <Textarea 
          value={formData.excerpt} 
          onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
          rows={2}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Content (Markdown supported)</Label>
        <Textarea 
          value={formData.content} 
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          rows={10}
          required
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Solar Basics">Solar Basics</SelectItem>
              <SelectItem value="Cost & Savings">Cost & Savings</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Installation">Installation</SelectItem>
              <SelectItem value="Government Rebates">Government Rebates</SelectItem>
              <SelectItem value="Tips & Guides">Tips & Guides</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Author Name</Label>
          <Input 
            value={formData.authorName} 
            onChange={(e) => setFormData({...formData, authorName: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label>Reading Time (min)</Label>
          <Input 
            type="number"
            value={formData.readingTime} 
            onChange={(e) => setFormData({...formData, readingTime: parseInt(e.target.value)})}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Featured Image URL</Label>
        <Input 
          value={formData.featuredImage} 
          onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch 
            checked={formData.isPublished} 
            onCheckedChange={(v) => setFormData({...formData, isPublished: v})}
          />
          <Label>Published</Label>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {post?.id ? "Update" : "Create"} Post
        </Button>
      </div>
    </form>
  );
}

// Testimonial Form
function TestimonialForm({ 
  testimonial, 
  onSave, 
  onCancel 
}: { 
  testimonial?: any; 
  onSave: () => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || "",
    location: testimonial?.location || "",
    role: testimonial?.role || "Homeowner",
    quote: testimonial?.quote || "",
    rating: testimonial?.rating || 5,
    type: testimonial?.type || "homeowner",
    systemSize: testimonial?.systemSize || "",
    savings: testimonial?.savings || "",
    isFeatured: testimonial?.isFeatured || false,
    displayOrder: testimonial?.displayOrder || 0,
    isPublished: testimonial?.isPublished || true,
  });

  const createMutation = trpc.testimonials.create.useMutation({
    onSuccess: () => {
      toast.success("Testimonial created!");
      onSave();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.testimonials.update.useMutation({
    onSuccess: () => {
      toast.success("Testimonial updated!");
      onSave();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testimonial?.id) {
      updateMutation.mutate({ id: testimonial.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input 
            value={formData.location} 
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Quote</Label>
        <Textarea 
          value={formData.quote} 
          onChange={(e) => setFormData({...formData, quote: e.target.value})}
          rows={3}
          required
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(v: "homeowner" | "installer") => setFormData({...formData, type: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homeowner">Homeowner</SelectItem>
              <SelectItem value="installer">Installer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Rating</Label>
          <Select value={String(formData.rating)} onValueChange={(v) => setFormData({...formData, rating: parseInt(v)})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 4, 3, 2, 1].map(r => (
                <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Display Order</Label>
          <Input 
            type="number"
            value={formData.displayOrder} 
            onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value)})}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>System Size (optional)</Label>
          <Input 
            value={formData.systemSize} 
            onChange={(e) => setFormData({...formData, systemSize: e.target.value})}
            placeholder="6.6kW"
          />
        </div>
        <div className="space-y-2">
          <Label>Savings (optional)</Label>
          <Input 
            value={formData.savings} 
            onChange={(e) => setFormData({...formData, savings: e.target.value})}
            placeholder="$1,200/year"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch 
            checked={formData.isFeatured} 
            onCheckedChange={(v) => setFormData({...formData, isFeatured: v})}
          />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            checked={formData.isPublished} 
            onCheckedChange={(v) => setFormData({...formData, isPublished: v})}
          />
          <Label>Published</Label>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {testimonial?.id ? "Update" : "Create"} Testimonial
        </Button>
      </div>
    </form>
  );
}

export default function AdminContent() {
  const { user, loading } = useAuth();
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);

  // Queries
  const { data: blogPosts, refetch: refetchPosts } = trpc.blog.adminGetAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: testimonials, refetch: refetchTestimonials } = trpc.testimonials.adminGetAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const { data: pendingRatings, refetch: refetchRatings } = trpc.ratings.getPending.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // Mutations
  const deletePostMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      refetchPosts();
    },
  });
  const deleteTestimonialMutation = trpc.testimonials.delete.useMutation({
    onSuccess: () => {
      toast.success("Testimonial deleted");
      refetchTestimonials();
    },
  });
  const moderateRatingMutation = trpc.ratings.moderate.useMutation({
    onSuccess: () => {
      toast.success("Rating moderated");
      refetchRatings();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin access to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600">Manage blog posts, testimonials, and installer ratings</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>

        <Tabs defaultValue="blog" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog Posts ({blogPosts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Testimonials ({testimonials?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="ratings" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Pending Ratings ({pendingRatings?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Blog Posts</CardTitle>
                  <CardDescription>Create and manage blog content</CardDescription>
                </div>
                <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingPost(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPost ? "Edit" : "Create"} Blog Post</DialogTitle>
                    </DialogHeader>
                    <BlogPostForm 
                      post={editingPost}
                      onSave={() => {
                        setShowPostForm(false);
                        refetchPosts();
                      }}
                      onCancel={() => setShowPostForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blogPosts?.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{post.title}</h3>
                          {post.isPublished ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Published</span>
                          ) : (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Draft</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{post.category} • {post.readingTime} min read</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingPost(post);
                            setShowPostForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this post?")) {
                              deletePostMutation.mutate({ id: post.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!blogPosts || blogPosts.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No blog posts yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Testimonials</CardTitle>
                  <CardDescription>Manage customer and installer testimonials</CardDescription>
                </div>
                <Dialog open={showTestimonialForm} onOpenChange={setShowTestimonialForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingTestimonial(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Testimonial
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingTestimonial ? "Edit" : "Create"} Testimonial</DialogTitle>
                    </DialogHeader>
                    <TestimonialForm 
                      testimonial={editingTestimonial}
                      onSave={() => {
                        setShowTestimonialForm(false);
                        refetchTestimonials();
                      }}
                      onCancel={() => setShowTestimonialForm(false)}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testimonials?.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{t.name}</h3>
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded capitalize">{t.type}</span>
                          {t.isFeatured && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Featured</span>
                          )}
                          {t.isPublished ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{t.location} • {t.rating} stars</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{t.quote}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingTestimonial(t);
                            setShowTestimonialForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this testimonial?")) {
                              deleteTestimonialMutation.mutate({ id: t.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!testimonials || testimonials.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No testimonials yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Ratings Tab */}
          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Pending Installer Ratings</CardTitle>
                <CardDescription>Review and approve ratings submitted by homeowners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRatings?.map((item) => (
                    <div key={item.rating.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{item.rating.reviewerName}</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-orange-600">{item.installer?.companyName}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < item.rating.overallRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          {item.rating.title && (
                            <p className="font-medium text-sm">{item.rating.title}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">{item.rating.comment}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {item.rating.reviewerLocation} • {new Date(item.rating.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => moderateRatingMutation.mutate({ ratingId: item.rating.id, action: "approve" })}
                            disabled={moderateRatingMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => moderateRatingMutation.mutate({ ratingId: item.rating.id, action: "reject" })}
                            disabled={moderateRatingMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!pendingRatings || pendingRatings.length === 0) && (
                    <p className="text-center text-gray-500 py-8">No pending ratings to review</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
