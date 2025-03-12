import Joi from "joi";

export const ProductSchema = Joi.object().keys({
    id: Joi.number().optional().allow(0).strip(), //strip id here to facilitate queryHelper.ts methods
    product_type: Joi.string().optional().allow(null, ""),
    name: Joi.string().optional().allow(null, ""),
    image: Joi.string().optional().allow(null, ""),
    quantity: Joi.number().optional().allow(null, ""),
    unit_price: Joi.number().optional().allow(null, "")
});

export const validate = (body: Object) => {
    const result = ProductSchema.validate(body, { abortEarly: false });
    return result;
}