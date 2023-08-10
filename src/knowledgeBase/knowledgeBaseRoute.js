const knowledgeBaseController = require('./knowledgeBaseController');
const express = require('express');
const router = express.Router();

router.post('/create', knowledgeBaseController.createKnowledgeBase);

router.post('/update', knowledgeBaseController.updateKnowledgeBase);

module.exports = router;