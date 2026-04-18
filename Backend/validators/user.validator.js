const Joi = require("joi");

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(60).optional(),
  role: Joi.string().valid("student", "instructor", "admin").optional(),
  isEmailVerified: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const deactivateUserSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().required()).min(1).required(),
  reason: Joi.string().trim().max(500).optional(),
});

const activateUserSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().required()).min(1).required(),
});

const bulkUpdateRoleSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().required()).min(1).required(),
  newRole: Joi.string().valid("student", "instructor", "admin").required(),
});

const bulkDeleteSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().required()).min(1).required(),
  permanent: Joi.boolean().optional().default(false),
});

module.exports = {
  updateUserSchema,
  deactivateUserSchema,
  activateUserSchema,
  bulkUpdateRoleSchema,
  bulkDeleteSchema,
};
