const productExpress = require("express");
const productRouter = productExpress.Router();
const productController = require("../controllers/productController");

productRouter.get("/all", productController.getAllProducts);
productRouter.post("/add", productController.addProduct);
productRouter.post("/update", productController.updateProduct);
productRouter.delete("/delete", productController.deleteProduct);

module.exports = productRouter;