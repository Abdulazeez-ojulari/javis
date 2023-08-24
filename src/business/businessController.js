const { KnowledgeBase } = require('../knowledgeBase/knowledgeBaseModel');
const errorMiddleware = require('../middlewares/error');
const { User } = require('../user/userModel');
const { Business } = require('./businessModel');
const { createBusinessService, updateBusinessService } = require('./businessService');

module.exports.createBusiness = errorMiddleware(async (req, res) => {
    let { userId, businessName, companyInformation, departments } = req.body;

    const user = await User.findOne({userId: userId})
    if(!user){
        return res.status(400).send({message: "User doesn't exists"});
    }

    const business = await Business.findOne({businessName: businessName})
    if(business){
        return res.status(400).send({message: "Business already exists"});
    }

    let newBusiness = await createBusinessService(businessName, companyInformation, departments, user)
    return res.send(newBusiness)
})

module.exports.updateBusiness = errorMiddleware(async (req, res) => {
    let { userId, businessId, departments, companyInformation, aiMode } = req.body;

    let data = {}

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

    data['businessId'] = businessId

    if(departments && departments.length > 0)
    data['departments'] = departments;

    if(companyInformation)
    data['companyInformation'] = companyInformation;

    if(aiMode)
    data['aiMode'] = aiMode;

    let updatedBusiness = await updateBusinessService(data)
    return res.send(updatedBusiness)
})

module.exports.getBusiness = errorMiddleware(async (req, res) => {
    let { businessId } = req.params;

    const business = await Business.findOne({businessId: businessId})
    if(!business){
        return res.status(404).send({message: "Business doesn't exists"});
    }

    let knowledgeBase = await KnowledgeBase.findOne({businessId: businessId})

    // let teams = await business.populate(business.teams[0].userId)

    let data = {
        business: business,
        knowledgeBase: knowledgeBase,
        // teams: teams
    }

    return res.send(data)
})