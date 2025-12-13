// authRoute.ts
import {Request, Response, Router} from 'express';
import passport from '../auth/passportConfig'; // import passport from our custom passport file
import {generateRefresh} from "../auth/KeysService";
import {getUserById} from "../service/UserService";

const router = Router();

/*
  This route triggers the Google sign-in/sign-up flow.
  When the frontend calls it, the user will be redirected to the
  Google accounts page to log in with their Google account.
*/

router.get('/google', function(req, response) {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: `appId=${req.query.appId}&type=${req.query.type}&subId=${req.query.subId}`
    })(req, response);
});


/*
  This route is the callback endpoint for Google OAuth2.0.
  After the user logs in via Google's authentication flow, they are redirected here.
  Passport.js processes the callback, attaches the user to req.user, and we handle
  the access token generation and redirect the user to the frontend.
*/
// Google OAuth2.0 callback route
router.get('/google/callback', passport.authenticate('google', { session: false }), async (req: Request, res: Response) => {
    try {
        // we can use req.user because the GoogleStrategy that we've
        // implemented in `google.ts` attaches the user
        const userId = req.user as {userId: string} | undefined;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication failed: user not found' });
        }
        const user = await getUserById(userId.userId);
        if (user === undefined) {
            return res.status(401).json({ message: 'Authentication failed: user not found' });
        }
        const urlParams = [];
        let appUrlFromState: string | null = null;

        if (req.query.state !== undefined) {
            const params = new URLSearchParams(req.query.state as string);
            const appId = params.get('appId') || '';
            if (!(appId === 'undefined' || appId === 'null')) {
                urlParams.push(`appId=${appId}`);
            }
            const type = params.get('type') || '';
            if (!(type === 'undefined' || type === 'null')) {
                urlParams.push(`type=${type}`);
            }
            const subId = params.get('subId') || '';
            if (!(subId === 'undefined' || subId === 'null')) {
                urlParams.push(`subId=${subId}`);
            }
            const appUrl = params.get('appUrl') || '';
            if (!(appUrl === 'undefined' || appUrl === 'null' || appUrl === '')) {
                appUrlFromState = appUrl;
            }
        }
        if (user.applicationId !== undefined && user.applicationId !== null) {
            urlParams.push(`redirect=dashboard`);
        } else if (user.applicationSubscriptionIds !== undefined && user.applicationSubscriptionIds.length > 0) {
            urlParams.push(`redirect=user`);
            // Pass appUrl if logging in from specific app
            if (appUrlFromState) {
                urlParams.push(`appUrl=${appUrlFromState}`);
            } else {
                urlParams.push(`appUrl=${user.applicationSubscriptionIds[0].id}`);
            }
        }

        const refreshToken = generateRefresh(user.id);


        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        const urlParamsStr = urlParams.length > 0 ? `?${urlParams.join('&')}` : '';
        const redirectUrl = process.env.SUCCESSFUL_LOGIN + urlParamsStr;
        return res.redirect(redirectUrl);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred during authentication', error });
    }
});




export default router;