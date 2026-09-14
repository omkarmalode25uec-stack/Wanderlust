const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const localStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");
const flash = require("connect-flash");
const UserRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";


// ================= VIEW ENGINE =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);


// ================= MIDDLEWARE =================

app.use(methodoverride("_method"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));


// ================= DATABASE CONNECTION =================

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}


// ================= SESSION =================

const sessionOptions = {
    secret: "this is a secret",
    resave: false,
    saveUninitialized: true
};

app.use(session(sessionOptions));

app.use(flash());


// ================= PASSPORT =================

app.use(passport.initialize());

app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());


// ================= FLASH + CURRENT USER =================

app.use((req, res, next) => {

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    // Make logged-in user available to all EJS files
    res.locals.currentUser = req.user;
    res.locals.currUser = req.user;

    next();

});


// ================= ROOT =================

app.get("/", (req, res) => {

    res.send("hi i am root");

});


// ================= DEMO USER =================

app.get("/demouser", async (req, res) => {

    try {

        let fakeUser = new User({
            email: "student@gmail.com",
            username: "delta-student"
        });

        let registeredUser = await User.register(
            fakeUser,
            "student"
        );

        res.send(registeredUser);

    } catch (err) {

        res.send(err);

    }

});


// ================= USER ROUTER =================

app.use("/", UserRouter);


// ================= LISTING ROUTER =================

app.use("/listings", listingRouter);


// ================= REVIEW ROUTER =================

app.use("/listings", reviewRouter);


// ================= 404 ERROR =================

app.all("/{*splat}", (req, res, next) => {

    next(new ExpressError(404, "Page not found"));

});


// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {

    let { statusCode = 500 } = err;

    res.status(statusCode).render("error.ejs", {
        err
    });

});


// ================= SERVER =================

app.listen(8080, () => {

    console.log("server working!!");

});