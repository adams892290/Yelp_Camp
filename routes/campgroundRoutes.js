const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isCampAuthor, validateCamp } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCamp, catchAsync(campgrounds.newCampground));


router.get("/new", isLoggedIn, campgrounds.newCampgroundForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .patch(isLoggedIn, isCampAuthor, validateCamp, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isCampAuthor, catchAsync(campgrounds.deleteCampground))
    .post(isLoggedIn, isCampAuthor, upload.array("image"), catchAsync(campgrounds.newImage));

router.get("/:id/edit", isLoggedIn, isCampAuthor, catchAsync(campgrounds.editCampgroundForm));

router.get("/:id/newimg", isLoggedIn, isCampAuthor, campgrounds.newImageForm);

module.exports = router;