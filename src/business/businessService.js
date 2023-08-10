const { Business } = require("./businessModel");
const uuid = require('uuid');

module.exports.createBusinessService = async (companyName, departments) => {
    let id = uuid.v4() + uuid.v4()
    let newBusiness = new Business({
        businessId: id,
        companyName: companyName,
        departments: departments,
    });
    try{
        await newBusiness.save();
    }catch(e){
        console.log(e);
        return e;
    }
    return newBusiness;
}