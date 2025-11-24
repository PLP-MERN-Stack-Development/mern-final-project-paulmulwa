require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const socketio = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const parcelRoutes = require('./routes/parcel.routes');
const transferRoutes = require('./routes/transfer.routes');
const regionRoutes = require('./routes/region.routes');
const documentRoutes = require('./routes/document.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Apply rate limiting to all routes (disabled in development)
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimiter);
}

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected successfully');
  
  // Auto-create Super Admin on startup
  const User = require('./models/User');
  const superAdminEmail = 'paulmulwa101@gmail.com';
  
  try {
    const existingSuperAdmin = await User.findOne({ email: superAdminEmail });
    
    if (!existingSuperAdmin) {
      await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: superAdminEmail,
        password: '12345678',
        nationalId: 'SUPER_ADMIN_ID',
        kraPin: 'SUPER_ADMIN_KRA',
        phoneNumber: '+254700000000',
        role: 'super_admin',
        isSuperAdmin: true,
        isApproved: true,
        isActive: true,
        canManageAdmins: true
      });
      console.log('👑 Super Admin created automatically');
      console.log(`   Email: ${superAdminEmail}`);
      console.log(`   Password: 12345678`);
    } else {
      console.log('👑 Super Admin already exists');
    }
  } catch (error) {
    console.error('❌ Error creating Super Admin:', error.message);
  }
})
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ardhisasa Lite API', 
    version: '1.0.0',
    status: 'running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/county-admin', require('./routes/countyAdmin.routes'));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
