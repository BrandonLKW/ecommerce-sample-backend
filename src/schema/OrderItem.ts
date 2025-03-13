import Joi from "joi";

export const OrderItemSchema = Joi.object().keys({
    id: Joi.number().optional().allow(0).strip(), //strip id here to facilitate queryHelper.ts methods
    order_id: Joi.number().optional().allow(null, ""),
    product_id: Joi.number().optional().allow(null, ""),
    unit_price: Joi.number().optional().allow(null, ""),
    quantity: Joi.number().optional().allow(null, ""),
    product: Joi.object().optional().strip()
});

export const validate = (body: Object) => {
    const result = OrderItemSchema.validate(body, { abortEarly: false });
    return result;
}