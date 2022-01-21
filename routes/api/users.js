const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { BadRequest } = require("http-errors");
const Jimp = require("jimp");
const { User } = require("../../models");
const { authenticate, upload } = require("../../middlewares");

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

module.exports = router;
