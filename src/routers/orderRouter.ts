const orderExpress = require("express");
const orderRouter = orderExpress.Router();
const orderController = require("../controllers/orderController");

orderRouter.get("/all", orderController.getAllOrders);
orderRouter.get("/get/status/:status", orderController.getOrdersByStatus);
orderRouter.post("/add", orderController.addOrder);
orderRouter.post("/update", orderController.updateOrder);
orderRouter.delete("/delete", orderController.deleteOrder);

module.exports = orderRouter;