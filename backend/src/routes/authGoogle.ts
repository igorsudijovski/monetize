// authRoute.ts
import {Request, Response, Router} from 'express';
import passport from '../auth/passportConfig'; // import passport from our custom passport file
import {generateRefresh} from "../auth/KeysService";

const router = Router();

/*
  This route triggers the Google sign-in/sign-up flow.
  When the frontend calls it, the user will be redirected to the
  Google accounts page to log in with their Google account.
*/

router.get('/google', function(req, response) {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: req.query.appId + ''
    })(req, response);
});


/*
  This route is the callback endpoint for Google OAuth2.0.
  After the user logs in via Google's authentication flow, they are redirected here.
  Passport.js processes the callback, attaches the user to req.user, and we handle
  the access token generation and redirect the user to the frontend.
*/
// Google OAuth2.0 callback route
router.get('/google/callback', passport.authenticate('google', { session: false }), (req: Request, res: Response) => {
    try {
        // we can use req.user because the GoogleStrategy that we've
        // implemented in `google.ts` attaches the user
        const user = req.user as {userId: string} | undefined;

        if (!user) {
            return res.status(401).json({ message: 'Authentication failed: user not found' });
        }

        const appId = req.query.state !== 'undefined' ? '?appId=' + req.query.state : '';

        const refreshToken = generateRefresh(user.userId);


        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        const redirectUrl = process.env.SUCCESSFUL_LOGIN + appId;
        return res.redirect(redirectUrl);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred during authentication', error });
    }
});




export default router;