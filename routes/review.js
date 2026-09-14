const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapasync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn } = require("../views/users/middlewares.js");

// ================= CREATE REVIEW =================

router.post("/:id/reviews", isLoggedIn, wrapAsync(async (req, res) => {

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);

    // Save the logged-in user's ID as the review author
    newReview.author = req.user._id;

    await newReview.save();

    listing.reviews.push(newReview._id);

    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

module.exports = router;