import Joi from "joi";
import { OrderItemSchema } from "./OrderItem";

export const OrderSchema = Joi.object().keys({
    id: Joi.number().required().allow(0).strip(), //strip id here to facilitate queryHelper.ts methods
    user_id: Joi.number().required(),
    created_date: Joi.string().required(),
    completed_date: Joi.string().optional().allow(null, ""),
    status: Joi.string().required(),
    orderItemList: Joi.array().items(OrderItemSchema).optional()
});

export const validate = (body: Object) => {
    const result = OrderSchema.validate(body, { abortEarly: false });
    return result;
}