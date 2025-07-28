const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("./models");
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ where: { user_google_id: profile.id } });
      if (!user) {
        user = await User.create({
          user_google_id: profile.id,
          user_email: profile.emails[0].value,
          user_name: profile.displayName,
          user_avatar: profile.photos[0].value,
        });
      }
      const token = jwt.sign(
        { id: user.user_id, role: "user" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      user.token = token;
      await user.save();
      return done(null, user);
    }
  )
);
