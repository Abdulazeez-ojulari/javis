const { KnowledgeBase } = require("../knowledgeBase/knowledgeBaseModel");

module.exports.createKnowledgeBaseService = async (businessId, knowledgeBase) => {
    let newKnowledgeBase = new KnowledgeBase({
        businessId: businessId,
        knowledgeBase: knowledgeBase,
    });
    try{
        await newKnowledgeBase.save();
    }catch(e){
        console.log(e);
        return e;
    }
    return newKnowledgeBase;
}

module.exports.updateKnowledgeBaseService = async (businessId, knowledgeBase) => {
    const updateKnowledgeBase = await KnowledgeBase.findOne({businessId: businessId})
    updateKnowledgeBase.knowledgeBase = knowledgeBase;
    try{
        await updateKnowledgeBase.save();
    }catch(e){
        console.log(e);
    }
    return updateKnowledgeBase;
}