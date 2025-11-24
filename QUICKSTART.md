# 🚀 Quick Start Guide

Get Ardhisasa Lite running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- MongoDB running locally OR MongoDB Atlas account

## Quick Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Configure Environment

**Backend** - Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ardhisasa
JWT_ACCESS_SECRET=your_secret_key_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_key_change_this_too
FRONTEND_URL=http://localhost:3000
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Database (Optional)

```bash
cd backend
node seedRegions.js
```

### 4. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access Application

Open browser: `http://localhost:3000`

## Test Accounts

### Create NLC Admin (MongoDB)

```javascript
// In MongoDB shell or Compass
use ardhisasa

db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@test.com",
  password: "$2a$10$YourHashedPasswordHere",
  nationalId: "00000000",
  kraPin: "A000000000A",
  phoneNumber: "+254700000000",
  role: "nlc_admin",
  isApproved: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Generate password hash:**
```bash
node
> require('bcryptjs').hashSync('admin123', 10)
```

### Register Regular Users

Go to `http://localhost:3000/register` and create:
- Buyer account
- County Admin account (requires NLC approval)

## Common Issues

**Port in use?**
- Change `PORT` in backend/.env
- Change `port` in frontend/vite.config.js

**MongoDB not running?**
```bash
# Windows: Check services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Connection refused?**
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Try MongoDB Atlas (free cloud database)

## What's Next?

1. Login with different roles
2. Test the transfer workflow
3. Explore the dashboard
4. Check API documentation
5. Review the code structure

## Documentation

- **Full Setup**: See `docs/SETUP.md`
- **API Reference**: See `docs/API_DOCUMENTATION.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Deployment**: See `docs/DEPLOYMENT.md`

## Need Help?

Check the comprehensive guides in the `/docs` folder or open an issue on GitHub.

---

**Happy Coding! 🎉**
