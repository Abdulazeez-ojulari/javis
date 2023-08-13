const errorMiddleware = require('../middlewares/error');
const { KnowledgeBase } = require('./knowledgeBaseModel');
const { createKnowledgeBaseService, updateKnowledgeBaseService, getKnowledgeBaseFromFileService } = require('./knowledgeBaseService');

module.exports.createKnowledgeBase = errorMiddleware(async (req, res) => {
    let { businessId, knowledgeBase, type } = req.body;
    const knowledge = await KnowledgeBase.findOne({businessId: businessId})
    if(knowledge){
        return res.status(400).send("A knowledge base already exists for this business");
    }

    let newKnowledgeBase = await createKnowledgeBaseService(businessId, knowledgeBase)
    return res.send(newKnowledgeBase)
})

module.exports.updateKnowledgeBase = errorMiddleware(async (req, res) => {
    let { businessId, knowledgeBase, type, faqs, companyInformation,  } = req.body;
    const knowledge = await KnowledgeBase.findOne({businessId: businessId})
    if(!knowledge){
        return res.status(404).send("This business dosen't exists");
    }

    if(type == "file" && req.files){
        knowledgeBase = await getKnowledgeBaseFromFileService(req.files)   
    }

    let newKnowledgeBase = await updateKnowledgeBaseService(businessId, knowledgeBase, faqs, companyInformation)
    return res.send(newKnowledgeBase)
    
})