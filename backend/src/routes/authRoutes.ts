import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Local authentication
router.post('/register', (req: Request, res: Response) => authController.register(req, res));
router.post('/login', (req: Request, res: Response) => authController.login(req, res));

// Get current user
router.get('/me', authenticate, (req, res) => authController.getCurrentUser(req as any, res));

// Google OAuth (only if configured)
const isGoogleOAuthConfigured = process.env.GOOGLE_CLIENT_ID &&
                                 process.env.GOOGLE_CLIENT_SECRET &&
                                 process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com';

if (isGoogleOAuthConfigured) {
  router.get(
    '/google',
    (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
      })(req, res, next);
    }
  );

  router.get(
    '/google/callback',
    (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate('google', {
        session: false,
        failureRedirect: '/login'
      }, (err: any, user: any) => {
        if (err || !user) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
        req.user = user;
        authController.googleCallback(req as any, res);
      })(req, res, next);
    }
  );
} else {
  // Return 501 Not Implemented for OAuth routes when not configured
  router.get('/google', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Google OAuth not configured on server' });
  });

  router.get('/google/callback', (req: Request, res: Response) => {
    res.status(501).json({ error: 'Google OAuth not configured on server' });
  });
}

export default router;
