const express = require("express");
const createError = require("http-errors");
const { Contact } = require("../../models");
const { joiSchema } = require("../../models/contact");
const { authenticate } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  const { page = 1, limit = 20, favorite } = req.query;
  try {
    const { _id } = req.user;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(
      { owner: _id },
      "-createdAt -updatedAt",
      { skip, limit: +limit }
    );

    if (favorite) {
      const filterContacts = contacts.filter((contact) => contact.favorite);
      res.json(filterContacts);
      return;
    }

    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      throw new createError.NotFound();
    }
    res.json(contact);
  } catch (err) {
    if (err.message.includes("Cast to ObjectId failed")) {
      err.status = 404;
    }
    next(err);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);

    if (error) {
      const missingFieldName = error.details[0].message.split(" ")[0].split("");
      const missingFieldNameNormalize = missingFieldName
        .slice(1, missingFieldName.length - 1)
        .join("");

      throw new createError.BadRequest(
        `missing required '${missingFieldNameNormalize}' field`
      );
    }

    const { _id } = req.user;

    const addedContact = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json(addedContact);
  } catch (err) {
    if (err.message.includes("validation failed")) {
      err.status = 400;
    }
    next(err);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await Contact.findByIdAndRemove(id);

    if (!result) {
      throw new createError.NotFound();
    }
    res.json({ message: "contact deleted" });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedContact) {
      throw new createError.NotFound();
    }
    res.json(updatedContact);
  } catch (err) {
    if (err.message.includes("validation failed")) {
      err.status = 400;
    }
    next(err);
  }
});

router.patch("/:id/favorite", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;

  try {
    if (favorite === undefined) {
      throw new createError.BadRequest("missing field favorite");
    }
    const updateContact = await Contact.findByIdAndUpdate(
      id,
      { favorite },
      {
        new: true,
      }
    );
    res.json(updateContact);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
