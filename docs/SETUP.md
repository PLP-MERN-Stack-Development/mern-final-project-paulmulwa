# Setup Instructions - Ardhisasa Lite

Follow these steps to set up and run the Ardhisasa Lite project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** - VS Code recommended

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd "Ardhi Sasa"
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# For Windows
copy .env.example .env

# For Mac/Linux
cp .env.example .env
```

### 2.4 Configure Environment Variables

Open the `.env` file and update these values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB (use your local or Atlas connection string)
MONGODB_URI=mongodb://localhost:27017/ardhisasa

# JWT Secrets (generate random strings)
JWT_ACCESS_SECRET=your_random_secret_key_here_change_this
JWT_REFRESH_SECRET=your_random_refresh_key_here_change_this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Optional: Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Generate JWT Secrets:**
```bash
# In Node.js REPL
node
> require('crypto').randomBytes(64).toString('hex')
```

### 2.5 Start MongoDB

Make sure MongoDB is running:

```bash
# Windows (if installed as service)
# MongoDB should start automatically

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 2.6 Seed Database (Optional)

Populate the database with Kenya regions:

```bash
node seedRegions.js
```

### 2.7 Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

## Step 3: Frontend Setup

Open a **new terminal window** and keep the backend running.

### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Create Environment File

```bash
# For Windows
copy .env.example .env

# For Mac/Linux
cp .env.example .env
```

### 3.4 Configure Environment Variables

The default values should work for local development:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3.5 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 4: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## Step 5: Create Test Accounts

### 5.1 Register as Buyer/Seller

1. Click "Register"
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@test.com
   - National ID: 12345678
   - KRA PIN: A123456789B
   - Phone: +254712345678
   - Role: Buyer
   - Password: password123
3. Click "Register"

### 5.2 Create NLC Admin (Via MongoDB)

Since there's no NLC admin initially, create one manually:

1. Open MongoDB Compass or mongo shell
2. Connect to `mongodb://localhost:27017`
3. Select `ardhisasa` database
4. Go to `users` collection
5. Insert this document (update password hash):

```javascript
{
  "firstName": "NLC",
  "lastName": "Admin",
  "email": "nlc@admin.com",
  "password": "$2a$10$...", // See below for generating hash
  "nationalId": "00000000",
  "kraPin": "A000000000A",
  "phoneNumber": "+254700000000",
  "role": "nlc_admin",
  "isApproved": true,
  "isActive": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

**Generate Password Hash:**

```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hashSync('admin123', 10);
# Copy the output and use it as the password value
```

### 5.3 Register as County Admin

1. Register with role "County Admin"
2. Select a county (e.g., Nairobi)
3. Login as NLC Admin
4. Go to "Pending Admins"
5. Approve the county admin

## Step 6: Test the System

### 6.1 As NLC Admin (nlc@admin.com / admin123)

1. Login
2. Approve pending county admins
3. View all transfers
4. Create test parcels

### 6.2 As County Admin

1. Login after approval
2. View transfers in your county
3. Verify documents
4. Approve/reject transfers

### 6.3 As Buyer/Seller

1. Login
2. Search for land
3. Verify title deeds
4. If seller: Initiate transfer
5. Track transfer status

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

**Backend:**
```bash
# Change PORT in backend/.env
PORT=5001
```

**Frontend:**
```bash
# Change port in frontend/vite.config.js
server: { port: 3001 }
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
# Windows
services.msc  # Look for MongoDB

# Mac
brew services list

# Linux
sudo systemctl status mongod
```

If not installed:
```bash
# Option 1: Install MongoDB locally
# Follow: https://www.mongodb.com/docs/manual/installation/

# Option 2: Use MongoDB Atlas (free cloud database)
# 1. Sign up at https://www.mongodb.com/cloud/atlas
# 2. Create free cluster
# 3. Get connection string
# 4. Update MONGODB_URI in backend/.env
```

### Module Not Found Errors

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL:
```env
FRONTEND_URL=http://localhost:3000
```

## Development Tips

### Hot Reload

Both backend and frontend have hot reload enabled:
- Backend: Uses `nodemon`
- Frontend: Uses Vite's HMR

### API Testing

Use tools like:
- Postman
- Thunder Client (VS Code extension)
- REST Client (VS Code extension)

### Database GUI

Recommended tools:
- MongoDB Compass (official GUI)
- Robo 3T
- Studio 3T

## Next Steps

1. **Explore Features**
   - Test all user roles
   - Try the transfer workflow
   - Upload documents

2. **Add Sample Data**
   - Create multiple parcels
   - Test search functionality
   - Create transfers

3. **Customize**
   - Modify UI colors in `tailwind.config.js`
   - Add more counties in `seedRegions.js`
   - Extend functionality

4. **Deploy**
   - See `DEPLOYMENT.md` for production deployment
   - Use Docker for containerization
   - Set up CI/CD pipeline

## Getting Help

- Check `API_DOCUMENTATION.md` for API details
- Review `ARCHITECTURE.md` for system design
- Open an issue on GitHub
- Check browser console for errors
- Review server logs for backend issues

## Clean Up

To stop the servers:

```bash
# Press Ctrl+C in both terminal windows
```

To reset the database:

```bash
# In MongoDB
use ardhisasa
db.dropDatabase()
```

---

**🎉 Congratulations!** You've successfully set up Ardhisasa Lite.

Start building and exploring the features!
