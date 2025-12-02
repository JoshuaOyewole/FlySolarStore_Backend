require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../database/connection');

const featuredGridProducts = [
  {
    id: "8ac53dd8-6418-454f-0018",
    sku: "GRID-CAMERA-001",
    title: "Professional DSLR Camera",
    slug: "professional-dslr-camera",
    brand: null,
    price: 899,
    size: null,
    colors: [],
    discount: 12,
    thumbnail: "/assets/images/market-1/product-16.png",
    images: [
      "/assets/images/market-1/product-16.png",
      "/assets/images/market-1/product-16.png"
    ],
    categories: ["Cameras", "Electronics"],
    status: null,
    reviews: [],
    stock: 20,
    rating: 4.8,
    for: {
      demo: "market-1",
      type: "featured-grid"
    },
    isFeatured: true,
    isNewArrival: false,
    isFlashDeal: false,
    views: 3200,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0019",
    sku: "GRID-LAPTOP-001",
    title: "Ultra-Slim Laptop 15.6 inch",
    slug: "ultra-slim-laptop-15-6-inch",
    brand: null,
    price: 1299,
    size: null,
    colors: ["Silver", "Space Gray"],
    discount: 8,
    thumbnail: "/assets/images/market-1/product-17.png",
    images: [
      "/assets/images/market-1/product-17.png",
      "/assets/images/market-1/product-17.png"
    ],
    categories: ["Laptops", "Computers"],
    status: null,
    reviews: [],
    stock: 15,
    rating: 4.7,
    for: {
      demo: "market-1",
      type: "featured-grid"
    },
    isFeatured: true,
    isNewArrival: false,
    isFlashDeal: false,
    views: 2850,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0020",
    sku: "GRID-TABLET-001",
    title: "Android Tablet 10 inch",
    slug: "android-tablet-10-inch",
    brand: null,
    price: 399,
    size: null,
    colors: ["Black", "White"],
    discount: 15,
    thumbnail: "/assets/images/market-1/product-18.png",
    images: [
      "/assets/images/market-1/product-18.png",
      "/assets/images/market-1/product-18.png"
    ],
    categories: ["Tablets", "Electronics"],
    status: null,
    reviews: [],
    stock: 45,
    rating: 4.5,
    for: {
      demo: "market-1",
      type: "featured-grid"
    },
    isFeatured: true,
    isNewArrival: false,
    isFlashDeal: false,
    views: 2100,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0021",
    sku: "GRID-DRONE-001",
    title: "4K HD Drone with Camera",
    slug: "4k-hd-drone-with-camera",
    brand: null,
    price: 599,
    size: null,
    colors: [],
    discount: 10,
    thumbnail: "/assets/images/market-1/product-19.png",
    images: [
      "/assets/images/market-1/product-19.png",
      "/assets/images/market-1/product-19.png"
    ],
    categories: ["Drones", "Cameras"],
    status: null,
    reviews: [],
    stock: 12,
    rating: 4.6,
    for: {
      demo: "market-1",
      type: "featured-grid"
    },
    isFeatured: true,
    isNewArrival: false,
    isFlashDeal: false,
    views: 1950,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0022",
    sku: "GRID-KEYBOARD-001",
    title: "Mechanical Gaming Keyboard RGB",
    slug: "mechanical-gaming-keyboard-rgb",
    brand: null,
    price: 129,
    size: null,
    colors: ["Black"],
    discount: 20,
    thumbnail: "/assets/images/market-1/product-20.png",
    images: [
      "/assets/images/market-1/product-20.png",
      "/assets/images/market-1/product-20.png"
    ],
    categories: ["Gaming", "Accessories"],
    status: null,
    reviews: [],
    stock: 60,
    rating: 4.7,
    for: {
      demo: "market-1",
      type: "featured-grid"
    },
    isFeatured: true,
    isNewArrival: false,
    isFlashDeal: false,
    views: 2600,
    isActive: true
  },
  {
    id: "8ac53dd8-6418-454f-0023",
    sku: "GRID-MOUSE-001",
    title: "Wireless Gaming Mouse",
    slug: "wireless-gaming-mouse",
    brand: null,
    price: 79,
    size: null,
    colors: ["Black", "White"],
    discount: 18,
    thumbnail: "/assets/images/market-1/product-21.png",
    images: [
      "/assets/images/market-1/product-21.png",
      "/assets/images/market-1/product-21.png"
    ],
    categories: ["Gaming", "Accessories"],
    status: null,
    reviews: [],
    stock: 95,
    rating: 4.4,
    for: {
      demo: "market-1",
      type: "featured-grid"
    },
    isFeatured: true,
    isNewArrival: false,
    isFlashDeal: false,
    views: 1800,
    isActive: true
  }
];

const seedFeaturedGrid = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🔄 Starting "Featured Grid" products seeding process...');
    
    // Direct collection access
    const productsCollection = mongoose.connection.db.collection('products');
    
    // Check if featured-grid products already exist
    const existingCount = await productsCollection.countDocuments({ 
      'for.type': 'featured-grid'
    });
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing "featured-grid" products.`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Do you want to delete existing "featured-grid" products and re-seed? (yes/no): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() === 'yes') {
        console.log('🗑️  Deleting existing "featured-grid" products...');
        const deleteResult = await productsCollection.deleteMany({ 
          'for.type': 'featured-grid'
        });
        console.log(`✅ Deleted ${deleteResult.deletedCount} products`);
      } else {
        console.log('❌ Seeding cancelled.');
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    console.log('📝 Inserting "Featured Grid" products...');
    
    // Prepare documents with timestamps
    const documentsToInsert = featuredGridProducts.map(product => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert all products
    const result = await productsCollection.insertMany(documentsToInsert);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} "Featured Grid" products!`);
    
    // Verify insertion
    const insertedProducts = await productsCollection.find({ 
      'for.type': 'featured-grid'
    }).toArray();
    
    console.log('\n📊 Inserted Products Summary:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price} (${product.discount}% off) - Stock: ${product.stock}`);
    });
    
    console.log('\n✅ "Featured Grid" products seeding completed successfully!');
    console.log('🔗 Access the products via: GET /api/products/featured-grid');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding "Featured Grid" products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedFeaturedGrid();
