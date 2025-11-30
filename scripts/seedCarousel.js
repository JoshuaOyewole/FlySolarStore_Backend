require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../database/connection');

const carouselData = {
  title: "50% Off For Your First Shopping",
  imgUrl: "/assets/images/market-1/airpod-1.png",
  buttonLink: "/products",
  buttonText: "Shop Now",
  description: "Get Free Shipping on all orders over $99.00",
  type: "hero", // Assuming this is a hero banner/carousel
  clickCount: 0,
};

const seedCarousel = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🔄 Checking if carousel already exists...');
    
    // Direct collection access
    const bannersCollection = mongoose.connection.db.collection('banners');
    
    // Check if banner with same title already exists
    const existingBanner = await bannersCollection.findOne({ title: carouselData.title });
    
    if (existingBanner) {
      console.log('⚠️  Carousel with this title already exists!');
      console.log('Existing banner:', existingBanner);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create document with all required fields
    const documentToInsert = {
      ...carouselData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 Inserting document:', documentToInsert);
    
    // Insert directly to collection
    const result = await bannersCollection.insertOne(documentToInsert);
    
    console.log('✅ Insert result:', result);
    
    // Verify insertion
    const insertedDoc = await bannersCollection.findOne({ _id: result.insertedId });
    
    console.log('✅ Carousel created successfully!');
    console.log('Created carousel:', insertedDoc);
    
    // Count total documents
    const count = await bannersCollection.countDocuments();
    console.log(`📊 Total banners in collection: ${count}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding carousel:', error);
    console.error('Stack:', error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedCarousel();
