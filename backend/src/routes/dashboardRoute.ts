import {Request, Response, Router} from "express";
import requireJwt from "../middleware/requireJwt";
import {getApplicationByUserIdAndAppId} from "../service/ApplicationsService";
import {UserEntity} from "../model/UserEntity";
import {getActiveKeys, getInactiveKeys, getIssuedKeysThisMonth, getRevenue} from "../service/DashboardService";
import {ApplicationsEntity} from "../model/ApplicationsEntity";
import {getAppSubscriptions} from "../service/ApplicationSubscriptionService";
import {isUUID} from "../service/helper";

const router = Router({mergeParams: true});

router.get('/revenue', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    const revenues = await getRevenue(app.id);
    return res.status(200).json({"revenues": revenues});
    // return res.status(200).json({"revenues": [{subId: 'id', name: 'someName',  totalNumber: 30, revenue: 50}]});
})

router.get('/generated-keys', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    const keysGenerated = await getIssuedKeysThisMonth(app.id);
    return res.status(200).json({"generatedKeys": keysGenerated});
})

router.get('/subscriptions', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    const subscriptions = await getAppSubscriptions(app.id);
    return res.status(200).json({"subscriptions": subscriptions});
});

router.get('/activekeys', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    let { page, limit, sort, title, search } = req.query;
    const pageNumber = parseInt(page + '') || 1;
    const limitNumber = parseInt(limit + '') || 10;
    const sortDesc = (sort + '' === 'desc');
    let titleStr = title ? ((title + '').toLowerCase() == 'all' ? undefined : title + '' ): undefined;
    const searchStr = search ? search + '' : undefined;
    if (titleStr !== undefined && !isUUID(titleStr)) {
        titleStr = undefined;
    }
    const response = await getActiveKeys(app.id, pageNumber, limitNumber, titleStr, searchStr, sortDesc)
    return res.status(200).json(response);
});

router.get('/usedkeys', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    let { page, limit, sort, title, search } = req.query;
    const pageNumber = parseInt(page + '') || 1;
    const limitNumber = parseInt(limit + '') || 10;
    const sortDesc = (sort + '' === 'desc');
    let titleStr = title ? ((title + '').toLowerCase() == 'all' ? undefined : title + '' ): undefined;
    const searchStr = search ? search + '' : undefined;
    if (titleStr !== undefined && !isUUID(titleStr)) {
        titleStr = undefined;
    }
    const response = await getInactiveKeys(app.id, pageNumber, limitNumber, titleStr, searchStr, sortDesc)
    return res.status(200).json(response);
});

export const handleApplication = async (req: Request): Promise<ApplicationsEntity | undefined> => {
    const user = req.user as UserEntity;
    if (user == undefined) {
        return undefined;
    }
    const appId = req.params.appId + '';
    if (!isUUID(appId)) {
        return undefined;
    }
    return await getApplicationByUserIdAndAppId(user.id, appId);
}

export default router;