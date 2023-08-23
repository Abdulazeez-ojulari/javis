const { Business } = require('../business/businessModel');
const errorMiddleware = require('../middlewares/error');
const { User } = require('../user/userModel');
const { KnowledgeBase } = require('./knowledgeBaseModel');
const { createKnowledgeBaseService, updateKnowledgeBaseService, getKnowledgeBaseFromFileService, createKnowledgeBaseFromCsvService } = require('./knowledgeBaseService');

module.exports.createKnowledgeBase = errorMiddleware(async (req, res) => {
    let { userId, businessId, knowledgeBase, type } = req.body;

    const user = await User.findOne({userId: userId})
    if(!user){
        return res.status(400).send({message: "User doesn't exists"});
    }

    const business = await Business.findOne({businessId: businessId})
    if(!business){
        return res.status(404).send({message: "Business doesn't exists"});
    }

    let teams = business.teams.map(team => {
        if(team.userId == user.id && team.role == "owner")
        return team
    })

    if(teams.length <= 0){
        return res.status(400).send({message: "Team member not authorized"});
    }

    const knowledge = await KnowledgeBase.findOne({businessId: businessId})
    if(knowledge){
        return res.status(400).send({message: "A knowledge base already exists for this business"});
    }

    if(type == "file" && req.files){
        let file = req.files[0];
        if(file.mimetype === 'text/csv'){
            await createKnowledgeBaseFromCsvService(req.files, res, businessId)
            return
        }else{
            knowledgeBase = await getKnowledgeBaseFromFileService(req.files)
        }   
    }

    let newKnowledgeBase = await createKnowledgeBaseService(businessId, knowledgeBase)
    return res.send(newKnowledgeBase)
})

module.exports.updateKnowledgeBase = errorMiddleware(async (req, res) => {
    let { userId, businessId, knowledgeBase, type, faqs, companyInformation,  } = req.body;

    const user = await User.findOne({userId: userId})
    if(!user){
        return res.status(400).send({message: "User doesn't exists"});
    }

    const business = await Business.findOne({businessId: businessId})
    if(!business){
        return res.status(404).send({message: "Business doesn't exists"});
    }

    let teams = business.teams.map(team => {
        if(team.userId == user.id && team.role == "owner")
        return team
    })

    if(teams.length <= 0){
        return res.status(400).send({message: "Team member not authorized"});
    }

    const knowledge = await KnowledgeBase.findOne({businessId: businessId})
    if(!knowledge){
        return res.status(404).send({message: "This business dosen't have a knowledge base"});
    }

    if(type == "file" && req.files){
        knowledgeBase = await getKnowledgeBaseFromFileService(req.files)   
    }

    let newKnowledgeBase = await updateKnowledgeBaseService(businessId, knowledgeBase, faqs, companyInformation)
    return res.send(newKnowledgeBase)
    
})

module.exports.getKnowledgeBase = errorMiddleware(async (req, res) => {
    let { userId, businessId } = req.body;

    const user = await User.findOne({userId: userId})
    if(!user){
        return res.status(400).send({message: "User doesn't exists"});
    }

    const business = await Business.findOne({businessId: businessId})
    if(!business){
        return res.status(404).send({message: "Business doesn't exists"});
    }

    let teams = business.teams.map(team => {
        if(team.userId == user.id && team.role == "owner")
        return team
    })

    if(teams.length <= 0){
        return res.status(400).send({message: "Team member not authorized"});
    }

    const knowledge = await KnowledgeBase.findOne({businessId: businessId})
    if(!knowledge){
        return res.status(404).send({message: "This business dosen't have a knowledge base"});
    }
    
    return res.send(knowledge)
})