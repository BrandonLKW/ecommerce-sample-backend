import * as express from "express";
import * as productController from "../controllers/productController";

const productRouter = express.Router();

productRouter.get("/all", productController.getAllProducts);
productRouter.get("/get/id/:id", productController.getProductById);
productRouter.get("/get/ptype/:ptype", productController.getProductsByType);
productRouter.post("/add", productController.addProduct);
productRouter.post("/update", productController.updateProduct);
productRouter.delete("/delete", productController.deleteProduct);

module.exports = productRouter;