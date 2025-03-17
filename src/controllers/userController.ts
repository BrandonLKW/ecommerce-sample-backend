import { Response, Request } from "express";
import * as userSchema from "../schema/User";
import * as jwtHelper from "../util/jwtHelper";
import * as queryHelper from "../util/queryHelper";
import * as errorHelper from "../util/errorHelper";

const userdb = require("../../database/database");

const userTableStr = "public.user"

//https://stackoverflow.com/questions/73740926/send-jwt-to-api-in-request-header-from-reactjs-frontend
export const getUser = async (req: Request, res: Response) => {
    try {
        const token = req.header("auth-token");
        //Check token
        const decoded: any = jwtHelper.verifyJwtToken(token); 
        //Build and fire query
        const selectFields = ["*"];
        const conditions = {
            id: decoded.body.id //assume id of user table available, error is also thrown if verification failed
        }
        const queryStr = queryHelper.createSelectWithConditionsStatement(userTableStr, selectFields, conditions);
        const response = await userdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error running getUser with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json({ error });
    }
}

export const getUserByEmailAndPass = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.params;
        const selectFields = ["*"]; //limit certain fields to be returned
        const conditions = {
            email: email
        }
        const queryStr = queryHelper.createSelectWithConditionsStatement(userTableStr, selectFields, conditions);
        const response = await userdb.query(queryStr);
        //Assume one row result everytime
        if (response.rows[0]){
            //Check if password is the same
            const isCorrectPassword = await jwtHelper.comparePassword(password, response.rows[0].password);
            if (!isCorrectPassword){
                res.status(401).json({ msg: "Wrong password" });
                return;
            }
            //Choose specific fields to return for privacy/security purposes
            const userObj = {
                id : response.rows[0].id,
                account_type: response.rows[0].account_type,
                name_first: response.rows[0].name_first,
                name_last: response.rows[0].name_last,
                email: response.rows[0].email,
                token: ""
            }; 
            userObj.token = jwtHelper.createJwtToken(userObj);
            res.status(201).json(userObj);
        } else{
            res.status(500).json({ message: "No Rows found" });
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const addUser = async (req: Request, res: Response) => {
    try {
        const validateUser = userSchema.validate(req.body);
        if (validateUser.error){
            return res.status(422).json({error: validateUser.error.message});
        }
        //Check if existing email
        const selectFields = ["id"];
        const conditions = {
            email: validateUser.value.email
        }
        const queryEmailStr = queryHelper.createSelectWithConditionsStatement(userTableStr, selectFields, conditions);
        const emailResponse = await userdb.query(queryEmailStr);
        if (!emailResponse){
            throw new Error("Unable to verify Email details");
        }
        if (emailResponse.rows[0]){
            res.status(201).json({ message: "Email already exists." }); //any records means email exists
            return;
        }
        //Hash password and add user
        validateUser.value.password = await jwtHelper.hashPassword(validateUser.value.password);
        const queryInsertStr = queryHelper.createInsertStatement(userTableStr, validateUser.value, "id");
        const insertResponse = await userdb.query(queryInsertStr);
        if (!insertResponse){
            throw new Error("Unable to add new User");
        }
        if (insertResponse.rows[0]){
            res.status(201).json({ message: "SUCCESS"});
        } else{
            res.status(500).json({ message: "Error adding User" });
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}