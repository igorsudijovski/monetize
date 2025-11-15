import {Request, Response, Router} from "express";
import requireJwt from "../middleware/requireJwt";
import {ApplicationsEntity} from "../model/ApplicationsEntity";
import {
    createAppSubscription,
    deleteAppSubscriptionById,
    getAppSubscriptionById,
    hasBoughtSubscription,
    numberOfActiveAppSubscriptions,
    numberOfAppSubscriptions,
    swapAppSubscriptionOrder,
    updateActiveAppSubscription,
    updateAppSubscription
} from "../service/ApplicationSubscriptionService";
import {isUUID} from "../service/helper";
import {ApplicationSubscriptionsEntity} from "../model/ApplicationSubscriptionsEntity";
import {getRestrictionByApp, handleApplication} from "./handleApplication";

const router = Router({mergeParams: true});

router.post('/app-subscription', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    const entity = await validateApplication(req, app, true);
    if (entity == undefined) {
        return res.status(400).json({message: 'Invalid Application Subscription'})
    }
    const created = await createAppSubscription(app.id, entity);
    return res.status(200).json({applicationSubscription: created});
})

router.get('/app-subscription/:appSubId', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    if (!isUUID(req.params.appSubId)) {
        return res.status(400).json({message: 'Invalid Application Subscription Id'})
    }
    const application = await getAppSubscriptionById(req.params.appSubId, app.id);
    if (application == undefined) {
        return res.status(400).json({message: 'No Application Subscription'})
    }
    return res.status(200).json({applicationSubscription: application});
})

router.get('/app-subscription/:appSubId/can-delete', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    if (!isUUID(req.params.appSubId)) {
        return res.status(400).json({message: 'Invalid Application Subscription Id'})
    }
    const application = await getAppSubscriptionById(req.params.appSubId, app.id);
    if (application == undefined) {
        return res.status(400).json({message: 'No Application Subscription'})
    }
    const hasBought = await hasBoughtSubscription(application.id);
    return res.status(200).json({canDelete: !hasBought});
})

router.delete('/app-subscription/:appSubId', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    if (!isUUID(req.params.appSubId)) {
        return res.status(400).json({message: 'Invalid Application Subscription Id'})
    }
    const application = await getAppSubscriptionById(req.params.appSubId, app.id);
    if (application == undefined) {
        return res.status(400).json({message: 'No Application Subscription'})
    }
    await deleteAppSubscriptionById(application.id, app.id);
    return res.status(204).send();
})

router.put('/app-subscription/:appSubId', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    const entity = await validateApplication(req, app, false);
    if (entity == undefined) {
        return res.status(400).json({message: 'Invalid Application Subscription'})
    }
    if (!isUUID(req.params.appSubId)) {
        return res.status(400).json({message: 'Invalid Application Subscription Id'})
    }
    const application = await getAppSubscriptionById(req.params.appSubId, app.id);
    if (application == undefined) {
        return res.status(400).json({message: 'No Application Subscription'})
    }
    const created = await updateAppSubscription(application.id, entity);
    if (created == undefined || !created) {
        return res.status(500).json({message: 'Failed to update Application Subscription'});
    }
    const updated = await getAppSubscriptionById(req.params.appSubId, app.id);
    if (updated == undefined) {
        return res.status(500).json({message: 'Failed to retrieve updated Application Subscription'});
    }
    return res.status(200).json({applicationSubscription: updated});
})

router.put('/app-subscription/:appSubId/activate', requireJwt, async (req: Request, res: Response) => {
    return handleActivation(req, res, true);
});

router.put('/app-subscription/:appSubId/deactivate', requireJwt, async (req: Request, res: Response) => {
    return handleActivation(req, res, false);
});

router.put('/app-subscriptions/:appSubId/swap/:otherAppSubId', requireJwt,  async (req: Request, res: Response) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    if (!isUUID(req.params.appSubId) || !isUUID(req.params.otherAppSubId)) {
        return res.status(400).json({message: 'Invalid Application Subscription Id'})
    }
    const swapped = await swapAppSubscriptionOrder(app.id, req.params.appSubId, req.params.otherAppSubId);
    if (swapped) {
        return res.status(200).json({message: 'Swapped'});
    }
    return res.status(400).json({message: 'Failed to swap'});
});

const handleActivation = async (req: Request, res: Response, activate: boolean) => {
    const app = await handleApplication(req);
    if (app == undefined) {
        return res.status(400).json({message: 'Unauthorize'})
    }
    if (!isUUID(req.params.appSubId)) {
        return res.status(400).json({message: 'Invalid Application Subscription Id'})
    }
    const restriction = await getRestrictionByApp(app);
    if (restriction == undefined) {
        return res.status(400).json({message: 'No Application'})
    }
    if (activate) {
        const numberOfSubs = await numberOfActiveAppSubscriptions(app.id);
        if (numberOfSubs >= restriction.numberOfSubscriptions) {
            return res.status(400).json({message: 'Cannot activate more subscriptions'});
        }
    }
    const appSub = await getAppSubscriptionById(req.params.appSubId, app.id);
    if (appSub == undefined) {
        return res.status(400).json({message: 'No Application'})
    }
    const booleanPromise = await updateActiveAppSubscription(appSub.id, activate);
    if (booleanPromise){
        return res.status(200).json({message: 'Activated'});
    }
    return res.status(500).json({message: 'Failed to activate'});
}

const validateApplication = async (req: Request, app: ApplicationsEntity, create: boolean): Promise<ApplicationSubscriptionsEntity | undefined> => {

    if (!app.active) {
        return undefined;
    }
    const restriction = await getRestrictionByApp(app);
    if (restriction == undefined) {
        return undefined;
    }

    const numberOfSubs = await numberOfAppSubscriptions(app.id);
    if (create && restriction.numberOfSubscriptions <= numberOfSubs) {
        return undefined;
    }
    try {
        const entity = req.body as ApplicationSubscriptionsEntity;
        if (entity.name == undefined || entity.name.trim().length === 0) {
            return undefined;
        }
        if (entity.price < restriction.priceLow || entity.price > restriction.priceHigh) {
            return undefined;
        }
        if (restriction.bulletTextLength !== undefined && (entity.bulletText == undefined || entity.bulletText.length > restriction.bulletTextLength)) {
            return undefined;
        }
        if (!entity.oneTimeUse && !entity.isLifetime && (entity.numDays == undefined || entity.numDays == 0) && (entity.numUsages == undefined || entity.numUsages == 0)) {
            return undefined;
        }
        if (entity.isLifetime && !restriction.creationTypes.includes('lifetime')) {
            return undefined;
        }
        if (entity.oneTimeUse && !restriction.creationTypes.includes('one_time')) {
            return undefined;
        }
        if (entity.numUsages !== undefined && entity.numUsages > 0 && !restriction.creationTypes.includes('usage_limited')) {
            return undefined;
        }
        if (entity.numDays !== undefined && entity.numDays > 0 && !restriction.creationTypes.includes('subscription')) {
            return undefined;
        }
        return entity;
    } catch (e) {
        console.error(e);
    }
    return undefined;
}

export default router;