const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");

const wrapAsync = require("./utils/wrapasync.js");
const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(methodoverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

// Database connection
main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}


// ================= ROUTES =================

// ROOT
app.get("/", (req, res) => {
    res.send("hi i am root");
});


// NEW ROUTE
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


// INDEX ROUTE
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));


// CREATE ROUTE
app.post("/listings", wrapAsync(async (req, res) => {
    const newlisting = new Listing(req.body.listing);
    if(!req.body.listing){
        throw new ExpressError(400,"bad request!");
    }
    await newlisting.save();

    res.redirect("/listings");
}));


app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page not found");
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Page not found");
    }

    res.render("listings/show.ejs", { listing });
}));

// EDIT ROUTE
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });
}));


// UPDATE ROUTE
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { runValidators: true }
    );

    res.redirect(`/listings/${id}`);
}));


// DELETE ROUTE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");
}));



// Express 5
app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});



app.use((err, req, res, next) => {

    let {
        statusCode = 500,
        message = "Something went wrong!"
    } = err;

    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("server working!!");
});