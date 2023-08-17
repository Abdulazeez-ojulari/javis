const user = require('./userController');
const express = require('express');
const router = express.Router();

router.post('/signup', user.signup);

router.post('/login', user.login);

module.exports = router;