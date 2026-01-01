# SolarlyAU - Build & Deployment Commands

**Simple, copy-paste commands to build and deploy your SolarlyAU system**

---

## 📦 **Step 1: Extract Your Backup**

```bash
# Unzip the backup file
unzip solarlyau-complete-backup.zip

# Navigate into the project directory
cd solar-lead-ai
```

---

## 🔧 **Step 2: Install Dependencies**

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install all project dependencies
pnpm install
```

**What this does:**
- Downloads all required packages from npm
- Installs React, Express, Stripe, SendGrid, etc.
- Takes 2-3 minutes

---

## 🗄️ **Step 3: Set Up Database**

```bash
# Push database schema to your MySQL database
pnpm db:push
```

**What this does:**
- Creates all tables (users, leads, installers, transactions, etc.)
- Sets up indexes and relationships
- Requires DATABASE_URL environment variable to be set

**If you need to seed sample data:**
```bash
# Add sample video testimonials
node seed-testimonials.mjs
```

---

## 🏗️ **Step 4: Build the Application**

```bash
# Build both frontend and backend
pnpm build
```

**What this does:**
- Compiles TypeScript to JavaScript
- Bundles frontend React app with Vite
- Optimizes assets for production
- Creates `dist/` folder with production-ready code
- Takes 1-2 minutes

---

## 🚀 **Step 5: Start the Server**

### Option A: Simple Start (Development)
```bash
# Start in development mode (with hot reload)
pnpm dev
```

### Option B: Production Start
```bash
# Start in production mode
pnpm start
```

### Option C: Background Process (Recommended for Servers)
```bash
# Install PM2 process manager
npm install -g pm2

# Start with PM2 (keeps running even after logout)
pm2 start "pnpm start" --name solarlyau

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

---

## 🌐 **Step 6: Configure Domain & SSL**

### If Using a Hosting Platform (Render, Railway, etc.)
- Platform handles SSL automatically
- Just point your domain DNS to their servers
- Follow platform-specific instructions

### If Using Your Own Server (VPS, DigitalOcean, AWS)

**Install Nginx (Reverse Proxy):**
```bash
sudo apt update
sudo apt install nginx
```

**Create Nginx Configuration:**
```bash
sudo nano /etc/nginx/sites-available/solarlyau
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name solarlyau.com www.solarlyau.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/solarlyau /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Install SSL Certificate (Free with Let's Encrypt):**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (follow prompts)
sudo certbot --nginx -d solarlyau.com -d www.solarlyau.com

# Auto-renewal is set up automatically
```

---

## 🔐 **Step 7: Set Environment Variables**

Create a `.env` file in the project root:

```bash
nano .env
```

**Paste your environment variables:**
```bash
# Database
DATABASE_URL="mysql://username:password@host:3306/database"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# SendGrid
SENDGRID_API_KEY="SG...."

# Twilio
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+..."

# Google Ads (when you get them)
GOOGLE_ADS_CUSTOMER_ID="123-456-7890"
GOOGLE_ADS_DEVELOPER_TOKEN="..."
GOOGLE_ADS_CLIENT_ID="..."
GOOGLE_ADS_CLIENT_SECRET="..."
GOOGLE_ADS_REFRESH_TOKEN="..."

# App Configuration
VITE_APP_TITLE="SolarlyAU"
VITE_APP_LOGO="/logo.svg"
OWNER_OPEN_ID="your-owner-id"
OWNER_NAME="Your Name"
JWT_SECRET="your-random-secret-key-here"

# OAuth (if using Manus OAuth)
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/app-auth"
VITE_APP_ID="your-app-id"

# Analytics
VITE_GA_MEASUREMENT_ID="G-..."

# API Keys
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="..."
VITE_FRONTEND_FORGE_API_KEY="..."
VITE_FRONTEND_FORGE_API_URL="..."
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## 🧪 **Step 8: Test Everything**

```bash
# Test database connection
pnpm db:push

# Test build
pnpm build

# Test server start
pnpm start

# Check if server is running
curl http://localhost:3000

# Check PM2 status (if using PM2)
pm2 status
pm2 logs solarlyau
```

---

## 📊 **Useful Commands**

### View Logs
```bash
# View PM2 logs
pm2 logs solarlyau

# View last 100 lines
pm2 logs solarlyau --lines 100

# View only errors
pm2 logs solarlyau --err
```

### Restart Server
```bash
# Restart with PM2
pm2 restart solarlyau

# Or stop and start manually
pm2 stop solarlyau
pm2 start solarlyau
```

### Update Code
```bash
# Pull latest changes (if using Git)
git pull

# Reinstall dependencies (if package.json changed)
pnpm install

# Rebuild
pnpm build

# Restart
pm2 restart solarlyau
```

### Database Commands
```bash
# Push schema changes
pnpm db:push

# Generate migration
pnpm db:generate

# View database studio (GUI)
pnpm db:studio
```

### Check Server Status
```bash
# Check if Node.js process is running
ps aux | grep node

# Check if port 3000 is in use
lsof -i :3000

# Check Nginx status
sudo systemctl status nginx

# Check SSL certificate expiry
sudo certbot certificates
```

---

## 🔄 **Complete Deployment Workflow**

**For first-time deployment:**
```bash
# 1. Extract and navigate
unzip solarlyau-complete-backup.zip && cd solar-lead-ai

# 2. Install dependencies
npm install -g pnpm && pnpm install

# 3. Set up environment variables
nano .env
# (paste your variables, save and exit)

# 4. Set up database
pnpm db:push

# 5. Build application
pnpm build

# 6. Start with PM2
npm install -g pm2
pm2 start "pnpm start" --name solarlyau
pm2 save
pm2 startup

# 7. Configure Nginx and SSL (if on VPS)
# (follow Step 6 above)

# 8. Test
curl http://localhost:3000
```

**For updates/redeployment:**
```bash
# 1. Navigate to project
cd solar-lead-ai

# 2. Pull latest code (if using Git)
git pull

# 3. Install any new dependencies
pnpm install

# 4. Rebuild
pnpm build

# 5. Restart
pm2 restart solarlyau

# 6. Check logs
pm2 logs solarlyau
```

---

## 🆘 **Troubleshooting**

### "Command not found: pnpm"
```bash
npm install -g pnpm
```

### "Cannot connect to database"
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test database connection
mysql -h host -u username -p database
```

### "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port
PORT=3001 pnpm start
```

### "Build failed"
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm build
```

### "PM2 not starting on boot"
```bash
# Reconfigure PM2 startup
pm2 unstartup
pm2 startup
# (follow the command it gives you)
pm2 save
```

---

## 📱 **Platform-Specific Commands**

### Railway.app
```bash
# Railway handles build automatically, just set:
# Build Command: pnpm install && pnpm build
# Start Command: pnpm start
```

### Render.com
```bash
# Build Command: pnpm install && pnpm build
# Start Command: pnpm start
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### DigitalOcean App Platform
```bash
# Build Command: pnpm install && pnpm build
# Run Command: pnpm start
```

---

## ✅ **Deployment Checklist**

Before going live, verify:

- [ ] Database is set up and accessible
- [ ] All environment variables are set in `.env`
- [ ] `pnpm install` completed successfully
- [ ] `pnpm build` completed without errors
- [ ] Server starts with `pnpm start`
- [ ] Can access homepage at http://localhost:3000
- [ ] Domain DNS points to server
- [ ] SSL certificate is active (HTTPS works)
- [ ] Stripe webhook URL updated to new domain
- [ ] Test payment flow works
- [ ] Test lead submission form works
- [ ] PM2 is running and auto-starts on boot
- [ ] Nginx is configured and running
- [ ] Firewall allows ports 80 and 443

---

## 🎯 **Quick Reference**

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Build application | `pnpm build` |
| Start development | `pnpm dev` |
| Start production | `pnpm start` |
| Database setup | `pnpm db:push` |
| View logs | `pm2 logs solarlyau` |
| Restart server | `pm2 restart solarlyau` |
| Check status | `pm2 status` |
| Update SSL | `sudo certbot renew` |

---

**That's it! Your SolarlyAU system is now deployed and running.**

For more detailed instructions, see `SELF_HOSTING_GUIDE.md`.
