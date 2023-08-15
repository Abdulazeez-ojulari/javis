const errorMiddleware = require('../middlewares/error');
const { Business } = require('./businessModel');
const { createBusinessService } = require('./businessService');

module.exports.createBusiness = errorMiddleware(async (req, res) => {
    let { companyName, departments } = req.body;
    const business = await Business.findOne({companyName: companyName})
    if(business){
        return res.status(400).send("Business already exists");
    }

    let newBusiness = await createBusinessService(companyName, departments)
    return res.send(newBusiness)
})