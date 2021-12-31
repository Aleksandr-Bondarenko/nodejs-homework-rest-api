const { Schema, model } = require("mongoose");
const joi = require("joi");

const emailRegexp = /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/;

const userSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      match: emailRegexp,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      minlength: 6,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const joiSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().pattern(emailRegexp).required(),
  password: joi.string().min(6).required(),
});

const User = model("users", userSchema);

module.exports = {
  User,
  joiSchema,
};
