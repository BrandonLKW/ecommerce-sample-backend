import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const path = require("path");

const db = require("../database/database"); //to test connection

const server: Express = express();

//middleware block
server.use(express.json());
server.use(express.static(path.join(__dirname, "dist")));

//routes block
server.get("/test", (_req: Request, res: Response) => {
    res.json({ hello: "world" });  
});

//listen block
const port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log(`Express app running on port ${port}`);
});