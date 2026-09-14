const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    image: {
        filename: {
            type: String
        },
        url: {
            type: String
        }
    },

    price: {
        type: Number
    },

    location: {
        type: String
    },

    country: {
        type: String
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"

    }
});
listingSchema.post("findOneAndDelete", async (Listing) => {
    if (listing)
         { await Review.deleteMany({ reviews: { $in: Listing.reviews } })
 }
});
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;