const mongoose = require("mongoose");
const campGround = require("../model/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelper");

mongoose.connect("mongodb://localhost:27017/yelp-camp", { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

const sample = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const seedDB = async function () {
    await campGround.deleteMany({});

    for (let i = 1; i <= 500; i++) {

        const price = Math.floor(Math.random() * 10000) + 1000;
        const location = sample(cities);
        const place = new campGround({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${location.city},${location.state}`,
            geometry: {
                type: "Point",
                coordinates: [location.longitude, location.latitude]
            },
            image: [{
                url:
                    'https://res.cloudinary.com/dqxnxg08n/image/upload/v1608970379/samples/landscapes/nature-mountains.jpg',
                filename: 'YelpCamp/a05ehxjum4we7dwonuow'
            },
            {
                url:
                    'https://res.cloudinary.com/dqxnxg08n/image/upload/v1608970375/samples/landscapes/beach-boat.jpg',
                filename: 'YelpCamp/wajpuni9ktu00o1sl3wm'
            },
            {
                url:
                    'https://res.cloudinary.com/dqxnxg08n/image/upload/v1608970372/samples/landscapes/girl-urban-view.jpg',
                filename: 'YelpCamp/tcgwd38i8nybjieyt5ed'
            }],
            author: "5fe3df55950187023a418eb2",
            price,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam commodi obcaecati porro dolore minus minima harum explicabo eius vero? Molestias quia dolorem ducimus iste delectus, reprehenderit nam repudiandae tenetur doloremquerror itaque fugit, doloribus, asperiores quas ipsam a esse, quaerat commodi expedita fuga voluptatem id beatae laudantium aperiam est libero. Vel ipsum obcaecati porro quos adipisci doloribus similique, sit quas. Alias quia tenetur culpa, accusantium, a explicabo laborum deleniti similique eum quis ipsam architecto fugit consequuntur maiores eius! Ad nostrum minima aut reiciendis dignissimos, corrupti doloremque repellendus totam quaerat doloribus."
        });
        await place.save();
    }
}

seedDB().then(function () {
    mongoose.connection.close();
});

