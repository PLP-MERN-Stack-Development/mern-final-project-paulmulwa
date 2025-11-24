# System Architecture - Ardhisasa Lite

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            React Frontend (Vite)                     │  │
│  │  - React Router for navigation                       │  │
│  │  - Context API for state management                  │  │
│  │  - Axios for HTTP requests                           │  │
│  │  - Socket.io client for real-time updates            │  │
│  │  - Tailwind CSS for styling                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Express.js REST API Server                  │  │
│  │                                                       │  │
│  │  Middleware Stack:                                   │  │
│  │  - Helmet (Security)                                 │  │
│  │  - CORS                                              │  │
│  │  - Morgan (Logging)                                  │  │
│  │  - Compression                                       │  │
│  │  - Rate Limiting                                     │  │
│  │  - JWT Authentication                                │  │
│  │  - Role-based Authorization                          │  │
│  │  - Input Validation                                  │  │
│  │  - Error Handler                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Socket.io Real-time Server                │  │
│  │  - User room management                              │  │
│  │  - Notification broadcasting                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕ MongoDB Protocol
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MongoDB Database                        │  │
│  │                                                       │  │
│  │  Collections:                                        │  │
│  │  - users                                             │  │
│  │  - parcels                                           │  │
│  │  - transfers                                         │  │
│  │  - regions                                           │  │
│  │  - documents                                         │  │
│  │  - notifications                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Backend Components

```
Backend/
├── Server Entry (server.js)
│   └── Initialize Express, Socket.io, MongoDB
├── Routes Layer
│   ├── Auth Routes (/api/auth/*)
│   ├── User Routes (/api/users/*)
│   ├── Parcel Routes (/api/parcels/*)
│   ├── Transfer Routes (/api/transfers/*)
│   ├── Region Routes (/api/regions/*)
│   ├── Document Routes (/api/documents/*)
│   └── Notification Routes (/api/notifications/*)
├── Controller Layer
│   ├── Business Logic
│   ├── Request Validation
│   └── Response Formatting
├── Model Layer (Mongoose)
│   ├── Schema Definitions
│   ├── Virtuals & Methods
│   └── Indexes
└── Middleware Layer
    ├── Authentication (JWT)
    ├── Authorization (RBAC)
    ├── Validation
    ├── File Upload
    ├── Rate Limiting
    └── Error Handling
```

### Frontend Components

```
Frontend/
├── Main App (App.jsx)
│   └── Router Configuration
├── Context Providers
│   ├── AuthContext (User state)
│   └── SocketContext (Real-time)
├── Pages
│   ├── Auth Pages (Login, Register)
│   ├── Dashboard
│   ├── Land Pages (Search, Verify, Details)
│   ├── Transfer Pages
│   ├── County Admin Pages
│   └── NLC Admin Pages
├── Components
│   ├── Layout (Sidebar, Header)
│   ├── Form Components (Input, Select, Button)
│   └── UI Components (Card, Badge, Loading)
└── Services
    ├── API Service (Axios)
    └── Socket Service
```

## Data Flow

### Authentication Flow

```
1. User Login
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT access & refresh tokens
   ↓
4. Store tokens in localStorage
   ↓
5. Include token in Authorization header
   ↓
6. Middleware verifies token
   ↓
7. Attach user to request object
   ↓
8. Controller processes request
```

### Transfer Workflow

```
1. SELLER: Initiate Transfer
   ↓
2. Create Transfer record (status: initiated)
   ↓
3. Update Parcel status (pending_transfer)
   ↓
4. Notify Buyer & County Admins
   ↓
5. COUNTY ADMIN: Verify Documents
   ↓
6. Update Transfer (status: county_verification)
   ↓
7. COUNTY ADMIN: Approve/Reject
   ↓
   ├─ Reject → Update Parcel (status: active)
   │           Notify parties
   │
   └─ Approve → Update Transfer (status: nlc_review)
               Notify NLC Admins
               ↓
8. NLC ADMIN: Final Approval
   ↓
   ├─ Reject → Update statuses, Notify
   │
   └─ Approve → Transfer Ownership
                Update Parcel owner
                Add to transfer history
                Update Transfer (status: completed)
                Notify all parties
```

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────┐
│         Authentication Layer            │
│                                         │
│  1. JWT Access Token (15 min)          │
│  2. JWT Refresh Token (7 days)         │
│  3. Token stored in httpOnly cookies   │
│     or localStorage                     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│        Authorization Layer              │
│                                         │
│  Role-Based Access Control (RBAC)      │
│                                         │
│  Roles:                                 │
│  - buyer                                │
│  - seller                               │
│  - county_admin (requires approval)     │
│  - nlc_admin                            │
│                                         │
│  Permissions checked at:                │
│  - Route level                          │
│  - Controller level                     │
└─────────────────────────────────────────┘
```

### Security Measures

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Minimum 6 characters
   - No plain text storage

2. **Token Security**
   - Short-lived access tokens
   - Secure refresh mechanism
   - Token blacklisting on logout

3. **API Security**
   - Helmet.js headers
   - CORS configuration
   - Rate limiting
   - Input validation
   - SQL injection prevention
   - XSS protection

4. **Data Security**
   - Mongoose schema validation
   - Sanitized user inputs
   - File upload restrictions
   - Secure file storage

## Database Design

### Entity Relationship

```
User ────────┐
     │       │
     │       │ owns
     │       ↓
     │    Parcel ──────┐
     │       │         │
     │       │ has     │ involved in
     │       ↓         ↓
     │   Document   Transfer
     │                 │
     │ receives        │ has
     │                 ↓
     └──────────→ Notification
```

### Key Relationships

- User → Parcel (One to Many) - Ownership
- Parcel → Transfer (One to Many) - Transfer history
- Transfer → User (Many to One) - Buyer & Seller
- User → Notification (One to Many) - Notifications
- Transfer → Document (One to Many) - Supporting docs

## Real-time Architecture

### Socket.io Implementation

```
┌──────────────────────────────────────┐
│         Client Connection            │
│                                      │
│  1. Connect to Socket.io server      │
│  2. Join user-specific room (userId) │
│  3. Listen for 'notification' events │
└──────────────────────────────────────┘
                  ↕
┌──────────────────────────────────────┐
│         Server Events                │
│                                      │
│  When action occurs:                 │
│  1. Create notification in DB        │
│  2. Emit to user's room              │
│  3. Client receives & displays       │
└──────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Vercel)             │
│                                         │
│  - Static hosting                       │
│  - CDN distribution                     │
│  - Automatic HTTPS                      │
└─────────────────────────────────────────┘
                  ↓ API Calls
┌─────────────────────────────────────────┐
│         Backend (Render/Railway)        │
│                                         │
│  - Node.js server                       │
│  - WebSocket support                    │
│  - Environment variables                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Database (MongoDB Atlas)           │
│                                         │
│  - Managed database                     │
│  - Automatic backups                    │
│  - Replica sets                         │
└─────────────────────────────────────────┘
```

## Performance Optimizations

1. **Database**
   - Indexed fields (titleNumber, owner, status)
   - Query optimization
   - Pagination for large datasets

2. **API**
   - Response compression
   - Rate limiting
   - Caching headers

3. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Memoization

4. **Real-time**
   - Room-based targeting
   - Event throttling
   - Connection pooling
