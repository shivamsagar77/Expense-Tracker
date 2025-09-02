const express = require('express');
const router = express.Router();
const signUpController = require("../controller/signUpController");


router.post('/', signUpController.signup);


module.exports = router;
