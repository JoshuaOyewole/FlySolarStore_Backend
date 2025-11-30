/**
 * Test script for creating a hero banner via API
 * 
 * Prerequisites:
 * 1. Backend server must be running (npm run dev)
 * 2. You need a valid admin JWT token
 * 
 * To get an admin token:
 * - Login as admin via POST /api/auth/login
 * - Copy the token from the response
 * - Replace YOUR_ADMIN_TOKEN below
 */

const testCreateHeroBanner = async () => {
  const API_URL = 'http://localhost:5000/api/homepage/hero-banners';
  const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN'; // Replace with actual admin token

  const bannerData = {
    title: "Summer Sale - Up to 70% Off",
    imgUrl: "/assets/images/market-1/speaker-5.png",
    buttonLink: "/products/sale",
    buttonText: "Shop Sale",
    description: "Limited time offer - Grab your favorite items now!",
    backgroundColor: "#ffeb3b",
    textColor: "#333333",
    targetAudience: "all",
    order: 7,
    isActive: true,
    isCurrentlyActive: true
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(bannerData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Hero banner created successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Failed to create hero banner');
      console.error('Status:', response.status);
      console.error('Error:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

// For Node.js environment
if (typeof window === 'undefined') {
  testCreateHeroBanner();
}

// For browser console
if (typeof window !== 'undefined') {
  window.testCreateHeroBanner = testCreateHeroBanner;
  console.log('Run testCreateHeroBanner() to test the endpoint');
}
