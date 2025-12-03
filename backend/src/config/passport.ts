import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from './database';
import { JWT_SECRET } from './jwt';

// Google OAuth Strategy (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (!user) {
            // Check if user exists with this email
            const email = profile.emails?.[0]?.value;
            if (email) {
              user = await prisma.user.findUnique({
                where: { email },
              });

              if (user) {
                // Link Google account to existing user
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    googleId: profile.id,
                    provider: 'google',
                    foto_perfil: profile.photos?.[0]?.value,
                  },
                });
              }
            }

            // Create new user if doesn't exist
            if (!user && email) {
              user = await prisma.user.create({
                data: {
                  googleId: profile.id,
                  email,
                  nombre: profile.displayName || email.split('@')[0],
                  provider: 'google',
                  foto_perfil: profile.photos?.[0]?.value,
                },
              });
            }
          }

          return done(null, user || false);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );
  console.log('✓ Google OAuth strategy configured');
} else {
  console.log('ℹ Google OAuth not configured (credentials missing) - email/password authentication available');
}

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
