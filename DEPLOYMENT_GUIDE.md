# 🚀 Complete Deployment Guide - Ardhisasa Lite

## Step-by-Step Guide to Deploy Your MERN App Live

This guide will walk you through deploying your Ardhisasa Lite application to the cloud using **MongoDB Atlas** (Database), **Render** (Backend), and **Vercel** (Frontend).

---

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ GitHub account with your code pushed
- ✅ Email address for signing up to services
- ✅ 30-60 minutes of time
- ✅ All services are **FREE** for this deployment!

---

## Part 1: Database Setup (MongoDB Atlas) 🗄️

### Step 1: Create MongoDB Atlas Account

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up with:
   - Google account (fastest), OR
   - Email and password
4. Complete email verification

### Step 2: Create a Free Cluster

1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (don't select paid options!)
3. **Cluster Configuration:**
   - Provider: **AWS** (recommended)
   - Region: Choose closest to your users (e.g., **eu-west-1 (Ireland)** for Africa/Europe)
   - Cluster Name: `ArdhisasaCluster` (or keep default)
4. Click **"Create"**
5. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User

1. You'll see **"Security Quickstart"**
2. **Authentication Method:** Username and Password
3. Create credentials:
   - Username: `ardhisasa_admin`
   - Password: Click **"Autogenerate Secure Password"**
   - **⚠️ IMPORTANT:** Copy and save this password somewhere safe!
4. Click **"Create User"**

### Step 4: Configure Network Access

1. Still in Security Quickstart, or click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (shows `0.0.0.0/0`)
   - This is needed for Render to connect
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://ardhisasa_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace** `<password>` with the actual password you saved earlier
7. **Add database name** before the `?`:
   ```
   mongodb+srv://ardhisasa_admin:YourPassword@cluster0.xxxxx.mongodb.net/ardhisasa?retryWrites=true&w=majority
   ```
8. **Save this complete connection string** - you'll need it soon!

### Step 6: Seed Kenya Regions Data (After Backend Deployment)

*We'll come back to this after deploying the backend*

---

## Part 2: Backend Deployment (Render) 🖥️

### Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with **GitHub** (recommended for easy deployment)
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service

1. From Render Dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Connect your repository:
   - Find **"mern-final-project-paulmulwa"**
   - Click **"Connect"**

### Step 3: Configure Backend Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `ardhisasa-backend` (or any name you prefer)
- **Region:** Choose closest region (e.g., **Frankfurt (EU Central)**)
- **Branch:** `main`
- **Root Directory:** `backend` ⚠️ **IMPORTANT!**
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **"Free"** plan ($0/month)
- Note: Free tier sleeps after 15 mins of inactivity (first request takes ~30 seconds to wake up)

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** and click **"Add Environment Variable"**

Add these variables one by one:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | |
| `MONGODB_URI` | `your_connection_string_from_mongodb` | Use the full string from Part 1, Step 5 |
| `JWT_ACCESS_SECRET` | `your_random_secret_key_here_123456` | Make it long and random |
| `JWT_REFRESH_SECRET` | `another_random_secret_key_here_789` | Different from above |
| `JWT_ACCESS_EXPIRY` | `15m` | |
| `JWT_REFRESH_EXPIRY` | `7d` | |
| `FRONTEND_URL` | `https://your-app-name.vercel.app` | We'll update this later |

**To generate secure secrets:**
- Option 1: Use random password generator
- Option 2: Type random characters (at least 32 characters)
- Example: `k8nF2mP9qL4sT7vX1wE6rY3uI0oA5zC`

### Step 5: Deploy Backend

1. Click **"Create Web Service"** at the bottom
2. Wait for deployment (5-10 minutes)
3. Watch the logs for any errors
4. When you see **"Server running on port 5000"** and **"MongoDB Connected Successfully"**, it's ready!
5. **Copy your backend URL** from the top (looks like: `https://ardhisasa-backend.onrender.com`)

### Step 6: Test Backend

1. Open a new browser tab
2. Visit: `https://your-backend-url.onrender.com/api/auth/register`
3. You should see a message like: `"Cannot GET /api/auth/register"` or a JSON error
4. This is GOOD! It means the server is running (it's a POST endpoint, not GET)

---

## Part 3: Seed Database with Kenya Regions 🇰🇪

### Option A: Using Render Shell (Recommended)

1. In Render Dashboard, go to your **ardhisasa-backend** service
2. Click **"Shell"** tab in the top menu
3. Wait for shell to connect
4. Run these commands:
   ```bash
   cd backend
   node seedRegions.js
   ```
5. Wait for "Regions seeded successfully!" message
6. Type `exit` to close shell

### Option B: Using Local Terminal

1. Open terminal on your computer
2. Navigate to your project:
   ```bash
   cd "C:\Users\Administrator\Desktop\projects\Ardhi Sasa\backend"
   ```
3. Set your MongoDB URI temporarily:
   ```bash
   $env:MONGODB_URI="your_mongodb_connection_string"
   ```
4. Run seed script:
   ```bash
   node seedRegions.js
   ```
5. You should see "47 counties seeded successfully!"

---

## Part 4: Frontend Deployment (Vercel) 🌐

### Step 1: Create Vercel Account

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 2: Import Project

1. From Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find **"mern-final-project-paulmulwa"** repository
3. Click **"Import"**

### Step 3: Configure Frontend

**Configure Project:**

1. **Framework Preset:** Detect automatically (should show **Vite**)
2. **Root Directory:** Click **"Edit"** and select `frontend` ⚠️ **IMPORTANT!**
3. **Build and Output Settings:**
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)
   - Install Command: `npm install` (auto-filled)

### Step 4: Add Environment Variables

Click **"Environment Variables"** section and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://your-backend-url.onrender.com` |

**⚠️ Replace** `your-backend-url` with your actual Render backend URL from Part 2, Step 5

**Example:**
```
VITE_API_URL = https://ardhisasa-backend.onrender.com/api
VITE_SOCKET_URL = https://ardhisasa-backend.onrender.com
```

### Step 5: Deploy Frontend

1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. When you see **"Congratulations!"** with confetti, it's done! 🎉
4. Click **"Visit"** to see your live site
5. **Copy your frontend URL** (looks like: `https://ardhisasa-lite.vercel.app`)

### Step 6: Update Backend with Frontend URL

1. Go back to **Render Dashboard**
2. Open your **ardhisasa-backend** service
3. Go to **"Environment"** tab
4. Find `FRONTEND_URL` variable
5. Update it with your Vercel URL: `https://your-app-name.vercel.app`
6. Click **"Save Changes"**
7. Service will auto-redeploy (wait 2-3 minutes)

---

## Part 5: Create Your First Admin User 👤

### Option A: Using MongoDB Atlas Console

1. Go to **MongoDB Atlas Dashboard**
2. Click **"Browse Collections"** on your cluster
3. If database doesn't exist, click **"Add My Own Data"**
   - Database name: `ardhisasa`
   - Collection name: `users`
4. Click on `users` collection
5. Click **"Insert Document"**
6. Switch to **"{ } View"** (code view)
7. Paste this (replace email and password):

```json
{
  "firstName": "System",
  "lastName": "Administrator",
  "email": "admin@ardhisasa.go.ke",
  "password": "$2a$10$YourHashedPasswordHere",
  "nationalId": "00000000",
  "kraPin": "A000000000A",
  "phoneNumber": "+254700000000",
  "role": "super_admin",
  "isApproved": true,
  "isActive": true,
  "createdAt": {
    "$date": "2024-01-01T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2024-01-01T00:00:00.000Z"
  }
}
```

**For the password:**
- Go to: https://bcrypt-generator.com/
- Enter your desired password (e.g., `Admin123!`)
- Rounds: `10`
- Click **"Hash"**
- Copy the hash and replace `$2a$10$YourHashedPasswordHere`

8. Click **"Insert"**

### Option B: Register Through Website

1. Visit your deployed site: `https://your-app-name.vercel.app`
2. Click **"Register"**
3. Fill in the form:
   - First Name: Your name
   - Last Name: Your surname
   - Email: Your email
   - Password: Secure password
   - National ID: Your ID number
   - KRA PIN: Your PIN
   - Phone: Your phone number
   - Role: Select **"Buyer/Seller"** first
4. Click **"Register"**
5. Login with your credentials

6. **Then manually upgrade to admin:**
   - Go to MongoDB Atlas → Browse Collections
   - Find your user in `users` collection
   - Click **"Edit"** (pencil icon)
   - Change `"role": "buyer"` to `"role": "super_admin"`
   - Click **"Update"**
   - Logout and login again

---

## Part 6: Testing Your Deployed App ✅

### 1. Test Public Pages

Visit your site and check:
- ✅ Home page loads
- ✅ About page works
- ✅ Services page displays
- ✅ Contact page shows

### 2. Test Registration & Login

1. Click **"Register"**
2. Create a test user account (use role: buyer)
3. Logout
4. Login with your credentials
5. Should redirect to dashboard

### 3. Test Admin Functions

1. Login as admin (super_admin account)
2. Should see admin sidebar menu
3. Try accessing admin pages

### 4. Test Real-time Features

1. Open app in two different browsers
2. Login as different users
3. Perform actions (create parcel, transfer, etc.)
4. Check if notifications appear in real-time

---

## 🎯 Your Deployed URLs

Save these for reference:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://your-app.vercel.app` | Main application |
| **Backend API** | `https://your-backend.onrender.com/api` | API endpoints |
| **Database** | MongoDB Atlas Dashboard | Data management |

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot connect to backend"

**Solution:**
- Check if backend is awake (visit backend URL)
- Verify `VITE_API_URL` in Vercel env variables
- Make sure it ends with `/api`
- Redeploy frontend after changing env variables

### Issue 2: "MongoDB connection failed"

**Solution:**
- Check MongoDB Atlas network access (should be `0.0.0.0/0`)
- Verify connection string in Render env variables
- Make sure password doesn't have special characters (or URL encode them)
- Check MongoDB Atlas user has correct permissions

### Issue 3: "Backend keeps sleeping (Free tier)"

**Solution:**
- First request after 15 min takes ~30 seconds to wake up
- Consider upgrading to paid plan ($7/month) for always-on
- Or use "Cron Job" services to ping your backend every 10 minutes

### Issue 4: "CORS errors in browser"

**Solution:**
- Verify `FRONTEND_URL` in Render backend env variables
- Should match your Vercel URL exactly
- Redeploy backend after changing

### Issue 5: "Build failed on Vercel"

**Solution:**
- Check build logs for specific error
- Make sure `frontend` root directory is set
- Verify all dependencies in `package.json`
- Check if env variables are set correctly

---

## 🔄 How to Update Your Deployed App

### Update Code:

1. Make changes to your local code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. **Render** auto-deploys automatically (watch logs)
4. **Vercel** auto-deploys automatically (watch deployment)

### Update Environment Variables:

**Render:**
1. Dashboard → Your service → Environment tab
2. Change variables
3. Click "Save Changes" (auto-redeploys)

**Vercel:**
1. Project → Settings → Environment Variables
2. Edit variables
3. Redeploy: Deployments tab → "..." → Redeploy

---

## 📊 Monitoring Your App

### Render Monitoring:

1. Dashboard → Your service
2. **Metrics tab:** CPU, Memory usage
3. **Logs tab:** See all console.log outputs
4. **Events tab:** Deployment history

### Vercel Monitoring:

1. Project Dashboard
2. **Analytics:** Page views, performance
3. **Deployments:** Build history
4. **Logs:** Runtime logs

### MongoDB Atlas Monitoring:

1. Cluster Dashboard
2. **Metrics:** Database operations
3. **Real-time:** Current connections
4. **Profiler:** Slow queries

---

## 🚀 Performance Tips

1. **Enable Compression:** Already configured in your code
2. **Use CDN:** Vercel provides this automatically
3. **Database Indexing:** MongoDB indexes on frequently queried fields
4. **Image Optimization:** Use Cloudinary or similar for images
5. **Caching:** Implement Redis for session management (advanced)

---

## 💰 Cost Breakdown (FREE Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **MongoDB Atlas** | FREE (M0) | 512 MB storage |
| **Render** | FREE | 750 hrs/month, sleeps after 15 min |
| **Vercel** | FREE | Unlimited bandwidth, 100 GB bandwidth |
| **TOTAL** | **$0/month** | Perfect for portfolio projects! |

### When to Upgrade:

- **MongoDB:** When you exceed 512 MB ($9/month for 2GB)
- **Render:** If you need always-on backend ($7/month)
- **Vercel:** Usually not needed unless commercial use

---

## 🎓 Next Steps

After successful deployment:

1. ✅ **Custom Domain:** Add your own domain in Vercel settings
2. ✅ **SSL Certificate:** Automatically provided by Vercel & Render
3. ✅ **Email Service:** Integrate SendGrid for email notifications
4. ✅ **File Storage:** Add Cloudinary for document uploads
5. ✅ **Analytics:** Add Google Analytics or Vercel Analytics
6. ✅ **Error Tracking:** Set up Sentry for error monitoring
7. ✅ **Backup:** Set up automated database backups

---

## 📞 Need Help?

If you encounter issues:

1. **Check Logs:**
   - Render: Logs tab
   - Vercel: Deployments → Click deployment → View Logs
   - MongoDB: Metrics & Monitoring

2. **Common Resources:**
   - Render Docs: https://render.com/docs
   - Vercel Docs: https://vercel.com/docs
   - MongoDB Docs: https://docs.mongodb.com

3. **Your Project Docs:**
   - README.md
   - docs/ARCHITECTURE.md
   - docs/API_DOCUMENTATION.md

---

## 🎉 Congratulations!

Your Ardhisasa Lite application is now live on the internet! 

**Share your project:**
- Frontend URL: Use this in your portfolio
- GitHub Repo: Share with potential employers
- Demo Video: Record a walkthrough

**Portfolio Impact:**
- ✅ Full-stack MERN application
- ✅ Real-time features (Socket.io)
- ✅ Authentication & Authorization
- ✅ Role-based access control
- ✅ File uploads & PDF generation
- ✅ Cloud deployment experience
- ✅ Database design & management

You've built and deployed a production-ready application! 🚀

---

**Last Updated:** November 24, 2025
**Project:** Ardhisasa Lite - Digital Land Registry System
**Repository:** https://github.com/PLP-MERN-Stack-Development/mern-final-project-paulmulwa
