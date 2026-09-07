const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); 


const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed error:", err.message);
    // Rethrow the error so that server.js knows the initialization failed
    throw err; 
  }
}

// Named export at the end
module.exports = { connectDB };
