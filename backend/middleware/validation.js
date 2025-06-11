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
    nota: Joi.number().min(1).max(5).required(),
    comentario: Joi.string().max(1000).allow(""),
    animacao_id: Joi.number().integer().positive().required()
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
    titulo_original: Joi.string().max(255).allow("", null),
    sinopse: Joi.string().allow("", null),
    poster_url: Joi.string().uri().allow("", null),
    banner_url: Joi.string().uri().allow("", null),
    ano_lancamento: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 5)
      .allow(null),
    episodios: Joi.number().integer().min(1).allow(null),
    // 
    status: Joi.string().valid(
      "Em exibição", 
      "Finalizado", 
      "Cancelado", 
      "Anunciado"  // 
    ).allow("", null),
    estudio: Joi.string().max(100).allow("", null),
    diretor: Joi.string().max(100).allow("", null),
    generos: Joi.array().items(Joi.number().integer()).min(1).required(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}
