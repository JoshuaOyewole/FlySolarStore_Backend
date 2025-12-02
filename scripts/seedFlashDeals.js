require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../database/connection');

const flashDealsProducts = [
  {
    id: "8ac53dd8-6418-454f-0001",
    sku: "FD-HEADPHONE-001",
    title: "Wireless Over-Ear Headphones",
    slug: "wireless-over-ear-headphones",
    brand: null,
    price: 250,
    size: null,
    colors: [],
    discount: 25,
    thumbnail: "/assets/images/market-1/product-1.png",
    images: [
      "/assets/images/market-1/product-1.png",
      "/assets/images/market-1/product-1.png"
    ],
    categories: ["Headphones"],
    status: null,
    reviews: [],
    stock: 50,
    rating: 4.5,
    for: {
      demo: "market-1",
      type: "flash-deals"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: true,
    flashDealEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    views: 1250,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0002",
    sku: "FD-EARBUDS-001",
    title: "True Wireless Earbuds",
    slug: "true-wireless-earbuds-1",
    brand: null,
    price: 350,
    size: null,
    colors: [],
    discount: 15,
    thumbnail: "/assets/images/market-1/product-2.png",
    images: [
      "/assets/images/market-1/product-2.png",
      "/assets/images/market-1/product-2.png"
    ],
    categories: ["Earbuds"],
    status: null,
    reviews: [],
    stock: 75,
    rating: 4.7,
    for: {
      demo: "market-1",
      type: "flash-deals"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: true,
    flashDealEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    views: 980,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0003",
    sku: "FD-SPEAKER-001",
    title: "Smart Home Speaker",
    slug: "smart-home-speaker",
    brand: null,
    price: 150,
    size: null,
    colors: [],
    discount: 28,
    thumbnail: "/assets/images/market-1/product-3.png",
    images: [
      "/assets/images/market-1/product-3.png",
      "/assets/images/market-1/product-3.png"
    ],
    categories: ["Speakers"],
    status: null,
    reviews: [],
    stock: 60,
    rating: 4.3,
    for: {
      demo: "market-1",
      type: "flash-deals"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: true,
    flashDealEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    views: 1450,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0004",
    sku: "FD-EARBUDS-002",
    title: "Beige Wireless Earbuds",
    slug: "beige-wireless-earbuds",
    brand: null,
    price: 180,
    size: null,
    colors: [],
    discount: 21,
    thumbnail: "/assets/images/market-1/product-4.png",
    images: [
      "/assets/images/market-1/product-4.png",
      "/assets/images/market-1/product-4.png"
    ],
    categories: ["Earbuds"],
    status: null,
    reviews: [],
    stock: 40,
    rating: 4.2,
    for: {
      demo: "market-1",
      type: "flash-deals"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: true,
    flashDealEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    views: 820,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0005",
    sku: "FD-HEADPHONE-002",
    title: "Wireless Over-Ear Headphones",
    slug: "wireless-over-ear-headphones-2",
    brand: null,
    price: 250,
    size: null,
    colors: [],
    discount: 25,
    thumbnail: "/assets/images/market-1/product-1.png",
    images: [
      "/assets/images/market-1/product-1.png",
      "/assets/images/market-1/product-1.png"
    ],
    categories: ["Headphones"],
    status: null,
    reviews: [],
    stock: 35,
    rating: 4.6,
    for: {
      demo: "market-1",
      type: "flash-deals"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: true,
    flashDealEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    views: 1100,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0006",
    sku: "FD-EARBUDS-003",
    title: "True Wireless Earbuds",
    slug: "true-wireless-earbuds-2",
    brand: null,
    price: 350,
    size: null,
    colors: [],
    discount: 15,
    thumbnail: "/assets/images/market-1/product-2.png",
    images: [
      "/assets/images/market-1/product-2.png",
      "/assets/images/market-1/product-2.png"
    ],
    categories: ["Earbuds"],
    status: null,
    reviews: [],
    stock: 90,
    rating: 4.8,
    for: {
      demo: "market-1",
      type: "flash-deals"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: true,
    flashDealEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    views: 1560,
    isActive: true
  }
];

const seedFlashDeals = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🔄 Starting flash deals seeding process...');
    
    // Direct collection access
    const productsCollection = mongoose.connection.db.collection('products');
    
    // Check if flash deals already exist
    const existingCount = await productsCollection.countDocuments({ 
      isFlashDeal: true,
      'for.type': 'flash-deals'
    });
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing flash deals products.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Do you want to delete existing flash deals and re-seed? (yes/no): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() === 'yes') {
        console.log('🗑️  Deleting existing flash deals...');
        const deleteResult = await productsCollection.deleteMany({ 
          isFlashDeal: true,
          'for.type': 'flash-deals'
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} products`);
      } else {
        console.log('❌ Seeding cancelled.');
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    console.log('📝 Inserting flash deals products...');
    
    // Prepare documents with timestamps
    const documentsToInsert = flashDealsProducts.map(product => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert all products
    const result = await productsCollection.insertMany(documentsToInsert);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} flash deals products!`);
    
    // Verify insertion
    const insertedProducts = await productsCollection.find({ 
      isFlashDeal: true,
      'for.type': 'flash-deals'
    }).toArray();
    
    console.log('\n📊 Inserted Products Summary:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price} (${product.discount}% off) - Stock: ${product.stock}`);
    });
    
    console.log('\n✅ Flash deals seeding completed successfully!');
    console.log('🔗 Access the flash deals via: GET /api/products/flash-deals');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding flash deals:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedFlashDeals();
