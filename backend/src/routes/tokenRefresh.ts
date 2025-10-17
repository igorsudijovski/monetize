import { Request, Response, Router } from 'express';
import {generateKey, generateRefresh, validateRefresh} from "../auth/KeysService";
import {getUserById} from "../service/UserService";

const router = Router();

router.get('/refresh-token', async (req: Request, res: Response) => {
    if (req.cookies?.refreshToken) {
        try {
            const cookieToken = req.cookies.refreshToken as string;
            const userId = validateRefresh(cookieToken);
            const user = await getUserById(userId);
            if (!user) {
                return res.status(401).json({ message: 'Invalid refresh token: user not found' });
            }
            const jwt = generateKey(user.googleId, user.email, user.id);
            const refreshToken = generateRefresh(userId);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            return res.json({ accessToken: jwt });
        } catch (error) {
            return res.status(401).json({ message: 'Invalid refresh token', error });
        }
    }
    return res.status(400).json({ message: 'Refresh token not provided' });
});

export default router;