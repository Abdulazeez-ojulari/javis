const multer = require('multer');
const knowledgeBaseController = require('./knowledgeBaseController');
const express = require('express');
const router = express.Router();
let multerInstance = multer();

router.post('/create', multerInstance.any(), knowledgeBaseController.createKnowledgeBase);

router.post('/update', multerInstance.any(), knowledgeBaseController.updateKnowledgeBase);

router.post('/get', knowledgeBaseController.getKnowledgeBase);

module.exports = router;