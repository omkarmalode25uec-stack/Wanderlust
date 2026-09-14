const listing = require("../../models/listing");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirecturl=req.originalUrl;
            req.flash("error", "You must be logged in to create a listing.");
            return res.redirect("/login");
        }
    next();
    }
    module.exports.saveRedirect=(req,res,next)=>{
        if(req.session.redirecturl){
            res.locals.redirecturl=req.session.redirecturl;
        }
        next();
    }
    module.exports.isOwner=async(req,res,next)=>{
        let listing=await Listing.findById(req.params.id);
        if(!listing.owner.equals(req.user._id)){
            req.flash("error", "You do not have permission to do that!");
            return res.redirect(`/listings/${req.params.id}`);
        }
        next();

    }