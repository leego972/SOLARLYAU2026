# SolarlyAU Self-Hosting Guide

**Complete guide to deploying your SolarlyAU system on alternative hosting platforms**

---

## 📦 What's Included in the Backup

The `solarlyau-complete-backup.zip` file contains:

- ✅ Complete source code (client + server)
- ✅ Database schema and migrations
- ✅ All configuration files
- ✅ Documentation and guides
- ✅ Autonomous system implementations
- ✅ Google Ads integration code
- ✅ Stripe payment integration
- ✅ Email templates and assets

**Not Included (You'll Need to Set Up):**
- node_modules (run `pnpm install` after extraction)
- Environment variables (see below)
- Database (MySQL/TiDB instance)
- SSL certificate (most hosts provide free)

---

## 💰 Budget-Friendly Hosting Options

### Option 1: **Railway.app** (Recommended for Beginners)
**Cost:** $5-20/month  
**Pros:** One-click deploy, automatic SSL, easy database setup  
**Cons:** Can get expensive at scale  

**Setup Steps:**
1. Create Railway account
2. Click "New Project" → "Deploy from GitHub"
3. Upload your code or connect GitHub
4. Add MySQL database (click "New" → "Database" → "MySQL")
5. Set environment variables (see below)
6. Deploy automatically

### Option 2: **Render.com** (Best Value)
**Cost:** $7-15/month (web service) + $7/month (database)  
**Total:** ~$15-22/month  
**Pros:** Free SSL, automatic deployments, good docs  
**Cons:** Slower cold starts on free tier  

**Setup Steps:**
1. Create Render account
2. Create "Web Service" → Connect repository
3. Build command: `pnpm install && pnpm build`
4. Start command: `pnpm start`
5. Add PostgreSQL database (or external MySQL)
6. Set environment variables
7. Deploy

### Option 3: **DigitalOcean App Platform**
**Cost:** $12/month (app) + $15/month (database)  
**Total:** ~$27/month  
**Pros:** Reliable, scalable, good performance  
**Cons:** More expensive  

**Setup Steps:**
1. Create DigitalOcean account
2. Go to "App Platform" → "Create App"
3. Connect GitHub or upload code
4. Choose "Node.js" runtime
5. Add MySQL managed database
6. Set environment variables
7. Deploy

### Option 4: **Vercel + PlanetScale** (Serverless)
**Cost:** $0-20/month (Vercel) + $0-29/month (PlanetScale)  
**Total:** $0-50/month (scales with usage)  
**Pros:** Free tier available, excellent performance  
**Cons:** Serverless limitations, learning curve  

**Setup Steps:**
1. Create Vercel account
2. Import project from GitHub
3. Framework: "Vite" (for frontend)
4. Add API routes for backend
5. Create PlanetScale database
6. Connect database via connection string
7. Set environment variables
8. Deploy

### Option 5: **AWS Lightsail** (Most Control)
**Cost:** $10/month (server) + $15/month (database)  
**Total:** ~$25/month  
**Pros:** Full control, AWS ecosystem, predictable pricing  
**Cons:** Requires more technical setup  

**Setup Steps:**
1. Create AWS account
2. Launch Lightsail instance (Node.js blueprint)
3. SSH into server
4. Upload and extract ZIP file
5. Install dependencies: `pnpm install`
6. Set up MySQL database (Lightsail managed)
7. Configure environment variables
8. Set up PM2 for process management
9. Configure Nginx reverse proxy
10. Add SSL certificate (Let's Encrypt)

---

## 🔧 Required Environment Variables

Create a `.env` file in the project root with these values:

```bash
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# Stripe (Your existing keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# SendGrid (Your existing key)
SENDGRID_API_KEY="SG...."

# Twilio (Your existing keys)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+..."

# Google Ads (When you get them)
GOOGLE_ADS_CUSTOMER_ID="123-456-7890"
GOOGLE_ADS_DEVELOPER_TOKEN="..."
GOOGLE_ADS_CLIENT_ID="..."
GOOGLE_ADS_CLIENT_SECRET="..."
GOOGLE_ADS_REFRESH_TOKEN="..."

# Manus OAuth (You'll need to create your own OAuth app)
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/app-auth"
VITE_APP_ID="your-app-id"
JWT_SECRET="your-random-secret-key"

# App Configuration
VITE_APP_TITLE="SolarlyAU"
VITE_APP_LOGO="/logo.svg"
OWNER_OPEN_ID="your-owner-id"
OWNER_NAME="Your Name"

# Analytics
VITE_GA_MEASUREMENT_ID="G-..."
VITE_ANALYTICS_WEBSITE_ID="..."
VITE_ANALYTICS_ENDPOINT="..."

# Frontend API Keys
VITE_FRONTEND_FORGE_API_KEY="..."
VITE_FRONTEND_FORGE_API_URL="..."
```

---

## 🚀 Deployment Steps (Generic)

### 1. Extract the Backup
```bash
unzip solarlyau-complete-backup.zip
cd solar-lead-ai
```

### 2. Install Dependencies
```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Set Up Database
```bash
# Push database schema
pnpm db:push

# (Optional) Seed with sample data
node seed-testimonials.mjs
```

### 4. Configure Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit with your values
nano .env
```

### 5. Build the Application
```bash
pnpm build
```

### 6. Start the Server
```bash
# Production mode
pnpm start

# Or with PM2 for process management
pm2 start "pnpm start" --name solarlyau
```

### 7. Configure Domain & SSL
- Point your domain DNS to the server IP
- Set up SSL certificate (Let's Encrypt or provider's free SSL)
- Configure reverse proxy (Nginx or platform's built-in)

---

## 🔄 Migration from Manus to Self-Hosting

### Step 1: Export Database Data
```bash
# From Manus dashboard, go to Database panel
# Click "Export" → Download SQL dump
# Import to your new database:
mysql -u user -p database < backup.sql
```

### Step 2: Update Environment Variables
- Copy all secrets from Manus Settings → Secrets
- Add them to your new hosting platform's environment variables

### Step 3: Update OAuth Redirect URLs
- If using Manus OAuth, update redirect URLs in Manus dashboard
- Or implement your own OAuth (Google, GitHub, etc.)

### Step 4: Test Payment Webhooks
- Update Stripe webhook URL to your new domain
- Test a payment to ensure webhooks work

### Step 5: Update Domain DNS
- Change DNS from Manus to your new hosting provider
- Wait for DNS propagation (24-48 hours)

---

## 📊 Cost Comparison

| Platform | Monthly Cost | Setup Difficulty | Best For |
|---|---|---|---|
| **Manus** | Unknown | Easiest | Quick start, no tech skills |
| **Railway** | $5-20 | Easy | Beginners, fast deploy |
| **Render** | $15-22 | Easy | Best value, reliable |
| **DigitalOcean** | $27 | Medium | Scalability, performance |
| **Vercel + PlanetScale** | $0-50 | Medium | Serverless, pay-as-you-go |
| **AWS Lightsail** | $25 | Hard | Full control, AWS ecosystem |

---

## 🛠️ Technical Requirements

**Minimum Server Specs:**
- 1 GB RAM
- 1 CPU core
- 10 GB storage
- Node.js 22.x
- MySQL 8.0 or compatible

**Recommended for Production:**
- 2 GB RAM
- 2 CPU cores
- 20 GB storage
- Load balancer (for scaling)
- CDN (Cloudflare free tier)

---

## ⚠️ Important Notes

### Authentication
Your app currently uses **Manus OAuth** for authentication. If you self-host, you'll need to either:

**Option A:** Keep using Manus OAuth (requires Manus account)
- Update redirect URLs in Manus dashboard
- Keep `OAUTH_SERVER_URL` and related env vars

**Option B:** Implement your own OAuth
- Use Google OAuth, GitHub, or Auth0
- Replace authentication code in `server/_core/auth.ts`
- Update frontend login flow

### Autonomous Systems
All autonomous systems (lead generation, installer recruitment, Google Ads) will continue working after migration. Just ensure:
- Scheduler is running (cron jobs or platform's scheduler)
- Environment variables are set correctly
- Database connection is stable

### Stripe Webhooks
**Critical:** Update your Stripe webhook URL after migration:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Update endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
3. Test the webhook to ensure it works

---

## 🆘 Troubleshooting

### Database Connection Errors
```bash
# Test database connection
node -e "console.log(process.env.DATABASE_URL)"

# Ensure format is correct:
# mysql://username:password@host:port/database
```

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

### Port Already in Use
```bash
# Change port in package.json or use environment variable
PORT=3001 pnpm start
```

### SSL Certificate Issues
- Most platforms provide free SSL automatically
- For custom servers, use Let's Encrypt: https://letsencrypt.org/
- Or use Cloudflare for free SSL proxy

---

## 📞 Need Help?

If you run into issues during self-hosting:

1. Check platform-specific documentation
2. Search for error messages on Stack Overflow
3. Join platform's Discord/community
4. Consider hiring a DevOps consultant ($50-100 for setup)

---

## 🎯 Recommendation

**For your budget situation, I recommend:**

1. **Start with Render.com** ($15-22/month)
   - Easy setup, good value
   - Free SSL, automatic deployments
   - Can scale as you grow

2. **Use Cloudflare** (free)
   - Add your domain to Cloudflare
   - Get free CDN + DDoS protection
   - Improves performance

3. **Monitor costs**
   - Start small, scale as revenue grows
   - Once making $5K+/month, upgrade to DigitalOcean or AWS

**Total Monthly Cost:** ~$15-25 vs Manus pricing

---

## ✅ Self-Hosting Checklist

Before going live:
- [ ] Database migrated and tested
- [ ] All environment variables set
- [ ] Stripe webhook URL updated
- [ ] Domain DNS pointed to new host
- [ ] SSL certificate active
- [ ] Test payment flow end-to-end
- [ ] Test lead submission form
- [ ] Verify autonomous systems running
- [ ] Set up monitoring/alerts
- [ ] Create backup strategy

---

**Good luck with your deployment! Your SolarlyAU system is fully portable and ready to run anywhere.**
