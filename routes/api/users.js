const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { BadRequest, NotFound } = require("http-errors");
const Jimp = require("jimp");
const { User } = require("../../models");
const { authenticate, upload } = require("../../middlewares");
const { sendEmail } = require("../../helpers");
require("dotenv").config();

const { SITE_NAME, NODE_ENV } = process.env;

const BASE_URL =
  NODE_ENV === "development" ? `http://localhost:3000` : SITE_NAME;

const router = express.Router();

router.get("/current", authenticate, async (req, res, next) => {
  const { email, subscription } = req.user;
  res.json({
    user: {
      email,
      subscription,
    },
  });
});

router.get("/logout", authenticate, async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
});

router.patch("/", authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { subscription } = req.body;
    if (subscription === undefined) {
      throw new BadRequest("Missing subscription field");
    }

    const validSubscriptions = ["starter", "pro", "business"];

    console.log(validSubscriptions.includes(subscription));

    if (!validSubscriptions.includes(subscription)) {
      throw new BadRequest("Invalid subscription value");
    }

    const updateSubscription = await User.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );
    res.json(updateSubscription);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { _id } = req.user;
      const avatarDir = path.join(__dirname, "../../", "public/avatars");
      const { path: tempUpload, filename } = req.file;

      const [extension] = filename.split(".").reverse();
      const newFileName = `${_id}.${extension}`;

      const fileUpload = path.join(avatarDir, newFileName);

      await fs.rename(tempUpload, fileUpload);

      Jimp.read(fileUpload)
        .then((file) => {
          return file.contain(250, 250).write(fileUpload);
        })
        .catch((err) => {
          console.error(err.message);
        });

      const avatarURL = path.join("avatars", newFileName);

      await User.findByIdAndUpdate(_id, { avatarURL });
      res.json({
        avatarURL,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw new NotFound("User not found");
    }

    res.json({
      message: "Verification successful",
    });

    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequest("missing required field email");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFound("User not found");
    }
    if (user.verify) {
      throw new BadRequest("Verification has already been passed");
    }

    const { verificationToken } = user;

    const data = {
      to: email,
      subject: "Email confirmation",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Confirm your email</a>`,
    };

    await sendEmail(data);

    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
