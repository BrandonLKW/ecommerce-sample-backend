import * as express from "express";
import * as orderController from "../controllers/orderController";

const orderRouter = express.Router();

orderRouter.get("/get/user/status/:status", orderController.getOrdersByUser);
orderRouter.get("/get/status/:status", orderController.getOrdersByStatus);
orderRouter.get("/item/get/order_id/:id", orderController.getOrderItemsByOrderId);
orderRouter.post("/add", orderController.addOrder);
orderRouter.post("/update", orderController.updateOrder);
orderRouter.delete("/delete", orderController.deleteOrder);

module.exports = orderRouter;