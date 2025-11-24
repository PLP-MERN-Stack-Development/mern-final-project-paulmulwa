# ⚡ Quick Deployment Reference

## 🎯 30-Minute Deployment Checklist

Use this if you've already read the full guide and just need quick reminders.

---

## Step 1: MongoDB Atlas (10 minutes)

1. **Sign up:** https://www.mongodb.com/cloud/atlas
2. **Create M0 FREE cluster** in your preferred region
3. **Create user:** `ardhisasa_admin` + autogenerate password (SAVE IT!)
4. **Network Access:** Allow `0.0.0.0/0`
5. **Get connection string:**
   ```
   mongodb+srv://ardhisasa_admin:PASSWORD@cluster0.xxxxx.mongodb.net/ardhisasa?retryWrites=true&w=majority
   ```
   ✅ Replace `PASSWORD`, Add `/ardhisasa` before `?`

---

## Step 2: Render Backend (10 minutes)

1. **Sign up:** https://render.com (use GitHub)
2. **New Web Service** → Connect `mern-final-project-paulmulwa`
3. **Configure:**
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Plan: FREE

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_ACCESS_SECRET=<random_32_char_string>
   JWT_REFRESH_SECRET=<different_random_32_char_string>
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Deploy** → Wait 5-10 min → Copy backend URL

6. **Seed Regions:**
   - Shell tab → `node seedRegions.js`

---

## Step 3: Vercel Frontend (5 minutes)

1. **Sign up:** https://vercel.com (use GitHub)
2. **New Project** → Import `mern-final-project-paulmulwa`
3. **Configure:**
   - Root Directory: `frontend`
   - Framework: Vite (auto-detected)

4. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

5. **Deploy** → Wait 2-3 min → Copy frontend URL

---

## Step 4: Update Backend (2 minutes)

1. Go to Render → Your service → Environment
2. Update `FRONTEND_URL` with Vercel URL
3. Save (auto-redeploys)

---

## Step 5: Create Admin User (3 minutes)

### Quick Method - Register + Upgrade:

1. Visit your site → Register as buyer
2. MongoDB Atlas → Collections → `users`
3. Find your user → Edit
4. Change `"role": "buyer"` to `"role": "super_admin"`
5. Update → Logout → Login

---

## ✅ Testing Checklist

- [ ] Frontend loads without errors
- [ ] Can register new user
- [ ] Can login
- [ ] Dashboard displays
- [ ] Backend API responds
- [ ] Real-time notifications work (test in 2 browsers)

---

## 🔗 Your Live URLs

```
Frontend:  https://_________________________.vercel.app
Backend:   https://_________________________.onrender.com
Database:  MongoDB Atlas Dashboard
GitHub:    https://github.com/PLP-MERN-Stack-Development/mern-final-project-paulmulwa
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to backend" | Check VITE_API_URL in Vercel, ensure backend is awake |
| "MongoDB connection failed" | Check network access (0.0.0.0/0) and connection string |
| "CORS error" | Update FRONTEND_URL in Render backend env |
| "Backend sleeping" | First request after 15 min takes 30 sec (free tier) |
| Build failed | Check logs, verify root directory is set correctly |

---

## 🔄 Update Process

```bash
# Local changes
git add .
git commit -m "Update message"
git push origin main

# Auto-deploys on both Render and Vercel
```

---

## 📊 Free Tier Limits

- **MongoDB:** 512 MB storage
- **Render:** Sleeps after 15 min inactivity
- **Vercel:** Unlimited for personal projects

---

## 🚀 Done!

Your app is live! Test it, share it, add it to your portfolio.

**Full Guide:** See `DEPLOYMENT_GUIDE.md` for detailed explanations.
