const mongoose = require("mongoose");

let isConnected = false;

async function connectDb(mongoUri) {
  if (isConnected) return;
  try {
    if (!mongoUri) {
      console.warn("⚠ MongoDB disabled: MONGO_URI not set");
      return;
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUri, {
      autoIndex: true
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.warn("⚠ Backend will continue running without database");
  }
}

module.exports = { connectDb };
