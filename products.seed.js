import mongoose from "mongoose";
import "dotenv/config";
import connectDB from "../config/database.js";
import Product from "../models/Product.js";

const seedProducts = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});

    const products = [
      {
        name: "Wireless Headphones",
        description: "Premium noise-cancelling wireless headphones with 30-hour battery",
        price: 2999,
        discountPrice: 2499,
        image: "https://via.placeholder.com/300x300?text=Headphones",
        images: [],
        category: "Electronics",
        stock: 50,
        rating: 4.5,
        reviews: [],
        numReviews: 0,
      },
      {
        name: "Smart Watch",
        description: "Feature-rich smartwatch with health monitoring and notifications",
        price: 4999,
        discountPrice: 3999,
        image: "https://via.placeholder.com/300x300?text=SmartWatch",
        images: [],
        category: "Electronics",
        stock: 30,
        rating: 4.2,
        reviews: [],
        numReviews: 0,
      },
      {
        name: "Portable Charger",
        description: "20000mAh portable charger with fast charging support",
        price: 1499,
        discountPrice: 999,
        image: "https://via.placeholder.com/300x300?text=Charger",
        images: [],
        category: "Electronics",
        stock: 100,
        rating: 4.7,
        reviews: [],
        numReviews: 0,
      },
      {
        name: "USB-C Cable",
        description: "Fast charging USB-C cable - 2 pack",
        price: 599,
        discountPrice: 399,
        image: "https://via.placeholder.com/300x300?text=Cable",
        images: [],
        category: "Electronics",
        stock: 200,
        rating: 4.3,
        reviews: [],
        numReviews: 0,
      },
      {
        name: "Laptop Stand",
        description: "Adjustable aluminum laptop stand for better ergonomics",
        price: 2499,
        discountPrice: 1899,
        image: "https://via.placeholder.com/300x300?text=LaptopStand",
        images: [],
        category: "Electronics",
        stock: 40,
        rating: 4.6,
        reviews: [],
        numReviews: 0,
      },
      {
        name: "Wireless Keyboard",
        description: "Mechanical wireless keyboard with RGB lighting",
        price: 3999,
        discountPrice: 2999,
        image: "https://via.placeholder.com/300x300?text=Keyboard",
        images: [],
        category: "Electronics",
        stock: 35,
        rating: 4.4,
        reviews: [],
        numReviews: 0,
      },
      {
        name: "4K Webcam",
        description: "Professional 4K webcam with auto-focus and noise cancellation",
        price: 5999,
        discountPrice: 4499,
        image: "https://via.placeholder.com/300x300?text=Webcam",
        images: [],
        category: "Electronics",
        stock: 25,
        rating: 4.8,
        reviews: [],
        numReviews: 0,
      },
      {
        name: "USB Hub",
        description: "7-port USB 3.0 hub with individual switches",
        price: 1999,
        discountPrice: 1299,
        image: "https://via.placeholder.com/300x300?text=USBHub",
        images: [],
        category: "Electronics",
        stock: 60,
        rating: 4.5,
        reviews: [],
        numReviews: 0,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✓ ${createdProducts.length} products seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error("✗ Seeding Error:", error.message);
    process.exit(1);
  }
};

seedProducts();
