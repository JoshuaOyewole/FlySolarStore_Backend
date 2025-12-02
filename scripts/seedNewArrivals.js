require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../database/connection');

const newArrivalsProducts = [
  {
    id: "8ac53dd8-6418-454f-0012",
    sku: "NA-DIFFUSER-001",
    title: "Aroma Diffuser",
    slug: "aroma-diffuser",
    brand: null,
    price: 199,
    size: null,
    colors: [],
    discount: 6,
    thumbnail: "/assets/images/market-1/product-10.png",
    images: [
      "/assets/images/market-1/product-10.png",
      "/assets/images/market-1/product-10.png"
    ],
    categories: ["Home & Kitchen"],
    status: null,
    reviews: [],
    stock: 55,
    rating: 4.3,
    for: {
      demo: "market-1",
      type: "new-arrivals"
    },
    isFeatured: false,
    isNewArrival: true,
    isFlashDeal: false,
    views: 850,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0013",
    sku: "NA-BACKPACK-001",
    title: "Modern Gray Backpack",
    slug: "modern-gray-backpack",
    brand: null,
    price: 122,
    size: null,
    colors: [],
    discount: 9,
    thumbnail: "/assets/images/market-1/product-11.png",
    images: [
      "/assets/images/market-1/product-11.png",
      "/assets/images/market-1/product-11.png"
    ],
    categories: ["Bags"],
    status: null,
    reviews: [],
    stock: 70,
    rating: 4.5,
    for: {
      demo: "market-1",
      type: "new-arrivals"
    },
    isFeatured: false,
    isNewArrival: true,
    isFlashDeal: false,
    views: 1200,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0014",
    sku: "NA-WATCH-001",
    title: "Smartwatch with Pink Strap",
    slug: "smartwatch-with-pink-strap",
    brand: null,
    price: 255,
    size: null,
    colors: [],
    discount: 10,
    thumbnail: "/assets/images/market-1/product-12.png",
    images: [
      "/assets/images/market-1/product-12.png",
      "/assets/images/market-1/product-12.png"
    ],
    categories: ["Watches"],
    status: null,
    reviews: [],
    stock: 40,
    rating: 4.6,
    for: {
      demo: "market-1",
      type: "new-arrivals"
    },
    isFeatured: false,
    isNewArrival: true,
    isFlashDeal: false,
    views: 1580,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0015",
    sku: "NA-SPEAKER-001",
    title: "JBL Portable Speaker",
    slug: "jbl-portable-speaker",
    brand: null,
    price: 109,
    size: null,
    colors: [],
    discount: 5,
    thumbnail: "/assets/images/market-1/product-13.png",
    images: [
      "/assets/images/market-1/product-13.png",
      "/assets/images/market-1/product-13.png"
    ],
    categories: ["Speakers"],
    status: null,
    reviews: [],
    stock: 85,
    rating: 4.4,
    for: {
      demo: "market-1",
      type: "new-arrivals"
    },
    isFeatured: false,
    isNewArrival: true,
    isFlashDeal: false,
    views: 980,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0016",
    sku: "NA-GAMING-001",
    title: "Xbox 360 Gaming Console",
    slug: "xbox-360-gaming-console",
    brand: null,
    price: 181,
    size: null,
    colors: [],
    discount: 5,
    thumbnail: "/assets/images/market-1/product-14.png",
    images: [
      "/assets/images/market-1/product-14.png",
      "/assets/images/market-1/product-14.png"
    ],
    categories: ["Gaming"],
    status: null,
    reviews: [],
    stock: 25,
    rating: 4.7,
    for: {
      demo: "market-1",
      type: "new-arrivals"
    },
    isFeatured: false,
    isNewArrival: true,
    isFlashDeal: false,
    views: 2100,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0017",
    sku: "NA-WATCH-002",
    title: "His & Hers Smartwatches",
    slug: "his-hers-smartwatches",
    brand: null,
    price: 154,
    size: null,
    colors: [],
    discount: 9,
    thumbnail: "/assets/images/market-1/product-15.png",
    images: [
      "/assets/images/market-1/product-15.png",
      "/assets/images/market-1/product-15.png"
    ],
    categories: ["Watches"],
    status: null,
    reviews: [],
    stock: 50,
    rating: 4.5,
    for: {
      demo: "market-1",
      type: "new-arrivals"
    },
    isFeatured: false,
    isNewArrival: true,
    isFlashDeal: false,
    views: 1450,
    isActive: true
  }
];

const seedNewArrivals = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🔄 Starting "New Arrivals" products seeding process...');
    
    // Direct collection access
    const productsCollection = mongoose.connection.db.collection('products');
    
    // Check if new-arrivals products already exist
    const existingCount = await productsCollection.countDocuments({ 
      'for.type': 'new-arrivals'
    });
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing "new-arrivals" products.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Do you want to delete existing "new-arrivals" products and re-seed? (yes/no): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() === 'yes') {
        console.log('🗑️  Deleting existing "new-arrivals" products...');
        const deleteResult = await productsCollection.deleteMany({ 
          'for.type': 'new-arrivals'
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} products`);
      } else {
        console.log('❌ Seeding cancelled.');
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    console.log('📝 Inserting "New Arrivals" products...');
    
    // Prepare documents with timestamps
    const documentsToInsert = newArrivalsProducts.map(product => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert all products
    const result = await productsCollection.insertMany(documentsToInsert);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} "New Arrivals" products!`);
    
    // Verify insertion
    const insertedProducts = await productsCollection.find({ 
      'for.type': 'new-arrivals'
    }).toArray();
    
    console.log('\n📊 Inserted Products Summary:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price} (${product.discount}% off) - Stock: ${product.stock}`);
    });
    
    console.log('\n✅ "New Arrivals" products seeding completed successfully!');
    console.log('🔗 Access the products via: GET /api/products/new-arrivals');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding "New Arrivals" products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedNewArrivals();
