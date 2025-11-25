# Ardhisasa Lite - Digital Land Registry System

![Ardhisasa Lite Logo](docs/logo.png)

A comprehensive MERN stack application for digitizing Kenya's land registry workflow, enabling secure title deed verification, land search, and digital transfer of land ownership.

## 🎯 Project Overview

Ardhisasa Lite is a modern digital land registry platform that streamlines land ownership management in Kenya. The system supports multiple user roles with distinct capabilities:

- **Buyers/Sellers**: Search land, verify titles, and manage transfers
- **County Admins**: Verify documents and approve transfers at county level
- **NLC Admins**: Oversee system-wide operations and approve county admins

## ✨ Key Features

### Core Functionality
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 🔍 **Land Search** - Search by county, subcounty, constituency, and ward
- ✅ **Title Verification** - Verify authenticity of land title deeds
- 📊 **Ownership Management** - Track current and historical ownership
- 🔄 **Digital Transfers** - Complete workflow from initiation to approval

### Transfer Workflow
1. **Seller initiates** transfer with buyer's National ID & KRA PIN
2. **County Admin verifies** documents and identity
3. **County Admin approves** or rejects transfer
4. **NLC Admin** provides final approval
5. **Ownership automatically updated** upon completion

### Additional Features
- 📱 **Real-time Notifications** - Socket.io powered instant updates
- 📂 **Document Management** - Upload and verify supporting documents
- 📈 **Transfer History** - Complete audit trail for each parcel
- 🌍 **Kenyan Region Structure** - Full county/subcounty hierarchy support
- 🗺️ **Interactive Parcel Mapping** - GPS-enabled boundary visualization
- 📊 **Analytics Dashboards** - County and national-level insights
- 🛰️ **Satellite Imagery** - Real-world parcel visualization

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access & refresh tokens)
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, bcryptjs, CORS

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Real-time**: Socket.io Client

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Ardhi Sasa"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI
# - JWT_ACCESS_SECRET
# - JWT_REFRESH_SECRET
# - CLOUDINARY credentials (optional)

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
Ardhi Sasa/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File uploads directory
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── main.jsx       # Entry point
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## 🔑 User Roles & Permissions

### Buyer / Seller (General User)
- Search land by region
- Verify title deeds
- View parcels (sellers see owned parcels)
- Initiate transfers (sellers only)
- Track transfer status

### County Admin
- Verify transfer documents
- Verify buyer/seller identity
- Approve/reject county-level transfers
- View county-specific parcels
- Requires NLC approval to activate account

### NLC Admin
- Approve county admin registrations
- Final approval for land transfers
- System-wide oversight
- Handle escalated cases
- Manage system configuration

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Parcels
- `GET /api/parcels` - Get all parcels
- `GET /api/parcels/:id` - Get parcel by ID
- `GET /api/parcels/title/:titleNumber` - Verify title
- `GET /api/parcels/my/parcels` - Get user's parcels
- `POST /api/parcels` - Create parcel (Admin)
- `PUT /api/parcels/:id` - Update parcel (Admin)

### Transfers
- `POST /api/transfers` - Initiate transfer
- `GET /api/transfers` - Get all transfers
- `GET /api/transfers/:id` - Get transfer details
- `PUT /api/transfers/:id/county-verify` - County verification
- `PUT /api/transfers/:id/nlc-approve` - NLC approval
- `PUT /api/transfers/:id/cancel` - Cancel transfer

### Users
- `GET /api/users` - Get all users (NLC Admin)
- `GET /api/users/pending-admins` - Get pending admins
- `PUT /api/users/:id/approve` - Approve county admin

### Regions
- `GET /api/regions` - Get all regions
- `GET /api/regions/counties/list` - Get counties
- `GET /api/regions/:county` - Get region by county

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment (Render/Railway)

1. Create a new web service
2. Connect your repository
3. Set environment variables
4. Deploy command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Import project from repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variables

### Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
FRONTEND_URL=https://your-frontend.com
```

**Frontend (.env)**
```
VITE_API_URL=https://your-backend.com/api
VITE_SOCKET_URL=https://your-backend.com
```

## 📊 Database Schema

### User Schema
- firstName, lastName, email, password
- nationalId, kraPin, phoneNumber
- role (buyer/seller/county_admin/nlc_admin)
- county (for county admins)
- isApproved, isActive

### Parcel Schema
- titleNumber (unique)
- owner (ref: User)
- county, subCounty, constituency, ward
- size, coordinates, zoning
- transferHistory array
- documents array

### Transfer Schema
- transferNumber (auto-generated)
- parcel, seller, buyer
- status (workflow states)
- countyVerification object
- nlcApproval object
- timeline array

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT access & refresh tokens
- Rate limiting on sensitive endpoints
- Helmet for security headers
- Input validation and sanitization
- Role-based access control
- CORS configuration

## 🎨 UI/UX Highlights

- Clean, modern interface with Tailwind CSS
- Responsive design for all devices
- Intuitive navigation with role-based menus
- Real-time notifications
- Loading states and error handling
- Accessible forms with validation feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

Developed as a comprehensive MERN stack portfolio project demonstrating:
- Full-stack development expertise
- Complex state management
- Multi-role user systems
- Real-time communications
- Secure authentication flows
- RESTful API design
- Modern UI/UX principles

## 📞 Support

For issues or questions, please open an issue in the repository.

## 🗺️ Roadmap

### Next-Generation Features (Planned)

#### 🚶 Interactive Parcel Boundary Walk Mode (AR Mode)
- [ ] GPS + Compass + Camera integration
- [ ] AR markers showing boundary corner points
- [ ] Real-time distance guidance ("2m from southwest corner")
- [ ] Physical walk-through for parcel verification
- [ ] Accuracy tracking and feedback

#### 🛰️ Advanced Satellite Parcel Visualization
- [ ] Google Satellite layer integration
- [ ] Mapbox Satellite support
- [ ] MapLibre rendering engine
- [ ] Real-world land imagery overlay
- [ ] Zoom and pan controls

#### 🏘️ Neighbor Parcel & Ownership Context
- [ ] Display adjacent parcel boundaries
- [ ] "View Parcel History" feature
- [ ] "Show Neighbors" functionality
- [ ] Ownership transparency tools
- [ ] Dispute resolution context

#### 📴 Offline Parcel Access
- [ ] Cache parcel geometry locally
- [ ] GPS + polygon works without internet
- [ ] Offline boundary verification
- [ ] Sync when connection restored
- [ ] Ideal for rural/remote areas

#### 📐 Parcel Area & Distance Calculator
- [ ] Tap corners to measure area
- [ ] Calculate perimeter automatically
- [ ] Side length measurements
- [ ] Corner coordinate display
- [ ] Export measurements to PDF

#### 🤖 AI Boundary Correction
- [ ] Upload survey maps (RIM/mutation forms)
- [ ] Auto-detect parcel boundaries
- [ ] Image-to-GeoJSON conversion
- [ ] Coordinate extraction from images
- [ ] Validation and accuracy scoring

#### ⚠️ Land Dispute Highlighting
- [ ] Detect overlapping parcels
- [ ] Mark ambiguous coordinates
- [ ] Admin-flagged conflict boundaries
- [ ] Fraud prevention indicators
- [ ] Dispute resolution workflow

#### 🏛️ County Dashboard (Admin)
- [ ] Heatmaps of land transfers
- [ ] Parcel activity tracking
- [ ] New registration logs
- [ ] Pending approvals queue
- [ ] County-level analytics

#### 🇰🇪 National Dashboard (NLC)
- [ ] National parcel map view
- [ ] County performance analytics
- [ ] Land-use pattern insights
- [ ] Automated fraud alerts
- [ ] Cross-county transfer monitoring

#### 📡 Location Accuracy Indicator
- [ ] Show GPS accuracy radius
- [ ] Signal strength indicator
- [ ] "Move to open sky" tips
- [ ] Precision improvement suggestions
- [ ] Multi-GNSS support (GPS, GLONASS, Galileo)

### Additional Enhancements
- [ ] Mobile application (React Native)
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Multi-language support (Swahili)
- [ ] Export reports (PDF)
- [ ] Advanced search filters
- [ ] Parcel valuation estimates
- [ ] Blockchain integration for immutability

## 📸 Screenshots

(Add screenshots of your application here)

---

**Built with ❤️ using the MERN Stack**
