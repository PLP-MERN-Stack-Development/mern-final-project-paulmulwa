require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const DEMO_USERS = [
  // Super Admin (already exists)
  {
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
  },
  // NLC Admin
  {
    firstName: 'NLC',
    lastName: 'Admin',
    email: 'nlc@admin.com',
    password: '12345678',
    nationalId: '12345678',
    kraPin: 'A123456789K',
    phoneNumber: '+254701000000',
    role: 'nlc_admin',
    isApproved: true,
    isActive: true
  },
  // County Admin - Nairobi (Approved)
  {
    firstName: 'Nairobi',
    lastName: 'County Admin',
    email: 'nairobi@county.com',
    password: '12345678',
    nationalId: '23456789',
    kraPin: 'A234567890K',
    phoneNumber: '+254702000000',
    role: 'county_admin',
    county: 'Nairobi City',
    isApproved: true,
    isActive: true
  },
  // County Admin - Mombasa (Approved)
  {
    firstName: 'Mombasa',
    lastName: 'County Admin',
    email: 'mombasa@county.com',
    password: '12345678',
    nationalId: '34567890',
    kraPin: 'A345678901K',
    phoneNumber: '+254703000000',
    role: 'county_admin',
    county: 'Mombasa',
    isApproved: true,
    isActive: true
  },
  // County Admin - Kisumu (Pending Approval)
  {
    firstName: 'Kisumu',
    lastName: 'County Admin',
    email: 'kisumu@county.com',
    password: '12345678',
    nationalId: '45678901',
    kraPin: 'A456789012K',
    phoneNumber: '+254704000000',
    role: 'county_admin',
    county: 'Kisumu',
    isApproved: false,
    isActive: true
  },
  // County Admin - Nakuru (Pending Approval)
  {
    firstName: 'James',
    lastName: 'Kamau',
    email: 'nakuru@county.com',
    password: '12345678',
    nationalId: '11223344',
    kraPin: 'A112233445K',
    phoneNumber: '+254710000000',
    role: 'county_admin',
    county: 'Nakuru',
    isApproved: false,
    isActive: true
  },
  // County Admin - Kiambu (Pending Approval)
  {
    firstName: 'Mary',
    lastName: 'Wanjiku',
    email: 'kiambu@county.com',
    password: '12345678',
    nationalId: '22334455',
    kraPin: 'A223344556K',
    phoneNumber: '+254711000000',
    role: 'county_admin',
    county: 'Kiambu',
    isApproved: false,
    isActive: true
  },
  // County Admin - Machakos (Pending Approval)
  {
    firstName: 'Peter',
    lastName: 'Mutua',
    email: 'machakos@county.com',
    password: '12345678',
    nationalId: '33445566',
    kraPin: 'A334455667K',
    phoneNumber: '+254712000000',
    role: 'county_admin',
    county: 'Machakos',
    isApproved: false,
    isActive: true
  },
  // County Admin - Uasin Gishu (Pending Approval)
  {
    firstName: 'Daniel',
    lastName: 'Kiprop',
    email: 'uasingishu@county.com',
    password: '12345678',
    nationalId: '44556677',
    kraPin: 'A445566778K',
    phoneNumber: '+254713000000',
    role: 'county_admin',
    county: 'Uasin Gishu',
    isApproved: false,
    isActive: true
  },
  // User 1
  {
    firstName: 'John',
    lastName: 'Kimani',
    email: 'user1@test.com',
    password: '12345678',
    nationalId: '56789012',
    kraPin: 'A567890123K',
    phoneNumber: '+254705000000',
    role: 'user',
    isApproved: true,
    isActive: true
  },
  // User 2
  {
    firstName: 'Jane',
    lastName: 'Njeri',
    email: 'user2@test.com',
    password: '12345678',
    nationalId: '67890123',
    kraPin: 'A678901234K',
    phoneNumber: '+254706000000',
    role: 'user',
    isApproved: true,
    isActive: true
  },
  // User 3 (Land Owner)
  {
    firstName: 'Mike',
    lastName: 'Otieno',
    email: 'user3@test.com',
    password: '12345678',
    nationalId: '78901234',
    kraPin: 'A789012345K',
    phoneNumber: '+254707000000',
    role: 'user',
    isApproved: true,
    isActive: true
  },
  // User 4 (Land Owner)
  {
    firstName: 'Sarah',
    lastName: 'Mwangi',
    email: 'user4@test.com',
    password: '12345678',
    nationalId: '89012345',
    kraPin: 'A890123456K',
    phoneNumber: '+254708000000',
    role: 'user',
    isApproved: true,
    isActive: true
  },
  // User 5 (Land Owner)
  {
    firstName: 'David',
    lastName: 'Ochieng',
    email: 'user5@test.com',
    password: '12345678',
    nationalId: '90123456',
    kraPin: 'A901234567K',
    phoneNumber: '+254709000000',
    role: 'user',
    isApproved: true,
    isActive: true
  }
];

const seedDemoUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    console.log('🌱 Seeding demo users...\n');

    let created = 0;
    let existing = 0;

    for (const userData of DEMO_USERS) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⏭️  User already exists: ${userData.email} (${userData.role})`);
          existing++;
        } else {
          await User.create(userData);
          console.log(`✅ Created: ${userData.email} (${userData.role})`);
          created++;
        }
      } catch (error) {
        console.log(`❌ Error creating ${userData.email}: ${error.message}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} users`);
    console.log(`   ⏭️  Existing: ${existing} users`);
    console.log(`   📝 Total: ${DEMO_USERS.length} users\n`);

    console.log('🔐 Demo User Credentials (All passwords: 12345678)\n');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ SUPER ADMIN                                         │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ Email: paulmulwa101@gmail.com                       │');
    console.log('│ Role:  super_admin (Full system access)             │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ NLC ADMIN                                           │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ Email: nlc@admin.com                                │');
    console.log('│ Role:  nlc_admin (Manage County Admins)             │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ COUNTY ADMINS                                       │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ Email: nairobi@county.com  (Nairobi - Approved)     │');
    console.log('│ Email: mombasa@county.com  (Mombasa - Approved)     │');
    console.log('│ Email: kisumu@county.com   (Kisumu - Pending)       │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ USERS                                               │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│ Email: user1@test.com      (John Kimani)            │');
    console.log('│ Email: user2@test.com      (Jane Njeri)             │');
    console.log('│ Email: user3@test.com      (Mike Otieno - Owner)    │');
    console.log('│ Email: user4@test.com      (Sarah Mwangi - Owner)   │');
    console.log('│ Email: user5@test.com      (David Ochieng - Owner)  │');
    console.log('└─────────────────────────────────────────────────────┘\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo users:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDemoUsers();
