import Joi from "joi";
import { OrderItemSchema } from "./OrderItem";

export const OrderSchema = Joi.object().keys({
    id: Joi.number().optional().allow(0).strip(), //strip id here to facilitate queryHelper.ts methods
    user_id: Joi.string().optional().allow(null, ""),
    created_date: Joi.string().optional().allow(null, ""),
    completed_date: Joi.string().optional().allow(null, ""),
    status: Joi.string().optional().allow(null, ""),
    orderItemList: Joi.array().items(OrderItemSchema).optional()
});

export const validate = (body: Object) => {
    const result = OrderSchema.validate(body, { abortEarly: false });
    return result;
}