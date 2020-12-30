const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.newReview));
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;