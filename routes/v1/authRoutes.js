const Passport = require("../../config/passportAuth");

const express = require("express"),
    { userSignup, userLogin, logOut, googleAuth } = require("../../controllers/authController"),
    router = express.Router();

router.post("/create-user", userSignup);
router.post("/login", userLogin);
router.post("/logout", logOut);
// 🔹 Google OAuth Login Route
router.get("/google", (req, res, next) => {
    const { userType } = req.query; // Extract userType from query

    if (!userType || !["candidate", "employer"].includes(userType)) {
        return res.status(400).json({ message: "Invalid or missing userType (must be 'candidate' or 'employer')." });
    }

    Passport.authenticate("google", { scope: ["profile", "email"], state: userType })(req, res, next);
});

// 🔹 Google OAuth Callback Route
router.get("/google/callback", Passport.authenticate("google", { session: false }), googleAuth);


module.exports = router;
