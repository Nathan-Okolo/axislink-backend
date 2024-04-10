import Joi from "joi";

export const postSchema = Joi.object({
  content: Joi.string().required(),
  media: Joi.object({
    key: Joi.string().required(),
  }).optional(),
});

export const viewPost = Joi.object({
  post_id: Joi.string().required()
});