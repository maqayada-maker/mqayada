import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import requestsRouter from "./requests";
import offersRouter from "./offers";
import advisorsRouter from "./advisors";
import statsRouter from "./stats";
import pricingRouter from "./pricing";
import reportsRouter from "./reports";
import notificationsRouter from "./notifications";
import supervisorRouter from "./supervisor";
import annualOffersRouter from "./annual_offers";
import clientProfilesRouter from "./client_profiles";
import homepageRouter from "./homepage";
import aiRouter from "./ai";
import rateAlertsRouter from "./rate_alerts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requestsRouter);
router.use(offersRouter);
router.use(advisorsRouter);
router.use(statsRouter);
router.use(pricingRouter);
router.use(reportsRouter);
router.use(notificationsRouter);
router.use(supervisorRouter);
router.use(annualOffersRouter);
router.use(clientProfilesRouter);
router.use(homepageRouter);
router.use(aiRouter);
router.use(rateAlertsRouter);

export default router;
