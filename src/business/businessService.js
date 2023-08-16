const { Business } = require("./businessModel");
const uuid = require('uuid');

module.exports.createBusinessService = async (businessName, departments, user) => {
    let id = uuid.v4() + uuid.v4()
    let teams = [
        {
            userId: user.id,
            role: "owner"
        }
    ]
    let newBusiness = new Business({
        businessId: id,
        businessName: businessName,
        departments: departments,
        teams: teams

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