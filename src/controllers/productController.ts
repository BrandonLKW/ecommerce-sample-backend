import { Response, Request } from "express";
import * as productSchema from "../schema/Product";
import * as queryHelper from "../util/queryHelper";

const productdb = require("../../database/database");

const productTableStr = "public.product";

const getAllProducts = async (req: Response, res: Request) => {
    try {
        const queryStr = `SELECT * FROM ${productTableStr}`;
        const response = await productdb.query(queryStr);
        res.status(201).json(response.rows);
    } catch (error) {
        res.status(500).json({ error });
    }
}

const addProduct = async (req: Response, res: Request) => {
    try {
        const validateProduct = productSchema.validate(req.body);
        if (validateProduct.error){
            return res.status(422).json({error: validateProduct.error.message});
        }
        const queryStr = queryHelper.createInsertStatement(productTableStr, validateProduct.value, "id");
        console.log(queryStr);
        const response = await productdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error adding product with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json({ error });
    }
}

const updateProduct = async (req: Response, res: Request) => {
    try{
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
        res.status(500).json({ error });
    }
}

const deleteProduct = async (req: Response, res: Request) => {
    try {
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

    }
}

module.exports = {
    getAllProducts, 
    addProduct,
    updateProduct,
    deleteProduct
};