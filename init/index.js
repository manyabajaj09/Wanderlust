const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const mongoURL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  try {
    await mongoose.connect(mongoURL);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.log("❌ MongoDB Connection Error:", err);
  }
}

main();

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("🌱 Database seeded with initial listings!");
  } catch (err) {
    console.log("❌ Error seeding database:", err);
  } finally {
    mongoose.connection.close(); // ✅ Always close the connection when done
  }
};

initDB();
