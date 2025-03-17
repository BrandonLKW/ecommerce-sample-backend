import Joi from "joi";

export const ProductSchema = Joi.object().keys({
    id: Joi.number().required().allow(0).strip(), //strip id here to facilitate queryHelper.ts methods
    product_type: Joi.string().required(),
    name: Joi.string().required(),
    image: Joi.string().optional().allow(null, ""),
    quantity: Joi.number().required().min(0).max(10000),
    unit_price: Joi.number().required().min(0.01).max(1000)
});

export const validate = (body: Object) => {
    const result = ProductSchema.validate(body, { abortEarly: false });
    return result;
}