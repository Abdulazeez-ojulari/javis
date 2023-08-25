const { Business } = require("./businessModel");
const uuid = require('uuid');

module.exports.createBusinessService = async (
    businessName, 
    industry, 
    phoneNo, 
    address, 
    bankName, 
    accountNo, 
    description,
    ownerName,
    ownerPhoneNo,
    ownwerEmail,
    instagramHandle,
    facebookHandle,
    twitterHandle,
    companyInformation, 
    departments, 
    user
) => {
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
        industry, 
        phoneNo, 
        address, 
        bankName, 
        accountNo, 
        description,
        ownerName,
        ownerPhoneNo,
        ownwerEmail,
        instagramHandle,
        facebookHandle,
        twitterHandle,
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
    const { 
        businessId, 
        industry, 
        phoneNo, 
        address, 
        bankName, 
        accountNo, 
        description,
        ownerName,
        ownerPhoneNo,
        ownwerEmail,
        instagramHandle,
        facebookHandle,
        twitterHandle,
        departments, 
        companyInformation, 
        aiMode ,
        plan
    } = data;

    const business = await Business.findOne({businessId: businessId})
    
    if(departments && departments.length > 0)
    business.departments = departments;

    if(companyInformation) business.companyInformation = companyInformation;

    if(industry) business.industry = industry;

    if(phoneNo) business.phoneNo = phoneNo;

    if(address) business.address = address;

    if(bankName) business.bankName = bankName;

    if(accountNo) business.accountNo = accountNo;

    if(description) business.description = description;

    if(ownerName) business.ownerName = ownerName;

    if(ownerPhoneNo) business.ownerPhoneNo = ownerPhoneNo;

    if(ownwerEmail) business.ownwerEmail = ownwerEmail;

    if(instagramHandle) business.instagramHandle = instagramHandle;

    if(facebookHandle) business.facebookHandle = facebookHandle;

    if(twitterHandle) business.twitterHandle = twitterHandle;

    if(aiMode) business.aiMode = aiMode;

    if(plan) business.plan = plan;

    try{
        await business.save();
    }catch(e){
        // console.log(e);
        return e;
    }
    return business;
}