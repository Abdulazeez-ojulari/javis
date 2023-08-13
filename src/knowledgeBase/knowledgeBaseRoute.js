const multer = require('multer');
const knowledgeBaseController = require('./knowledgeBaseController');
const express = require('express');
const router = express.Router();
let multerInstance = multer();

router.post('/create', knowledgeBaseController.createKnowledgeBase);

router.post('/update', multerInstance.any(), knowledgeBaseController.updateKnowledgeBase);

module.exports = router;