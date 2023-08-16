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

module.exports.updateBusinessService = async (data) => {
    let { businessId, departments } = data;

    const business = await Business.findOne({businessId: businessId})
    
    if(departments && departments.length > 0)
    business.departments = departments;

    try{
        await business.save();
    }catch(e){
        console.log(e);
        return e;
    }
    return business;
}