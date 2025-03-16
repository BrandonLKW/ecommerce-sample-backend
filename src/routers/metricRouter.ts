import * as express from "express";
import * as metricController from "../controllers/metricController";

const metricRouter = express.Router();

metricRouter.get("/orderitem/ptype/:ptype/status/:status/sdate/:sdate/edate/:edate", metricController.getOrderItemMetricsByTypeStatusAndDate);
metricRouter.get("/product/usercount/pid/:pid",metricController.getPendingUserCountByProduct);

module.exports = metricRouter;