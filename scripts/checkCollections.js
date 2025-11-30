require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../database/connection');

const checkCollections = async () => {
  try {
    // Connect to database
    await connectDB();

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📋 Available collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Check if banners collection exists and count documents
    console.log('\n🔍 Checking banners collection...');
    const bannersCollection = mongoose.connection.db.collection('banners');
    const count = await bannersCollection.countDocuments();
    console.log(`   Documents in banners collection: ${count}`);
    
    if (count > 0) {
      const docs = await bannersCollection.find({}).toArray();
      console.log('\n📄 Documents:');
      docs.forEach((doc, i) => {
        console.log(`\n${i + 1}.`, doc);
      });
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

checkCollections();
