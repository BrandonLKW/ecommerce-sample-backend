import Joi from "joi";

export const UserSchema = Joi.object().keys({
    id: Joi.number().optional().allow(0).strip(), //strip id here to facilitate queryHelper.ts methods
    account_type: Joi.string().optional().allow(null, ""),
    name_first: Joi.string().optional().allow(null, ""),
    name_last: Joi.string().optional().allow(null, ""),
    email: Joi.string().optional().allow(null, ""),
    password: Joi.string().optional().allow(null, ""),
    address_1: Joi.string().optional().allow(null, ""),
    address_2: Joi.string().optional().allow(null, "")
});

export const validate = (body: Object) => {
    const result = UserSchema.validate(body, { abortEarly: false });
    return result;
}