require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateUserEmails = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 Updating user emails and names...\n');

    const updates = [
      { oldEmail: 'buyer1@test.com', newEmail: 'user1@test.com', firstName: 'John', lastName: 'Kimani' },
      { oldEmail: 'buyer2@test.com', newEmail: 'user2@test.com', firstName: 'Jane', lastName: 'Njeri' },
      { oldEmail: 'seller1@test.com', newEmail: 'user3@test.com', firstName: 'Mike', lastName: 'Otieno' },
      { oldEmail: 'seller2@test.com', newEmail: 'user4@test.com', firstName: 'Sarah', lastName: 'Mwangi' },
      { oldEmail: 'trader@test.com', newEmail: 'user5@test.com', firstName: 'David', lastName: 'Ochieng' }
    ];

    for (const update of updates) {
      const result = await User.updateOne(
        { email: update.oldEmail },
        { 
          $set: { 
            email: update.newEmail,
            firstName: update.firstName,
            lastName: update.lastName
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${update.oldEmail} → ${update.newEmail} (${update.firstName} ${update.lastName})`);
      } else {
        console.log(`⏭️  User ${update.oldEmail} not found or already updated`);
      }
    }

    console.log('\n✅ Update completed successfully!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during update:', error.message);
    process.exit(1);
  }
};

updateUserEmails();
