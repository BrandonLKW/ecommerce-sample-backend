import { Response, Request } from "express";
import * as productSchema from "../schema/Product";
import * as jwtHelper from "../util/jwtHelper";
import * as queryHelper from "../util/queryHelper";
import * as errorHelper from "../util/errorHelper";

const productdb = require("../../database/database");

const productTableStr = "public.product";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const queryStr = `SELECT * FROM ${productTableStr}`;
        const response = await productdb.query(queryStr);
        res.status(201).json(response.rows);
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const selectFields = ["*"];
        const conditions = {
            id: id
        }
        const queryStr = queryHelper.createSelectWithConditionsStatement(productTableStr, selectFields, conditions);
        const response = await productdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error searching products with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const getProductsByType = async (req: Request, res: Response) => {
    try {
        const { ptype } = req.params;
        const selectFields = ["*"];
        const conditions = {
            product_type: ptype
        }
        const queryStr = queryHelper.createSelectWithConditionsStatement(productTableStr, selectFields, conditions);
        const response = await productdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error searching products with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const addProduct = async (req: Request, res: Response) => {
    try {
        //Check token
        const token = req.header("auth-token");
        const decoded: any = jwtHelper.verifyJwtToken(token); 
        if (decoded.body.account_type !== "ADMIN"){
            throw new Error(`Current User is not allowed to add Products!`);
        }
        const validateProduct = productSchema.validate(req.body);
        if (validateProduct.error){
            return res.status(422).json({error: validateProduct.error.message});
        }
        const queryStr = queryHelper.createInsertStatement(productTableStr, validateProduct.value, "id");
        const response = await productdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error adding product with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const updateProduct = async (req: Request, res: Response) => {
    try {
        //Check token
        const token = req.header("auth-token");
        const decoded: any = jwtHelper.verifyJwtToken(token); 
        if (decoded.body.account_type !== "ADMIN"){
            throw new Error(`Current User is not allowed to update Products!`);
        }
        const validateProduct = productSchema.validate(req.body);
        if (validateProduct.error){
            return res.status(422).json({error: validateProduct.error.message});
        }
        //Set update conditions
        const conditions = {
            id: req.body.id, //use req.body because validate will strip the id
        };
        const queryStr = queryHelper.createUpdateStatement(productTableStr, validateProduct.value, conditions, "id");
        const response = await productdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error updating product with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const subtractProductQuantity = async (req: Request, res: Response) => {
    try {
        //Check token
        const token = req.header("auth-token");
        const decoded: any = jwtHelper.verifyJwtToken(token); 
        //
        const { id, quantity } = req.body;
        const queryStr = `UPDATE ${productTableStr} SET quantity = quantity - ${quantity} WHERE id = ${id} returning id`;
        console.log(queryStr);
        const response = await productdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error updating product with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        //Check token
        const token = req.header("auth-token");
        const decoded: any = jwtHelper.verifyJwtToken(token); 
        if (decoded.body.account_type !== "ADMIN"){
            throw new Error(`Current User is not allowed to update Products!`);
        }
        const validateProduct = productSchema.validate(req.body);
        if (validateProduct.error){
            return res.status(422).json({error: validateProduct.error.message});
        }
        //Set delete conditions
        const conditions = {
            id: req.body.id, //use req.body because validate will strip the id
        };
        const queryStr = queryHelper.createDeleteStatement(productTableStr, conditions, "id");
        const response = await productdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error updating product with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}
