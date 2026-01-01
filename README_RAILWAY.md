# SolarlyAU - Railway Deployment Package

## 📦 Package Contents

This ZIP contains the complete SolarlyAU application ready for Railway deployment.

**Size:** 3.5MB (excludes node_modules, will be installed during deployment)

## 🚀 Quick Deploy

### Option 1: Railway Dashboard (Easiest)

1. Extract this ZIP file
2. Push to GitHub repository
3. Go to https://railway.app/new
4. Click "Deploy from GitHub repo"
5. Select your repository
6. Railway will auto-deploy

### Option 2: Railway CLI

```bash
# Extract ZIP
unzip solarlyau-railway-deployment.zip
cd solar-lead-ai

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 📋 Pre-Deployment Checklist

Before deploying, you need:

- [ ] Railway account (https://railway.app)
- [ ] Stripe account with API keys (https://stripe.com)
- [ ] Email provider (Gmail, SendGrid, or Resend)
- [ ] Database (Railway MySQL or external)
- [ ] Manus OAuth credentials (optional, for auth)

## 📚 Documentation Files

- **RAILWAY_DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **RAILWAY_ENV_VARS.md** - All environment variables explained
- **HYBRID_OUTREACH_GUIDE.md** - Installer recruitment system
- **DEPLOYMENT_GUIDE.md** - General deployment guide
- **GOOGLE_ADS_SETUP_GUIDE.md** - Marketing automation setup

## ⚙️ Environment Variables

You'll need to configure ~20 environment variables. See `RAILWAY_ENV_VARS.md` for the complete list.

**Critical Variables:**
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Random secret for sessions
- `STRIPE_SECRET_KEY` - Stripe API key
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` - Email sending
- `OWNER_OPEN_ID` - Your Manus account ID

## 🗄️ Database Setup

Railway provides MySQL out of the box:

1. Add MySQL service in Railway dashboard
2. Copy `DATABASE_URL` to your app's environment variables
3. Run migrations: `railway run pnpm db:push`

## 💳 Stripe Configuration

After deployment:

1. Configure webhook endpoint: `https://your-app.railway.app/api/stripe/webhook`
2. Select events: `checkout.session.completed`, `payment_intent.succeeded`
3. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable

## 🧪 Testing

The application includes 195 tests (91% pass rate):

```bash
pnpm test
```

## 📊 Features Included

✅ Homeowner lead submission
✅ AI-powered lead qualification
✅ Installer marketplace
✅ Stripe payment processing
✅ Email notifications
✅ SMS notifications (Twilio/ClickSend)
✅ Admin dashboard
✅ Revenue tracking
✅ Blog system
✅ Testimonials & ratings
✅ Lead tracking for homeowners
✅ LinkedIn + email recruitment automation

## 🔧 Build Commands

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Build for production
pnpm build

# Start production server
pnpm start

# Development mode
pnpm dev
```

## 📖 Getting Started

1. **Read RAILWAY_DEPLOYMENT_GUIDE.md** - Start here for step-by-step instructions
2. **Configure environment variables** - Use RAILWAY_ENV_VARS.md as reference
3. **Deploy to Railway** - Follow the guide
4. **Set up Stripe webhook** - Critical for payments
5. **Test the application** - Verify all features work
6. **Launch installer recruitment** - Use HYBRID_OUTREACH_GUIDE.md

## 🐛 Troubleshooting

### Build Fails
- Check Railway logs for specific errors
- Verify all environment variables are set
- Ensure `pnpm` is being used (not npm)

### Database Connection Issues
- Verify `DATABASE_URL` format is correct
- Check if MySQL service is running
- Run migrations: `railway run pnpm db:push`

### Stripe Webhook Failures
- Verify webhook URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches dashboard
- Ensure webhook events are selected

### Email Not Sending
- Check email provider credentials
- Verify `FROM_EMAIL` domain is verified (SendGrid/Resend)
- Test with Gmail first (easiest to set up)

## 📞 Support

- Railway Documentation: https://docs.railway.app
- Stripe Documentation: https://stripe.com/docs
- Check application logs: `railway logs`
- Review environment variables: `railway variables`

## 🎯 Next Steps After Deployment

1. **Seed the marketplace** - Visit `/admin/revenue` and click "Seed 20 New Leads"
2. **Test payment flow** - Use Stripe test card: 4242 4242 4242 4242
3. **Launch recruitment** - Run `pnpm exec tsx run_hybrid_outreach.ts`
4. **Monitor metrics** - Check `/admin/metrics` daily
5. **Collect testimonials** - Follow up with first installers

## 📄 License

Proprietary - All rights reserved

## 🏗️ Built With

- React 19 + TypeScript
- tRPC 11 for type-safe APIs
- Tailwind CSS 4 for styling
- Drizzle ORM for database
- Stripe for payments
- Express 4 for server
- Vite for bundling

---

**Ready to deploy?** Start with `RAILWAY_DEPLOYMENT_GUIDE.md` 🚀
