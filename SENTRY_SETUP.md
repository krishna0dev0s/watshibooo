# How to Get Your Sentry DSN

## Step-by-Step Guide

### 1. **Create a Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Click **"Sign Up"** (or Sign In if you already have an account)
   - Sign up with email or GitHub/Google account
   - Verify your email

### 2. **Create a New Project**
   - After login, click **"Projects"** in the sidebar
   - Click **"Create Project"** button
   - Select **"Next.js"** as your platform
   - Name your project (e.g., "watshiboo-interview")
   - Click **"Create Project"**

### 3. **Get Your DSN**
   - You'll be taken to your project settings
   - Look for the **"Client Keys (DSN)"** section
   - Click on **"Settings"** → **"Client Keys (DSN)"**
   - You'll see your DSN that looks like:
   ```
   https://xxxxxxxxxxxxx@o123456.ingest.sentry.io/7654321
   ```
   - Copy this entire URL

### 4. **Alternative: Copy from Dashboard**
   If you can't find it:
   - Click your **project name** in the top left
   - Go to **"Settings"** gear icon
   - Click **"Client Keys (DSN)"** in left sidebar
   - Copy the DSN URL

### 5. **Add to Your `.env.local`**
   ```
   SENTRY_DSN=https://xxxxxxxxxxxxx@o123456.ingest.sentry.io/7654321
   ```

---

## What You'll Get (Free Plan Includes)

✅ **5,000 errors/month** - Plenty for testing
✅ **Real-time error alerts** - Know when something breaks
✅ **Source maps** - See exact code lines that error
✅ **Browser crashes** - Track user-facing bugs
✅ **Performance monitoring** - See slow API calls

---

## Quick Visual Guide

1. **sentry.io** → Sign Up
2. **Create Project** → Select "Next.js"
3. **Settings** → Client Keys (DSN)
4. **Copy DSN** → Paste to `.env.local`
5. **Restart** your dev server (`npm run dev`)

---

## Verify It's Working

After adding the DSN and restarting:

1. Open DevTools (F12)
2. Go to **Console** tab
3. Type this:
   ```javascript
   throw new Error("Test error");
   ```
4. The error should appear in your Sentry dashboard within seconds!

---

## Dashboard Location

Once set up, view errors at:
```
https://sentry.io/organizations/[your-org]/issues/
```

Click on your project to see all errors, performance, and user sessions.

---

## Pro Tips

- **Free plan** works great for development and small projects
- **Upgrade to Pro** ($29/month) when you go live for more events
- **Set up alerts** to notify you via email or Slack when errors occur
- **Use Source Maps** to see exact line numbers that error (Sentry handles this automatically with Next.js)

---

## If You Don't See Client Keys Section

1. Go to **Settings** (⚙️ icon at bottom left)
2. Click **"Projects"** in sidebar
3. Select your project name
4. Look for **"Client Keys (DSN)"** tab

---

**That's it!** Your Sentry DSN is your error-tracking superpower. Every crash and error will now be logged automatically. 🚀
