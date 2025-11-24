# Project File Structure

```
Ardhi Sasa/
│
├── 📄 README.md                          # Main project documentation
├── 📄 PROJECT_SUMMARY.md                 # Complete project overview
├── 📄 QUICKSTART.md                      # 5-minute setup guide
├── 📄 docker-compose.yml                 # Docker orchestration
│
├── 📁 backend/                           # Node.js + Express Backend
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 server.js                      # Main server entry point
│   ├── 📄 .env.example                   # Environment template
│   ├── 📄 Dockerfile                     # Backend container config
│   ├── 📄 jest.config.js                 # Testing configuration
│   ├── 📄 seedRegions.js                 # Database seed script
│   │
│   ├── 📁 controllers/                   # Business logic layer
│   │   ├── auth.controller.js            # Authentication logic
│   │   ├── user.controller.js            # User management
│   │   ├── parcel.controller.js          # Land parcel operations
│   │   ├── transfer.controller.js        # Transfer workflow
│   │   ├── region.controller.js          # Kenya regions
│   │   ├── document.controller.js        # File handling
│   │   └── notification.controller.js    # Notifications
│   │
│   ├── 📁 models/                        # MongoDB schemas
│   │   ├── User.js                       # User model
│   │   ├── Parcel.js                     # Land parcel model
│   │   ├── Transfer.js                   # Transfer model
│   │   ├── Region.js                     # Region model
│   │   ├── Document.js                   # Document model
│   │   └── Notification.js               # Notification model
│   │
│   ├── 📁 routes/                        # API endpoints
│   │   ├── auth.routes.js                # /api/auth/*
│   │   ├── user.routes.js                # /api/users/*
│   │   ├── parcel.routes.js              # /api/parcels/*
│   │   ├── transfer.routes.js            # /api/transfers/*
│   │   ├── region.routes.js              # /api/regions/*
│   │   ├── document.routes.js            # /api/documents/*
│   │   └── notification.routes.js        # /api/notifications/*
│   │
│   ├── 📁 middleware/                    # Custom middleware
│   │   ├── auth.js                       # JWT authentication
│   │   ├── validator.js                  # Input validation
│   │   ├── errorHandler.js               # Error handling
│   │   ├── rateLimiter.js                # Rate limiting
│   │   └── upload.js                     # File upload
│   │
│   └── 📁 tests/                         # Test files
│       ├── setup.js                      # Test configuration
│       └── auth.test.js                  # Sample test
│
├── 📁 frontend/                          # React Frontend
│   ├── 📄 package.json                   # Frontend dependencies
│   ├── 📄 index.html                     # HTML template
│   ├── 📄 vite.config.js                 # Vite configuration
│   ├── 📄 tailwind.config.js             # Tailwind CSS config
│   ├── 📄 postcss.config.js              # PostCSS config
│   ├── 📄 .env.example                   # Environment template
│   ├── 📄 Dockerfile                     # Frontend container
│   ├── 📄 nginx.conf                     # Nginx configuration
│   │
│   └── 📁 src/                           # Source code
│       ├── 📄 main.jsx                   # App entry point
│       ├── 📄 App.jsx                    # Main app component
│       ├── 📄 index.css                  # Global styles
│       │
│       ├── 📁 components/                # Reusable components
│       │   ├── Layout.jsx                # Main layout (sidebar)
│       │   ├── Card.jsx                  # Card component
│       │   ├── Button.jsx                # Button component
│       │   ├── Input.jsx                 # Input component
│       │   ├── Select.jsx                # Select component
│       │   ├── Badge.jsx                 # Badge component
│       │   └── Loading.jsx               # Loading spinner
│       │
│       ├── 📁 context/                   # React Context
│       │   ├── AuthContext.jsx           # Authentication state
│       │   └── SocketContext.jsx         # Socket.io connection
│       │
│       ├── 📁 services/                  # API services
│       │   └── api.js                    # Axios configuration
│       │
│       └── 📁 pages/                     # Page components
│           │
│           ├── 📁 Auth/                  # Authentication pages
│           │   ├── Login.jsx
│           │   └── Register.jsx
│           │
│           ├── 📁 Dashboard/             # Dashboard
│           │   └── Dashboard.jsx
│           │
│           ├── 📁 Land/                  # Land management
│           │   ├── SearchLand.jsx
│           │   ├── VerifyTitle.jsx
│           │   ├── ParcelDetails.jsx
│           │   └── MyParcels.jsx
│           │
│           ├── 📁 Transfer/              # Transfer pages
│           │   ├── InitiateTransfer.jsx
│           │   ├── TransferDetails.jsx
│           │   └── MyTransfers.jsx
│           │
│           ├── 📁 CountyAdmin/           # County admin pages
│           │   ├── CountyApprovals.jsx
│           │   └── DocumentVerification.jsx
│           │
│           ├── 📁 NLCAdmin/              # NLC admin pages
│           │   ├── NLCApprovals.jsx
│           │   └── PendingAdmins.jsx
│           │
│           ├── 📁 Profile/               # User profile
│           │   └── Profile.jsx
│           │
│           └── NotFound.jsx              # 404 page
│
├── 📁 docs/                              # Documentation
│   ├── API_DOCUMENTATION.md              # Complete API reference
│   ├── ARCHITECTURE.md                   # System architecture
│   ├── DEPLOYMENT.md                     # Deployment guide
│   └── SETUP.md                          # Setup instructions
│
└── 📁 .github/                           # GitHub configuration
    └── workflows/
        └── ci-cd.yml                     # CI/CD pipeline

```

## Key Files Explanation

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `.env` | Environment variables (create from .env.example) |
| `docker-compose.yml` | Multi-container Docker setup |
| `jest.config.js` | Testing configuration |
| `vite.config.js` | Frontend build configuration |
| `tailwind.config.js` | CSS framework configuration |

### Backend Core Files

| File | Purpose |
|------|---------|
| `server.js` | Express server setup, MongoDB connection, Socket.io |
| `controllers/` | Business logic for each feature |
| `models/` | MongoDB schemas and validations |
| `routes/` | API endpoint definitions |
| `middleware/` | Authentication, validation, error handling |

### Frontend Core Files

| File | Purpose |
|------|---------|
| `main.jsx` | React app initialization |
| `App.jsx` | Router configuration and protected routes |
| `components/` | Reusable UI components |
| `context/` | Global state management |
| `pages/` | Page-level components |
| `services/api.js` | API calls and interceptors |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview and features |
| `PROJECT_SUMMARY.md` | Complete project details |
| `QUICKSTART.md` | Fast setup guide |
| `docs/SETUP.md` | Detailed setup instructions |
| `docs/API_DOCUMENTATION.md` | API endpoint reference |
| `docs/ARCHITECTURE.md` | System design and data flow |
| `docs/DEPLOYMENT.md` | Production deployment |

## Navigation Tips

### To Add a New Feature:

1. **Backend**:
   - Create model in `models/`
   - Add controller in `controllers/`
   - Define routes in `routes/`
   - Update `server.js` to include routes

2. **Frontend**:
   - Create page in `pages/`
   - Add route in `App.jsx`
   - Create components in `components/` if needed
   - Add API calls in `services/api.js`

### To Understand the System:

1. Start with `README.md` for overview
2. Check `docs/ARCHITECTURE.md` for design
3. Review `models/` for data structure
4. Explore `controllers/` for business logic
5. Study `pages/` for UI implementation

### To Deploy:

1. Follow `docs/DEPLOYMENT.md`
2. Use Docker: `docker-compose up`
3. Or deploy manually to cloud platforms

## File Counts

- **Backend Files**: ~30 files
- **Frontend Files**: ~40 files
- **Documentation**: 5 major documents
- **Configuration**: 10+ config files
- **Total Lines of Code**: ~8,000+

## Quick File Access

**Need to...**

- Add API endpoint? → `routes/` then `controllers/`
- Change database schema? → `models/`
- Add UI page? → `pages/` then add route in `App.jsx`
- Fix authentication? → `middleware/auth.js` or `context/AuthContext.jsx`
- Update styling? → `tailwind.config.js` or component CSS
- Add tests? → `tests/` directory
- Configure deployment? → `Dockerfile` or `docker-compose.yml`

---

**Pro Tip**: Use VS Code's file search (Ctrl+P) to quickly navigate between files!
