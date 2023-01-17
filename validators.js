import joi from 'joi'

export const registerUserSchema = joi.object( {
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    passwordConfirm: joi.any().valid(joi.ref('password')).required()

}).allow("name", "email", "password", "passwordConfirm")