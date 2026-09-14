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

    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: new mongoose.Types.ObjectId("6aa4469ea5072d2379af861d")
    }));

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