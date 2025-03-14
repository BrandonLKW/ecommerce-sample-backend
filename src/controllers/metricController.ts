import { Response, Request } from "express";

const metricdb = require("../../database/database");

const productTableStr = "public.product"
const orderTableStr = "public.order";
const orderItemTableStr = "public.order_item";

export const getOrderItemMetricsByTypeStatusAndDate = async (req: Response, res: Request) => {
    try {
        const { ptype, status, sdate, edate } = req.params;
        const queryStr = `SELECT p.product_type, p.name, oi.quantity, oi.unit_price, o.completed_date `
        .concat(`FROM ${orderItemTableStr} oi `)
        .concat(`JOIN ${productTableStr} p ON p.id = oi.product_id `)
        .concat(`JOIN ${orderTableStr} o ON o.id = oi.order_id `)
        .concat(`WHERE oi.order_id IN (`)
        .concat(`SELECT id FROM public.order `)
        .concat(`WHERE status = '${status}' `)
        .concat(`AND completed_date >= '${sdate}' `)
        .concat(`AND completed_date <= '${edate}' `)
        .concat(`) `)
        .concat(`AND p.product_type = '${ptype}'`)
        .concat(`ORDER BY completed_date`)
        console.log(queryStr);
        const response = await metricdb.query(queryStr);
        if (response.rows.length > 0){
            res.status(201).json(response.rows);
        } else {
            throw new Error(`Error running getOrders with query: ${queryStr}`);
        }
    } catch (error) {
        res.status(500).json({ error });
    }
}
