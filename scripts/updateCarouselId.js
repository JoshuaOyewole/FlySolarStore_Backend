require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../database/connection');

const updateCarouselId = async () => {
  try {
    // Connect to database
    await connectDB();

    // Load Banner model after connection
    const Banner = require('../models/Banner');

    console.log('🔄 Updating carousel id field...');
    
    // Find the carousel without an id field and update it using collection method
    const bannersWithoutId = await Banner.find({ id: { $exists: false } });
    
    let updatedCount = 0;
    for (const banner of bannersWithoutId) {
      await Banner.collection.updateOne(
        { _id: banner._id },
        { $set: { id: banner._id.toString() } }
      );
      updatedCount++;
    }
    
    const result = { modifiedCount: updatedCount };
    
    console.log('✅ Updated carousels:', result.modifiedCount);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating carousel:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

updateCarouselId();
