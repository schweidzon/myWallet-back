
export function validateSchema(schema) {
    return (req, res, next) => {
        const validateUser = schema.validate(req.body, { abortEarly: false })
        if (validateUser.error) {
            const erros = validateUser.error.details.map((err) => {
                if (err.message === '"confirmPassword" must be [ref:password]') {
                    err.message = "confirmPassword tem que ser igual ao password"
                }
                if (err.message.includes("/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+$/")) {
                    err.message = "Nome de usuário inválido"
                }

                return err.message
            })
            return res.status(422).send(erros)
        }
        next()

    }
}
