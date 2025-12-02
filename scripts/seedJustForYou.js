require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../database/connection');

const justForYouProducts = [
  {
    id: "8ac53dd8-6418-454f-0007",
    sku: "JFY-SPEAKER-001",
    title: "Geometric Bookshelf Speaker",
    slug: "geometric-bookshelf-speaker",
    brand: null,
    price: 150,
    size: null,
    colors: [],
    discount: 8,
    thumbnail: "/assets/images/market-1/product-5.png",
    images: [
      "/assets/images/market-1/product-5.png",
      "/assets/images/market-1/product-5.png"
    ],
    categories: ["Speakers"],
    status: null,
    reviews: [],
    stock: 45,
    rating: 4.4,
    for: {
      demo: "market-1",
      type: "just-for-you"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: false,
    views: 2100,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0008",
    sku: "JFY-SPEAKER-002",
    title: "Modern Speaker Set",
    slug: "modern-speaker-set",
    brand: null,
    price: 250,
    size: null,
    colors: [],
    discount: 8,
    thumbnail: "/assets/images/market-1/product-6.png",
    images: [
      "/assets/images/market-1/product-6.png",
      "/assets/images/market-1/product-6.png"
    ],
    categories: ["Speakers"],
    status: null,
    reviews: [],
    stock: 30,
    rating: 4.6,
    for: {
      demo: "market-1",
      type: "just-for-you"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: false,
    views: 1850,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0009",
    sku: "JFY-SPEAKER-003",
    title: "Portable Bluetooth Speaker",
    slug: "portable-bluetooth-speaker",
    brand: null,
    price: 350,
    size: null,
    colors: [],
    discount: 10,
    thumbnail: "/assets/images/market-1/product-7.png",
    images: [
      "/assets/images/market-1/product-7.png",
      "/assets/images/market-1/product-7.png"
    ],
    categories: ["Speakers"],
    status: null,
    reviews: [],
    stock: 65,
    rating: 4.7,
    for: {
      demo: "market-1",
      type: "just-for-you"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: false,
    views: 2450,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0010",
    sku: "JFY-ACCESSORY-001",
    title: "Replacement Earpad Cushion",
    slug: "replacement-earpad-cushion",
    brand: null,
    price: 15,
    size: null,
    colors: [],
    discount: 5,
    thumbnail: "/assets/images/market-1/product-8.png",
    images: [
      "/assets/images/market-1/product-8.png",
      "/assets/images/market-1/product-8.png"
    ],
    categories: ["Accessories"],
    status: null,
    reviews: [],
    stock: 150,
    rating: 4.2,
    for: {
      demo: "market-1",
      type: "just-for-you"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: false,
    views: 980,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0011",
    sku: "JFY-BAG-001",
    title: "Modern Travel Bag",
    slug: "modern-travel-bag",
    brand: null,
    price: 55,
    size: null,
    colors: [],
    discount: 7,
    thumbnail: "/assets/images/market-1/product-9.png",
    images: [
      "/assets/images/market-1/product-9.png",
      "/assets/images/market-1/product-9.png"
    ],
    categories: ["Bags"],
    status: null,
    reviews: [],
    stock: 80,
    rating: 4.5,
    for: {
      demo: "market-1",
      type: "just-for-you"
    },
    isFeatured: false,
    isNewArrival: false,
    isFlashDeal: false,
    views: 1650,
    isActive: true
  }
];

const seedJustForYou = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🔄 Starting "Just for You" products seeding process...');
    
    // Direct collection access
    const productsCollection = mongoose.connection.db.collection('products');
    
    // Check if just-for-you products already exist
    const existingCount = await productsCollection.countDocuments({ 
      'for.type': 'just-for-you'
    });
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing "just-for-you" products.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Do you want to delete existing "just-for-you" products and re-seed? (yes/no): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() === 'yes') {
        console.log('🗑️  Deleting existing "just-for-you" products...');
        const deleteResult = await productsCollection.deleteMany({ 
          'for.type': 'just-for-you'
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} products`);
      } else {
        console.log('❌ Seeding cancelled.');
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    console.log('📝 Inserting "Just for You" products...');
    
    // Prepare documents with timestamps
    const documentsToInsert = justForYouProducts.map(product => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert all products
    const result = await productsCollection.insertMany(documentsToInsert);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} "Just for You" products!`);
    
    // Verify insertion
    const insertedProducts = await productsCollection.find({ 
      'for.type': 'just-for-you'
    }).toArray();
    
    console.log('\n📊 Inserted Products Summary:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price} (${product.discount}% off) - Stock: ${product.stock}`);
    });
    
    console.log('\n✅ "Just for You" products seeding completed successfully!');
    console.log('🔗 Access the products via: GET /api/products/just-for-you');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding "Just for You" products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedJustForYou();
