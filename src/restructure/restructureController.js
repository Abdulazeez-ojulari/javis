const { restructureMsg, restructureEmail, restructureEmailHtml } = require("./restructureService");

module.exports.restructureMessage = async (req, res) => {
    let { message } = req.body;
  
    let result = await restructureMsg(message)
  
    res.send({"result": result})
    return;
};

module.exports.restructureEmail = async (req, res) => {
    let { message } = req.body;
  
    let result = await restructureEmail(message)
  
    res.send({"result": result})
    return;
};

module.exports.restructureEmailHtml = async (req, res) => {
    let { message } = req.body;
  
    let result = await restructureEmailHtml(message)
  
    res.send({"result": result})
    return;
};