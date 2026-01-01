import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Sun,
  ArrowRight,
  Loader2,
  BookOpen
} from "lucide-react";
import { APP_LOGO } from "@/const";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";

// Fallback blog posts data (used when database is empty)
const fallbackBlogPosts: Record<string, {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}> = {
  "solar-rebates-2025": {
    id: "solar-rebates-2025",
    title: "Complete Guide to Solar Rebates in Australia 2025",
    excerpt: "Everything you need to know about federal STCs, state rebates, and how to maximize your solar savings in 2025.",
    category: "Rebates & Incentives",
    author: "SolarlyAU Team",
    date: "December 15, 2024",
    readTime: "8 min read",
    image: "🏛️",
    content: `
## Federal Solar Rebates (STCs)

The Small-scale Technology Certificates (STCs) program remains the primary federal incentive for residential solar in 2025. Here's what you need to know:

### How STCs Work

When you install a solar system, you're entitled to create STCs based on the amount of electricity your system is expected to generate over its lifetime (up to 2030). Each STC represents 1 megawatt-hour (MWh) of renewable electricity.

**Key Points:**
- STCs can reduce your system cost by **$2,500-$4,500** depending on location and system size
- Your installer typically claims the rebate and applies it as an upfront discount
- Systems up to 100kW installed by CEC-accredited installers are eligible
- The number of STCs decreases each year as we approach 2030

### Calculating Your STC Rebate

The formula for calculating STCs is:
\`\`\`
STCs = System Size (kW) × Zone Rating × Deeming Period
\`\`\`

Australia is divided into four zones based on solar radiation levels:
- **Zone 1** (highest): Northern Australia - Rating 1.622
- **Zone 2**: Most of Queensland, WA, NT - Rating 1.536
- **Zone 3**: Sydney, Perth, Adelaide - Rating 1.382
- **Zone 4** (lowest): Melbourne, Hobart, Tasmania - Rating 1.185

## State-by-State Rebates

### Victoria

Victoria offers some of the most generous state-level solar incentives in Australia:

**Solar Homes Program**
- Up to **$1,400 rebate** for eligible households
- Interest-free loans available up to $1,400
- Income threshold: Combined household income under $210,000

**Battery Rebate**
- Up to **$2,950** for eligible households
- Must be installed with a new or existing solar system
- Battery must be at least 6kWh capacity

### New South Wales

**Peak Demand Reduction Scheme**
- Incentives for battery storage systems
- Payments for reducing grid demand during peak periods

**Empowering Homes Program**
- Interest-free loans up to **$14,000** for solar and battery systems
- Available to households with income under $180,000

### Queensland

**Battery Booster**
- Up to **$3,000** for battery systems
- Must be paired with new or existing solar
- Available through participating retailers

**Interest-Free Loans**
- Various programs through energy retailers
- Check with your local provider for current offers

### South Australia

**Home Battery Scheme**
- Subsidies for battery installation
- Amounts vary based on battery size and household circumstances

**Virtual Power Plant Programs**
- Additional incentives for joining VPP networks
- Earn credits for sharing stored energy during peak demand

### Western Australia

**Distributed Energy Buyback Scheme (DEBS)**
- Competitive feed-in tariffs for exported solar
- Time-of-use rates reward exporting during peak periods

## How to Maximize Your Rebates

### 1. Act Quickly
STC values decrease each year as we approach 2030. Installing sooner means more certificates and a bigger discount.

### 2. Choose a CEC-Accredited Installer
This is mandatory for rebate eligibility. All installers in the SolarlyAU network are CEC-accredited.

### 3. Consider Batteries
Many states offer additional battery incentives. If you're thinking about storage, now is a great time to add it.

### 4. Check Income Eligibility
Some state programs have income thresholds. Review the requirements before applying.

### 5. Get Multiple Quotes
Prices vary significantly between installers. Getting 3+ quotes ensures you get the best value.

## Common Questions

**Q: Can I claim both federal and state rebates?**
A: Yes! Federal STCs and state rebates are separate programs. You can claim both.

**Q: Do rebates apply to battery-only installations?**
A: Federal STCs only apply to solar panels. However, many states offer separate battery rebates.

**Q: How long do rebates take to process?**
A: Federal STCs are typically applied as an upfront discount by your installer. State rebates may take 2-8 weeks to process.

## Ready to Claim Your Rebates?

The best way to maximize your solar savings is to get quotes from multiple CEC-accredited installers. They'll help you navigate the rebate process and ensure you get every dollar you're entitled to.
    `
  },
  "solar-panel-types": {
    id: "solar-panel-types",
    title: "Monocrystalline vs Polycrystalline: Which Solar Panels Are Best?",
    excerpt: "A detailed comparison of solar panel technologies to help you make an informed decision.",
    category: "Technology",
    author: "SolarlyAU Team",
    date: "December 10, 2024",
    readTime: "6 min read",
    image: "⚡",
    content: `
## Understanding Solar Panel Types

When shopping for solar panels, you'll encounter two main types of crystalline silicon panels: monocrystalline and polycrystalline. Understanding the differences will help you make the right choice for your home.

## Monocrystalline Panels

Monocrystalline panels are made from a single crystal of silicon, giving them their characteristic uniform dark appearance.

### Advantages
- **Higher efficiency** (18-22%): Generate more power per square meter
- **Better performance in low light**: Ideal for partially shaded roofs
- **Longer lifespan**: Often come with 25-30 year warranties
- **Sleek appearance**: Uniform black color looks better on most roofs

### Disadvantages
- **Higher cost**: Premium pricing reflects premium performance
- **More sensitive to high temperatures**: Slight efficiency drop in extreme heat

## Polycrystalline Panels

Polycrystalline panels are made from multiple silicon crystals melted together, creating their distinctive blue, speckled appearance.

### Advantages
- **Lower cost**: More affordable upfront investment
- **Good efficiency** (15-17%): Solid performance for most applications
- **Less waste in manufacturing**: More environmentally friendly production

### Disadvantages
- **Lower efficiency**: Need more roof space for same output
- **Less aesthetically pleasing**: Blue color may not suit all homes
- **Shorter lifespan**: Typically 20-25 year warranties

## Which Should You Choose?

**Choose Monocrystalline if:**
- You have limited roof space
- Aesthetics are important to you
- You want maximum long-term value
- Your roof has partial shading

**Choose Polycrystalline if:**
- Budget is your primary concern
- You have plenty of roof space
- You're in a cooler climate
- You prioritize environmental manufacturing

## The Verdict

For most Australian homeowners, **monocrystalline panels** offer the best value despite their higher upfront cost. The improved efficiency and longer lifespan typically result in better returns over the system's lifetime.

However, if budget is tight and you have ample roof space, polycrystalline panels remain a solid choice that will serve you well for decades.
    `
  },
  "battery-storage-guide": {
    id: "battery-storage-guide",
    title: "Is a Solar Battery Worth It in 2025? Complete ROI Analysis",
    excerpt: "We crunch the numbers on solar battery storage. Find out if adding a battery makes financial sense.",
    category: "Batteries",
    author: "SolarlyAU Team",
    date: "December 5, 2024",
    readTime: "10 min read",
    image: "🔋",
    content: `
## The Battery Question

With battery prices dropping and electricity rates rising, more Australians are asking: "Should I add a battery to my solar system?" Let's dive into the numbers.

## Current Battery Costs

As of 2025, here are typical installed prices for popular battery systems:

| Battery | Capacity | Typical Cost |
|---------|----------|--------------|
| Tesla Powerwall 2 | 13.5 kWh | $12,000-$15,000 |
| BYD Battery-Box | 10.2 kWh | $9,000-$12,000 |
| Enphase IQ Battery | 10.1 kWh | $10,000-$13,000 |
| Alpha ESS | 10.1 kWh | $8,000-$11,000 |

## Calculating Your ROI

### Step 1: Understand Your Usage Pattern

Batteries make the most sense if you:
- Use most electricity in the evening (after solar production stops)
- Have time-of-use electricity rates
- Experience frequent power outages
- Want energy independence

### Step 2: Calculate Potential Savings

**Example Scenario:**
- 10 kWh battery
- Evening electricity rate: $0.35/kWh
- Solar feed-in tariff: $0.05/kWh
- Daily battery cycles: 1

**Daily Savings:**
\`\`\`
10 kWh × ($0.35 - $0.05) = $3.00/day
Annual Savings = $3.00 × 365 = $1,095/year
\`\`\`

### Step 3: Payback Period

With a $10,000 battery and $1,095 annual savings:
\`\`\`
Payback Period = $10,000 ÷ $1,095 = 9.1 years
\`\`\`

## When Batteries Make Sense

**Good candidates for batteries:**
- High evening electricity users
- Areas with expensive peak rates
- Locations with unreliable grid power
- Households wanting backup power

**May want to wait:**
- Low electricity users
- Those with generous feed-in tariffs
- Budget-conscious buyers
- Renters or those planning to move soon

## State Rebates Improve ROI

Don't forget state battery rebates:
- **Victoria**: Up to $2,950
- **South Australia**: Various subsidies
- **Queensland**: Up to $3,000

These rebates can reduce payback periods by 2-3 years.

## Our Recommendation

For most households, batteries are now at the **tipping point** of financial viability. If you:
- Plan to stay in your home 10+ years
- Have high evening usage
- Value backup power
- Can access state rebates

...then a battery is likely a good investment.

If you're unsure, start with solar only and add a battery later. Most modern inverters are "battery-ready" for easy future upgrades.
    `
  }
};

// Related posts for recommendations
const relatedPosts = [
  { id: "solar-rebates-2025", title: "Complete Guide to Solar Rebates 2025", category: "Rebates" },
  { id: "solar-panel-types", title: "Monocrystalline vs Polycrystalline", category: "Technology" },
  { id: "battery-storage-guide", title: "Is a Solar Battery Worth It?", category: "Batteries" },
];

export default function BlogArticle() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Fetch from database
  const { data: dbPost, isLoading } = trpc.blog.getBySlug.useQuery({ slug });
  
  // Use database post if available, otherwise use fallback
  const fallbackPost = fallbackBlogPosts[slug];
  const post = dbPost ? {
    id: String(dbPost.id),
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    category: dbPost.category,
    author: dbPost.authorName,
    date: dbPost.publishedAt ? new Date(dbPost.publishedAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
    readTime: `${dbPost.readingTime} min read`,
    image: dbPost.featuredImage || '',
    content: dbPost.content,
  } : fallbackPost;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container py-4 flex items-center justify-between">
            <Link href="/blog" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
          </div>
        </header>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Article Not Found</h1>
          <p className="text-slate-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Browse All Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <img src={APP_LOGO} alt="SolarlyAU" className="h-10 w-auto" />
        </div>
      </header>

      {/* Article Header */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-100">
              {post.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-slate-600 mb-8">{post.excerpt}</p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <article className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-orange-600 prose-strong:text-slate-900">
              <Streamdown>{post.content}</Streamdown>
            </article>

            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share this article
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-12 bg-slate-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h2>
            <div className="grid gap-4">
              {relatedPosts.filter(p => p.id !== slug).slice(0, 3).map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <Badge variant="secondary" className="mb-2 text-xs">{relatedPost.category}</Badge>
                        <h3 className="font-semibold text-slate-900 hover:text-orange-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                      </div>
                      <ArrowRight className="w-5 h-5 text-orange-500" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Go Solar?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Get free quotes from verified installers and start saving today.
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
