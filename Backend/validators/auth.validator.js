const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid("student", "instructor", "admin").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const googleAuthSchema = Joi.object({
  idToken: Joi.string().trim(),
  accessToken: Joi.string().trim(),
  role: Joi.string().valid("student", "instructor", "admin").optional(),
}).or("idToken", "accessToken");

const updateAvatarSchema = Joi.object({
  avatar: Joi.string().uri().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateAvatarSchema,
};
