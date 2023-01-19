import joi from 'joi'



export const registerUserSchema = joi.object( {
    name: joi.string().pattern(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+$/).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    confirmPassword: joi.any().valid(joi.ref('password')).required()

}).allow("name", "email", "password", "confirmPassword")

export const loginSchema = joi.object({
    email :joi.string().email().required(),
    password: joi.string().min(6).required()
}).allow("email", "password")

export const entriesSchema = joi.object({
    value: joi.number().min(0).required(),
    description: joi.string().required(),
    type: joi.string().valid("entry", "exit").required(),
}).allow("value", "description", "type")

export const editSchema = joi.object({
    value: joi.number().min(0),
    description: joi.string()
})