if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// ================= DNS FIX FOR MONGODB ATLAS =================

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

// IMPORTS 

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

// Passport Local Strategy
const LocalStrategy = require("passport-local").Strategy;

// Routers and Models
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const UserRouter = require("./routes/user.js");
const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

//  CLOUDINARY 

const { storage } = require("./cloudconfig.js");

//  DATABASE 

const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
    console.error("❌ ATLASDB_URL is missing from .env");
    process.exit(1);
}

//  VIEW ENGINE 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

//  MIDDLEWARE 

app.use(methodOverride("_method"));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, "public")));

// SESSION 
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SESSION_SECRET || "this is a secret"
    }
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store: store, // Fixed: Added the store here so sessions are saved to MongoDB
    secret: process.env.SESSION_SECRET || "this is a secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));

app.use(flash());

// PASSPORT 

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASH + CURRENT USER 

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    res.locals.currentUser = req.user;
    res.locals.currUser = req.user;

    next();
});

//  ROOT 

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// DEMO USER 

app.get("/demouser", async (req, res) => {
    try {
        const fakeUser = new User({
            email: "student@gmail.com",
            username: "delta-student"
        });

        const registeredUser = await User.register(
            fakeUser,
            "student"
        );

        res.send(registeredUser);

    } catch (err) {
        res.send(err);
    }
});

//  ROUTERS 

app.use("/", UserRouter);

app.use("/listings", listingRouter);

app.use("/listings", reviewRouter);

// ================= 404 ERROR =================

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// ERROR HANDLER 

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).render("error.ejs", {
        err
    });
});

//  DATABASE + SERVER 
async function startServer() {

    try {

        console.log("Connecting to MongoDB Atlas...");

        await mongoose.connect(dbUrl);

        console.log("✅ Connected to MongoDB Atlas");

        const PORT = process.env.PORT || 8080;

        app.listen(PORT, () => {
            console.log(`🚀 Server working on port ${PORT}`);
        });

    } catch (err) {

        console.error("❌ MongoDB connection failed:");
        console.error(err);

        process.exit(1);
    }
}

startServer();