import {Request, Response, Router} from "express";
import requireJwt from "../middleware/requireJwt";
import {getApplicationByUserId, updateApplication} from "../service/ApplicationsService";
import {UserEntity} from "../model/UserEntity";
import {getRestriction} from "../model/GeneralSubscriptionsType";
import {getSubscriptionById} from "../service/GeneralSubscriptionService";
import {ApplicationsEntity} from "../model/ApplicationsEntity";

const router = Router();


router.get('/my-subscription', requireJwt,  async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    const app = await getApplicationByUserId(user.id);
    if (app == undefined) {
        return res.status(400).json({message: 'No Application'})
    }

    const generalSub = await getSubscriptionById(app.subscriptionId);
    if (generalSub == undefined) {
        return res.status(400).json({message: 'No Application'})
    }

    const restriction = getRestriction(generalSub.type);
    return res.status(200).json({app: app, restriction: restriction});
})
router.put('/my-subscription', requireJwt,  async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    const app = await getApplicationByUserId(user.id);
    if (app == undefined) {
        return res.status(400).json({message: 'No Application'})
    }
    const entity = req.body as ApplicationsEntity;
    entity.id = app.id;
    await updateApplication(entity);
    return res.status(200).json({message: 'Application updated'});

})


export default router;