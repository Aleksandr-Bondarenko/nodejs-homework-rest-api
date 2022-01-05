const express = require("express");
const { BadRequest } = require("http-errors");
const { User } = require("../../models");
const { authenticate } = require("../../middlewares");

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

module.exports = router;
