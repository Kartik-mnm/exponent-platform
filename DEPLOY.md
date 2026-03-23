# Deployment Guide — Exponent Platform

## Architecture

```
platform/   → React app  → Netlify  → platform.yourdomain.com
server/     → Node.js    → Render   → api.yourdomain.com (currently acadfee.onrender.com)
client/     → React app  → Render   → nishchay.yourdomain.com (currently acadfee-app.onrender.com)
```

---

## Deploying the Platform Control Panel to Netlify

### Step 1 — Create Netlify account
Go to [netlify.com](https://netlify.com) and sign up with GitHub.

### Step 2 — Connect repo
1. Click **Add new site** → **Import an existing project**
2. Choose **GitHub** → select `Kartik-mnm/exponent-platform`
3. Set these build settings:
   - **Base directory:** `platform`
   - **Build command:** `npm run build`
   - **Publish directory:** `platform/build`

### Step 3 — Set environment variables
In Netlify → Site Settings → Environment Variables, add:
```
REACT_APP_API_URL = https://acadfee.onrender.com
```
(Change to `https://api.yourdomain.com` once you have a custom domain)

### Step 4 — Deploy
Click **Deploy site**. Netlify builds and gives you a URL like `https://random-name-123.netlify.app`.

### Step 5 — Add custom domain (when ready)
1. Buy domain from GoDaddy/Namecheap (e.g. `exponent.app`)
2. In Netlify → Domain Management → Add custom domain → `platform.exponent.app`
3. In your domain DNS settings add:
   ```
   CNAME   platform   your-site-name.netlify.app
   ```

---

## Setting up Custom Domain on Render (for the backend)

### Step 1 — Add domain in Render
1. Go to Render → acadfee web service → Settings → Custom Domains
2. Add: `api.exponent.app`
3. Copy the CNAME value Render gives you

### Step 2 — Add DNS records
In your domain registrar DNS settings:
```
Type    Name        Value
CNAME   api         acadfee.onrender.com
CNAME   *           acadfee.onrender.com
```

The wildcard `*` record means ALL subdomains automatically point to your server:
- `nishchay.exponent.app` → your server
- `brightfuture.exponent.app` → your server
- Any new academy → your server (auto!)

### Step 3 — Update environment variable
In Netlify, change `REACT_APP_API_URL` to `https://api.exponent.app`

---

## Local Development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Platform Control Panel
cd platform
cp .env.example .env.local
npm install
npm start
# Opens at http://localhost:3000
# Login: kartik@exponent.app / MyPassword123

# Terminal 3 — Academy Portal (Nishchay)
cd client
npm install
npm start
# Opens at http://localhost:3001
```

---

## After Getting a Domain — Final URLs

```
https://platform.exponent.app          ← You (platform control panel)
https://nishchay.exponent.app          ← Nishchay Academy portal
https://brightfuture.exponent.app      ← New academy (auto-provisioned)
https://api.exponent.app               ← Backend API
```

Adding a new academy takes 2 minutes:
1. Log in to platform.exponent.app
2. Click + New Academy
3. Fill the wizard
4. Their portal is live instantly at slug.exponent.app
