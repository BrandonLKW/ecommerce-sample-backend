import { Response, Request } from "express";
import * as orderSchema from "../schema/Order";
import * as orderItemSchema from "../schema/OrderItem";
import * as jwtHelper from "../util/jwtHelper";
import * as queryHelper from "../util/queryHelper";
import * as errorHelper from "../util/errorHelper";

const orderdb = require("../../database/database");

const orderTableStr = "public.order";
const orderItemTableStr = "public.order_item";

export const getOrdersByStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.params;
        const selectFields = ["*"]; //grab entire order row
        const conditions = {
            status: status.toUpperCase()
        }
        const queryStr = queryHelper.createSelectWithConditionsStatement(orderTableStr, selectFields, conditions);
        const response = await orderdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error running getOrders with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const getOrdersByUser = async (req: Request, res: Response) => {
    try {
        //Check token to verify and for id
        const token = req.header("auth-token");
        const decoded: any = jwtHelper.verifyJwtToken(token); 
        //Build and execute query
        const { status } = req.params;
        const selectFields = ["*"]; //grab entire order row
        const conditions = {
            user_id: decoded.body.id,
            status: status
        }
        const queryStr = queryHelper.createSelectWithConditionsStatement(orderTableStr, selectFields, conditions);
        console.log(queryStr);
        const response = await orderdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error running getOrders with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const getOrderItemsByOrderId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const selectFields = ["*"];
        const conditions = {
            order_id: id
        }
        const queryStr = queryHelper.createSelectWithConditionsStatement(orderItemTableStr, selectFields, conditions);
        const response = await orderdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error running getOrderItems with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const addOrder = async (req: Request, res: Response) => {
    try {
        //Check token to verify and for id
        const token = req.header("auth-token");
        const decoded: any = jwtHelper.verifyJwtToken(token); 
        //Build and execute query
        const validateOrder = orderSchema.validate(req.body);
        if (validateOrder.error){
            return res.status(422).json({error: validateOrder.error.message});
        }
        //Start to setup input params for insert method in queryHelper
        let children = {}; //Used to store child objects if populated (format of -> column name: {tableName: string, data: obj[]})
        let excludedChildren: string[] = []; //Used to store string of child's param name if child is not populated
        //At this point orderItemList is the only child, but future additions will follow this format
        const orderItemList: object[] = req.body.orderItemList;
        if (orderItemList?.length) {
            children = {
                ...children,
                orderItemList: {
                    tableName: `${orderItemTableStr}`,
                    data: orderItemList.map((item) => {
                        const validateOrderItem = orderItemSchema.validate(item); //Validate each child object as well
                        if (validateOrderItem.error) {
                            throw Error(validateOrderItem.error.message);
                        }
                        return validateOrderItem.value;
                    }),
                },
            };
        } else {
            excludedChildren.push("orderItemList");
        }
        //Remove defined children from parent, to be constructed in a separate sub query in the helper
        let parent = Object.fromEntries(
            Object.entries(validateOrder.value).filter(
                ([key]) =>
                    !Object.keys(children).includes(key) &&
                    !excludedChildren.includes(key)
            )
        );
        Object.assign(parent, {user_id: decoded.body.id}); //add user reference as well
        let queryStr = "";
        if (Object.keys(children).length > 0) {
            queryStr = queryHelper.createInsertWithChildrenStatement(
                orderTableStr,
                parent,
                children,
                "order_id"
            );
        } else {
            queryStr = queryHelper.createInsertStatement(
                orderTableStr,
                parent,
                "id"
            );
        }
        const response = await orderdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error adding product with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const updateOrder = async (req: Request, res: Response) => {
    try {
        //Check token to verify and for id
        const token = req.header("auth-token");
        const decoded: any = jwtHelper.verifyJwtToken(token); 
        //Build and execute query
        const validateOrder = orderSchema.validate(req.body);
        if (validateOrder.error){
            return res.status(422).json({error: validateOrder.error.message});
        }
        //Start to setup input params for insert method in queryHelper
        let children = {}; //Used to store child objects if populated (format of -> column name: {tableName: string, data: obj[]})
        let excludedChildren: string[] = []; //Used to store string of child's param name if child is not populated\
        const orderItemList: object[] = req.body.orderItemList;
        if (orderItemList?.length) {
            children = {
                ...children,
                orderItemList: {
                    tableName: `${orderItemTableStr}`,
                    data: orderItemList.map((item) => {
                        const validateOrderItem = orderItemSchema.validate(item); //Validate each child object as well
                        if (validateOrderItem.error) {
                            throw Error(validateOrderItem.error.message);
                        }
                        Object.assign(validateOrderItem.value, {id: (item as any).id}); 
                        return validateOrderItem.value; //Pass the original obj after validation
                    }),
                },
            };
        } else {
            excludedChildren.push("orderItemList");
        }
        //Define WHERE conditions
        const conditions = {
            id: req.body.id
        }
        //Remove defined children from parent, to be constructed in a separate sub query in the helper
        const parent = Object.fromEntries(
            Object.entries(validateOrder.value).filter(
                ([key]) =>
                    !Object.keys(children).includes(key) &&
                    !excludedChildren.includes(key)
            )
        );
        let queryStr = "";
        if (Object.keys(children).length > 0) {
            queryStr = queryHelper.createUpdateWithChildrenStatement(
                orderTableStr,
                parent,
                conditions,
                children
            );
        } else {
            queryStr = queryHelper.createUpdateStatement(
                orderTableStr,
                parent,
                conditions,
                "id"
            );
        }
        console.log(queryStr);
        const response = await orderdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error updating product with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const validateProduct = orderSchema.validate(req.body);
        if (validateProduct.error){
            return res.status(422).json({error: validateProduct.error.message});
        }
        //Set delete conditions
        const conditions = {
            id: req.body.id, //use req.body because validate will strip the id
        };
        const queryStr = queryHelper.createDeleteStatement(orderTableStr, conditions, "id");
        const response = await orderdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error updating product with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json(errorHelper.createErrorMessage(error));
    }
}
