const Review = require("../model/reviews");
const campGround = require("../model/campground");

module.exports.newReview = async function (req, res, next) {
    const { body, rating } = req.body;
    const { id } = req.params;
    const review = new Review({ body, rating });
    const campground = await campGround.findById(id);
    campground.reviews.push(review);
    review.author = req.user._id;
    await campground.save();
    await review.save();
    req.flash("success", "Successfully added review!");
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async function (req, res, next) {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await campGround.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", "Successfully deleted a review");
    res.redirect(`/campgrounds/${id}`);
};