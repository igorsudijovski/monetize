import {Request, Response, Router} from "express";
import requireJwt from "../middleware/requireJwt";
import {getApplicationByUserId} from "../service/ApplicationsService";
import {UserEntity} from "../model/UserEntity";

const router = Router();

router.get('/my-subscription', requireJwt,  async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    const app = await getApplicationByUserId(user.id);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    return res.status(200).json(app);
})

export default router;