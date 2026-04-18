const Joi = require("joi");

const lessonInputSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  type: Joi.string().valid("video", "article", "quiz").optional(),
  order: Joi.number().integer().min(1).required(),
  durationMinutes: Joi.number().min(0).optional(),
  content: Joi.string().allow("").optional(),
  videoUrl: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .allow(null, "")
    .optional(),
  isPreview: Joi.boolean().optional(),
});

const sectionInputSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  order: Joi.number().integer().min(1).required(),
  lessons: Joi.array().items(lessonInputSchema).optional(),
});

const createCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(160).required(),
  slug: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().min(20).max(4000).required(),
  shortDescription: Joi.string().trim().max(280).allow("").optional(),
  thumbnail: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .allow(null, "")
    .optional(),
  category: Joi.string().trim().min(2).max(80).required(),
  tags: Joi.array().items(Joi.string().trim().min(1).max(40)).optional(),
  language: Joi.string().trim().max(50).optional(),
  level: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
  price: Joi.number().min(0).optional(),
  isPublished: Joi.boolean().optional(),
  sections: Joi.array().items(sectionInputSchema).optional(),
  lessons: Joi.array().items(lessonInputSchema).optional(),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(160).optional(),
  slug: Joi.string().trim().min(3).max(200).optional(),
  description: Joi.string().trim().min(20).max(4000).optional(),
  shortDescription: Joi.string().trim().max(280).allow("").optional(),
  thumbnail: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .allow(null, "")
    .optional(),
  category: Joi.string().trim().min(2).max(80).optional(),
  tags: Joi.array().items(Joi.string().trim().min(1).max(40)).optional(),
  language: Joi.string().trim().max(50).optional(),
  level: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
  price: Joi.number().min(0).optional(),
  isPublished: Joi.boolean().optional(),
  sections: Joi.array().items(sectionInputSchema).optional(),
  lessons: Joi.array().items(lessonInputSchema).optional(),
}).min(1);

module.exports = {
  createCourseSchema,
  updateCourseSchema,
};
