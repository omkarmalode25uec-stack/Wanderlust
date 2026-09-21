const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {
        allListings
    });
};

module.exports.rendernewform = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Bad request!");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    } else if (!newListing.image || !newListing.image.url) {
        newListing.image = {
            url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        };
    }

    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
};