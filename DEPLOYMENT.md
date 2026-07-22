# 🚀 Publishing Apex Ecosystem Under One Single Link (Vercel / Netlify / GitHub)

This workspace is now configured as a **unified static monorepo**. When published, the main Marketing Portal and all 10 embedded projects will run under **one single URL** (e.g. `https://your-app.vercel.app/`).

---

## ⚡ Option 1: Deploy to Vercel in 1 Minute (Recommended)

### Method A: Via Command Line (CLI)
Run the following command in your terminal inside `c:\Users\hp\Desktop\projects`:
```bash
npx vercel
```
- Select `Y` (Yes) to setup and deploy.
- Vercel will automatically detect `vercel.json` and deploy all 10 projects under one single URL!

### Method B: Via Vercel Dashboard (GitHub / Drag & Drop)
1. Push `c:\Users\hp\Desktop\projects` to a GitHub repository OR go to [Vercel Dashboard](https://vercel.com/new).
2. Import the repository or drag & drop the `projects` folder.
3. Keep default settings and click **Deploy**.
4. Your single unified link (e.g., `https://apex-ecosystem-platform.vercel.app`) is live!

---

## ⚡ Option 2: Deploy to Netlify
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the whole `c:\Users\hp\Desktop\projects` folder.
3. Netlify will publish all 10 apps under one single URL.

---

## ⚡ Option 3: Local Unified Server (Test locally)
To run a local server serving all 10 apps on one port:
```bash
npx serve .
```
Then open `http://localhost:3000` in your browser.
