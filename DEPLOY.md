# 🚀 MEDIVAULT — Deployment Guide

This guide walks you through pushing MEDIVAULT to your git repo and deploying it to your own domain. Pick whichever deployment option fits your needs.

---

## Table of Contents

1. [Push to Your Git Repo](#1-push-to-your-git-repo)
2. [Deploy on Vercel (Recommended — Free)](#2-deploy-on-vercel-recommended--free)
3. [Deploy on Netlify](#3-deploy-on-netlify)
4. [Self-Host with Docker (Any VPS)](#4-self-host-with-docker-any-vps)
5. [Self-Host on Ubuntu/Debian VPS (No Docker)](#5-self-host-on-ubuntudebian-vps-no-docker)
6. [Connect Your Custom Domain](#6-connect-your-custom-domain)
7. [Post-Deployment: Seed the Database](#7-post-deployment-seed-the-database)
8. [Updating Your Deployment](#8-updating-your-deployment)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Push to Your Git Repo

MEDIVAULT is already initialized as a git repo locally. Here's how to push it to GitHub/GitLab/Bitbucket.

### Option A: GitHub (most common)

```bash
# 1. Create an empty repo on GitHub.com — do NOT initialize with README/LICENSE/gitignore
#    (we already have those). Repo URL will be like:
#    https://github.com/YOUR_USERNAME/medivault.git

# 2. From your local MEDIVAULT directory:
cd /path/to/medivault

# 3. Update the repository URL in package.json (search for YOUR_USERNAME)
#    Replace YOUR_USERNAME with your actual GitHub username

# 4. Add your GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/medivault.git

# 5. Push
git branch -M main
git push -u origin main
```

### Option B: GitLab / Bitbucket

Same flow — just use the appropriate remote URL.

```bash
git remote add origin git@gitlab.com:YOUR_USERNAME/medivault.git
# OR
git remote add origin https://bitbucket.org/YOUR_USERNAME/medivault.git

git branch -M main
git push -u origin main
```

### If the repo was initialized with a README on the remote

```bash
git pull origin main --allow-unrelated-histories
# Resolve any conflicts (keep ours), then:
git push -u origin main
```

---

## 2. Deploy on Vercel (Recommended — Free)

Vercel is the company behind Next.js — deployment takes 2 minutes and the free tier comfortably runs MEDIVAULT.

### Step-by-step

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub/GitLab/Bitbucket.

2. **Click "Add New Project"** → import your `medivault` repo.

3. **Configure the project** (Vercel auto-detects most settings, but verify):
   - **Framework Preset:** Next.js
   - **Build Command:** `next build` (leave default)
   - **Output Directory:** `.next` (leave default)
   - **Install Command:** `npm install` (or `bun install` if you use bun)

4. **Add environment variables** (under "Environment Variables"):
   - `DATABASE_URL` = `file:/tmp/medivault.db`
   - (Note: Vercel's serverless functions have an ephemeral filesystem — SQLite is fine for low-to-medium traffic. For high-traffic production, see the Postgres migration note below.)

5. **Click "Deploy"** — Vercel builds and deploys in ~2 minutes.

6. **Wait for the build to finish.** You'll get a URL like `medivault-abc123.vercel.app`. Click it to verify.

7. **Seed the database** — see [Section 7](#7-post-deployment-seed-the-database).

### ⚠️ SQLite on Vercel — Important Note

Vercel's serverless functions are stateless and the filesystem is ephemeral. SQLite will work for prototyping and low-traffic deployments, but **data will not persist across function instances** in the long term, and **the database resets on redeploy**.

For a production-grade MEDIVAULT on Vercel, migrate to a managed database:

- **Vercel Postgres** (free tier available) — easiest, runs in the same VPC
- **Neon Postgres** (free tier, serverless)
- **Supabase Postgres** (free tier, includes auth if you ever want it)
- **PlanetScale MySQL** (free tier)

To migrate, change the `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"`, update `DATABASE_URL` to the Postgres connection string, run `npx prisma db push`, then `npm run seed`. The rest of the code works unchanged.

### Custom domain on Vercel

1. In your Vercel project: **Settings → Domains**
2. Add your domain (e.g. `medivault.yourname.com` or `www.medivault.yourname.com`)
3. Vercel shows you the DNS records to add at your registrar:
   - Usually an `A` record pointing to `76.76.21.21`, OR
   - A `CNAME` record pointing to `cname.vercel-dns.com`
4. Once DNS propagates (5-60 minutes), Vercel auto-provisions HTTPS via Let's Encrypt.

---

## 3. Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import an existing project"
2. Connect your git repo
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. Install the Next.js plugin (Netlify auto-detects it)
5. Add environment variable `DATABASE_URL=file:/tmp/medivault.db`
6. Deploy → connect your domain under "Domain settings"

Same SQLite caveat as Vercel — see the migration note above.

---

## 4. Self-Host with Docker (Any VPS)

This is the **most reliable** way to run MEDIVAULT — your data persists, no rate limits, no vendor lock-in.

### Prerequisites

- A VPS (DigitalOcean, Hetzner, Linode, AWS Lightsail, etc.) — $5/month is plenty
- Docker + Docker Compose installed (most VPS providers offer a Docker image)
- A domain name (optional but recommended)

### Step-by-step

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Install Docker (if not already installed)
curl -fsSL https://get.docker.com | sh

# 3. Clone your repo
git clone https://github.com/YOUR_USERNAME/medivault.git
cd medivault

# 4. (Optional) Edit docker-compose.yml to map a custom port or volume path
# Edit the volume path `/data/medivault:/app/db` to wherever you want the DB to live

# 5. Copy .env (the Dockerfile sets DATABASE_URL inside the container)
cp .env.example .env

# 6. Build and run
docker compose up -d --build

# 7. Wait ~1 minute for the build, then check
docker compose ps
curl http://localhost:3000  # should return HTML

# 8. Seed the database (first time only)
docker compose exec medivault npm run seed
```

Your MEDIVAULT is now live at `http://your-vps-ip:3000`.

### Point your domain at it

See [Section 6](#6-connect-your-custom-domain).

---

## 5. Self-Host on Ubuntu/Debian VPS (No Docker)

If you'd rather not use Docker:

```bash
# 1. Install Node.js 20+ (use NodeSource setup script)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Install Bun (optional — faster)
curl -fsSL https://bun.sh/install | bash

# 3. Clone and build
git clone https://github.com/YOUR_USERNAME/medivault.git
cd medivault
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL=file:/var/lib/medivault/medivault.db
mkdir -p /var/lib/medivault

# 4. Generate Prisma client, push schema, seed
npx prisma generate
npx prisma db push
npm run seed

# 5. Build Next.js
npm run build

# 6. Run with a process manager (pm2 keeps it alive + restarts on crash)
sudo npm install -g pm2
pm2 start "npm start" --name medivault
pm2 save
pm2 startup  # follow the printed instructions to enable on boot

# 7. Install Nginx as a reverse proxy
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/medivault`:

```nginx
server {
    listen 80;
    server_name medivault.yourdomain.com;  # change to your domain

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Allow larger request bodies (chat messages, case submissions)
    client_max_body_size 2m;
}
```

Enable + reload:

```bash
sudo ln -s /etc/nginx/sites-available/medivault /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Add HTTPS with Let's Encrypt (free, auto-renewing)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d medivault.yourdomain.com
```

---

## 6. Connect Your Custom Domain

Regardless of where you deploy, the DNS steps are similar.

### At your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)

Add one of these records:

| Record type | Name | Value | Use when |
|-------------|------|-------|----------|
| **A** | `medivault` (subdomain) or `@` (root) | `YOUR_VPS_IP` | Self-hosting on VPS |
| **CNAME** | `medivault` | `cname.vercel-dns.com` | Deployed on Vercel |
| **CNAME** | `medivault` | `your-site-name.netlify.app` | Deployed on Netlify |

### Verify DNS propagation

```bash
# Wait 5-30 minutes, then check
dig medivault.yourdomain.com
# or
nslookup medivault.yourdomain.com
```

### HTTPS / SSL certificate

- **Vercel / Netlify:** auto-provisioned via Let's Encrypt
- **Self-hosted with Nginx:** use `sudo certbot --nginx -d medivault.yourdomain.com` (auto-renews)
- **Cloudflare in front:** set SSL mode to "Full" and Cloudflare provisions the edge cert

---

## 7. Post-Deployment: Seed the Database

The database schema is empty when you first deploy. Seed it with the default content (6 disciplines, 8 books, 6 topics, 10 cases):

```bash
# Vercel / Netlify — run the seed script locally against the production DB
# (set DATABASE_URL to your production DB URL in .env first)
npx prisma db push
npm run seed

# Docker
docker compose exec medivault npm run seed

# VPS without Docker
npm run seed
```

Verify the seed worked by visiting your deployment — you should see 6 disciplines, 8 books, and 10 clinical cases.

---

## 8. Updating Your Deployment

When you push new code to your `main` branch:

- **Vercel / Netlify:** auto-redeploys automatically (usually within 60 seconds)
- **Docker (VPS):**
  ```bash
  ssh root@your-vps-ip
  cd medivault
  git pull
  docker compose up -d --build
  # Re-run seed if you added new content
  docker compose exec medivault npm run seed
  ```
- **VPS without Docker:**
  ```bash
  ssh root@your-vps-ip
  cd medivault
  git pull
  npm install
  npx prisma generate
  npx prisma db push
  npm run build
  pm2 restart medivault
  ```

---

## 9. Troubleshooting

### "Cannot find module '@prisma/client'"
Run `npx prisma generate` (or `npm run db:generate`). The `postinstall` script in `package.json` does this automatically, but if it fails you can run it manually.

### "Database connection failed"
- Verify `DATABASE_URL` is set correctly in your `.env` file
- For SQLite, ensure the directory exists and is writable
- For Postgres/MySQL, verify the connection string format:
  - Postgres: `postgresql://user:password@host:5432/dbname`
  - MySQL: `mysql://user:password@host:3306/dbname`

### "Images not loading"
The images live in `/public/medivault/`. They're committed to the repo, so they should deploy automatically. If missing:
- Verify `public/medivault/*.png` exists in your repo
- Rebuild and redeploy

### "Chat messages not appearing"
The chat polls every 4 seconds. If messages don't appear:
- Check the browser console for fetch errors
- Verify `/api/chat` returns `{ ok: true, messages: [...] }` when visited directly
- For SQLite on Vercel: each serverless function instance has its own DB — switch to Postgres (see [Section 2](#2-deploy-on-vercel-recommended--free))

### "My permanent ID is gone on a new device"
Your ID is stored in `localStorage` per browser. To restore:
1. Open the **Progress** section on your old device
2. Copy the 12-character **Recovery Code**
3. On the new device, open the dev console (F12) and run:
   ```js
   fetch('/api/identity', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ action: 'recover', recoveryCode: 'YOUR-CODE-HERE' })
   }).then(r => r.json()).then(d => {
     if (d.ok) {
       localStorage.setItem('medivault.user', JSON.stringify(d.user))
       location.reload()
     }
   })
   ```

### Still stuck?

Open an issue at `https://github.com/YOUR_USERNAME/medivault/issues` with:
- Your deployment method (Vercel / Netlify / Docker / VPS)
- The exact error message
- Your browser + OS
- The output of `npm run lint` (if running locally)

---

**Need help?** The MEDIVAULT community is here for you. Open an issue, start a discussion, or join the global chat inside the app.
