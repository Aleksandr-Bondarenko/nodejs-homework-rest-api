const express = require("express");
const { User } = require("../../models");
const { joiSchema } = require("../../models/user");

const router = express.Router();

router.post("/register", async (req, res, next) => {});

module.exports = router;
