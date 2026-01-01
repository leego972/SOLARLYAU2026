import { drizzle } from "drizzle-orm/mysql2";
import { videoTestimonials } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const sampleTestimonials = [
  {
    installerId: 1,
    installerName: "Michael Chen",
    companyName: "SunPower Solutions QLD",
    title: "Tripled My Close Rate in 3 Months",
    quote: "SolarlyAU leads are pre-qualified and ready to buy. My close rate went from 22% to 68% and revenue increased by $47K in just 3 months.",
    videoUrl: "https://storage.solarlyau.com/testimonials/michael-chen.mp4",
    thumbnailUrl: "https://storage.solarlyau.com/testimonials/michael-chen-thumb.jpg",
    duration: 87,
    revenueBefore: 85000,
    revenueAfter: 182000,
    closeRateBefore: 22,
    closeRateAfter: 68,
    featured: true,
    displayOrder: 1,
    isActive: true,
  },
  {
    installerId: 2,
    installerName: "Sarah Williams",
    companyName: "Green Energy NSW",
    title: "Best Investment for My Solar Business",
    quote: "The AI-generated leads are incredibly accurate. I closed 15 deals in my first month alone. The ROI is insane - every dollar I spend returns $12.",
    videoUrl: "https://storage.solarlyau.com/testimonials/sarah-williams.mp4",
    thumbnailUrl: "https://storage.solarlyau.com/testimonials/sarah-williams-thumb.jpg",
    duration: 92,
    revenueBefore: 120000,
    revenueAfter: 285000,
    closeRateBefore: 28,
    closeRateAfter: 71,
    featured: true,
    displayOrder: 2,
    isActive: true,
  },
  {
    installerId: 3,
    installerName: "David Thompson",
    companyName: "Aussie Solar WA",
    title: "From Struggling to Thriving",
    quote: "I was spending $8K/month on Google Ads with terrible results. Switched to SolarlyAU and now spend $600/month on leads that actually convert. Game changer.",
    videoUrl: "https://storage.solarlyau.com/testimonials/david-thompson.mp4",
    thumbnailUrl: "https://storage.solarlyau.com/testimonials/david-thompson-thumb.jpg",
    duration: 95,
    revenueBefore: 95000,
    revenueAfter: 220000,
    closeRateBefore: 18,
    closeRateAfter: 62,
    featured: true,
    displayOrder: 3,
    isActive: true,
  },
];

async function seedTestimonials() {
  console.log("Seeding sample video testimonials...");

  for (const testimonial of sampleTestimonials) {
    await db.insert(videoTestimonials).values(testimonial);
    console.log(`✓ Added testimonial: ${testimonial.installerName}`);
  }

  console.log("\n✅ Sample testimonials seeded successfully!");
  console.log(`Total: ${sampleTestimonials.length} testimonials`);
  process.exit(0);
}

seedTestimonials().catch((error) => {
  console.error("❌ Error seeding testimonials:", error);
  process.exit(1);
});
