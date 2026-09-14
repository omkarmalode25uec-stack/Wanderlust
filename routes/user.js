
const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport = require("passport");
const { saveRedirect } = require("../views/users/middlewares.js");


// ================= SIGNUP ROUTE =================

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});


router.post("/signup", saveRedirect, wrapasync(async (req, res, next) => {
    try {
        let { email, username, password } = req.body;

        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", "Welcome to Delta-Student");

            const redirectUrl = res.locals.redirecturl || "/listings";

            res.redirect(redirectUrl);
        });

    } catch (e) {
        console.log("SIGNUP ERROR:", e.message);

        req.flash("error", e.message);

        res.redirect("/signup");
    }
}));


// ================= LOGIN ROUTE =================

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});


router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {

        req.flash("success", "Welcome back!");

        const redirectUrl = res.locals.redirecturl || "/listings";

        res.redirect(redirectUrl);
    }
);


// ================= LOGOUT ROUTE =================

router.get("/logout", (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash("success", "Logged out successfully!");

        res.redirect("/listings");
    });

});


module.exports = router;

