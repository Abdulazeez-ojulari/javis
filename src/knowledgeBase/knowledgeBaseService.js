const readXlsxFile = require('read-excel-file/node')
const { KnowledgeBase } = require("../knowledgeBase/knowledgeBaseModel");
const parse = require('csv-parse').parse

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

module.exports.updateKnowledgeBaseService = async (businessId, knowledgeBase, faqs, companyInformation) => {
    const updateKnowledgeBase = await KnowledgeBase.findOne({businessId: businessId})
    if(knowledgeBase){
        updateKnowledgeBase.knowledgeBase = knowledgeBase;
    }

    if(faqs){
        updateKnowledgeBase.faqs = faqs;
    }

    if(companyInformation){
        updateKnowledgeBase.companyInformation = companyInformation;
    }

    try{
        await updateKnowledgeBase.save();
    }catch(e){
        console.log(e);
    }
    return updateKnowledgeBase;
}

module.exports.getKnowledgeBaseFromFileService = async (files) => {
    let file = files[0];
    let knowledgeBase = []
    if(file.mimetype === 'text/csv'){
        parse(file.buffer, async (err, records) => {
            if (err) {
            console.error(err)
            return res.status(400).json({success: false, message: 'An error occurred'})
            }
            let head = records[0];
            for (let i = 1; i < records.length; i++) {
                const record = records[i];
                let cont = {}
                for (let j = 0; j < head.length; j++){
                    cont[head[j]] = record[j]
                }
                knowledgeBase.push(cont)
            }
        })
    }else if(file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
        readXlsxFile(file.buffer).then((records) => {
            let head = records[0];
            for (let i = 1; i < records.length; i++) {
                const record = records[i];
                let cont = {}
                for (let j = 0; j < head.length; j++){
                    cont[head[j]] = record[j]
                }
                knowledgeBase.push(cont)
            }
        })
    }
    return knowledgeBase;
}