require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../database/connection');

const viewCarousels = async () => {
  try {
    // Connect to database
    await connectDB();

    // Load Banner model after connection
    const Banner = require('../models/Banner');

    console.log('🔄 Fetching all banners/carousels...\n');
    
    const carousels = await Banner.find({})
      .sort({ order: 1 })
      .select('-__v');
    
    console.log(`Found ${carousels.length} banner(s):\n`);
    carousels.forEach((carousel, index) => {
      console.log(`${index + 1}. ${carousel.title}`);
      console.log(`   ID: ${carousel.id || carousel._id}`);
      console.log(`   Order: ${carousel.order}`);
      console.log(`   Image: ${carousel.imgUrl}`);
      console.log(`   Button: ${carousel.buttonText} -> ${carousel.buttonLink}`);
      console.log(`   Description: ${carousel.description}`);
      console.log(`   Active: ${carousel.isActive}\n`);
    });
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fetching carousels:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

viewCarousels();
