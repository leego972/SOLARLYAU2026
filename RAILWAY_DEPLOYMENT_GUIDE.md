# SolarlyAU - Railway Deployment Guide

## Quick Start

1. **Create Railway Account**: https://railway.app
2. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

## Deployment Steps

### 1. Create New Project

**Via Railway Dashboard:**
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select your SolarlyAU repository
5. Railway will auto-detect the configuration

**Via Railway CLI:**
```bash
cd solar-lead-ai
railway init
railway up
```

### 2. Add MySQL Database

1. In your Railway project, click "New"
2. Select "Database" → "MySQL"
3. Railway will create a MySQL instance
4. Copy the `DATABASE_URL` from the database service
5. Add it to your main service's environment variables

**Alternative:** Use external database (PlanetScale, TiDB Cloud, AWS RDS)

### 3. Configure Environment Variables

Go to your service → "Variables" tab and add all required variables from `RAILWAY_ENV_VARS.md`.

**Minimum Required:**
```
DATABASE_URL=mysql://...
JWT_SECRET=your-random-secret
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SolarlyAU
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-openid
OWNER_NAME=Your Name
VITE_APP_ID=solarlyau
VITE_APP_TITLE=SolarlyAU
VITE_APP_LOGO=/logo.svg
```

### 4. Deploy

Railway will automatically deploy when you push to your connected GitHub branch.

**Manual deployment via CLI:**
```bash
railway up
```

### 5. Run Database Migrations

After first deployment:

**Via Railway CLI:**
```bash
railway run pnpm db:push
```

**Via Railway Dashboard:**
1. Go to your service
2. Click "Settings" → "Deploy"
3. Add to build command: `pnpm install && pnpm db:push && pnpm build`

### 6. Configure Stripe Webhook

1. Get your Railway deployment URL (e.g., `https://your-app.railway.app`)
2. Go to https://dashboard.stripe.com/webhooks
3. Click "Add endpoint"
4. Enter: `https://your-app.railway.app/api/stripe/webhook`
5. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Copy the webhook signing secret
7. Add to Railway environment variables as `STRIPE_WEBHOOK_SECRET`

### 7. Configure Custom Domain (Optional)

1. In Railway project, go to "Settings" → "Domains"
2. Click "Generate Domain" for free Railway subdomain
3. Or click "Custom Domain" to add your own domain
4. Add DNS records as shown by Railway
5. Wait for SSL certificate to provision (5-10 minutes)

## Post-Deployment Checklist

- [ ] Application is accessible at Railway URL
- [ ] Database connection working (check logs)
- [ ] User registration/login working
- [ ] Stripe checkout flow working
- [ ] Email sending working (test with password reset)
- [ ] Homeowner lead submission working
- [ ] Installer can view leads
- [ ] Admin dashboard accessible
- [ ] Stripe webhook receiving events
- [ ] Custom domain configured (if applicable)

## Monitoring & Logs

### View Logs
**Via Dashboard:**
1. Go to your service
2. Click "Deployments"
3. Click on latest deployment
4. View logs in real-time

**Via CLI:**
```bash
railway logs
```

### Metrics
Railway provides built-in metrics:
- CPU usage
- Memory usage
- Network traffic
- Request count

Access via: Project → Service → "Metrics" tab

## Troubleshooting

### Build Failures

**Error: "pnpm: command not found"**
- Railway should auto-detect pnpm from `package.json`
- If not, add to `railway.json`:
  ```json
  {
    "build": {
      "builder": "NIXPACKS"
    }
  }
  ```

**Error: "TypeScript compilation failed"**
- Check logs for specific errors
- Ensure all dependencies are in `package.json`
- Try local build: `pnpm build`

### Runtime Errors

**Error: "Cannot connect to database"**
- Verify `DATABASE_URL` is set correctly
- Check if MySQL service is running
- Ensure database allows connections from Railway IPs

**Error: "Stripe webhook signature verification failed"**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Ensure webhook URL is correct
- Check if webhook is receiving events in Stripe dashboard

**Error: "Email sending failed"**
- Verify email provider credentials
- Check if Gmail app password is correct
- Ensure `FROM_EMAIL` domain is verified (for SendGrid/Resend)

### Performance Issues

**Slow response times:**
- Check Railway metrics for CPU/memory usage
- Consider upgrading Railway plan
- Optimize database queries
- Add database indexes

**Out of memory:**
- Increase memory limit in Railway settings
- Check for memory leaks in logs
- Optimize image processing

## Scaling

### Horizontal Scaling
Railway supports horizontal scaling:
1. Go to Service → "Settings" → "Scaling"
2. Increase replica count
3. Railway will load balance automatically

### Vertical Scaling
Upgrade Railway plan for more resources:
- Hobby: $5/month (512MB RAM, 1 vCPU)
- Pro: $20/month (8GB RAM, 8 vCPU)
- Enterprise: Custom pricing

## Backup & Recovery

### Database Backups
**Automated backups:**
- Railway MySQL includes daily backups
- Retention: 7 days on Hobby plan, 30 days on Pro

**Manual backup:**
```bash
railway run mysqldump -u user -p database > backup.sql
```

**Restore from backup:**
```bash
railway run mysql -u user -p database < backup.sql
```

### Application Rollback
Railway keeps deployment history:
1. Go to "Deployments"
2. Find previous working deployment
3. Click "Redeploy"

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Stripe Keys**: Use test keys for development, live keys for production
3. **Database**: Use strong passwords, enable SSL
4. **JWT Secret**: Use cryptographically secure random string
5. **CORS**: Configure allowed origins in production
6. **Rate Limiting**: Enable in production (already configured)
7. **HTTPS**: Always use HTTPS (Railway provides free SSL)

## Cost Optimization

### Railway Pricing
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage
- **Usage**: $0.000231/GB-hour for memory, $0.000463/vCPU-hour

### Tips to Reduce Costs
1. Use Railway's MySQL instead of external database
2. Optimize images (compress, use WebP)
3. Enable caching for static assets
4. Use Railway's free tier for development
5. Monitor usage in Railway dashboard

## Support

### Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: team@railway.app

### SolarlyAU Issues
- Check logs first
- Review environment variables
- Test locally before deploying
- Contact developer for custom issues

## Additional Resources

- Railway Documentation: https://docs.railway.app
- Railway CLI: https://docs.railway.app/develop/cli
- Railway Templates: https://railway.app/templates
- Stripe Documentation: https://stripe.com/docs
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
