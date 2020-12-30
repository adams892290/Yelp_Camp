const User = require("../model/users");

module.exports.registerUserForm = function (req, res) {
    res.render("users/register");
};

module.exports.registerUser = async function (req, res, next) {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, function (err) {
        if (err) {
            return next(err);
        } else {
            req.flash("success", "User successfully added!");
            res.redirect("/campgrounds");
        }
    });

};

module.exports.loginUserForm = function (req, res) {
    res.render("users/login");
}

module.exports.loginUser = function (req, res) {
    req.flash("success", "Welcome Back!!");
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logoutUser = function (req, res) {
    req.logout();
    res.redirect("/campgrounds");
}