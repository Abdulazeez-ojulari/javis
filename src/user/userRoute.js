const user = require('./userController');
const express = require('express');
const router = express.Router();

router.post('/signup', user.signup);

module.exports = router;