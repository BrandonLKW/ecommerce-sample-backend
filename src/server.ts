import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const path = require("path");
const productRouter = require("./routers/productRouter");
const orderRouter = require("./routers/orderRouter");
const metricRouter = require("./routers/metricRouter");

const server: Express = express();

//middleware block
server.use(express.json());
server.use(express.static(path.join(__dirname, "dist")));

//routes block
server.use("/api/product", productRouter);
server.use("/api/order", orderRouter);
server.use("/api/metric", metricRouter);
server.get("/test", (_req: Request, res: Response) => {
    res.json({ hello: "world" });  
});

//listen block
const port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log(`Express app running on port ${port}`);
});