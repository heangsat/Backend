import mongoose from 'mongoose';
import 'dotenv/config';
import productItem from './models/product.js';

const MONG_URL = process.env.MONGODB_URI;
// IMPORTANT: This must match your Express server's port
const BASE_URL = 'http://localhost:4000/uploads';

const products = [
  {
    name: "iPhone 16 Pro Max",
    price: 1299,
    description: "The ultimate iPhone with Titanium design and A18 Pro chip.",
    category: "Electronics",
    image: `${BASE_URL}/iphone16.jpg`,
    available: true
  },
  {
    name: "Premium Coffee Cup",
    price: 15,
    description: "High-quality ceramic cup for your daily brew.",
    category: "Home & Living",
    image: `${BASE_URL}/coffee.jpg`,
    available: true
  },
  {
    name: "Smart LED TV 4K",
    price: 499,
    description: "Experience cinematic colors with this 55-inch Smart TV.",
    category: "Electronics",
    image: `${BASE_URL}/tv.jpg`,
    available: true
  },
  {
    name: "Abstract Art Print",
    price: 35,
    description: "Modern abstract animation art for your wall decor.",
    category: "Home & Living",
    image: `${BASE_URL}/art.jpg`,
    available: true
  },
  // Keeping a few external ones just for variety if needed, or remove them.
  // I will stick to the local ones for now to prove it works.
];

async function seedDB() {
  try {
    await mongoose.connect(MONG_URL);
    console.log('Connected to MongoDB');

    // Optional: Clear existing products to avoid duplicates
    await productItem.deleteMany({}); 
    console.log('Cleared existing products');

    await productItem.insertMany(products);
    console.log(`Successfully added ${products.length} products with LOCAL images`);

    mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();