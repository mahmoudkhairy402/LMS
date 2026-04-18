const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    // .pattern(/[a-z]/, "lowercase")
    // .pattern(/[A-Z]/, "uppercase")
    // .pattern(/[0-9]/, "number")
    // .pattern(/[^a-zA-Z0-9]/, "special character")
    .required(),
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

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).optional(),
  avatar: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .max(2048)
    .optional(),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(8).max(128).required(),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[a-z]/, "lowercase")
    .pattern(/[A-Z]/, "uppercase")
    .pattern(/[0-9]/, "number")
    .pattern(/[^a-zA-Z0-9]/, "special character")
    .required(),
  confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  updateProfileSchema,

  changePasswordSchema,
};
