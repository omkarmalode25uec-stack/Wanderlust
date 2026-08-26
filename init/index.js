const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
}

const initDB = async () => {
    await Listing.deleteMany({});
    console.log("Old data deleted");

    await Listing.insertMany(initData.data);
    console.log("Data was initialized successfully!");
};

main()
    .then(initDB)
    .then(() => {
        console.log("Closing database connection...");
        return mongoose.connection.close();
    })
    .catch((err) => {
        console.log("ERROR:", err);
    });