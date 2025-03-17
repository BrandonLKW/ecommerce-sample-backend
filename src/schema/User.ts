import Joi from "joi";

export const UserSchema = Joi.object().keys({
    id: Joi.number().required().allow(0).strip(), //strip id here to facilitate queryHelper.ts methods
    account_type: Joi.string().required(),
    name_first: Joi.string().required(),
    name_last: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    address_1: Joi.string().required(),
    address_2: Joi.string().optional().allow(null, "")
});

export const validate = (body: Object) => {
    const result = UserSchema.validate(body, { abortEarly: false });
    return result;
}