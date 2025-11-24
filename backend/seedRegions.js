require('dotenv').config();
const mongoose = require('mongoose');
const Region = require('./models/Region');

const kenyaRegions = [
  {
    county: 'Nairobi',
    subCounties: [
      {
        name: 'Westlands',
        constituencies: [
          {
            name: 'Westlands',
            wards: ['Kitisuru', 'Parklands/Highridge', 'Karura', 'Kangemi', 'Mountain View']
          }
        ]
      },
      {
        name: 'Dagoretti',
        constituencies: [
          {
            name: 'Dagoretti North',
            wards: ['Kilimani', 'Kawangware', 'Gatina', 'Kileleshwa', 'Kabiro']
          },
          {
            name: 'Dagoretti South',
            wards: ['Mutuini', 'Ngando', 'Riruta', 'Uthiru/Ruthimitu', 'Waithaka']
          }
        ]
      }
    ]
  },
  {
    county: 'Mombasa',
    subCounties: [
      {
        name: 'Mvita',
        constituencies: [
          {
            name: 'Mvita',
            wards: ['Mji Wa Kale/Makadara', 'Tudor', 'Tononoka', 'Shimanzi/Ganjoni', 'Majengo']
          }
        ]
      },
      {
        name: 'Nyali',
        constituencies: [
          {
            name: 'Nyali',
            wards: ['Frere Town', 'Ziwa La Ng\'Ombe', 'Mkomani', 'Kongowea', 'Kadzandani']
          }
        ]
      }
    ]
  },
  {
    county: 'Kisumu',
    subCounties: [
      {
        name: 'Kisumu Central',
        constituencies: [
          {
            name: 'Kisumu Central',
            wards: ['Market Milimani', 'Kondele', 'Nyalenda A', 'Nyalenda B', 'Migosi']
          }
        ]
      },
      {
        name: 'Kisumu East',
        constituencies: [
          {
            name: 'Kisumu East',
            wards: ['Kajulu', 'Kolwa Central', 'Kolwa East', 'Manyatta B', 'Nyalenda']
          }
        ]
      }
    ]
  },
  {
    county: 'Nakuru',
    subCounties: [
      {
        name: 'Nakuru Town',
        constituencies: [
          {
            name: 'Nakuru Town East',
            wards: ['Biashara', 'Kivumbini', 'Flamingo', 'Menengai', 'Nakuru East']
          },
          {
            name: 'Nakuru Town West',
            wards: ['Kaptembwo', 'Kapkures', 'Rhoda', 'London', 'Shaabab']
          }
        ]
      }
    ]
  },
  {
    county: 'Kiambu',
    subCounties: [
      {
        name: 'Thika Town',
        constituencies: [
          {
            name: 'Thika Town',
            wards: ['Township', 'Kamenu', 'Hospital', 'Gatuanyaga', 'Ngoliba']
          }
        ]
      },
      {
        name: 'Ruiru',
        constituencies: [
          {
            name: 'Ruiru',
            wards: ['Biashara', 'Gatongora', 'Kahawa Sukari', 'Kahawa Wendani', 'Kiuu']
          }
        ]
      }
    ]
  }
];

async function seedRegions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing regions
    await Region.deleteMany({});
    console.log('Cleared existing regions');

    // Insert new regions
    await Region.insertMany(kenyaRegions);
    console.log('Seeded Kenya regions successfully');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding regions:', error);
    process.exit(1);
  }
}

seedRegions();
