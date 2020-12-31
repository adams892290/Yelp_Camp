if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localPassport = require("passport-local");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const ExpressError = require("./utils/ExpressError");
const campgroundRoutes = require("./routes/campgroundRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const User = require("./model/users");
const userRoutes = require("./routes/userRoutes");
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
const MongoDBStore = require("connect-mongo")(session);

mongoose.connect(dbUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const secret = process.env.SECRET || "thesecretingredient";

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
});

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(mongoSanitize());
app.use(helmet());

app.use(function (req, res, next) {
    if (!["/login", "/"].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",

    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = ["https://fonts.googleapis.com", "https://fonts.gstatic.com",];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dqxnxg08n/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);


const port = process.env.PORT || 7000;
app.listen(port, function () {
    console.log("Server is online");
});

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/wlogin", function (req, res) {
    res.render("wish/wishlogin");
});

app.post("/wlogin", function (req, res) {
    const { password } = req.body;
    if (password === "knockknock") {
        res.render("wish/index");
    }
});

app.get("/wlogin/optionone", function (req, res) {
    res.render("wish/optionone");
});

app.get("/wlogin/optiontwo", function (req, res) {
    res.render("wish/optiontwo");
});

app.get("/wlogin/optionthree", function (req, res) {
    res.render("wish/optionthree");
});


app.all("*", function (req, res, next) {
    throw new ExpressError(404, "Page not found!!!");
});

app.use(function (err, req, res, next) {
    const { status = 500, message = "Something went wrong!" } = err;
    // if (!err.message)
    //     err.message = "Something went wrong!";
    res.status(status).render("error", { message, status });
});