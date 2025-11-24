# Deployment Guide - Ardhisasa Lite

## Prerequisites

- Node.js 16+ installed
- MongoDB database (local or Atlas)
- Git repository
- Domain name (optional)

## Option 1: Manual Deployment

### Backend Deployment (Render)

1. **Create Account**
   - Sign up at https://render.com
   - Connect your GitHub repository

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select your repository
   - Configure:
     - Name: `ardhisasa-backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Region: Choose closest to your users

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your_mongodb_uri>
   JWT_ACCESS_SECRET=<generate_random_string>
   JWT_REFRESH_SECRET=<generate_random_string>
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   FRONTEND_URL=<your_frontend_url>
   CLOUDINARY_CLOUD_NAME=<optional>
   CLOUDINARY_API_KEY=<optional>
   CLOUDINARY_API_SECRET=<optional>
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://ardhisasa-backend.onrender.com`)

### Frontend Deployment (Vercel)

1. **Create Account**
   - Sign up at https://vercel.com
   - Connect your GitHub repository

2. **Import Project**
   - Click "New Project"
   - Import your repository
   - Configure:
     - Framework Preset: `Vite`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=<your_backend_url>/api
   VITE_SOCKET_URL=<your_backend_url>
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Visit your live site

### Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Choose region closest to your backend

2. **Configure Access**
   - Database Access: Create user with password
   - Network Access: Add IP `0.0.0.0/0` (allow all) or specific IPs

3. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Use this as `MONGODB_URI` in backend

4. **Seed Data (Optional)**
   ```bash
   cd backend
   MONGODB_URI=<your_uri> node seedRegions.js
   ```

## Option 2: Docker Deployment

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. **Clone Repository**
   ```bash
   git clone <your-repo>
   cd "Ardhi Sasa"
   ```

2. **Update docker-compose.yml**
   - Update environment variables
   - Set secure passwords

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

4. **Verify**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000
   - MongoDB: localhost:27017

5. **View Logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop Services**
   ```bash
   docker-compose down
   ```

## Option 3: VPS Deployment (Ubuntu)

### Server Setup

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

3. **Install MongoDB**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

4. **Install Nginx**
   ```bash
   sudo apt install -y nginx
   ```

5. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

### Deploy Backend

1. **Clone Repository**
   ```bash
   cd /var/www
   git clone <your-repo> ardhisasa
   cd ardhisasa/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Create .env File**
   ```bash
   nano .env
   # Add your environment variables
   ```

4. **Start with PM2**
   ```bash
   pm2 start server.js --name ardhisasa-backend
   pm2 save
   pm2 startup
   ```

### Deploy Frontend

1. **Build Frontend**
   ```bash
   cd /var/www/ardhisasa/frontend
   npm install
   npm run build
   ```

2. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/ardhisasa
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           root /var/www/ardhisasa/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/ardhisasa /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup SSL (Optional)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment

### 1. Create Initial Admin User

Access MongoDB and create NLC admin:

```javascript
use ardhisasa

db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@ardhisasa.go.ke",
  password: "<hashed_password>", // Use bcrypt to hash
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

### 2. Seed Regions

```bash
cd backend
node seedRegions.js
```

### 3. Test the System

1. Visit frontend URL
2. Register as buyer
3. Login as admin
4. Approve county admin (if any)
5. Create test parcel
6. Test transfer workflow

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs ardhisasa-backend
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Backup

### Database Backup
```bash
mongodump --uri="<your_mongodb_uri>" --out=/backup/$(date +%Y%m%d)
```

### Automated Backup (Cron)
```bash
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * mongodump --uri="<your_mongodb_uri>" --out=/backup/$(date +\%Y\%m\%d)
```

## Troubleshooting

### Backend Not Starting
- Check logs: `pm2 logs ardhisasa-backend`
- Verify MongoDB connection
- Check environment variables

### Frontend Not Loading
- Check Nginx configuration
- Verify build files exist
- Check browser console for errors

### Database Connection Issues
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check connection string
- Verify network access (Atlas)

## Security Checklist

- ✅ Use strong JWT secrets
- ✅ Enable HTTPS (SSL certificate)
- ✅ Configure firewall (UFW)
- ✅ Regular security updates
- ✅ Backup database regularly
- ✅ Monitor server logs
- ✅ Use environment variables
- ✅ Implement rate limiting
- ✅ Enable CORS properly

## Scaling

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple backend instances
- MongoDB replica set
- Redis for session management

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching
- CDN for static assets
