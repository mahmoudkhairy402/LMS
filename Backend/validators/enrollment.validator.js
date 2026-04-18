const Joi = require("joi");

const updateProgressSchema = Joi.object({
  progressPercent: Joi.number().min(0).max(100).optional(),
  completedLessonIds: Joi.array()
    .items(Joi.string().trim().length(24).hex())
    .optional(),
}).min(1);

module.exports = {
  updateProgressSchema,
};
