const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Parcel = require('./models/Parcel');
const User = require('./models/User');
const Document = require('./models/Document');

dotenv.config();

// Kenya counties with realistic locations
const KENYAN_LOCATIONS = [
  {
    county: 'Nairobi City',
    constituency: 'Westlands',
    ward: 'Parklands/Highridge',
    subCounty: 'Westlands',
    locations: [
      { name: 'Parklands', zoning: 'residential' },
      { name: 'Westlands', zoning: 'commercial' },
      { name: 'Highridge', zoning: 'residential' }
    ]
  },
  {
    county: 'Nairobi City',
    constituency: 'Kibra',
    ward: 'Laini Saba',
    subCounty: 'Kibra',
    locations: [
      { name: 'Kibera', zoning: 'residential' },
      { name: 'Makina', zoning: 'residential' }
    ]
  },
  {
    county: 'Nairobi City',
    constituency: 'Kasarani',
    ward: 'Mwiki',
    subCounty: 'Kasarani',
    locations: [
      { name: 'Kasarani', zoning: 'mixed' },
      { name: 'Mwiki', zoning: 'residential' }
    ]
  },
  {
    county: 'Mombasa',
    constituency: 'Mvita',
    ward: 'Mji wa Kale/Makadara',
    subCounty: 'Mvita',
    locations: [
      { name: 'Old Town', zoning: 'commercial' },
      { name: 'Makadara', zoning: 'residential' }
    ]
  },
  {
    county: 'Mombasa',
    constituency: 'Nyali',
    ward: 'Frere Town',
    subCounty: 'Nyali',
    locations: [
      { name: 'Nyali', zoning: 'residential' },
      { name: 'Frere Town', zoning: 'residential' }
    ]
  },
  {
    county: 'Kisumu',
    constituency: 'Kisumu Central',
    ward: 'Market Milimani',
    subCounty: 'Kisumu Central',
    locations: [
      { name: 'Milimani', zoning: 'commercial' },
      { name: 'Market Area', zoning: 'commercial' }
    ]
  },
  {
    county: 'Kisumu',
    constituency: 'Kisumu West',
    ward: 'North West Kisumu',
    subCounty: 'Kisumu West',
    locations: [
      { name: 'Mamboleo', zoning: 'residential' },
      { name: 'Dunga', zoning: 'agricultural' }
    ]
  },
  {
    county: 'Nakuru',
    constituency: 'Nakuru Town West',
    ward: 'Shabaab',
    subCounty: 'Nakuru Town West',
    locations: [
      { name: 'Section 58', zoning: 'residential' },
      { name: 'Shabaab', zoning: 'residential' }
    ]
  },
  {
    county: 'Nakuru',
    constituency: 'Bahati',
    ward: 'Lanet/Umoja',
    subCounty: 'Bahati',
    locations: [
      { name: 'Lanet', zoning: 'mixed' },
      { name: 'Umoja', zoning: 'residential' }
    ]
  },
  {
    county: 'Kiambu',
    constituency: 'Kiambu',
    ward: 'Township',
    subCounty: 'Kiambu',
    locations: [
      { name: 'Kiambu Town', zoning: 'commercial' },
      { name: 'Ndumberi', zoning: 'agricultural' }
    ]
  },
  {
    county: 'Kiambu',
    constituency: 'Kikuyu',
    ward: 'Kikuyu',
    subCounty: 'Kikuyu',
    locations: [
      { name: 'Kikuyu Town', zoning: 'mixed' },
      { name: 'Karai', zoning: 'agricultural' }
    ]
  },
  {
    county: 'Machakos',
    constituency: 'Machakos Town',
    ward: 'Kalama',
    subCounty: 'Machakos Town',
    locations: [
      { name: 'Kalama', zoning: 'residential' },
      { name: 'Township', zoning: 'commercial' }
    ]
  },
  {
    county: 'Uasin Gishu',
    constituency: 'Eldoret North',
    ward: 'Kapsoya',
    subCounty: 'Eldoret North',
    locations: [
      { name: 'Kapsoya', zoning: 'residential' },
      { name: 'Pioneer', zoning: 'commercial' }
    ]
  },
  {
    county: 'Meru',
    constituency: 'Imenti Central',
    ward: 'Abothuguchi Central',
    subCounty: 'Imenti Central',
    locations: [
      { name: 'Meru Town', zoning: 'commercial' },
      { name: 'Abothuguchi', zoning: 'agricultural' }
    ]
  },
  {
    county: 'Nyeri',
    constituency: 'Nyeri Town',
    ward: 'Ruring\'u',
    subCounty: 'Nyeri Town',
    locations: [
      { name: 'Nyeri CBD', zoning: 'commercial' },
      { name: 'Ruring\'u', zoning: 'residential' }
    ]
  }
];

// Kenyan names for realistic data
const FIRST_NAMES = [
  'John', 'Mary', 'Peter', 'Grace', 'James', 'Jane', 'David', 'Sarah',
  'Joseph', 'Ruth', 'Daniel', 'Faith', 'Samuel', 'Esther', 'Michael',
  'Catherine', 'Paul', 'Lucy', 'Anthony', 'Alice', 'Francis', 'Rose',
  'Robert', 'Ann', 'Stephen', 'Margaret', 'William', 'Elizabeth',
  'Thomas', 'Nancy', 'George', 'Janet'
];

const LAST_NAMES = [
  'Kamau', 'Wanjiru', 'Otieno', 'Achieng', 'Kipchoge', 'Jeptoo',
  'Mwangi', 'Wambui', 'Omondi', 'Adhiambo', 'Kipruto', 'Chebet',
  'Njoroge', 'Nyambura', 'Ochieng', 'Akinyi', 'Kimani', 'Waithera',
  'Onyango', 'Awuor', 'Mutua', 'Muthoni', 'Ouma', 'Moraa',
  'Kiplagat', 'Chepkemoi', 'Kariuki', 'Wangari', 'Owino', 'Atieno'
];

// Generate title number in format: COUNTYCODE12345678
function generateTitleNumber(countyName, index) {
  const countyCode = countyName.substring(0, 3).toUpperCase();
  const number = String(index).padStart(8, '0');
  return `${countyCode}${number}`;
}

// Generate LR number
function generateLRNumber(county, index) {
  return `LR${index}/${county.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}`;
}

// Create demo parcels
const createDemoParcels = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get demo users to assign as owners
    const users = await User.find({ role: 'user' });
    const allOwners = users;

    if (allOwners.length === 0) {
      console.log('⚠️  No users found. Please run seedDemoUsers.js first');
      process.exit(1);
    }

    console.log(`📊 Found ${allOwners.length} potential land owners`);
    console.log('🏗️  Creating demo parcels with title deeds...\n');

    const parcels = [];
    let parcelIndex = 12345600;

    for (const location of KENYAN_LOCATIONS) {
      for (const place of location.locations) {
        parcelIndex++;
        
        // Random owner
        const owner = allOwners[Math.floor(Math.random() * allOwners.length)];
        
        // Random size between 0.25 and 50 acres
        const sizeValue = parseFloat((Math.random() * 49.75 + 0.25).toFixed(2));
        
        // Random market value based on size and zoning
        const basePrice = place.zoning === 'commercial' ? 5000000 : 
                         place.zoning === 'residential' ? 2000000 : 1000000;
        const marketValue = Math.floor((basePrice + Math.random() * basePrice) * sizeValue);

        // Random approval status
        const approvalStatuses = [
          'pending_county_admin',
          'pending_nlc_admin',
          'approved',
          'approved',
          'approved' // More approved than pending
        ];
        const approvalStatus = approvalStatuses[Math.floor(Math.random() * approvalStatuses.length)];

        const parcelData = {
          titleNumber: generateTitleNumber(location.county, parcelIndex),
          lrNumber: generateLRNumber(location.county, parcelIndex),
          owner: owner._id,
          ownerName: `${owner.firstName} ${owner.lastName}`,
          ownerIdNumber: owner.nationalId || `DEMO${Math.floor(10000000 + Math.random() * 90000000)}`,
          ownerKraPin: owner.kraPin || `A${Math.floor(100000000 + Math.random() * 900000000)}K`,
          county: location.county,
          subCounty: location.subCounty,
          constituency: location.constituency,
          ward: location.ward,
          size: {
            value: sizeValue,
            unit: 'acres'
          },
          coordinates: {
            latitude: -1.286389 + (Math.random() - 0.5) * 2,
            longitude: 36.817223 + (Math.random() - 0.5) * 2
          },
          zoning: place.zoning,
          landUse: `${place.name} - ${place.zoning} area`,
          marketValue,
          description: `Prime ${place.zoning} land located in ${place.name}, ${location.ward} ward, ${location.constituency} constituency, ${location.county} County. This ${sizeValue} acres parcel is ideal for ${place.zoning} development.`,
          approvalStatus,
          countyAdminApproval: {
            status: approvalStatus === 'pending_county_admin' ? 'pending' : 'approved',
            approvedAt: approvalStatus !== 'pending_county_admin' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined
          },
          nlcAdminApproval: {
            status: approvalStatus === 'approved' ? 'approved' : 
                   approvalStatus === 'pending_nlc_admin' ? 'pending' : 'pending',
            approvedAt: approvalStatus === 'approved' ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) : undefined
          },
          isVerified: approvalStatus === 'approved',
          verifiedAt: approvalStatus === 'approved' ? new Date() : undefined,
          status: 'active'
        };

        parcels.push(parcelData);
      }
    }

    // Insert parcels
    let created = 0;
    let existing = 0;
    let updated = 0;

    for (const parcelData of parcels) {
      const existingParcel = await Parcel.findOne({ titleNumber: parcelData.titleNumber });
      
      if (existingParcel) {
        // Update existing parcel with new owner credential fields if they're missing
        if (!existingParcel.ownerIdNumber || !existingParcel.ownerKraPin) {
          await Parcel.updateOne(
            { titleNumber: parcelData.titleNumber },
            { 
              $set: { 
                ownerIdNumber: parcelData.ownerIdNumber,
                ownerKraPin: parcelData.ownerKraPin
              } 
            }
          );
          updated++;
          console.log(`🔄 Updated credentials: ${parcelData.titleNumber} (${parcelData.county})`);
        } else {
          console.log(`⏭️  Parcel exists: ${parcelData.titleNumber} (${parcelData.county})`);
        }
        existing++;
      } else {
        const parcel = await Parcel.create(parcelData);
        
        // Create mock title deed document
        await Document.create({
          documentType: 'title_deed',
          fileName: `${parcelData.titleNumber}_title_deed.pdf`,
          fileUrl: `https://example.com/documents/${parcelData.titleNumber}_title_deed.pdf`,
          fileSize: Math.floor(Math.random() * 500000 + 100000),
          mimeType: 'application/pdf',
          uploadedBy: parcelData.owner,
          relatedTo: {
            model: 'Parcel',
            id: parcel._id
          },
          isVerified: parcelData.isVerified,
          remarks: 'Official title deed document'
        });
        
        created++;
        console.log(`✅ Created: ${parcelData.titleNumber} - ${parcelData.ownerName} (${parcelData.county}) - Status: ${parcelData.approvalStatus}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created} parcels`);
    console.log(`   🔄 Updated: ${updated} parcels`);
    console.log(`   ⏭️  Existing: ${existing} parcels`);
    console.log(`   📝 Total: ${parcels.length} parcels\n`);

    // Display approval status breakdown
    const allParcels = await Parcel.find({});
    const pendingCounty = allParcels.filter(p => p.approvalStatus === 'pending_county_admin').length;
    const pendingNLC = allParcels.filter(p => p.approvalStatus === 'pending_nlc_admin').length;
    const approved = allParcels.filter(p => p.approvalStatus === 'approved').length;

    console.log(`📋 Approval Status Breakdown:`);
    console.log(`   ⏳ Pending County Admin: ${pendingCounty} parcels`);
    console.log(`   ⏳ Pending NLC Admin: ${pendingNLC} parcels`);
    console.log(`   ✅ Approved: ${approved} parcels\n`);

    // Display sample parcels by county
    console.log(`🗺️  Sample Parcels by County:\n`);
    const counties = [...new Set(KENYAN_LOCATIONS.map(l => l.county))];
    for (const county of counties) {
      const countyParcels = allParcels.filter(p => p.county === county);
      if (countyParcels.length > 0) {
        const sample = countyParcels[0];
        console.log(`   ${county}: ${countyParcels.length} parcels`);
        console.log(`      Sample: ${sample.titleNumber} - ${sample.ownerName}`);
      }
    }

    console.log('\n🎉 Demo parcels seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createDemoParcels();
