const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");

const wrapAsync = require("../utils/wrapasync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn ,isOwner} = require("../views/users/middlewares.js");


// ================= NEW ROUTE =================
// GET /listings/new

router.get("/new", isLoggedIn, (req, res) => {

    res.render("listings/new.ejs");

});


// ================= INDEX ROUTE =================
// GET /listings

router.get("/", wrapAsync(async (req, res) => {

    const allListings = await Listing.find({});

    res.render("listings/index.ejs", {
        allListings
    });

}));


// ================= CREATE LISTING ROUTE =================
// POST /listings

router.post("/", isLoggedIn,isOwner, wrapAsync(async (req, res) => {

    if (!req.body.listing) {
        throw new ExpressError(400, "Bad request!");
    }

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New listing created!");

    res.redirect("/listings");

}));


// ================= SHOW ROUTE =================
// GET /listings/:id

router.get("/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page not found");
    }

    const listing = await Listing.findById(id)
        .populate("owner")
        .populate("reviews");

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", {
        listing
    });

}));


// ================= EDIT ROUTE =================
// GET /listings/:id/edit

router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", {
        listing
    });

}));


// ================= UPDATE ROUTE =================
// PUT /listings/:id

router.put("/:id", isLoggedIn,isOwner,wrapAsync(async (req, res) => {

    const { id } = req.params;
    listing = await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        {
            runValidators: true
        }
    );

    req.flash("success", "Listing updated!");

    res.redirect(`/listings/${id}`);

}));


// ================= DELETE ROUTE =================
// DELETE /listings/:id

router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {

    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing deleted!");

    res.redirect("/listings");

}));


module.exports = router;