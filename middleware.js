const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const campGround = require("./model/campground");
const Review = require("./model/reviews");

const isLoggedIn = function (req, res, next) {


    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login first!");
        res.redirect("/login");
    } else
        next();
}

const validateCamp = function (req, res, next) {
    const result = campgroundSchema.validate(req.body);

    if (result.error) {
        const msg = result.error.details.map(function (ele) { return ele.message }).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

const isCampAuthor = async function (req, res, next) {
    const { id } = req.params;
    const foundCamp = await campGround.findById(id);
    if (!foundCamp.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized to do that!");
        res.redirect(`/campgrounds/${id}`);
    } else
        next();
}

const validateReview = function (req, res, next) {
    const result = reviewSchema.validate(req.body);

    if (result.error) {
        const msg = result.error.details.map(function (ele) { return ele.message }).join(",");
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}

const isReviewAuthor = async function (req, res, next) {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized to do that!");
        res.redirect(`/campgrounds/${id}`);
    } else
        next();
}

module.exports.isLoggedIn = isLoggedIn;
module.exports.validateCamp = validateCamp;
module.exports.isCampAuthor = isCampAuthor;
module.exports.validateReview = validateReview;
module.exports.isReviewAuthor = isReviewAuthor;