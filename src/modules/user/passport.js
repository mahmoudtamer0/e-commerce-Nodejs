const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./user.schema");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_BASE_URL}/api/v1/users/google/callback`
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            let user = await User.findOne({ email });

            if (user) {
                user.googleId = profile.id;
                user.provider = "google";
                await user.save();
            } else {
                user = await User.create({
                    name: profile.displayName,
                    email,
                    googleId: profile.id,
                    provider: "google",
                    image: profile.photos[0].value,
                    isEmailVerified: true
                });
            }

            return done(null, user);

        } catch (err) {
            return done(err, null);
        }
    }));