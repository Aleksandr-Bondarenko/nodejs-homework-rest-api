const express = require("express");
const createError = require("http-errors");
const Joi = require("joi");
const operations = require("../../models/contacts");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const contacts = await operations.getAll();
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const contact = await operations.getById(id);
    if (!contact) {
      throw new createError.NotFound();
    }
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const postSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });

  const { error } = postSchema.validate(req.body);

  try {
    if (error) {
      const missingFieldName = error.details[0].message.split(" ")[0].split("");
      const missingFieldNameNormalize = missingFieldName
        .slice(1, missingFieldName.length - 1)
        .join("");

      throw new createError.BadRequest(
        `missing required '${missingFieldNameNormalize}' field`
      );
    }

    const addedContact = await operations.add(req.body);
    res.status(201).json(addedContact);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await operations.removeById(id);

    if (!result) {
      throw new createError.NotFound();
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const putSchema = Joi.object().min(1);
  const { error } = putSchema.validate(req.body);

  try {
    if (error) {
      throw new createError.BadRequest("missing fields");
    }

    const updatedContact = await operations.updateById(id, req.body);
    if (!updatedContact) {
      throw new createError.NotFound();
    }
    res.json(updatedContact);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
