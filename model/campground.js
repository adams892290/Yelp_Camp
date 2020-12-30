const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");

const imageSchema = new mongoose.Schema({

    url: String,
    filename: String

});

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
})

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    image: [imageSchema],
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
}, opts);

campgroundSchema.virtual("properties.popupTitle").get(function () {
    return `${this.title}`;
});

campgroundSchema.virtual("properties.popupId").get(function () {
    return `${this._id}`;
});

campgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);