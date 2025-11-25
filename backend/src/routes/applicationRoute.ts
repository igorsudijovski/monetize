import {Request, Response, Router} from "express";
import requireJwt from "../middleware/requireJwt";
import {getApplicationByUserId, isUrlNameExists, updateApplication} from "../service/ApplicationsService";
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
    if (entity.urlName == null  || entity.urlName.trim().length < 3 || entity.urlName.trim().length > 50 || !/^[a-zA-Z][a-zA-Z0-9-_]+$/.test(entity.urlName)) {
        entity.urlName = app.urlName;
    }
    await updateApplication(entity);
    return res.status(200).json({message: 'Application updated'});

})

router.get('/urlExists/:urlName', requireJwt,  async (req: Request, res: Response) => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return res.status(401).json({message: 'Unauthorize'})
    }
    const app = await getApplicationByUserId(user.id);
    if (app == undefined) {
        return res.status(400).json({message: 'No Application'})
    }
    if (app.urlName === req.params.urlName) {
        return res.status(200).json({exists: false});
    }
    const exists = await isUrlNameExists(req.params.urlName);
    return res.status(200).json({exists: exists});
});


export default router;