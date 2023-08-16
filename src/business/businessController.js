const errorMiddleware = require('../middlewares/error');
const { Business } = require('./businessModel');
const { createBusinessService, updateBusinessService } = require('./businessService');

module.exports.createBusiness = errorMiddleware(async (req, res) => {
    let { companyName, departments } = req.body;
    const business = await Business.findOne({companyName: companyName})
    if(business){
        return res.status(400).send("Business already exists");
    }

    let newBusiness = await createBusinessService(companyName, departments)
    return res.send(newBusiness)
})

module.exports.updateBusiness = errorMiddleware(async (req, res) => {
    let { businessId, departments } = req.body;

    let data = {}

    const business = await Business.findOne({businessId: businessId})
    if(!business){
        return res.status(404).send("Business doesn't exists");
    }

    data['businessId'] = businessId

    if(departments && departments.length > 0)
    data['departments'] = departments


    let updatedBusiness = await updateBusinessService(data)
    return res.send(updatedBusiness)
})