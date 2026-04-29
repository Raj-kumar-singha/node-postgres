const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { users } = require("../models");
const { generateToken, createSession } = require("../utils/authProvider");
const { googleClientId, googleClientSecret, googleCallbackUrl } = require("./envConfig");
console.log("googleClientId", googleClientId);
console.log("googleClientSecret", googleClientSecret);
console.log("googleCallbackUrl", googleCallbackUrl);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await users.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl,
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const userType = req.query.userType;

        let user = await users.findOne({ where: { email } });

        if (user) {
            // If user exists but has no Google ID, update it
            if (!user.googleId) {
                await user.update({ googleId, authProvider: "google" });
            }
        } else {
            // Validate userType
            if (!userType || !["candidate", "employer"].includes(userType)) {
                return done(null, false, { message: "Invalid or missing userType. It must be 'candidate' or 'employer'." });
            }

            // Create new user
            user = await users.create({
                email,
                googleId,
                authProvider: "google",
                userType,
                profileStatus: "registered",
            });
        }

        // Generate JWT Token
        const token = generateToken({ userId: user._id, userType: user.userType });

        // Store session
        await createSession(user, token);

        return done(null, { user, token });
    } catch (error) {
        console.error("Google auth error:", error);
        return done(error, false);
    }
}));

module.exports = passport;
