require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const SUPER_ADMIN = {
  firstName: 'Super',
  lastName: 'Admin',
  email: 'paulmulwa101@gmail.com',
  password: '12345678',
  nationalId: 'SUPER_ADMIN_ID',
  kraPin: 'SUPER_ADMIN_KRA',
  phoneNumber: '+254700000000',
  role: 'super_admin',
  isSuperAdmin: true,
  isApproved: true,
  isActive: true,
  canManageAdmins: true
};

const seedSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: SUPER_ADMIN.email });

    if (existingSuperAdmin) {
      console.log('✅ Super Admin already exists');
      console.log(`Email: ${existingSuperAdmin.email}`);
      console.log(`Role: ${existingSuperAdmin.role}`);
      console.log(`Is Super Admin: ${existingSuperAdmin.isSuperAdmin}`);
    } else {
      // Create super admin
      const superAdmin = await User.create(SUPER_ADMIN);
      console.log('✅ Super Admin created successfully!');
      console.log(`Email: ${superAdmin.email}`);
      console.log(`Password: 12345678`);
      console.log(`Role: ${superAdmin.role}`);
      console.log(`\n🔐 Login Credentials:`);
      console.log(`   Email: paulmulwa101@gmail.com`);
      console.log(`   Password: 12345678`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding super admin:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedSuperAdmin();
