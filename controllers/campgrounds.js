const campGround = require("../model/campground");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async function (req, res, next) {
    const camps = await campGround.find({});
    res.render("campgrounds/index", { camps });
};

module.exports.newCampgroundForm = function (req, res) {
    res.render("campgrounds/new");
};

module.exports.showCampground = async function (req, res, next) {
    const { id } = req.params;
    const foundCamp = await campGround.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("author");
    if (!foundCamp) {
        req.flash("error", "Campground not found!!");
        res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { foundCamp });
};

module.exports.newCampground = async function (req, res, next) {
    // if (!title || !location || !price || !description || !image) {
    //     throw new ExpressError(400, "Insufficient data for making campground!!");
    // }

    const { title, location, price, description } = req.body;
    const newCamp = new campGround({
        title, location, price, description
    });
    // for (let file of req.files) {
    //     newCamp.image.push({ url: file.path, filename: file.filename });
    // }
    const geoData = await geocoder.forwardGeocode({
        query: location,
        limit: 1
    }).send();
    const images = req.files.map(function (ele) { return { url: ele.path, filename: ele.filename } });
    newCamp.image = images;
    newCamp.author = req.user._id;
    newCamp.geometry = geoData.body.features[0].geometry;
    await newCamp.save();
    console.log(newCamp);
    req.flash("success", "Campground successfully created!");
    res.redirect("/campgrounds");
    console.log(newCamp.geometry);
};

module.exports.editCampgroundForm = async function (req, res, next) {
    const { id } = req.params;
    const foundCamp = await campGround.findById(id);
    res.render("campgrounds/edit", { foundCamp });
};

module.exports.editCampground = async function (req, res, next) {
    const { id } = req.params;
    const { title, location, price, description, image } = req.body;
    // if (!title || !location || !price || !description || !image) {
    //     throw new ExpressError(400, "Insufficient data for updating campground!!");
    // }

    const updatedCamp = await campGround.findByIdAndUpdate(id, { title, location, price, description, image });
    await updatedCamp.save();

    // await campGround.findByIdAndUpdate(id, { title, location, price, description, image });
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async function (req, res, next) {
    const { id } = req.params;
    await campGround.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!!");
    res.redirect("/campgrounds");
};

module.exports.newImage = async function (req, res) {
    const { id } = req.params;
    const foundCamp = await campGround.findById(id);
    const newImages = req.files.map(function (ele) { return { url: ele.path, filename: ele.filename } });
    // req.files.forEach(function (ele) {
    //     const image = { url: ele.path, filename: ele.filename };
    //     foundCamp.image.push(image);
    // });
    foundCamp.image.push(...newImages);
    console.log(req.body.deletedImg);
    // if (req.body.deletedImg) {
    //     console.log("*******************************************************");

    //     const images = foundCamp.image.filter(function (ele) {
    //         for (let filename of req.body.deletedImg) {
    //             if (filename === ele.filename) {
    //                 return false;
    //             }
    //         }
    //         return true;
    //     });
    //     foundCamp.image = images;
    // }
    await foundCamp.save();

    if (req.body.deletedImg) {

        for (let filename of req.body.deletedImg)
            await cloudinary.uploader.destroy(filename);
        await foundCamp.updateOne({ $pull: { image: { filename: { $in: req.body.deletedImg } } } });

    }

    res.redirect(`/campgrounds/${id}`);
}

module.exports.newImageForm = async function (req, res) {
    const { id } = req.params;
    const foundCamp = await campGround.findById(id);
    res.render("campgrounds/newimg", { foundCamp });
}