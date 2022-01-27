const express = require("express");
const { BadRequest, Conflict, Unauthorized } = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");
const { User } = require("../../models");
const { joiSignupSchema, joiLoginSchema } = require("../../models/user");
const { sendEmail } = require("../../helpers");

require("dotenv").config();

const router = express.Router();
const { SECRET_KEY, SITE_NAME, NODE_ENV } = process.env;

const BASE_URL =
  NODE_ENV === "development" ? `http://localhost:3000` : SITE_NAME;

router.post("/signup", async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const { error } = joiSignupSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const user = await User.findOne({ email });
    if (user) {
      throw new Conflict("Email in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const data = {
      to: email,
      subject: "Email confirmation",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Confirm your email</a>`,
    };

    await sendEmail(data);

    res.status(201).json({
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Unauthorized("Email or password is wrong");
    }

    if (!user.verify) {
      throw new Unauthorized("Email not confirm");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new Unauthorized("Email or password is wrong");
    }

    const { _id, subscription } = user;
    const payload = {
      id: _id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
    console.log(token);
    await User.findByIdAndUpdate(_id, { token });
    res.json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
