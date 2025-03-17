import Joi from "joi";

export const OrderItemSchema = Joi.object().keys({
    id: Joi.number().required().allow(0).strip(), //strip id here to facilitate queryHelper.ts methods
    order_id: Joi.number().required(),
    product_id: Joi.number().required(),
    unit_price: Joi.number().required().min(0.01).max(1000),
    quantity: Joi.number().required().min(0).max(10000),
    product: Joi.object().optional().strip()
});

export const validate = (body: Object) => {
    const result = OrderItemSchema.validate(body, { abortEarly: false });
    return result;
}