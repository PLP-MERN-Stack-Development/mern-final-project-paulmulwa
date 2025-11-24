require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const migrateUserRoles = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 Migrating user roles from buyer/seller to unified user role...\n');

    // Update all buyers to users
    const buyersResult = await User.updateMany(
      { role: 'buyer' },
      { $set: { role: 'user' } }
    );
    console.log(`✅ Migrated ${buyersResult.modifiedCount} buyers to users`);

    // Update all sellers to users
    const sellersResult = await User.updateMany(
      { role: 'seller' },
      { $set: { role: 'user' } }
    );
    console.log(`✅ Migrated ${sellersResult.modifiedCount} sellers to users`);

    // Summary
    const totalUsers = await User.countDocuments({ role: 'user' });
    const countyAdmins = await User.countDocuments({ role: 'county_admin' });
    const nlcAdmins = await User.countDocuments({ role: 'nlc_admin' });
    const superAdmins = await User.countDocuments({ role: 'super_admin' });

    console.log('\n📊 Migration Summary:');
    console.log(`   👤 Users: ${totalUsers}`);
    console.log(`   🏢 County Admins: ${countyAdmins}`);
    console.log(`   🏛️  NLC Admins: ${nlcAdmins}`);
    console.log(`   ⚡ Super Admins: ${superAdmins}\n`);

    console.log('✅ Migration completed successfully!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    process.exit(1);
  }
};

migrateUserRoles();
