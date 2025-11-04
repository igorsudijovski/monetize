import {Request, Response, Router} from "express";
import requireJwt from "../middleware/requireJwt";
import {getApplicationByUserId, getApplicationByUserIdAndAppId} from "../service/ApplicationsService";
import {UserEntity} from "../model/UserEntity";
import {getRevenue} from "../service/DashboardService";

const router = Router();

router.get('/revenue', requireJwt,  async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    const app = await getApplicationByUserIdAndAppId(user.id, req.params.appId + '');
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    const revenues = await getRevenue(app.id);
    return res.status(200).json({"revenues": revenues});
})

export default router;