const { Business } = require("./businessModel");
const uuid = require('uuid');

module.exports.createBusinessService = async (businessName, companyInformation, departments, user) => {
    let id = uuid.v4() + uuid.v4()
    let teams = [
        {
            userId: user.id,
            role: "owner"
        }
    ]
    let newBusiness = new Business({
        userId: user.id,
        businessId: id,
        businessName: businessName,
        departments: departments,
        companyInformation: companyInformation,
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
    let { businessId, departments, companyInformation, aiMode } = data;

    const business = await Business.findOne({businessId: businessId})
    
    if(departments && departments.length > 0)
    business.departments = departments;

    if(companyInformation)
    business.companyInformation = companyInformation;

    if(aiMode)
    business.aiMode = aiMode;

    try{
        await business.save();
    }catch(e){
        // console.log(e);
        return e;
    }
    return business;
}