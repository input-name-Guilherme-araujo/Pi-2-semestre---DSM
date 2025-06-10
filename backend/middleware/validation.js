import Joi from "joi"

export const validateUser = (req, res, next) => {
  const schema = Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(6).required(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().required(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

export const validateAvaliacao = (req, res, next) => {
  const schema = Joi.object({
    nota: Joi.number().min(1).max(5).required(), // Corrigir: era 0-10, mas deveria ser 1-5
    comentario: Joi.string().max(1000).allow(""),
    animacao_id: Joi.number().integer().positive().required() // ADICIONAR ESTA LINHA
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

export const validateAnimacao = (req, res, next) => {
  const schema = Joi.object({
    titulo: Joi.string().min(1).max(255).required(),
    titulo_original: Joi.string().max(255).allow(""),
    sinopse: Joi.string().allow(""),
    poster_url: Joi.string().uri().allow(""),
    banner_url: Joi.string().uri().allow(""),
    ano_lancamento: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 5),
    episodios: Joi.number().integer().min(1),
    status: Joi.string().valid("Em exibição", "Finalizado", "Cancelado", "Anunciado"),
    estudio: Joi.string().max(100).allow(""),
    diretor: Joi.string().max(100).allow(""),
    generos: Joi.array().items(Joi.number().integer()).min(1).required(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}
