import joi from 'joi'

export const registerUserSchema = joi.object( {
    name: joi.string().pattern(/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+$/).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    confirmPassword: joi.any().valid(joi.ref('password')).required()

}).allow("name", "email", "password", "confirmPassword")