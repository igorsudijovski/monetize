import { Request, Response, Router } from 'express';

const router = Router();

router.post('/logout', (req: Request, res: Response) => {
    try {
        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred during logout', error });
    }
});

export default router;