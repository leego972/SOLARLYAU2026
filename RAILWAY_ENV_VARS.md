# Environment Variables for Railway Deployment

## Required Variables

### Database
```
DATABASE_URL=mysql://user:password@host:port/database
```
Get from Railway MySQL plugin or external database provider (PlanetScale, TiDB Cloud, etc.)

### Authentication
```
JWT_SECRET=your-random-secret-here
```
Generate with: `openssl rand -base64 32`

```
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-manus-openid
OWNER_NAME=Your Name
```
Get from Manus account settings

### Application
```
VITE_APP_ID=your-app-id
VITE_APP_TITLE=SolarlyAU
VITE_APP_LOGO=/logo.svg
```

### Email (Choose ONE provider)

**Option 1: Gmail (Easiest for testing)**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SolarlyAU
```
Get app password: https://myaccount.google.com/apppasswords

**Option 2: SendGrid (Recommended for production)**
```
SENDGRID_API_KEY=SG.your-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SolarlyAU
```
Sign up: https://sendgrid.com

**Option 3: Resend (Modern alternative)**
```
RESEND_API_KEY=re_your-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SolarlyAU
```
Sign up: https://resend.com

### Stripe Payment Processing
```
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
```
Get from: https://dashboard.stripe.com/apikeys

**Important:** After deployment, configure Stripe webhook:
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-railway-url.railway.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Optional Variables

### Manus Built-in APIs (LLM, Storage, Notifications)
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```
Get from Manus dashboard

### Analytics
```
VITE_ANALYTICS_ENDPOINT=https://analytics.yourdomain.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### SMS Notifications (Optional)

**Twilio:**
```
twilio_sid_account=your-twilio-sid
twilio_auth_token=your-twilio-token
twilio_phone_number=+1234567890
```

**ClickSend:**
```
CLICKSEND_USERNAME=your-clicksend-username
CLICKSEND_API_KEY=your-clicksend-api-key
```

## Setting Environment Variables in Railway

### Via Railway Dashboard:
1. Open your project in Railway
2. Click on your service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add each variable one by one

### Via Railway CLI:
```bash
railway variables set DATABASE_URL="mysql://..."
railway variables set JWT_SECRET="your-secret"
# ... etc
```

### Bulk Import:
1. Create a `.env` file locally with all variables
2. Run: `railway variables set --from-file .env`

## Post-Deployment Checklist

- [ ] Database connected and migrations run
- [ ] Stripe webhook configured
- [ ] Email sending tested
- [ ] OAuth login working
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Environment variables verified

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL format is correct
- Check if Railway MySQL plugin is running
- Verify firewall allows Railway IPs

### Email Not Sending
- Check email provider credentials
- Verify FROM_EMAIL domain is verified (for SendGrid/Resend)
- Check Railway logs for error messages

### Stripe Webhook Failures
- Verify webhook URL is correct
- Check STRIPE_WEBHOOK_SECRET matches dashboard
- Ensure webhook events are selected

### OAuth Login Issues
- Verify OAUTH_SERVER_URL and VITE_OAUTH_PORTAL_URL
- Check OWNER_OPEN_ID matches your Manus account
- Ensure JWT_SECRET is set and consistent
