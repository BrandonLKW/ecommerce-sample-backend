import * as express from "express";
import * as userController from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/get/user", userController.getUser);
userRouter.get("/email/:email/password/:password", userController.getUserByEmailAndPass);
userRouter.post("/add", userController.addUser);

module.exports = userRouter;